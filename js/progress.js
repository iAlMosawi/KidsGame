/* Players, results, mistakes, streaks, badges, homework and shared settings.
   Everything is kept on this device; when CONFIG.SHEET_URL is set, results go
   to your Google Sheet and homework/settings come from it. */
const Progress = (() => {
  const RES = 'kids-games-results-v1', QUEUE = 'kids-games-queue-v1', PLAYER = 'kids-games-player-v1',
    PLAYERS = 'kids-games-players-v1', PROFILES = 'kids-games-profiles-v1', SETTINGS = 'kids-games-settings-v1',
    PUBLIC = 'kids-games-public-cache-v1';
  const get = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } };
  const cleanName = (n) => String(n || '').replace(/\s+/g, ' ').trim().slice(0, 30);
  const cleanClass = (c) => String(c || '').replace(/\s+/g, '').trim().toUpperCase().slice(0, 10);
  const cloud = () => typeof CONFIG !== 'undefined' && !!CONFIG.SHEET_URL;
  const lower = (s) => String(s || '').trim().toLowerCase();
  const day = (d) => { const x = new Date(d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
  const me = () => lower(get(PLAYER, ''));

  async function flush() {
    if (!cloud()) return;
    // First time this device sees the Sheet: also send results played before it was connected.
    const BF = 'kids-games-backfilled:' + CONFIG.SHEET_URL;
    if (!get(BF, false)) {
      const q0 = get(QUEUE, []), ids = new Set(q0.map(x => x.id));
      set(QUEUE, q0.concat(get(RES, []).filter(r => !ids.has(r.id))));
      set(BF, true);
    }
    const q = get(QUEUE, []).slice(0, 200);
    if (!q.length) return;
    try {
      // text/plain avoids a CORS preflight, which Apps Script does not answer.
      const r = await fetch(CONFIG.SHEET_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(q) });
      const j = await r.json();
      if (j.ok) { const ids = new Set(q.map(x => x.id)); set(QUEUE, get(QUEUE, []).filter(x => !ids.has(x.id))); if (get(QUEUE, []).length) flush(); }
    } catch (e) { /* offline: keep the queue and retry later */ }
  }

  /* ---- Badges: computed from this child's results on this device ---- */
  const BADGES = [
    { id: 'first', icon: '🎮', en: 'First game', ar: 'أول لعبة', test: s => s.games >= 1 },
    { id: 'g10', icon: '🎯', en: '10 games', ar: '١٠ ألعاب', test: s => s.games >= 10 },
    { id: 'g50', icon: '🏅', en: '50 games', ar: '٥٠ لعبة', test: s => s.games >= 50 },
    { id: 'g100', icon: '🏆', en: '100 games', ar: '١٠٠ لعبة', test: s => s.games >= 100 },
    { id: 'three', icon: '⭐', en: 'First 3 stars', ar: 'أول ٣ نجوم', test: s => s.threeStar >= 1 },
    { id: 'perfect', icon: '💯', en: 'Perfect quiz', ar: 'اختبار كامل', test: s => s.perfect >= 1 },
    { id: 's3', icon: '🔥', en: '3 days in a row', ar: '٣ أيام متتالية', test: s => s.bestStreak >= 3 },
    { id: 's7', icon: '🌟', en: '7 days in a row', ar: '٧ أيام متتالية', test: s => s.bestStreak >= 7 },
    { id: 'rainbow', icon: '🌈', en: 'Played all 3 subjects', ar: 'لعبت المواد الثلاث', test: s => s.subjects >= 3 },
    { id: 'math', icon: '🧮', en: 'Math master (5× 3 stars)', ar: 'بطل الرياضيات', test: s => s.three.math >= 5 },
    { id: 'eng', icon: '📚', en: 'English star (5× 3 stars)', ar: 'نجم الإنجليزية', test: s => s.three.english >= 5 },
    { id: 'arb', icon: '🌙', en: 'Arabic star (5× 3 stars)', ar: 'نجم العربية', test: s => s.three.arabic >= 5 },
    { id: 'tables', icon: '✖️', en: 'Times-table master', ar: 'بطل جدول الضرب', test: s => s.tables },
    { id: 'daily5', icon: '📅', en: '5 daily challenges', ar: '٥ تحديات يومية', test: s => s.daily >= 5 },
    { id: 'hw', icon: '📌', en: 'Homework done', ar: 'أنجزت الواجب', test: s => s.homework >= 1 },
    { id: 'fixer', icon: '♻️', en: 'Fixed 10 mistakes', ar: 'صحّحت ١٠ أخطاء', test: s => s.fixed >= 10 },
    { id: 'grade', icon: '🎓', en: 'Played every topic in a grade', ar: 'كل دروس صفٍّ', test: s => s.fullGrade },
  ];
  const LEVELS = [['Beginner', 'مبتدئ'], ['Explorer', 'مستكشف'], ['Learner', 'متعلّم'], ['Star', 'نجم'], ['Champion', 'بطل'], ['Hero', 'خارق'], ['Legend', 'أسطورة']];

  function streakInfo(rows) {
    const days = new Set(rows.map(r => day(r.time)));
    let cur = 0;
    const d = new Date();
    if (!days.has(day(d))) d.setDate(d.getDate() - 1); // still counts if you played yesterday
    while (days.has(day(d))) { cur++; d.setDate(d.getDate() - 1); }
    const sorted = [...days].sort();
    let best = 0, run = 0, prev = null;
    for (const s of sorted) {
      const t = new Date(s + 'T12:00:00');
      run = prev && (t - prev) / 864e5 < 1.5 ? run + 1 : 1;
      best = Math.max(best, run); prev = t;
    }
    return { current: cur, best, today: days.has(day(new Date())) };
  }

  const api = {
    cloud, cleanName, cleanClass, day,
    /* ---- players ---- */
    player: () => get(PLAYER, ''),
    profile(name) { return get(PROFILES, {})[lower(name || get(PLAYER, ''))] || { avatar: '🙂', cls: '' }; },
    setPlayer(name, avatar, cls) {
      name = cleanName(name); if (!name) return;
      set(PLAYER, name);
      const ps = get(PLAYERS, []).filter(p => lower(p) !== lower(name));
      ps.unshift(name); set(PLAYERS, ps.slice(0, 40));
      const pr = get(PROFILES, {}), old = pr[lower(name)] || {};
      pr[lower(name)] = { avatar: avatar || old.avatar || '🙂', cls: cls === undefined ? (old.cls || '') : cleanClass(cls), grade: old.grade || null };
      set(PROFILES, pr);
    },
    setLastGrade(g) { const pr = get(PROFILES, {}); if (pr[me()]) { pr[me()].grade = g; set(PROFILES, pr); } },
    players: () => get(PLAYERS, []),

    /* ---- results ---- */
    add(r) {
      const p = api.profile();
      const rec = Object.assign({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8), time: new Date().toISOString(), cls: p.cls || '', avatar: p.avatar || '' }, r);
      set(RES, get(RES, []).concat(rec).slice(-5000));
      if (cloud()) { set(QUEUE, get(QUEUE, []).concat(rec)); flush(); }
      return rec;
    },
    local: () => get(RES, []),
    mine: () => get(RES, []).filter(r => lower(r.name) === me()),
    pending: () => get(QUEUE, []).length,
    flush,

    /* ---- mistakes for "Practice my mistakes" ---- */
    mistakes(subject, grade) {
      const all = get('kids-games-mistakes-v1:' + me(), []);
      return all.filter(m => (!subject || m.subject === subject) && (!grade || +m.grade === +grade));
    },
    addMistake(m) {
      const k = 'kids-games-mistakes-v1:' + me(), all = get(k, []);
      const key = m.q.prompt + '|' + m.q.big + '|' + (m.q.tiles || '') + '|' + m.q.answer;
      if (all.some(x => x.key === key)) return;
      set(k, all.concat(Object.assign({ key, at: Date.now() }, m)).slice(-60));
    },
    fixMistake(q) {
      const k = 'kids-games-mistakes-v1:' + me(), key = q.prompt + '|' + q.big + '|' + (q.tiles || '') + '|' + q.answer, all = get(k, []);
      if (!all.some(x => x.key === key)) return false;
      set(k, all.filter(x => x.key !== key));
      set('kids-games-fixed-v1:' + me(), get('kids-games-fixed-v1:' + me(), 0) + 1);
      return true;
    },

    /* ---- streaks, levels, badges ---- */
    streak: () => streakInfo(api.mine()),
    stats(totalStars, homeworkDone) {
      const rows = api.mine(), three = { math: 0, english: 0, arabic: 0 };
      rows.forEach(r => { if (+r.stars === 3 && three[r.subject] != null) three[r.subject]++; });
      const st = streakInfo(rows);
      // Every topic in a grade+subject played at least once?
      let fullGrade = false;
      if (typeof SUBJECTS !== 'undefined') {
        const played = new Set(rows.map(r => r.subject + '|' + r.grade + '|' + r.topicId));
        fullGrade = Object.values(SUBJECTS).some(s => Object.entries(s.grades).some(([g, gd]) => gd.topics.every(t => played.has(s.id + '|' + g + '|' + t.id))));
      }
      return {
        games: rows.length, threeStar: rows.filter(r => +r.stars === 3).length,
        perfect: rows.filter(r => r.game === 'quiz' && +r.total > 0 && +r.score === +r.total).length,
        bestStreak: st.best, streak: st, subjects: new Set(rows.map(r => r.subject).filter(s => s !== 'mixed')).size, three,
        tables: rows.some(r => r.subject === 'math' && r.topicId === 'mult' && +r.stars === 3),
        daily: new Set(rows.filter(r => r.game === 'daily').map(r => day(r.time))).size,
        homework: homeworkDone || 0, fixed: get('kids-games-fixed-v1:' + me(), 0), fullGrade, stars: totalStars || 0,
      };
    },
    BADGES, LEVELS,
    level(stars) { const n = Math.floor((stars || 0) / 15); return { n: n + 1, name: LEVELS[Math.min(n, LEVELS.length - 1)], next: (n + 1) * 15, into: (stars || 0) - n * 15 }; },
    earned(s) { return BADGES.filter(b => b.test(s)).map(b => b.id); },
    newBadges(s) {
      const k = 'kids-games-badges-v1:' + me(), seen = get(k, []), now = api.earned(s), fresh = now.filter(id => !seen.includes(id));
      if (fresh.length) set(k, now);
      return BADGES.filter(b => fresh.includes(b.id));
    },

    /* ---- homework + settings (shared through the Sheet when connected) ---- */
    settings() { return Object.assign({ leaderboard: false, homework: [] }, cloud() ? get(PUBLIC, {}).settings : get(SETTINGS, {})); },
    saveLocalSettings(s) { set(SETTINGS, s); },
    leaderboardData() { return cloud() ? (get(PUBLIC, {}).leaderboard || []) : null; },
    async refreshPublic() {
      if (!cloud()) return false;
      try {
        const j = await (await fetch(CONFIG.SHEET_URL + (CONFIG.SHEET_URL.includes('?') ? '&' : '?') + 'public=1')).json();
        if (j.ok) { set(PUBLIC, { settings: j.settings || {}, leaderboard: j.leaderboard || [], at: Date.now() }); return true; }
      } catch (e) { /* offline */ }
      return false;
    },
    homeworkDone(hw, name) {
      const rows = (name ? get(RES, []).filter(r => lower(r.name) === lower(name)) : api.mine());
      return rows.some(r => api.matchesHomework(r, hw));
    },
    matchesHomework(r, hw) {
      return new Date(r.time) >= new Date(hw.created) && +r.grade === +hw.grade && r.subject === hw.subject &&
        (hw.topicId === 'all' || r.topicId === hw.topicId) && (!hw.game || hw.game === 'any' || r.game === hw.game);
    },

    /* ---- admin ---- */
    async fetchCloud(pin) {
      const r = await fetch(CONFIG.SHEET_URL + (CONFIG.SHEET_URL.includes('?') ? '&' : '?') + 'pin=' + encodeURIComponent(pin));
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'error');
      return { results: j.results, settings: j.settings || {} };
    },
    async saveCloudSettings(pin, settings) {
      const r = await fetch(CONFIG.SHEET_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'settings', pin, settings }) });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'error');
      return true;
    },
  };
  return api;
})();
window.addEventListener('online', () => Progress.flush());
