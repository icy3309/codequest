-- =========================================================
--  Update 1: Sicherheit (mehrfach ausführbar)
--  1. Rätsel-Antworten mit geheimem Zusatzwert ("Pepper") prüfen
--  2. Nur echte Python-Level-IDs annehmen
--  3. Ranglisten-Views durch abgesicherte Funktionen ersetzen
--  4. Überflüssige Standardrechte entziehen
--  Danach supabase/puzzles.sql ausführen. Den Pepper selbst NICHT ins Repo:
--    insert into public.app_secrets (key, value) values ('puzzle_pepper', '<geheim>')
--      on conflict (key) do update set value = excluded.value;
-- =========================================================

-- ---------- Geheimnisse (für niemanden über die API lesbar) ----------
create table if not exists public.app_secrets (key text primary key, value text not null);
alter table public.app_secrets enable row level security;
revoke all on public.app_secrets from public, anon, authenticated;

-- ---------- Rätsel: Prüfung mit Pepper, max. 10 Fehlversuche pro Stunde ----------
create or replace function public.submit_puzzle(p_week date, p_tier int, p_answer text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  start constant date := '2026-11-16';
  pepper text; slots int; s int; h text; wrong int; pl int; pts int;
begin
  if auth.uid() is null then raise exception 'Nicht angemeldet'; end if;
  if p_tier not between 1 and 3 or extract(isodow from p_week) <> 1
     or now() < p_week - interval '1 day' or now() > p_week + interval '8 days' then
    raise exception 'Diese Woche ist nicht aktiv';
  end if;
  if length(coalesce(p_answer, '')) > 200 then raise exception 'Antwort zu lang'; end if;
  if exists (select 1 from puzzle_solves where user_id = auth.uid() and week = p_week and tier = p_tier) then
    return jsonb_build_object('ok', true, 'points', 0);
  end if;
  select count(*) into wrong from puzzle_attempts where user_id = auth.uid() and at > now() - interval '1 hour';
  if wrong >= 10 then
    return jsonb_build_object('ok', false, 'wait',
      greatest(1, ceil(extract(epoch from (select min(at) from puzzle_attempts where user_id = auth.uid() and at > now() - interval '1 hour') + interval '1 hour' - now())))::int);
  end if;
  select value into pepper from app_secrets where key = 'puzzle_pepper';
  if pepper is null then raise exception 'Rätsel-Pepper fehlt (app_secrets)'; end if;
  select count(distinct slot) into slots from weekly_puzzles;
  if slots = 0 then raise exception 'Keine Rätsel eingetragen (supabase/puzzles.sql ausführen)'; end if;
  s := (((p_week - start) / 7) % slots + slots) % slots;
  h := encode(sha256(convert_to(pepper || ':s' || s || 't' || p_tier || ':' || lower(regexp_replace(coalesce(p_answer, ''), '\s', '', 'g')), 'UTF8')), 'hex');
  if h is distinct from (select answer_hash from weekly_puzzles where slot = s and tier = p_tier) then
    insert into puzzle_attempts (user_id) values (auth.uid());
    return jsonb_build_object('ok', false);
  end if;
  select count(*) + 1 into pl from puzzle_solves where week = p_week and tier = p_tier;
  pts := (array[100, 200, 400])[p_tier] + case pl when 1 then 100 when 2 then 50 when 3 then 25 else 0 end;
  insert into puzzle_solves (user_id, week, tier, points, place) values (auth.uid(), p_week, p_tier, pts, pl);
  perform award_points(auth.uid(), 'puzzle', p_week || '/' || p_tier, pts);
  return jsonb_build_object('ok', true, 'points', pts, 'place', pl);
end $$;

-- ---------- Level: nur die 50 echten Python-Level (Thema 01–10, Level 01–04 + Projekt) ----------
create or replace function public.record_levels(p_levels jsonb)
returns int language plpgsql security definer set search_path = public as $$
declare k text; v int; old int; pts int; gained int := 0;
begin
  if auth.uid() is null then raise exception 'Nicht angemeldet'; end if;
  if not exists (select 1 from profiles where id = auth.uid()) then raise exception 'Kein Profil'; end if;
  if jsonb_typeof(p_levels) <> 'object' or (select count(*) from jsonb_object_keys(p_levels)) > 60 then
    raise exception 'Ungültige Daten';
  end if;
  for k, v in select key, (value #>> '{}')::int from jsonb_each(p_levels) loop
    if k !~ '^py-(0[1-9]|10)-(0[1-4]|p)$' or v not between 1 and 3 then
      raise exception 'Ungültiges Level: %', k;
    end if;
    select stars into old from level_completions where user_id = auth.uid() and level_id = k;
    old := coalesce(old, 0);
    if v > old then
      pts := (case when k like '%-p' then 100 else 30 end) * (v - old);
      insert into level_completions (user_id, level_id, stars) values (auth.uid(), k, v)
        on conflict (user_id, level_id) do update set stars = excluded.stars, completed_at = now();
      perform award_points(auth.uid(), 'level', k, pts);
      gained := gained + pts;
    end if;
  end loop;
  return gained;
end $$;
-- Bereits gespeicherte, ungültige Level (falls jemand geschummelt hat) entfernen
delete from public.level_completions where level_id !~ '^py-(0[1-9]|10)-(0[1-4]|p)$';

-- ---------- Ranglisten als Funktionen statt Views ----------
drop view if exists public.leaderboard_week;
drop view if exists public.puzzle_leaderboard;

create or replace function public.get_leaderboard_week()
returns table (id uuid, username text, total_score bigint, points bigint)
language sql stable security definer set search_path = public as $$
  select p.id, p.username, p.total_score, sum(l.points)::bigint
    from point_log l join profiles p on p.id = l.user_id
   where l.created_at > now() - interval '7 days'
   group by p.id, p.username, p.total_score
   order by 4 desc
   limit 50;
$$;

create or replace function public.get_puzzle_leaderboard(p_week date)
returns table (user_id uuid, username text, points bigint, tiers int, last_solved timestamptz)
language sql stable security definer set search_path = public as $$
  select s.user_id, p.username, sum(s.points)::bigint, count(*)::int, max(s.solved_at)
    from puzzle_solves s join profiles p on p.id = s.user_id
   where s.week = p_week
   group by s.user_id, p.username
   order by 3 desc, 5 asc
   limit 50;
$$;
revoke execute on function public.get_leaderboard_week, public.get_puzzle_leaderboard from public;
grant execute on function public.get_leaderboard_week, public.get_puzzle_leaderboard to anon, authenticated;

-- ---------- Überflüssige Standardrechte entziehen ----------
revoke truncate, trigger, references on all tables in schema public from anon, authenticated;
revoke insert, update, delete on public.level_completions, public.puzzle_solves, public.friendships, public.profiles from anon;
revoke delete on public.progress from anon, authenticated;
