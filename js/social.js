'use strict';
/* =========================================================
   Login-Fenster, Freunde, Online-Status (Presence),
   Rangliste und Profil. (Aus Tastenrausch übernommen und angepasst.)
   ========================================================= */
const SOC = { tab: 'friends', lobby: null, inbox: null, online: {}, friends: [], requestsIn: [], requestsOut: [], lbKind: 'all', activity: 'Startseite', subscribed: false };

/* ---------- Login & Name ---------- */
let loginMode = 'link';
function setLoginMode(mode) {
  loginMode = mode;
  const pw = mode === 'pw';
  $$('#loginModeSeg button').forEach((b) => b.classList.toggle('on', b.dataset.mode === mode));
  $('#loginPassword').hidden = !pw; $('#loginPassword').required = pw;
  $('#loginSubmit').textContent = pw ? 'Einloggen' : 'Login-Link senden';
  $('#loginHint').textContent = pw
    ? 'Mit E-Mail und Passwort einloggen. Ein Passwort legst du nach dem ersten Login im Profil fest.'
    : 'Du bekommst einen Login-Link per E-Mail. Beim ersten Mal wird so auch dein Account erstellt.';
  $('#loginErr').textContent = '';
}
function openLogin() { $('#loginStep1').hidden = false; $('#loginStep2').hidden = true; setLoginMode(loginMode); openModal('loginModal'); }
function openNameModal() { $('#nameErr').textContent = ''; openModal('nameModal'); }
function initAuthForms() {
  $('#loginForm').onsubmit = async (e) => {
    e.preventDefault();
    const email = $('#loginEmail').value.trim(), btn = e.submitter;
    btn.disabled = true; $('#loginErr').textContent = '';
    try {
      if (loginMode === 'pw') { await signInWithPassword(email, $('#loginPassword').value); $('#loginPassword').value = ''; closeModal('loginModal'); }
      else { await sendMagicLink(email); $('#loginStep1').hidden = true; $('#loginStep2').hidden = false; $('#loginSentTo').textContent = email; }
    } catch (err) { $('#loginErr').textContent = authErrorText(err); }
    btn.disabled = false;
  };
  $('#loginModeSeg').onclick = (e) => { const b = e.target.closest('button[data-mode]'); if (b) setLoginMode(b.dataset.mode); };
  $('#nameForm').onsubmit = async (e) => {
    e.preventDefault();
    const name = $('#nameInput').value.trim();
    if (!/^[A-Za-z0-9_]{3,16}$/.test(name)) { $('#nameErr').textContent = '3–16 Zeichen: Buchstaben, Zahlen und _'; return; }
    try { await createProfile(name); closeModal('nameModal'); } catch (err) { $('#nameErr').textContent = err.message; }
  };
  $('#accountBtn').onclick = () => (NET.user && !NET.profile ? openNameModal() : NET.user ? (showScreen('social'), setTab('profile')) : openLogin());
  onHeader(() => {
    const b = $('#accountBtn');
    b.hidden = !SUPABASE_CONFIGURED || !NET.ready || Boolean(NET.error);
    b.textContent = NET.profile ? `🙂 ${NET.profile.username}` : NET.user ? '🏷 Name wählen' : '🔑 Anmelden';
  });
}

/** Hinweis-Box, falls kein Login möglich/aktiv. Gibt true zurück, wenn eingeloggt. */
function renderGate(gate, openModals = false) {
  const show = (html) => { gate.hidden = false; gate.innerHTML = html; return false; };
  if (!SUPABASE_CONFIGURED) return show(`<div class="gate-icon">🛠</div><h3>Online-Teil noch nicht eingerichtet</h3>
    <p class="muted">Lernen klappt auch offline. Für Freunde, Rangliste und Claude-Feedback: Supabase-Daten in <code>js/config.js</code> eintragen – Anleitung in der <code>README.md</code>.</p>`);
  if (NET.error) return show(`<div class="gate-icon">📡</div><h3>Keine Verbindung</h3><p class="muted">${esc(NET.error)}</p>`);
  if (!NET.ready) return show('<div class="gate-icon spin">⏳</div><h3>Verbinde …</h3>');
  if (!NET.user) {
    show(`<div class="gate-icon">🔑</div><h3>Melde dich an</h3><p class="muted">Freunde, Rangliste und Wochen-Wertung brauchen einen Account.</p><button class="primary" data-gate="login">Anmelden</button>`);
    $('[data-gate]', gate).onclick = openLogin;
    if (openModals) openLogin();
    return false;
  }
  if (!NET.profile) {
    show('<div class="gate-icon">🏷</div><h3>Wähle deinen Spielernamen</h3><button class="primary" data-gate="name">Namen wählen</button>');
    $('[data-gate]', gate).onclick = openNameModal;
    if (openModals) openNameModal();
    return false;
  }
  gate.hidden = true;
  return true;
}

function renderSocial(openModals = false) {
  const ok = renderGate($('#socialGate'), openModals);
  $('#socialHub').hidden = !ok;
  if (ok) setTab(SOC.tab);
}
function setTab(t) {
  SOC.tab = t;
  $$('#socialTabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === t));
  $$('#social .tab-panel').forEach((p) => (p.hidden = p.id !== 'tab-' + t));
  if (t === 'friends') loadFriends();
  if (t === 'leaderboard') loadLeaderboard();
  if (t === 'profile') renderProfile();
}
const socialVisible = (tab) => UI.current === 'social' && SOC.tab === tab && loggedIn();

/* ---------- Presence & Postfach ---------- */
function presencePayload() { return { username: NET.profile.username, activity: SOC.activity }; }
function setPresenceActivity(text) {
  SOC.activity = text;
  if (SOC.lobby && SOC.subscribed) SOC.lobby.track(presencePayload());
}
function socialStart() {
  if (SOC.lobby || !loggedIn()) return;
  const me = NET.user.id;
  SOC.lobby = NET.sb.channel('lobby', { config: { presence: { key: me } } });
  SOC.lobby
    .on('presence', { event: 'sync' }, () => {
      const st = SOC.lobby.presenceState();
      SOC.online = Object.fromEntries(Object.entries(st).map(([k, metas]) => [k, metas[metas.length - 1] || {}]));
      if (socialVisible('friends')) renderFriends();
    })
    .subscribe((s) => { if (s === 'SUBSCRIBED') { SOC.subscribed = true; SOC.lobby.track(presencePayload()); } });

  SOC.inbox = NET.sb.channel('user:' + me);
  SOC.inbox.on('broadcast', { event: 'friend' }, async ({ payload }) => {
    await loadFriends(socialVisible('friends'));
    const from = payload?.from;
    const f = SOC.friends.find((x) => x.id === from) || SOC.requestsIn.find((x) => x.id === from);
    if (!f) return; // Absender unbekannt → ignorieren
    const accepted = SOC.friends.includes(f);
    toast(`👋 <b>${esc(f.username)}</b> ${accepted ? 'hat deine Freundschaftsanfrage angenommen!' : 'möchte mit dir befreundet sein.'}`,
      accepted ? [] : [{ label: 'Ansehen', primary: true, onClick: () => { showScreen('social'); setTab('friends'); } }]);
  }).subscribe();
  loadFriends(false);
}
function socialStop() {
  if (SOC.lobby) NET.sb.removeChannel(SOC.lobby);
  if (SOC.inbox) NET.sb.removeChannel(SOC.inbox);
  Object.assign(SOC, { lobby: null, inbox: null, subscribed: false, online: {}, friends: [], requestsIn: [], requestsOut: [] });
}
async function sendToUser(uid, event, payload) {
  const ch = NET.sb.channel('user:' + uid);
  await new Promise((res) => { const t = setTimeout(res, 4000); ch.subscribe((s) => { if (s === 'SUBSCRIBED') { clearTimeout(t); res(); } }); });
  await ch.send({ type: 'broadcast', event, payload });
  setTimeout(() => NET.sb.removeChannel(ch), 1000);
}

/* ---------- Freunde ---------- */
async function loadFriends(render = true) {
  if (!loggedIn()) return;
  const me = NET.user.id;
  const { data: rows, error } = await NET.sb.from('friendships').select('*');
  if (error) { console.warn(error); return; }
  const other = (r) => (r.requester_id === me ? r.addressee_id : r.requester_id);
  const ids = [...new Set(rows.map(other))];
  let P = {};
  if (ids.length) {
    const { data } = await NET.sb.from('profiles').select('id,username,total_score,streak').in('id', ids);
    P = Object.fromEntries((data || []).map((p) => [p.id, p]));
  }
  SOC.friends = rows.filter((r) => r.status === 'accepted').map((r) => P[other(r)]).filter(Boolean);
  SOC.requestsIn = rows.filter((r) => r.status === 'pending' && r.addressee_id === me).map((r) => P[r.requester_id]).filter(Boolean);
  SOC.requestsOut = rows.filter((r) => r.status === 'pending' && r.requester_id === me).map((r) => P[r.addressee_id]).filter(Boolean);
  $('#friendBadge').hidden = !SOC.requestsIn.length;
  $('#friendBadge').textContent = SOC.requestsIn.length;
  if (render) renderFriends();
}
function renderFriends() {
  const on = (id) => Boolean(SOC.online[id]);
  const sorted = [...SOC.friends].sort((a, b) => on(b.id) - on(a.id) || b.total_score - a.total_score);
  $('#friendRequests').innerHTML =
    SOC.requestsIn.map((p) => `<div class="frow"><span class="fname">${esc(p.username)}</span><span class="fmeta muted">möchte dein Freund sein</span>
      <button class="primary sm" data-act="accept" data-id="${p.id}">Annehmen</button><button class="ghost sm" data-act="remove" data-id="${p.id}">Ablehnen</button></div>`).join('') +
    SOC.requestsOut.map((p) => `<div class="frow"><span class="fname">${esc(p.username)}</span><span class="fmeta muted">Anfrage ausstehend …</span>
      <button class="ghost sm" data-act="remove" data-id="${p.id}">Zurückziehen</button></div>`).join('') ||
    '<p class="muted">Keine offenen Anfragen.</p>';
  $('#friendList').innerHTML = sorted.map((p) => {
    const r = RANKS[rankIndex(p.total_score)], act = SOC.online[p.id]?.activity;
    return `<div class="frow">
      <span class="dot ${on(p.id) ? 'on' : ''}" title="${on(p.id) ? 'online' : 'offline'}"></span>
      <span class="fname">${esc(p.username)}</span>
      <span class="fmeta"><span style="color:${r[3]}">${r[2]} ${esc(r[1])}</span> <span class="muted">· ${fmt(p.total_score)} Punkte${p.streak ? ` · 🔥 ${p.streak}` : ''}</span>
        ${on(p.id) ? `<br><span class="activity">● ${esc(String(act || 'online').slice(0, 60))}</span>` : ''}</span>
      <button class="ghost sm" data-act="remove" data-id="${p.id}" title="Freund entfernen">✕</button>
    </div>`;
  }).join('') || '<p class="muted">Noch keine Freunde – füge oben jemanden über den Spielernamen hinzu!</p>';
}
function initFriends() {
  $('#friendForm').onsubmit = async (e) => {
    e.preventDefault();
    const name = $('#friendInput').value.trim(), msg = $('#friendMsg');
    if (!name) return;
    try {
      const res = await rpc('add_friend', { p_username: name });
      const texts = { not_found: '❌ Spieler nicht gefunden.', self: '😄 Das bist du selbst.', exists: 'ℹ️ Anfrage wurde schon gesendet.', accepted: '🎉 Ihr seid jetzt Freunde!', requested: '✅ Anfrage gesendet!' };
      msg.textContent = texts[res] || res;
      if (res === 'requested' || res === 'accepted') {
        $('#friendInput').value = '';
        const { data } = await NET.sb.from('profiles').select('id').ilike('username', name.replace(/_/g, '\\_')).maybeSingle();
        if (data) sendToUser(data.id, 'friend', { from: NET.user.id });
      }
      loadFriends();
    } catch (err) { msg.textContent = err.message; }
  };
  $('#tab-friends').addEventListener('click', async (e) => {
    const b = e.target.closest('button[data-act]');
    if (!b) return;
    const id = b.dataset.id, me = NET.user.id;
    if (b.dataset.act === 'accept') {
      await NET.sb.from('friendships').update({ status: 'accepted' }).eq('requester_id', id).eq('addressee_id', me);
      sendToUser(id, 'friend', { from: me });
    } else if (b.dataset.act === 'remove') {
      if (SOC.friends.some((f) => f.id === id) && !confirm('Freund wirklich entfernen?')) return;
      await NET.sb.from('friendships').delete().or(`and(requester_id.eq.${id},addressee_id.eq.${me}),and(requester_id.eq.${me},addressee_id.eq.${id})`);
    }
    loadFriends();
  });
}

/* ---------- Rangliste ---------- */
async function loadLeaderboard() {
  const k = SOC.lbKind, sb = NET.sb, me = NET.user.id;
  $$('#lbTabs button').forEach((b) => b.classList.toggle('on', b.dataset.lb === k));
  $('#lbTable').innerHTML = '<p class="muted">Lade …</p>';
  let rows = [], myRank = null;
  try {
    if (k === 'week') {
      const { data, error } = await sb.from('leaderboard_week').select('*').order('points', { ascending: false }).limit(50);
      if (error) throw error;
      rows = data.map((r) => ({ id: r.id, name: r.username, v: r.points, total: r.total_score }));
    } else {
      let q = sb.from('profiles').select('id,username,total_score,streak').order('total_score', { ascending: false }).limit(50);
      if (k === 'friends') { await loadFriends(false); q = q.in('id', [me, ...SOC.friends.map((f) => f.id)]); }
      const { data, error } = await q;
      if (error) throw error;
      rows = data.map((r) => ({ id: r.id, name: r.username, v: r.total_score, total: r.total_score }));
      if (k === 'all' && !rows.some((r) => r.id === me)) {
        const { count } = await sb.from('profiles').select('id', { count: 'exact', head: true }).gt('total_score', NET.profile.total_score);
        myRank = { rank: (count || 0) + 1, name: NET.profile.username, v: NET.profile.total_score, total: NET.profile.total_score };
      }
    }
  } catch (err) { $('#lbTable').innerHTML = `<p class="muted">Fehler: ${esc(err.message)}</p>`; return; }
  const medal = (i) => ['🥇', '🥈', '🥉'][i] || `#${i + 1}`;
  const rk = (t) => { const r = RANKS[rankIndex(t)]; return `<span style="color:${r[3]}">${r[2]} ${esc(r[1])}</span>`; };
  $('#lbTable').innerHTML = rows.length ? `<table class="lb">
    ${rows.map((r, i) => `<tr class="${r.id === me ? 'me' : ''}"><td class="rk">${medal(i)}</td><td>${esc(r.name)}</td><td class="ex">${rk(r.total)}</td><td class="vl">${fmt(r.v)}</td></tr>`).join('')}
    ${myRank ? `<tr><td colspan="4" class="muted">⋯</td></tr><tr class="me"><td class="rk">#${myRank.rank}</td><td>${esc(myRank.name)}</td><td class="ex">${rk(myRank.total)}</td><td class="vl">${fmt(myRank.v)}</td></tr>` : ''}
    </table>` : '<p class="muted">Noch keine Einträge – sei der Erste!</p>';
}
function initLeaderboard() {
  $('#lbTabs').addEventListener('click', (e) => { const b = e.target.closest('button[data-lb]'); if (b) { SOC.lbKind = b.dataset.lb; loadLeaderboard(); } });
  $('#socialTabs').addEventListener('click', (e) => { const b = e.target.closest('button[data-tab]'); if (b) setTab(b.dataset.tab); });
}

/* ---------- Profil ---------- */
async function deleteAccount() {
  const name = NET.profile?.username;
  const typed = prompt(`Account wirklich endgültig löschen? Das kann nicht rückgängig gemacht werden.\n\nTippe zur Bestätigung deinen Spielernamen „${name}“ ein:`);
  if (typed === null) return;
  if (typed.trim() !== name) { toast('❌ Der Name stimmt nicht – nichts gelöscht.'); return; }
  try {
    await rpc('delete_my_account');
    socialStop();
    await NET.sb.auth.signOut().catch(() => {});
    toast('🗑 Dein Account wurde gelöscht. Dein lokaler Fortschritt in diesem Browser bleibt erhalten.');
    showScreen('home');
  } catch (e) { toast('❌ Löschen fehlgeschlagen: ' + esc(e.message)); }
}
function renderProfile() {
  const p = NET.profile, r = RANKS[rankIndex(p.total_score)];
  const py = courseProgress('python');
  $('#tab-profile').innerHTML = `
    <div class="profile-head">
      <div class="avatar">${esc(p.username[0].toUpperCase())}</div>
      <div><div class="pname">${esc(p.username)}</div><div class="muted">${esc(NET.user.email || '')} · <span style="color:${r[3]}">${r[2]} ${esc(r[1])}</span></div></div>
      <button class="ghost" id="logoutBtn">Abmelden</button>
    </div>
    <div class="stats">
      <div><span>Punkte</span><b>${fmt(p.total_score)}</b></div>
      <div><span>Serie</span><b>🔥 ${p.streak || 0}</b></div>
      <div><span>Python</span><b>${py.done}/${py.total}</b></div>
      <div><span>Sterne</span><b>⭐ ${totalStars()}</b></div>
    </div>
    <h3>🔒 Passwort</h3>
    <form class="panel inline-form" id="pwForm">
      <input type="password" id="pwInput" placeholder="Neues Passwort (mind. 6 Zeichen)" minlength="6" autocomplete="new-password" required>
      <button class="primary">Speichern</button>
      <span class="muted small" id="pwMsg">Damit meldest du dich auf jedem Gerät ohne Login-Mail an.</span>
    </form>
    <h3>Account</h3>
    <div class="panel danger-zone">
      <span class="muted small">Löscht Profil, Punkte, Freundschaften und Fortschritt in der Cloud endgültig.</span>
      <button class="ghost danger" id="deleteAccBtn">Account löschen</button>
    </div>`;
  $('#deleteAccBtn').onclick = deleteAccount;
  $('#logoutBtn').onclick = async () => { await signOut(); showScreen('home'); };
  $('#pwForm').onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.submitter; btn.disabled = true;
    try { await setPassword($('#pwInput').value); $('#pwInput').value = ''; $('#pwMsg').textContent = '✅ Gespeichert!'; }
    catch (err) { $('#pwMsg').textContent = '⚠️ ' + authErrorText(err); }
    btn.disabled = false;
  };
}
