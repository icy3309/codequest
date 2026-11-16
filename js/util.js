'use strict';
/* =========== Kleine Helfer =========== */
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (n) => Math.round(Number(n) || 0).toLocaleString('de-DE');
const starsHtml = (n, max = 3) => `<span class="stars">${[...Array(max)].map((_, i) => `<span class="${i < n ? 'on' : 'off'}">★</span>`).join('')}</span>`;

/** Mini-Markdown: Absätze, **fett**, `code`, ```Codeblöcke```, - Listen. Alles wird escaped. */
function md(text) {
  const out = [];
  if (Array.isArray(text)) text = text.join('\n\n');
  String(text || '').trim().split(/```/).forEach((b, i) => {
    if (i % 2 === 1) { out.push(`<pre class="code">${highlight(b.replace(/^\w*\n/, '').replace(/\n$/, ''))}</pre>`); return; }
    for (const para of b.split(/\n\s*\n/)) {
      const p = para.trim();
      if (!p) continue;
      const lines = p.split('\n');
      if (lines.every((l) => /^\s*[-•]\s/.test(l))) {
        out.push('<ul>' + lines.map((l) => `<li>${inline(l.replace(/^\s*[-•]\s/, ''))}</li>`).join('') + '</ul>');
      } else out.push(`<p>${lines.map(inline).join('<br>')}</p>`);
    }
  });
  return out.join('');
}
function inline(s) {
  return esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
}

/* ---------- Syntax-Highlighting (Python, bewusst simpel) ---------- */
const PY_KW = new Set('False None True and as assert break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield'.split(' '));
const PY_BI = new Set('print input len range int str float bool list dict set tuple type sum min max abs round sorted reversed enumerate zip map filter isinstance super self any all chr ord'.split(' '));
function highlight(code) {
  const re = /(#[^\n]*)|("""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$)|[fFrRbB]{0,2}"(?:\\.|[^"\\\n])*"?|[fFrRbB]{0,2}'(?:\\.|[^'\\\n])*'?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)(\s*\()?/g;
  let out = '', last = 0, m;
  while ((m = re.exec(code))) {
    out += esc(code.slice(last, m.index));
    last = re.lastIndex;
    if (m[1]) out += `<span class="tk-c">${esc(m[1])}</span>`;
    else if (m[2]) out += `<span class="tk-s">${esc(m[2])}</span>`;
    else if (m[3]) out += `<span class="tk-n">${esc(m[3])}</span>`;
    else {
      const w = m[4], paren = m[5] || '';
      if (PY_KW.has(w)) out += `<span class="tk-k">${w}</span>${esc(paren)}`;
      else if (PY_BI.has(w)) out += `<span class="tk-b">${w}</span>${esc(paren)}`;
      else if (paren) out += `<span class="tk-f">${w}</span>${esc(paren)}`;
      else out += esc(w);
    }
    if (m[0] === '') re.lastIndex++;
  }
  return out + esc(code.slice(last));
}

const dayStr = (offset = 0) => new Date(Date.now() - offset * 864e5).toLocaleDateString('sv');
/** Einfacher deterministischer Hash (z. B. für die Auswahl der Tagesaufgaben). */
function hashStr(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
async function sha256Hex(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
