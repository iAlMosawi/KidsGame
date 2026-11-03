/* Player names + game results. Results are stored on this device and,
   when CONFIG.SHEET_URL is set, sent to your Google Sheet. */
const Progress = (() => {
  const RES = 'kids-games-results-v1', QUEUE = 'kids-games-queue-v1', PLAYER = 'kids-games-player-v1', PLAYERS = 'kids-games-players-v1';
  const get = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
  const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } };
  const cleanName = (n) => String(n || '').replace(/\s+/g, ' ').trim().slice(0, 30);
  const cloud = () => typeof CONFIG !== 'undefined' && !!CONFIG.SHEET_URL;

  async function flush() {
    if (!cloud()) return;
    const q = get(QUEUE, []);
    if (!q.length) return;
    try {
      // text/plain avoids a CORS preflight, which Apps Script does not answer.
      const r = await fetch(CONFIG.SHEET_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(q) });
      const j = await r.json();
      if (j.ok) { const ids = new Set(q.map(x => x.id)); set(QUEUE, get(QUEUE, []).filter(x => !ids.has(x.id))); }
    } catch (e) { /* offline: keep the queue and retry later */ }
  }

  return {
    cloud,
    cleanName,
    player: () => get(PLAYER, ''),
    setPlayer(name) {
      name = cleanName(name); if (!name) return;
      set(PLAYER, name);
      const ps = get(PLAYERS, []).filter(p => p.toLowerCase() !== name.toLowerCase());
      ps.unshift(name); set(PLAYERS, ps.slice(0, 40));
    },
    players: () => get(PLAYERS, []),
    removePlayer(name) { set(PLAYERS, get(PLAYERS, []).filter(p => p !== name)); if (get(PLAYER, '') === name) set(PLAYER, ''); },
    add(r) {
      const rec = Object.assign({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8), time: new Date().toISOString() }, r);
      set(RES, get(RES, []).concat(rec).slice(-5000));
      if (cloud()) { set(QUEUE, get(QUEUE, []).concat(rec)); flush(); }
      return rec;
    },
    local: () => get(RES, []),
    clearLocal() { set(RES, []); set(QUEUE, []); },
    pending: () => get(QUEUE, []).length,
    flush,
    async fetchCloud(pin) {
      const r = await fetch(CONFIG.SHEET_URL + (CONFIG.SHEET_URL.includes('?') ? '&' : '?') + 'pin=' + encodeURIComponent(pin));
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'error');
      return j.results;
    },
  };
})();
window.addEventListener('online', () => Progress.flush());
