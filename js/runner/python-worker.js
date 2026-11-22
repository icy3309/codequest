/* Pyodide-Worker: führt Python im Hintergrund aus, damit Endlosschleifen
   die Seite nicht einfrieren (der Haupt-Thread beendet den Worker dann). */
const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
let py = null;

const ready = (async () => {
  importScripts(PYODIDE_URL + 'pyodide.js');
  py = await loadPyodide({ indexURL: PYODIDE_URL });
  const harness = await (await fetch('harness.py?v=3')).text();
  py.runPython(harness);
  postMessage({ type: 'ready' });
})().catch((e) => postMessage({ type: 'fatal', msg: String(e && e.message || e) }));

onmessage = async ({ data }) => {
  try {
    await ready;
    const fn = py.globals.get(data.cmd === 'run' ? 'api_run' : 'api_test');
    const res = data.cmd === 'run'
      ? fn(data.code, JSON.stringify(data.inputs || []), Boolean(data.interactive))
      : fn(data.code, JSON.stringify(data.tests || []));
    fn.destroy();
    postMessage({ type: 'result', id: data.id, result: JSON.parse(res) });
  } catch (e) {
    postMessage({ type: 'result', id: data.id, crash: String(e && e.message || e) });
  }
};
