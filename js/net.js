'use strict';
/* =========================================================
   Supabase: Verbindung, Login (Login-Link/Passwort), Profil,
   Fortschritt in der Cloud. Ohne config.js läuft alles offline.
   (Übernommen und angepasst aus Tastenrausch.)
   ========================================================= */
const SB_CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';
const SB_SRI = 'sha384-0w2KAL2YHP6wKOkUDzkCDGgVvfmHnj02DHeQ6XcHOgTfFsGyonKOpShMH1x6nk9o';
const NET = { sb: null, user: null, profile: null, ready: !SUPABASE_CONFIGURED, error: '', subs: [] };

const onNetChange = (fn) => NET.subs.push(fn);
const netNotify = () => NET.subs.forEach((f) => f());
const loggedIn = () => Boolean(NET.profile);

function loadScript(src, integrity) {
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src;
    if (integrity) { s.integrity = integrity; s.crossOrigin = 'anonymous'; }
    s.referrerPolicy = 'no-referrer';
    s.onload = res;
    s.onerror = () => rej(new Error('Supabase-Bibliothek konnte nicht geladen werden (offline?)'));
    document.head.appendChild(s);
  });
}

async function netInit() {
  if (!SUPABASE_CONFIGURED) return;
  try {
    await loadScript(SB_CDN, SB_SRI);
    NET.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    NET.sb.auth.onAuthStateChange((_e, session) => setTimeout(() => handleSession(session), 0));
  } catch (e) {
    console.warn(e);
    NET.error = e.message; NET.ready = true; netNotify();
  }
}

async function handleSession(session) {
  const uid = session?.user?.id || null;
  if (NET.ready && uid === (NET.user?.id || null)) return; // Token-Refresh
  NET.user = session?.user || null;
  // Login-Token aus der Adresszeile entfernen (nach Klick auf den Login-Link)
  if (/access_token|refresh_token/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search);
  cloudLoaded = false;
  NET.profile = NET.user ? await fetchProfile(NET.user.id) : null;
  NET.ready = true;
  netNotify();
}
async function fetchProfile(id) {
  const { data, error } = await NET.sb.from('profiles').select('*').eq('id', id).maybeSingle();
  if (error) console.warn(error);
  return data || null;
}
async function refreshProfile() {
  if (!NET.user) return;
  NET.profile = await fetchProfile(NET.user.id);
  netNotify();
}

async function sendMagicLink(email) {
  const { error } = await NET.sb.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname } });
  if (error) throw error;
}
async function signInWithPassword(email, password) {
  const { error } = await NET.sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
}
async function setPassword(password) {
  const { error } = await NET.sb.auth.updateUser({ password });
  if (error) throw error;
}
function authErrorText(err) {
  const m = String(err?.message || err);
  if (/rate limit|too many|security purposes/i.test(m)) return '⏳ Zu viele Login-Mails in kurzer Zeit. Warte etwa eine Stunde – oder melde dich mit Passwort an, falls du schon eins hast.';
  if (/invalid login credentials/i.test(m)) return 'E-Mail oder Passwort falsch. Noch kein Passwort? Melde dich einmal per Login-Link an und leg im Profil eins fest.';
  if (/password should be|at least 6/i.test(m)) return 'Das Passwort muss mindestens 6 Zeichen lang sein.';
  if (/email not confirmed/i.test(m)) return 'Diese E-Mail ist noch nicht bestätigt – melde dich einmal per Login-Link an.';
  if (/same password|different from the old/i.test(m)) return 'Das ist schon dein aktuelles Passwort.';
  return m;
}
async function createProfile(username) {
  const { error } = await NET.sb.from('profiles').insert({ id: NET.user.id, username });
  if (error) {
    if (error.code === '23505') throw new Error('Dieser Name ist schon vergeben.');
    if (error.code === '23514') throw new Error('3–16 Zeichen: Buchstaben, Zahlen und _');
    throw error;
  }
  await refreshProfile();
}
async function signOut() { await NET.sb.auth.signOut(); }

async function rpc(name, args = {}) {
  const { data, error } = await NET.sb.rpc(name, args);
  if (error) throw new Error(error.message);
  return data;
}

/* ---------- Punkte ---------- */
/** Level-Sterne an den Server melden. Der Server rechnet die Punkte selbst aus (nur Verbesserungen zählen). */
async function recordLevelOnline(id, stars) {
  if (!loggedIn()) return;
  try {
    const gained = await rpc('record_levels', { p_levels: { [id]: stars } });
    if (gained > 0) await refreshProfile();
  } catch (e) { console.warn('Level nicht gespeichert:', e.message); }
}
/** Beim Login: alle lokal gelösten Level melden (z. B. offline gespielt oder anderes Gerät). */
async function syncLevelsOnline() {
  if (!loggedIn() || !Object.keys(save.stars).length) return;
  try {
    const gained = await rpc('record_levels', { p_levels: save.stars });
    if (gained > 0) { await refreshProfile(); toast(`☁️ ${fmt(gained)} Punkte aus deinem lokalen Fortschritt übernommen.`); }
  } catch (e) { console.warn(e.message); }
}

/* ---------- Fortschritt in der Cloud ---------- */
let cloudTimer = null, cloudLoaded = false, cloudLoading = null;
function cloudLoad() {
  if (!NET.user || cloudLoaded) return Promise.resolve();
  return (cloudLoading ||= cloudFetchMerge().finally(() => { cloudLoading = null; }));
}
async function cloudFetchMerge() {
  const uid = NET.user.id;
  const { data, error } = await NET.sb.from('progress').select('data').eq('user_id', uid).maybeSingle();
  if (NET.user?.id !== uid) return;
  if (error) { console.warn('Fortschritt nicht geladen:', error.message); return; }
  const merged = mergeSave(save, data?.data || {});
  const changed = JSON.stringify(cloudFields(merged)) !== JSON.stringify(cloudFields(save));
  Object.assign(save, merged);
  cloudLoaded = true;
  persist();
  refreshHeader();
  UI.enterHooks[UI.current]?.();
  if (changed && data) toast('☁️ Dein Fortschritt wurde aus deinem Account geladen.');
  await syncLevelsOnline();
}
function cloudSave() {
  if (!NET.sb || !NET.user || !cloudLoaded) return;
  clearTimeout(cloudTimer);
  cloudTimer = setTimeout(async () => {
    const { error } = await NET.sb.from('progress').upsert({ user_id: NET.user.id, data: cloudFields(save), updated_at: new Date().toISOString() });
    if (error) console.warn('Fortschritt nicht gesichert:', error.message);
  }, 800);
}
