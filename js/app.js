/* Screens and navigation: Home → Grade → Subject → Game → Results */
(function () {
  const esc = U.esc;
  const $app = document.getElementById('app');

  const STR = {
    en: {
      question: 'Question', moves: 'Moves', word: 'Word', spell: 'Spell the word!', hint: 'Hint',
      oops: 'Oops! The right answer is shown in green.', tryAgain: 'Not quite — try again!',
      praise: ['Great job! 🎉', 'Awesome! 🌟', 'Well done! 👏', 'Super! 🚀', 'Correct! ✅'],
      memoryHint: 'Flip two cards. Find the matching pairs!', noGame: 'This game is not available for this topic yet.',
      games: { quiz: ['Quiz', '10 questions'], time: ['Time Attack', 'Beat the 60-second clock'], balloon: ['Balloon Pop', 'Pop the right balloon'], memory: ['Memory Match', 'Find the pairs'], builder: ['Word Builder', 'Spell with letter tiles'] },
      allTopics: 'All topics', chooseTopic: 'Choose a topic', chooseGame: 'Choose a game', playAgain: 'Play again', otherGame: 'Other games',
      score: 'Score', result: ['Keep practicing! 💪', 'Good try! 🙂', 'Great work! 😃', 'Amazing! 🏆'],
    },
    ar: {
      question: 'سؤال', moves: 'محاولات', word: 'كلمة', spell: 'اكتبِ الكلمة!', hint: 'مساعدة',
      oops: 'أوه! الإجابةُ الصحيحةُ باللون الأخضر.', tryAgain: 'حاولْ مرةً أخرى!',
      praise: ['أحسنت! 🎉', 'رائع! 🌟', 'ممتاز! 👏', 'بطل! 🚀', 'صحيح! ✅'],
      memoryHint: 'اقلبْ بطاقتين وابحثْ عن الأزواج المتطابقة!', noGame: 'هذه اللعبة غير متاحة لهذا الدرس.',
      games: { quiz: ['اختبار', '١٠ أسئلة'], time: ['سباق الوقت', 'أجبْ قبل انتهاء ٦٠ ثانية'], balloon: ['فرقعة البالونات', 'فرقعِ البالون الصحيح'], memory: ['لعبة الذاكرة', 'ابحثْ عن الأزواج'], builder: ['بناء الكلمات', 'رتّبِ الحروف'] },
      allTopics: 'كل الدروس', chooseTopic: 'اخترِ الدرس', chooseGame: 'اخترِ اللعبة', playAgain: 'العبْ مرةً أخرى', otherGame: 'ألعاب أخرى',
      score: 'النتيجة', result: ['استمرَّ في التدريب! 💪', 'محاولةٌ جيدة! 🙂', 'عملٌ رائع! 😃', 'مذهل! 🏆'],
    },
  };

  const GRADE_COLORS = ['#ff6b6b', '#ff922b', '#fcc419', '#51cf66', '#4dabf7', '#cc5de8'];
  const GRADE_ANIMALS = ['🐣', '🐰', '🦊', '🐼', '🦁', '🦉'];

  /* ---- Saved stars (best per grade/subject/game/topic) ---- */
  const KEY = 'kids-games-stars-v1';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const save = (d) => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* private mode */ } };
  let stars = load();
  const sumStars = (prefix = '') => Object.entries(stars).filter(([k]) => k.startsWith(prefix)).reduce((s, [, v]) => s + v, 0);
  const updateTotal = () => { document.getElementById('starTotal').textContent = sumStars(); };

  /* ---- State & navigation ---- */
  const state = { screen: 'home', grade: null, subject: null, topic: 'all', game: null, runId: 0 };
  const history = [];
  function go(screen, patch = {}, push = true) {
    if (push) history.push({ ...state });
    Object.assign(state, patch, { screen });
    state.runId++;
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    render();
    window.scrollTo(0, 0);
  }
  function back() {
    const prev = history.pop();
    if (!prev) return;
    // Skip over finished games when going back.
    if (prev.screen === 'game' || prev.screen === 'result') return back();
    Object.assign(state, prev); state.runId++;
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    render();
  }
  document.getElementById('backBtn').onclick = back;
  document.getElementById('homeBtn').onclick = () => { history.length = 0; go('home', {}, false); };
  const soundBtn = document.getElementById('soundBtn');
  soundBtn.onclick = () => { Sound.on = !Sound.on; soundBtn.textContent = Sound.on ? '🔊' : '🔇'; };

  const subj = () => SUBJECTS[state.subject];
  const gradeData = () => subj().grades[state.grade];
  const lang = () => (subj() ? subj().lang : 'en');
  const t = (k) => STR[lang()][k];

  /* Topics + which games are possible for the current selection. */
  function activeTopics() {
    const all = gradeData().topics;
    return state.topic === 'all' ? all : all.filter(x => x.id === state.topic);
  }
  function gameAvailable(g) {
    const tp = activeTopics();
    if (g.needs === 'gen') return tp.length > 0;
    if (g.needs === 'short') return tp.some(x => !x.long);
    if (g.needs === 'pair') return gradeData().topics.some(x => x.pair);
    if (g.needs === 'words') return subj().id !== 'math' && (gradeData().words || []).length > 0;
    return false;
  }

  /* ---------- Screens ---------- */
  function home() {
    $app.innerHTML = `
      <section class="hero">
        <div class="hero-emoji">🎒📚✏️</div>
        <h2>Learn & Play!  <span class="ar">تعلّم والعب!</span></h2>
        <p>Choose your grade to start · اخترْ صفَّك للبدء</p>
      </section>
      <div class="grid grades">${[1, 2, 3, 4, 5, 6].map(g => `
        <button class="tile-card grade" style="--c:${GRADE_COLORS[g - 1]}" data-g="${g}">
          <span class="big-emoji">${GRADE_ANIMALS[g - 1]}</span>
          <span class="label">Grade ${g}</span>
          <span class="sub ar">الصف ${['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'][g - 1]}</span>
          <span class="mini-stars">⭐ ${sumStars(`g${g}-`)}</span>
        </button>`).join('')}
      </div>`;
    $app.querySelectorAll('.grade').forEach(b => (b.onclick = () => go('subjects', { grade: +b.dataset.g })));
  }

  function subjects() {
    $app.innerHTML = `
      <h2 class="screen-title">Grade ${state.grade} · <span class="ar">الصف ${state.grade}</span></h2>
      <p class="center">Pick a subject · اخترِ المادة</p>
      <div class="grid subjects">${Object.values(SUBJECTS).map(s => `
        <button class="tile-card subject ${s.id}" data-s="${s.id}">
          <span class="big-emoji">${s.icon}</span>
          <span class="label">${s.name}</span>
          <span class="sub ar">${s.nameAr}</span>
          <span class="mini-stars">⭐ ${sumStars(`g${state.grade}-${s.id}-`)}</span>
        </button>`).join('')}
      </div>`;
    $app.querySelectorAll('.subject').forEach(b => (b.onclick = () => go('hub', { subject: b.dataset.s, topic: 'all' })));
  }

  function hub() {
    const s = subj(), gd = gradeData(), rtl = s.rtl;
    $app.innerHTML = `
      <div class="hub ${s.id}" ${rtl ? 'dir="rtl" lang="ar"' : ''}>
        <h2 class="screen-title">${s.icon} ${rtl ? s.nameAr : s.name} · ${rtl ? 'الصف ' + state.grade : 'Grade ' + state.grade}</h2>
        <h3>${t('chooseTopic')}</h3>
        <div class="chips">
          <button class="chip ${state.topic === 'all' ? 'on' : ''}" data-t="all">✨ ${t('allTopics')}</button>
          ${gd.topics.map(x => `<button class="chip ${state.topic === x.id ? 'on' : ''}" data-t="${x.id}">${esc(x.name)}</button>`).join('')}
        </div>
        <h3>${t('chooseGame')}</h3>
        <div class="grid games">${Games.list.filter(g => g.needs !== 'words' || s.id !== 'math').map(g => {
          const ok = gameAvailable(g), [name, desc] = t('games')[g.id], best = stars[key(g.id)] || 0;
          return `<button class="tile-card game-card" data-id="${g.id}" ${ok ? '' : 'disabled'}>
            <span class="big-emoji">${g.icon}</span><span class="label">${name}</span><span class="sub">${desc}</span>
            <span class="mini-stars">${'★'.repeat(best)}${'☆'.repeat(3 - best)}</span></button>`;
        }).join('')}</div>
      </div>`;
    $app.querySelectorAll('.chip').forEach(b => (b.onclick = () => { state.topic = b.dataset.t; hub(); }));
    $app.querySelectorAll('.game-card').forEach(b => (b.onclick = () => go('game', { game: b.dataset.id })));
  }

  const key = (gameId) => `g${state.grade}-${state.subject}-${gameId}-${state.topic}`;

  function game() {
    const s = subj(), gd = gradeData(), g = Games.list.find(x => x.id === state.game), runId = state.runId;
    let topics = activeTopics();
    if (g.needs === 'short') topics = topics.filter(x => !x.long);
    const recent = [];
    const gen = () => {
      // Avoid repeating the same question too soon.
      let q;
      for (let i = 0; i < 15; i++) {
        q = U.pick(topics).gen();
        const k = q.prompt + '|' + q.big + '|' + (q.tiles || '') + '|' + q.answer;
        if (!recent.includes(k)) { recent.push(k); if (recent.length > 8) recent.shift(); break; }
      }
      return q;
    };
    const pairs = (n) => {
      let pt = topics.filter(x => x.pair);
      if (!pt.length) pt = gd.topics.filter(x => x.pair);
      const out = [], L = new Set(), R = new Set();
      for (let i = 0; i < 300 && out.length < n; i++) {
        const [a, b] = U.pick(pt).pair();
        if (L.has(a) || R.has(b) || L.has(b) || R.has(a) || a === b) continue;
        L.add(a); R.add(b); out.push([a, b]);
      }
      return out;
    };
    const [name] = t('games')[g.id];
    $app.innerHTML = `<div class="game-wrap ${s.id}" ${s.rtl ? 'dir="rtl" lang="ar"' : ''}>
      <h2 class="screen-title small">${g.icon} ${name}</h2><div class="game-root"></div></div>`;
    g.run({
      root: $app.querySelector('.game-root'), gen, pairs, words: gd.words || [], lang: s.lang, grade: state.grade, t,
      alive: () => state.runId === runId && state.screen === 'game',
      end: (res) => { if (state.runId === runId) go('result', { result: res }); },
    });
  }

  function result() {
    const r = state.result, s = subj(), k = key(state.game);
    if ((stars[k] || 0) < r.stars) { stars[k] = r.stars; save(stars); }
    updateTotal();
    if (r.stars >= 1) { Sound.win(); confetti(r.stars * 40); }
    $app.innerHTML = `<div class="result card" ${s.rtl ? 'dir="rtl" lang="ar"' : ''}>
      <div class="result-stars">${[0, 1, 2].map(i => `<span class="${i < r.stars ? 'on' : ''}" style="animation-delay:${i * 0.25}s">★</span>`).join('')}</div>
      <h2>${t('result')[r.stars]}</h2>
      <p class="score">${t('score')}: <b>${r.score}${r.total ? ' / ' + r.total : ''}</b></p>
      <div class="row">
        <button class="btn primary again">🔁 ${t('playAgain')}</button>
        <button class="btn other">🎮 ${t('otherGame')}</button>
      </div></div>`;
    $app.querySelector('.again').onclick = () => go('game', {}, false);
    $app.querySelector('.other').onclick = () => { history.length = 0; history.push({ ...state, screen: 'home' }, { ...state, screen: 'subjects' }); go('hub', {}, false); };
  }

  function confetti(n) {
    const box = document.getElementById('confetti');
    const colors = ['#ff6b6b', '#fcc419', '#51cf66', '#4dabf7', '#cc5de8', '#ff922b'];
    for (let i = 0; i < n; i++) {
      const p = document.createElement('i');
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = U.pick(colors);
      p.style.animationDuration = 1.5 + Math.random() * 1.5 + 's';
      p.style.animationDelay = Math.random() * 0.4 + 's';
      p.style.transform = `rotate(${Math.random() * 360}deg)`;
      box.appendChild(p);
      setTimeout(() => p.remove(), 3500);
    }
  }

  function render() {
    document.getElementById('backBtn').hidden = state.screen === 'home';
    ({ home, subjects, hub, game, result })[state.screen]();
  }

  updateTotal();
  render();
})();
