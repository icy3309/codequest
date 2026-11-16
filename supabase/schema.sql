-- =========================================================
--  Codequest – Supabase-Schema
--  Einmal komplett im Supabase SQL-Editor ausführen (mehrfach ausführbar).
--  Danach supabase/puzzles.sql ausführen (Wochenrätsel).
--
--  Grundsatz: Der Browser darf fast nur LESEN. Punkte, Ränge, Rätsel
--  und Aufgaben ändern sich ausschließlich über die Funktionen unten.
-- =========================================================

-- ---------- Profile ----------
create table if not exists public.profiles (
  id            uuid primary key references auth.users on delete cascade,
  username      text not null check (username ~ '^[A-Za-z0-9_]{3,16}$'),
  total_score   bigint not null default 0,
  streak        int not null default 0,
  last_active   date,
  created_at    timestamptz not null default now()
);
create unique index if not exists profiles_username_lower on public.profiles (lower(username));
alter table public.profiles enable row level security;
drop policy if exists "profiles read" on public.profiles;
drop policy if exists "profiles insert own" on public.profiles;
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles read" on public.profiles for select using (true);
create policy "profiles insert own" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles update own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
revoke insert, update, delete on public.profiles from anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant insert (id, username) on public.profiles to authenticated;
grant update (username) on public.profiles to authenticated;

-- ---------- Punkte-Protokoll (für Wochen-Rangliste) ----------
create table if not exists public.point_log (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles on delete cascade,
  source     text not null,          -- level | quest | puzzle
  ref        text,
  points     int not null,
  created_at timestamptz not null default now()
);
create index if not exists point_log_created on public.point_log (created_at);
alter table public.point_log enable row level security;
revoke all on public.point_log from anon, authenticated;

-- Punkte gutschreiben + Tage-Serie pflegen (nur intern).
create or replace function public.award_points(p_user uuid, p_source text, p_ref text, p_points int)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_points <= 0 then return; end if;
  insert into point_log (user_id, source, ref, points) values (p_user, p_source, p_ref, p_points);
  update profiles
     set total_score = total_score + p_points,
         streak = case when last_active = current_date then streak
                       when last_active = current_date - 1 then streak + 1
                       else 1 end,
         last_active = current_date
   where id = p_user;
end $$;
revoke execute on function public.award_points from public, anon, authenticated;

-- ---------- Gelöste Level ----------
create table if not exists public.level_completions (
  user_id      uuid not null references public.profiles on delete cascade,
  level_id     text not null,
  stars        int not null check (stars between 1 and 3),
  completed_at timestamptz not null default now(),
  primary key (user_id, level_id)
);
alter table public.level_completions enable row level security;
drop policy if exists "levels read" on public.level_completions;
create policy "levels read" on public.level_completions for select using (true);
revoke insert, update, delete on public.level_completions from anon, authenticated;
grant select on public.level_completions to anon, authenticated;

-- Sterne melden: {"py-01-02": 3, ...}. Nur Verbesserungen bringen Punkte.
-- Punkte pro Stern: Level 30, Projekt 100 (identisch mit js/courses.js).
create or replace function public.record_levels(p_levels jsonb)
returns int language plpgsql security definer set search_path = public as $$
declare k text; v int; old int; pts int; gained int := 0;
begin
  if auth.uid() is null then raise exception 'Nicht angemeldet'; end if;
  if not exists (select 1 from profiles where id = auth.uid()) then raise exception 'Kein Profil'; end if;
  if jsonb_typeof(p_levels) <> 'object' or (select count(*) from jsonb_object_keys(p_levels)) > 400 then
    raise exception 'Ungültige Daten';
  end if;
  for k, v in select key, (value #>> '{}')::int from jsonb_each(p_levels) loop
    if k !~ '^(py|js|sql|web|java)-(0[1-9]|1[0-9]|20)-(0[1-9]|1[0-9]|p)$' or v not between 1 and 3 then
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

-- ---------- Tagesaufgaben ----------
create table if not exists public.quest_claims (
  user_id    uuid not null references public.profiles on delete cascade,
  day        date not null,
  quest      text not null,
  points     int not null,
  claimed_at timestamptz not null default now(),
  primary key (user_id, day, quest)
);
alter table public.quest_claims enable row level security;
revoke all on public.quest_claims from anon, authenticated;

-- Belohnungen identisch mit js/quests.js. Höchstens 3 pro Tag.
create or replace function public.claim_quest(p_day date, p_quest text)
returns int language plpgsql security definer set search_path = public as $$
declare pts int; n int;
begin
  if auth.uid() is null then raise exception 'Nicht angemeldet'; end if;
  if p_day not between current_date - 1 and current_date + 1 then raise exception 'Falscher Tag'; end if;
  pts := case p_quest
    when 'solve2' then 40 when 'solve4' then 80 when 'first1' then 40 when 'nohint2' then 50
    when 'three1' then 30 when 'three3' then 70 when 'run10' then 20 when 'claude1' then 20
    when 'project1' then 100 when 'puzzle1' then 50 else null end;
  if pts is null then raise exception 'Unbekannte Aufgabe'; end if;
  select count(*) into n from quest_claims where user_id = auth.uid() and day = p_day;
  if n >= 3 then raise exception 'Heute schon 3 Aufgaben abgeholt'; end if;
  insert into quest_claims (user_id, day, quest, points) values (auth.uid(), p_day, p_quest, pts)
    on conflict do nothing;
  if not found then return 0; end if;
  perform award_points(auth.uid(), 'quest', p_quest, pts);
  return pts;
end $$;

-- ---------- Wochenrätsel ----------
-- Die Antworten liegen nur als Hash vor: sha256('s<slot>t<tier>:' || antwort_ohne_leerzeichen_klein)
create table if not exists public.weekly_puzzles (
  slot        int not null,
  tier        int not null check (tier between 1 and 3),
  title       text not null,
  answer_hash text not null,
  primary key (slot, tier)
);
alter table public.weekly_puzzles enable row level security;
revoke all on public.weekly_puzzles from anon, authenticated;   -- Hashes bleiben geheim

create table if not exists public.puzzle_solves (
  user_id   uuid not null references public.profiles on delete cascade,
  week      date not null,
  tier      int not null,
  points    int not null,
  place     int not null,
  solved_at timestamptz not null default now(),
  primary key (user_id, week, tier)
);
alter table public.puzzle_solves enable row level security;
drop policy if exists "solves read" on public.puzzle_solves;
create policy "solves read" on public.puzzle_solves for select using (true);
revoke insert, update, delete on public.puzzle_solves from anon, authenticated;
grant select on public.puzzle_solves to anon, authenticated;

create table if not exists public.puzzle_attempts (
  user_id uuid not null references public.profiles on delete cascade,
  at      timestamptz not null default now()
);
create index if not exists puzzle_attempts_user on public.puzzle_attempts (user_id, at);
alter table public.puzzle_attempts enable row level security;
revoke all on public.puzzle_attempts from anon, authenticated;

create or replace function public.submit_puzzle(p_week date, p_tier int, p_answer text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  start constant date := '2026-11-16';       -- identisch mit PUZZLE_START in js/puzzles-data.js
  slots int; s int; h text; wrong int; pl int; pts int;
begin
  if auth.uid() is null then raise exception 'Nicht angemeldet'; end if;
  if p_tier not between 1 and 3 or extract(isodow from p_week) <> 1
     or now() < p_week - interval '1 day' or now() > p_week + interval '8 days' then
    raise exception 'Diese Woche ist nicht aktiv';
  end if;
  if exists (select 1 from puzzle_solves where user_id = auth.uid() and week = p_week and tier = p_tier) then
    return jsonb_build_object('ok', true, 'points', 0);
  end if;
  select count(*) into wrong from puzzle_attempts where user_id = auth.uid() and at > now() - interval '10 minutes';
  if wrong >= 10 then
    return jsonb_build_object('ok', false, 'wait',
      greatest(1, ceil(extract(epoch from (select min(at) from puzzle_attempts where user_id = auth.uid() and at > now() - interval '10 minutes') + interval '10 minutes' - now())))::int);
  end if;
  select count(distinct slot) into slots from weekly_puzzles;
  if slots = 0 then raise exception 'Keine Rätsel eingetragen (supabase/puzzles.sql ausführen)'; end if;
  s := (((p_week - start) / 7) % slots + slots) % slots;
  h := encode(sha256(convert_to('s' || s || 't' || p_tier || ':' || lower(regexp_replace(coalesce(p_answer, ''), '\s', '', 'g')), 'UTF8')), 'hex');
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

-- ---------- Claude-Feedback: Tageslimit ----------
create table if not exists public.ai_usage (
  user_id uuid not null references public.profiles on delete cascade,
  day     date not null default current_date,
  count   int not null default 0,
  primary key (user_id, day)
);
alter table public.ai_usage enable row level security;
revoke all on public.ai_usage from anon, authenticated;

create or replace function public.bump_ai_usage()
returns jsonb language plpgsql security definer set search_path = public as $$
declare lim constant int := 20; n int;
begin
  if auth.uid() is null then raise exception 'Nicht angemeldet'; end if;
  if not exists (select 1 from profiles where id = auth.uid()) then raise exception 'Kein Profil'; end if;
  insert into ai_usage (user_id, day, count) values (auth.uid(), current_date, 1)
    on conflict (user_id, day) do update set count = ai_usage.count + 1
    returning count into n;
  if n > lim then
    update ai_usage set count = lim where user_id = auth.uid() and day = current_date;
    return jsonb_build_object('allowed', false, 'limit', lim, 'remaining', 0);
  end if;
  return jsonb_build_object('allowed', true, 'limit', lim, 'remaining', lim - n);
end $$;

-- ---------- Freundschaften ----------
create table if not exists public.friendships (
  requester_id uuid not null references public.profiles on delete cascade,
  addressee_id uuid not null references public.profiles on delete cascade,
  status       text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at   timestamptz not null default now(),
  primary key (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);
alter table public.friendships enable row level security;
drop policy if exists "friends read" on public.friendships;
drop policy if exists "friends accept" on public.friendships;
drop policy if exists "friends delete" on public.friendships;
create policy "friends read" on public.friendships for select to authenticated using (auth.uid() in (requester_id, addressee_id));
create policy "friends accept" on public.friendships for update to authenticated
  using (addressee_id = auth.uid()) with check (addressee_id = auth.uid() and status = 'accepted');
create policy "friends delete" on public.friendships for delete to authenticated using (auth.uid() in (requester_id, addressee_id));
revoke insert, update, delete on public.friendships from anon, authenticated;
grant select, delete on public.friendships to authenticated;
grant update (status) on public.friendships to authenticated;

create or replace function public.add_friend(p_username text)
returns text language plpgsql security definer set search_path = public as $$
declare target uuid;
begin
  if auth.uid() is null then raise exception 'Nicht angemeldet'; end if;
  select id into target from profiles where lower(username) = lower(p_username);
  if target is null then return 'not_found'; end if;
  if target = auth.uid() then return 'self'; end if;
  if exists (select 1 from friendships where requester_id = target and addressee_id = auth.uid()) then
    update friendships set status = 'accepted' where requester_id = target and addressee_id = auth.uid();
    return 'accepted';
  end if;
  if exists (select 1 from friendships where requester_id = auth.uid() and addressee_id = target) then return 'exists'; end if;
  if (select count(*) from friendships where requester_id = auth.uid() and status = 'pending') >= 30 then
    raise exception 'Zu viele offene Anfragen';
  end if;
  insert into friendships (requester_id, addressee_id) values (auth.uid(), target);
  return 'requested';
end $$;

-- ---------- Fortschritt (Sterne, Projektschritte …) zum Geräte-Wechsel ----------
create table if not exists public.progress (
  user_id    uuid primary key references auth.users on delete cascade,
  data       jsonb not null default '{}'::jsonb check (pg_column_size(data) < 32768),
  updated_at timestamptz not null default now()
);
alter table public.progress enable row level security;
drop policy if exists "progress read own" on public.progress;
drop policy if exists "progress insert own" on public.progress;
drop policy if exists "progress update own" on public.progress;
create policy "progress read own" on public.progress for select to authenticated using (user_id = auth.uid());
create policy "progress insert own" on public.progress for insert to authenticated with check (user_id = auth.uid());
create policy "progress update own" on public.progress for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
revoke all on public.progress from anon;
grant select, insert, update on public.progress to authenticated;

-- ---------- Ranglisten (nur Namen + Summen) ----------
create or replace view public.leaderboard_week as
  select p.id, p.username, p.total_score, sum(l.points)::bigint as points
    from point_log l join profiles p on p.id = l.user_id
   where l.created_at > now() - interval '7 days'
   group by p.id, p.username, p.total_score;

create or replace view public.puzzle_leaderboard as
  select s.week, s.user_id, p.username, sum(s.points)::bigint as points, count(*)::int as tiers, max(s.solved_at) as last_solved
    from puzzle_solves s join profiles p on p.id = s.user_id
   group by s.week, s.user_id, p.username;
grant select on public.leaderboard_week, public.puzzle_leaderboard to anon, authenticated;

-- Wie viele Spieler in welchem Rang (nur Zahlen).
create or replace function public.rank_distribution(p_thresholds bigint[])
returns table (rank_idx int, players bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if p_thresholds is null or array_length(p_thresholds, 1) is null or array_length(p_thresholds, 1) > 20 then
    raise exception 'Ungültige Ränge';
  end if;
  return query
    select greatest(width_bucket(p.total_score, p_thresholds), 1) - 1, count(*)::bigint
      from profiles p group by 1 order by 1;
end $$;

-- Eigenen Account endgültig löschen (Art. 17 DSGVO) – alles hängt per Cascade dran.
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'Nicht angemeldet'; end if;
  delete from auth.users where id = auth.uid();
end $$;

-- ---------- Rechte für die Funktionen ----------
revoke execute on function public.record_levels, public.claim_quest, public.submit_puzzle,
  public.bump_ai_usage, public.add_friend, public.delete_my_account from public, anon;
grant execute on function public.record_levels, public.claim_quest, public.submit_puzzle,
  public.bump_ai_usage, public.add_friend, public.delete_my_account to authenticated;
revoke execute on function public.rank_distribution from public;
grant execute on function public.rank_distribution to anon, authenticated;
