'use strict';
/* =========================================================
   Feedback von Claude über die Supabase Edge Function "review".
   Der API-Key liegt nur bei Supabase, nie im Browser.
   ========================================================= */
async function askClaude() {
  const box = $('#claudeBox'), lv = LV.level;
  box.hidden = false;
  box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  if (!loggedIn()) {
    box.innerHTML = `<div class="who">🤖 Claude</div><p class="muted">${SUPABASE_CONFIGURED
      ? 'Für Claude-Feedback musst du angemeldet sein (so bleibt der API-Schlüssel geheim und es gibt ein faires Tageslimit).'
      : 'Claude-Feedback braucht den Online-Teil (Supabase + Edge Function „review“). Die Einrichtung steht in der README.'}</p>
      ${SUPABASE_CONFIGURED ? '<button class="primary sm" id="claudeLogin">Anmelden</button>' : ''}`;
    $('#claudeLogin')?.addEventListener('click', openLogin);
    return;
  }
  box.innerHTML = '<div class="who">🤖 Claude</div><p class="muted"><span class="spin">⏳</span> Claude schaut sich deinen Code an …</p>';
  try {
    if (!LV.results) {
      const { visible, hidden } = activeTests(lv);
      LV.results = await Runner.test(LV.lang, LV.editor.value, [...visible, ...hidden]);
    }
    const task = isProject(lv) ? lv.steps[projStep(lv)].task : lv.task;
    const results = LV.results.map((r) => ({
      ok: r.ok, type: r.type, label: r.label || r.msg || r.expr || '', input: r.input,
      expected: typeof r.expect === 'string' ? r.expect.slice(0, 400) : undefined,
      got: typeof r.got === 'string' ? r.got.slice(0, 400) : undefined,
      error: r.error ? `${r.error.type}: ${r.error.msg} (Zeile ${r.error.line ?? '?'})` : undefined,
    }));
    const { data, error } = await NET.sb.functions.invoke('review', {
      body: { language: LV.lang, title: lv.title, task: Array.isArray(task) ? task.join('\n\n') : task, code: LV.editor.value, results },
    });
    if (error) {
      let msg = error.message;
      try { msg = (await error.context.json()).error || msg; } catch {}
      throw new Error(msg);
    }
    box.innerHTML = `<div class="who">🤖 Claude</div>${md(data.feedback)}${data.remaining != null ? `<div class="muted small">Heute noch ${data.remaining} Feedbacks.</div>` : ''}`;
    questEvent('claude');
  } catch (e) {
    box.innerHTML = `<div class="who">🤖 Claude</div><p class="err">⚠️ ${esc(e.message)}</p>`;
  }
}
