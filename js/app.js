/* Screens and navigation: Name → Home → Grade → Subject → Game → Results (+ Badges, Leaderboard) */
(function () {
  const esc = U.esc;
  const $app = document.getElementById('app');

  const STR = {
    en: {
      question: 'Question', moves: 'Moves', word: 'Word', spell: 'Spell the word!', hint: 'Hint', next: 'Next', answerIs: 'The answer is', dragHere: 'Drag or tap the pieces here', reset: 'Start over',
      oops: 'Oops! The right answer is shown in green.', tryAgain: 'Not quite — try again!',
      praise: ['Great job! 🎉', 'Awesome! 🌟', 'Well done! 👏', 'Super! 🚀', 'Correct! ✅'],
      memoryHint: 'Flip two cards. Find the matching pairs!', noGame: 'This game is not available for this topic yet.',
      games: { quiz: ['Quiz', '10 questions'], time: ['Time Attack', 'Beat the 60-second clock'], balloon: ['Balloon Pop', 'Pop the right balloon'], memory: ['Memory Match', 'Find the pairs'], builder: ['Word Builder', 'Spell with letter tiles'], order: ['Put in Order', 'Drag the pieces into order'], practice: ['Practice my mistakes', 'Fix the questions you missed'], daily: ['Daily Challenge', '5 questions a day'] },
      allTopics: 'All topics', selected: 'Games will use', tapTopic: 'Tap a topic to practice just that one.', chooseTopic: 'Choose a topic', chooseGame: 'Choose a game', playAgain: 'Play again', otherGame: 'Other games',
      score: 'Score', result: ['Keep practicing! 💪', 'Good try! 🙂', 'Great work! 😃', 'Amazing! 🏆'], toFix: 'to fix', weak: 'Your weak topics',
    },
    ar: {
      question: 'سؤال', moves: 'محاولات', word: 'كلمة', spell: 'اكتبِ الكلمة!', hint: 'مساعدة', next: 'التالي', answerIs: 'الإجابة الصحيحة', dragHere: 'اسحبِ القطعَ أو اضغطْ عليها لوضعها هنا', reset: 'من جديد',
      oops: 'أوه! الإجابةُ الصحيحةُ باللون الأخضر.', tryAgain: 'حاولْ مرةً أخرى!',
      praise: ['أحسنت! 🎉', 'رائع! 🌟', 'ممتاز! 👏', 'بطل! 🚀', 'صحيح! ✅'],
      memoryHint: 'اقلبْ بطاقتين وابحثْ عن الأزواج المتطابقة!', noGame: 'هذه اللعبة غير متاحة لهذا الدرس.',
      games: { quiz: ['اختبار', '١٠ أسئلة'], time: ['سباق الوقت', 'أجبْ قبل انتهاء ٦٠ ثانية'], balloon: ['فرقعة البالونات', 'فرقعِ البالون الصحيح'], memory: ['لعبة الذاكرة', 'ابحثْ عن الأزواج'], builder: ['بناء الكلمات', 'رتّبِ الحروف'], order: ['رتّب الجملة', 'اسحبِ الكلمات بالترتيب'], practice: ['تدرّب على أخطائي', 'صحّحِ الأسئلة التي أخطأتَ فيها'], daily: ['التحدي اليومي', '٥ أسئلة كل يوم'] },
      allTopics: 'كل الدروس', selected: 'الألعاب ستستخدم', tapTopic: 'اضغطْ على درسٍ للتدرّب عليه وحده.', chooseTopic: 'اخترِ الدرس', chooseGame: 'اخترِ اللعبة', playAgain: 'العبْ مرةً أخرى', otherGame: 'ألعاب أخرى',
      score: 'النتيجة', result: ['استمرَّ في التدريب! 💪', 'محاولةٌ جيدة! 🙂', 'عملٌ رائع! 😃', 'مذهل! 🏆'], toFix: 'للتصحيح', weak: 'دروسك الضعيفة',
    },
  };

  const GRADE_COLORS = ['#ff6b6b', '#ff922b', '#fcc419', '#51cf66', '#4dabf7', '#cc5de8'];
  const GRADE_ANIMALS = ['🐣', '🐰', '🦊', '🐼', '🦁', '🦉'];
  const AVATARS = ['🐱', '🐶', '🦊', '🐼', '🐨', '🦁', '🐯', '🐸', '🐵', '🐰', '🦄', '🐙', '🦋', '🐢', '🦖', '🐧', '🐝', '🦉', '🐬', '🚀'];
  const SUBJ_ICON = { english: '🔤', math: '🔢', arabic: '🌙', mixed: '🎲' };

  /* ---- Saved stars (best per grade/subject/game/topic), per player ---- */
  const KEY = () => 'kids-games-stars-v1:' + Progress.player().toLowerCase();
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY())) || {}; } catch (e) { return {}; } };
  const save = (d) => { try { localStorage.setItem(KEY(), JSON.stringify(d)); } catch (e) { /* private mode */ } };
  let stars = load();
  const sumStars = (prefix = '') => Object.entries(stars).filter(([k]) => k.startsWith(prefix)).reduce((s, [, v]) => s + v, 0);
  // Total stars = best stars per game slot + stars from daily challenges and practice.
  const totalStars = () => sumStars() + Progress.mine().filter(r => r.game === 'daily' || r.game === 'practice').reduce((s, r) => s + (+r.stars || 0), 0);
  const updatePlayer = () => {
    const n = Progress.player(), p = Progress.profile();
    document.getElementById('playerName').textContent = n ? `${p.avatar || '🙂'} ${n}` : '?';
    stars = load(); updateTotal();
  };
  const updateTotal = () => { document.getElementById('starTotal').textContent = totalStars(); };

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
    if (!prev) return go('home', {}, false);
    if (prev.screen === 'game' || prev.screen === 'result') return back();
    Object.assign(state, prev); state.runId++;
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    render();
  }
  document.getElementById('backBtn').onclick = back;
  document.getElementById('homeBtn').onclick = () => { history.length = 0; go(Progress.player() ? 'home' : 'player', {}, false); };
  document.getElementById('playerBtn').onclick = () => { history.length = 0; go('player', {}, false); };
  const soundBtn = document.getElementById('soundBtn');
  soundBtn.onclick = () => { Sound.on = !Sound.on; soundBtn.textContent = Sound.on ? '🔊' : '🔇'; };

  const subj = () => SUBJECTS[state.subject];
  const gradeData = () => subj().grades[state.grade];
  const lang = () => (state.subject && subj() ? subj().lang : 'en');
  const t = (k) => STR[lang()][k];
  const T = (k) => STR.en[k];

  /* Topics that can be shown on this device (listening needs a voice). */
  const usable = (topics, l) => topics.filter(x => !x.needsVoice || Voice.has(x.needsVoice));
  function activeTopics() {
    const all = usable(gradeData().topics);
    return state.topic === 'all' ? all : all.filter(x => x.id === state.topic);
  }
  function gameAvailable(g) {
    const tp = activeTopics();
    if (g.needs === 'gen') return tp.length > 0;
    if (g.needs === 'short') return tp.some(x => !x.long);
    if (g.needs === 'pair') return gradeData().topics.some(x => x.pair);
    if (g.needs === 'words') return subj().id !== 'math' && (gradeData().words || []).length > 0;
    if (g.needs === 'order') return !!gradeData().order;
    return false;
  }

  /* Tag each generated question with where it came from (used for mistakes and speech). */
  const tag = (q, s, g, topic) => Object.assign(q, { _s: s.id, _g: +g, _t: topic.id, sayLang: q.sayLang || s.lang });

  /* ---- Toasts (badges, tips) ---- */
  function toast(html, ms = 3500) {
    const el = document.createElement('div'); el.className = 'toast'; el.innerHTML = html;
    document.body.appendChild(el); setTimeout(() => el.classList.add('show'), 10);
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, ms);
  }
  let warnedVoice = false;
  document.addEventListener('no-voice', () => {
    if (warnedVoice) return; warnedVoice = true;
    toast('🔇 This device has no Arabic voice, so Arabic can\'t be read aloud here.<br><small>A grown-up can add one in the device settings (Language & Speech), or add recordings to the <b>audio</b> folder.</small>', 7000);
  });
  document.addEventListener('voices-ready', () => { if (state.screen === 'hub') hub(); });

  /* ---------- Name, avatar and class ---------- */
  function player() {
    const known = Progress.players(), cur = Progress.player(), prof = cur ? Progress.profile(cur) : { avatar: AVATARS[0], cls: '' };
    let avatar = prof.avatar && prof.avatar !== '🙂' ? prof.avatar : AVATARS[0];
    $app.innerHTML = `
      <section class="hero">
        <div class="hero-emoji">👋</div>
        <h2>What is your name? <span class="ar">ما اسمك؟</span></h2>
      </section>
      <form class="card name-form">
        <input id="nameInput" maxlength="30" autocomplete="off" placeholder="Your name · اسمك" value="${esc(cur)}" dir="auto" required>
        <label class="lbl">Choose your animal · اخترْ حيوانك</label>
        <div class="avatars">${AVATARS.map(a => `<button type="button" class="avatar ${a === avatar ? 'on' : ''}" data-a="${a}">${a}</button>`).join('')}</div>
        <label class="lbl" for="classInput">Your class (optional) · صفّك وشعبتك (اختياري)</label>
        <input id="classInput" class="small-input" maxlength="10" autocomplete="off" placeholder="e.g. 3A · مثال: 3A" value="${esc(prof.cls || '')}" dir="ltr">
        <button class="btn primary" type="submit">Let's play! · هيا نلعب ▶</button>
      </form>
      ${known.length ? `<h3 class="center">Or choose your name · أو اخترْ اسمك</h3>
      <div class="players">${known.map(n => { const p = Progress.profile(n); return `<button class="player-chip ${n === cur ? 'on' : ''}" data-n="${esc(n)}" dir="auto">${p.avatar || '🙂'} ${esc(n)}${p.cls ? ` <small>${esc(p.cls)}</small>` : ''}</button>`; }).join('')}</div>` : ''}`;
    const input = $app.querySelector('#nameInput');
    if (!cur) input.focus();
    $app.querySelectorAll('.avatar').forEach(b => (b.onclick = () => { avatar = b.dataset.a; $app.querySelectorAll('.avatar').forEach(x => x.classList.toggle('on', x === b)); Sound.flip(); }));
    const start = (n, av, cls) => { if (!Progress.cleanName(n)) return input.focus(); Progress.setPlayer(n, av, cls); updatePlayer(); history.length = 0; go('home', {}, false); };
    $app.querySelector('form').onsubmit = (e) => { e.preventDefault(); start(input.value, avatar, $app.querySelector('#classInput').value); };
    $app.querySelectorAll('.player-chip').forEach(b => (b.onclick = () => start(b.dataset.n)));
  }

  /* ---------- Home ---------- */
  const myHomework = () => {
    const cls = Progress.profile().cls || '';
    return (Progress.settings().homework || []).filter(h => !h.cls || h.cls === cls);
  };
  function weakTopics(limit = 3) {
    const m = {};
    Progress.mine().filter(r => r.topicId && r.topicId !== 'all' && SUBJECTS[r.subject]).forEach(r => {
      const k = r.subject + '|' + r.grade + '|' + r.topicId;
      const p = ['quiz', 'balloon', 'builder', 'practice', 'order'].includes(r.game) && +r.total > 0 ? +r.score / +r.total : (+r.stars || 0) / 3;
      (m[k] = m[k] || []).push(p);
    });
    return Object.entries(m).map(([k, v]) => ({ k, avg: v.reduce((a, b) => a + b, 0) / v.length })).filter(x => x.avg < 0.6).sort((a, b) => a.avg - b.avg).slice(0, limit)
      .map(x => { const [s, g, id] = x.k.split('|'); const tp = (SUBJECTS[s].grades[g].topics.find(t => t.id === id) || {}); return { s, g: +g, id, name: tp.name, avg: x.avg }; }).filter(x => x.name);
  }

  function home() {
    const name = Progress.player(), prof = Progress.profile(), ts = totalStars(), lv = Progress.level(ts), st = Progress.streak();
    const mistakes = Progress.mistakes().length, hw = myHomework(), settings = Progress.settings(), dailyDone = Progress.mine().some(r => r.game === 'daily' && Progress.day(r.time) === Progress.day(new Date()));
    const lastGrade = prof.grade, weak = weakTopics();
    const hwDone = hw.filter(h => Progress.homeworkDone(h)).length;
    const earned = Progress.earned(Progress.stats(ts, hwDone));
    $app.innerHTML = `
      <section class="hero compact">
        <div class="hero-avatar">${prof.avatar || '🙂'}</div>
        <h2>Hi ${esc(name)}! <span class="ar">أهلاً ${esc(name)}!</span></h2>
        <div class="level-box">
          <span class="lv">Level ${lv.n} · ${lv.name[0]} <span class="ar">${lv.name[1]}</span></span>
          <div class="bar"><div class="bar-fill" style="width:${Math.round(lv.into / 15 * 100)}%;background:#fcc419"></div></div>
          <span class="muted small">⭐ ${ts} · ${lv.next - ts} more to Level ${lv.n + 1}</span>
        </div>
        <div class="home-pills">
          <span class="pill">🔥 ${st.current} day${st.current === 1 ? '' : 's'} in a row</span>
          <button class="pill link" id="badgesBtn">🏅 ${earned.length}/${Progress.BADGES.length} badges</button>
          ${settings.leaderboard ? '<button class="pill link" id="boardBtn">🏆 Leaderboard</button>' : ''}
        </div>
      </section>

      <div class="grid quick">
        <button class="tile-card quick-card daily ${dailyDone ? 'done' : ''}" id="dailyBtn" ${lastGrade ? '' : 'disabled'}>
          <span class="big-emoji">${dailyDone ? '✅' : '📅'}</span><span class="label">Daily Challenge</span>
          <span class="sub">${dailyDone ? 'Done today! Come back tomorrow' : lastGrade ? `5 mixed questions · Grade ${lastGrade}` : 'Choose your grade below first'}</span></button>
        <button class="tile-card quick-card practice" id="practiceBtn" ${mistakes || weak.length ? '' : 'disabled'}>
          <span class="big-emoji">♻️</span><span class="label">Practice my mistakes</span>
          <span class="sub">${mistakes ? `${mistakes} question${mistakes > 1 ? 's' : ''} to fix` : weak.length ? 'Practice your weak topics' : 'No mistakes yet — great!'}</span></button>
      </div>

      ${hw.length ? `<h3>📌 Homework · الواجب</h3><div class="hw-list">${hw.map(h => {
        const done = Progress.homeworkDone(h), s = SUBJECTS[h.subject], g = Games.list.find(x => x.id === h.game);
        return `<div class="hw ${done ? 'done' : ''}"><div><b dir="auto">${SUBJ_ICON[h.subject] || ''} ${esc(s ? s.name : h.subject)} · Grade ${esc(h.grade)} · ${esc(h.topicName || 'All topics')}</b>
          <div class="muted small" dir="auto">${g ? 'Game: ' + esc(STR.en.games[g.id][0]) + ' · ' : ''}${h.due ? 'Due ' + esc(h.due) : ''}${h.note ? ' · ' + esc(h.note) : ''}</div></div>
          ${done ? '<span class="badge-done">✅ Done</span>' : `<button class="btn primary hw-go" data-id="${esc(h.id)}">Start ▶</button>`}</div>`;
      }).join('')}</div>` : ''}

      ${weak.length ? `<p class="muted center small">💪 Needs practice: ${weak.map(w => `${SUBJ_ICON[w.s]} ${esc(w.name)} (G${w.g})`).join(' · ')}</p>` : ''}

      <h3>Choose your grade · اخترْ صفَّك</h3>
      <div class="grid grades">${[1, 2, 3, 4, 5, 6].map(g => `
        <button class="tile-card grade ${lastGrade === g ? 'mine' : ''}" style="--c:${GRADE_COLORS[g - 1]}" data-g="${g}">
          <span class="big-emoji">${GRADE_ANIMALS[g - 1]}</span>
          <span class="label">Grade ${g}</span>
          <span class="sub ar">الصف ${['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'][g - 1]}</span>
          <span class="mini-stars">⭐ ${sumStars(`g${g}-`)}</span>
        </button>`).join('')}
      </div>`;
    $app.querySelectorAll('.grade').forEach(b => (b.onclick = () => { Progress.setLastGrade(+b.dataset.g); go('subjects', { grade: +b.dataset.g }); }));
    $app.querySelector('#dailyBtn').onclick = () => { if (!dailyDone) go('game', { game: 'daily', grade: lastGrade, subject: null, topic: 'all' }); else toast('✅ You already did today\'s challenge. See you tomorrow!'); };
    $app.querySelector('#practiceBtn').onclick = () => go('game', { game: 'practice', subject: null, grade: null, topic: 'all' });
    $app.querySelector('#badgesBtn').onclick = () => go('badges');
    const bb = $app.querySelector('#boardBtn'); if (bb) bb.onclick = () => go('board');
    $app.querySelectorAll('.hw-go').forEach(b => (b.onclick = () => {
      const h = hw.find(x => x.id === b.dataset.id);
      if (!SUBJECTS[h.subject]) return;
      Progress.setLastGrade(+h.grade);
      history.length = 0; history.push({ ...state, screen: 'home' });
      if (h.game && h.game !== 'any') go('game', { grade: +h.grade, subject: h.subject, topic: h.topicId || 'all', game: h.game });
      else go('hub', { grade: +h.grade, subject: h.subject, topic: h.topicId || 'all' });
    }));
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

  const topicName = () => (state.topic === 'all' ? t('allTopics') : (gradeData().topics.find(x => x.id === state.topic) || {}).name);
  const key = (gameId) => `g${state.grade}-${state.subject}-${gameId}-${state.topic}`;

  function hub(pulse = false) {
    const s = subj(), gd = gradeData(), rtl = s.rtl, topics = usable(gd.topics);
    const mist = Progress.mistakes(s.id, state.grade).length;
    $app.innerHTML = `
      <div class="hub ${s.id}" ${rtl ? 'dir="rtl" lang="ar"' : ''}>
        <h2 class="screen-title">${s.icon} ${rtl ? s.nameAr : s.name} · ${rtl ? 'الصف ' + state.grade : 'Grade ' + state.grade}</h2>
        <h3>${t('chooseTopic')}</h3>
        <p class="hint start">${t('tapTopic')}</p>
        <div class="chips">
          <button class="chip ${state.topic === 'all' ? 'on' : ''}" data-t="all">${state.topic === 'all' ? '✅' : '✨'} ${t('allTopics')}</button>
          ${topics.map(x => `<button class="chip ${state.topic === x.id ? 'on' : ''}" data-t="${x.id}">${state.topic === x.id ? '✅ ' : ''}${esc(x.name)}</button>`).join('')}
        </div>
        <div class="selected-topic${pulse ? ' pulse' : ''}">🎯 ${t('selected')}: <b>${esc(topicName())}</b></div>
        <h3>${t('chooseGame')}</h3>
        <div class="grid games">${Games.list.filter(g => (g.needs !== 'words' || s.id !== 'math')).map(g => {
          const ok = gameAvailable(g), [name, desc] = t('games')[g.id], best = stars[key(g.id)] || 0;
          return `<button class="tile-card game-card" data-id="${g.id}" ${ok ? '' : 'disabled'}>
            <span class="big-emoji">${g.icon}</span><span class="label">${name}</span><span class="sub">${desc}</span>
            <span class="mini-stars">${'★'.repeat(best)}${'☆'.repeat(3 - best)}</span></button>`;
        }).join('')}
          <button class="tile-card game-card practice-card" data-id="practice" ${mist ? '' : 'disabled'}>
            <span class="big-emoji">♻️</span><span class="label">${t('games').practice[0]}</span><span class="sub">${mist ? mist + ' ' + t('toFix') : t('games').practice[1]}</span></button>
        </div>
      </div>`;
    $app.querySelectorAll('.chip').forEach(b => (b.onclick = () => {
      const y = window.scrollY;
      state.topic = b.dataset.t; Sound.flip(); hub(true); window.scrollTo(0, y);
    }));
    $app.querySelectorAll('.game-card').forEach(b => (b.onclick = () => go('game', { game: b.dataset.id })));
  }

  /* ---------- Playing a game ---------- */
  function game() {
    const runId = state.runId, started = Date.now(), special = state.game === 'daily' || state.game === 'practice';
    const g = special ? { id: state.game, icon: state.game === 'daily' ? '📅' : '♻️', run: Games.quiz } : Games.list.find(x => x.id === state.game);
    let gen, total, pairs, words = [], order = null, label, wrapClass = 'mixed', rtl = false, gameLang = 'en';

    if (state.game === 'daily') {
      // 5 questions mixed across all subjects of the child's grade.
      const pool = Object.values(SUBJECTS).flatMap(s => usable(s.grades[state.grade].topics).filter(x => !x.long || s.id !== 'english').map(tp => [s, tp]));
      gen = () => { const [s, tp] = U.pick(pool); return tag(tp.gen(), s, state.grade, tp); };
      total = 5; label = `Grade ${state.grade} · English, Math & Arabic`;
    } else if (state.game === 'practice') {
      // Mistakes first (this subject/grade when started from a subject page), then weak topics.
      const list = U.shuffle(Progress.mistakes(state.subject, state.grade));
      const weak = weakTopics(5).filter(w => (!state.subject || w.s === state.subject) && (!state.grade || w.g === +state.grade));
      total = Math.max(5, Math.min(10, list.length));
      gen = (i) => {
        if (i < list.length) { const m = list[i]; return Object.assign({}, m.q, { choices: U.shuffle(m.q.choices) }); }
        const w = weak.length ? U.pick(weak) : null;
        if (w) { const s = SUBJECTS[w.s], tp = s.grades[w.g].topics.find(x => x.id === w.id); return tag(tp.gen(), s, w.g, tp); }
        const s = state.subject ? subj() : SUBJECTS[U.pick(Object.keys(SUBJECTS))], gr = state.grade || Progress.profile().grade || 1, tp = U.pick(usable(s.grades[gr].topics));
        return tag(tp.gen(), s, gr, tp);
      };
      label = state.subject ? `${subj().name} · Grade ${state.grade}` : 'All subjects';
      if (state.subject) { wrapClass = subj().id; rtl = !!subj().rtl; gameLang = subj().lang; }
    } else {
      const s = subj(), gd = gradeData();
      let topics = activeTopics();
      if (g.needs === 'short') topics = topics.filter(x => !x.long);
      const recent = [];
      gen = () => {
        let q;
        for (let i = 0; i < 15; i++) {
          const tp = U.pick(topics); q = tag(tp.gen(), s, state.grade, tp);
          const k = q.prompt + '|' + q.big + '|' + (q.tiles || '') + '|' + q.answer;
          if (!recent.includes(k)) { recent.push(k); if (recent.length > 8) recent.shift(); break; }
        }
        return q;
      };
      pairs = (n) => {
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
      words = gd.words || []; order = gd.order; label = topicName();
      wrapClass = s.id; rtl = !!s.rtl; gameLang = s.lang;
    }
    const strings = STR[special && !rtl ? 'en' : (rtl ? 'ar' : 'en')], tt = k => strings[k];
    const [name] = strings.games[g.id];
    $app.innerHTML = `<div class="game-wrap ${wrapClass}" ${rtl ? 'dir="rtl" lang="ar"' : ''}>
      <h2 class="screen-title small">${g.icon} ${name}</h2><p class="game-topic">🎯 ${esc(label)}</p><div class="game-root"></div></div>`;
    g.run({
      root: $app.querySelector('.game-root'), gen, total, pairs, words, order, lang: gameLang, grade: state.grade || 1, t: tt,
      alive: () => state.runId === runId && state.screen === 'game',
      answered: (q, ok) => {
        if (!q || !q._s) return;
        if (ok) Progress.fixMistake(q);
        else Progress.addMistake({ subject: q._s, grade: q._g, topicId: q._t, q });
      },
      end: (res) => {
        if (state.runId !== runId) return;
        Progress.add({
          name: Progress.player(), grade: state.grade || '', subject: state.game === 'daily' ? 'mixed' : (state.subject || 'mixed'),
          topic: label, topicId: special ? state.game : state.topic,
          game: g.id, score: res.score, total: res.total == null ? '' : res.total, stars: res.stars,
          seconds: Math.round((Date.now() - started) / 1000),
        });
        go('result', { result: res, resultLang: rtl ? 'ar' : 'en' });
      },
    });
  }

  function result() {
    const r = state.result, special = state.game === 'daily' || state.game === 'practice', ar = state.resultLang === 'ar';
    const before = Progress.level(totalStars() - (special ? r.stars : 0));
    if (!special) { const k = key(state.game); if ((stars[k] || 0) < r.stars) { stars[k] = r.stars; save(stars); } }
    updateTotal();
    const ts = totalStars(), lv = Progress.level(ts);
    const hwDone = myHomework().filter(h => Progress.homeworkDone(h)).length;
    const fresh = Progress.newBadges(Progress.stats(ts, hwDone));
    if (r.stars >= 1) { Sound.win(); confetti(r.stars * 40); }
    const S = STR[ar ? 'ar' : 'en'];
    $app.innerHTML = `<div class="result card" ${ar ? 'dir="rtl" lang="ar"' : ''}>
      <div class="result-stars">${[0, 1, 2].map(i => `<span class="${i < r.stars ? 'on' : ''}" style="animation-delay:${i * 0.25}s">★</span>`).join('')}</div>
      <h2>${S.result[r.stars]}</h2>
      <p class="score">${S.score}: <b>${r.score}${r.total ? ' / ' + r.total : ''}</b></p>
      ${lv.n > before.n ? `<div class="levelup">⬆️ Level ${lv.n}! ${lv.name[0]} · ${lv.name[1]}</div>` : ''}
      ${fresh.length ? `<div class="new-badges"><b>🎉 New badge${fresh.length > 1 ? 's' : ''}!</b>${fresh.map(b => `<div class="badge-pop">${b.icon} ${esc(ar ? b.ar : b.en)}</div>`).join('')}</div>` : ''}
      <div class="row">
        <button class="btn primary again">🔁 ${S.playAgain}</button>
        <button class="btn other">${special ? '🏠 Home' : '🎮 ' + S.otherGame}</button>
      </div></div>`;
    if (fresh.length) setTimeout(() => Sound.badge(), 700);
    const again = $app.querySelector('.again');
    if (state.game === 'daily') again.style.display = 'none';
    again.onclick = () => go('game', {}, false);
    $app.querySelector('.other').onclick = () => {
      history.length = 0;
      if (special || !state.subject) return go('home', {}, false);
      history.push({ ...state, screen: 'home' }, { ...state, screen: 'subjects' }); go('hub', {}, false);
    };
  }

  /* ---------- Badges ---------- */
  function badges() {
    const ts = totalStars(), hwDone = myHomework().filter(h => Progress.homeworkDone(h)).length, s = Progress.stats(ts, hwDone), got = Progress.earned(s), lv = Progress.level(ts);
    $app.innerHTML = `<h2 class="screen-title">🏅 My badges · أوسمتي</h2>
      <p class="center">Level ${lv.n} · ${lv.name[0]} <span class="ar">${lv.name[1]}</span> · ⭐ ${ts} · 🔥 best streak ${s.bestStreak} day(s)</p>
      <div class="grid badges">${Progress.BADGES.map(b => `<div class="badge-card ${got.includes(b.id) ? 'got' : ''}">
        <div class="b-icon">${got.includes(b.id) ? b.icon : '🔒'}</div><div class="b-name">${esc(b.en)}</div><div class="b-name ar">${esc(b.ar)}</div></div>`).join('')}</div>`;
  }

  /* ---------- Leaderboard (only when the admin switches it on) ---------- */
  function board() {
    const prof = Progress.profile(), mine = Progress.player().toLowerCase();
    let rows = Progress.leaderboardData();
    if (!rows) { // no Sheet: build from this device
      const since = Date.now() - 7 * 864e5, m = {};
      Progress.local().forEach(r => {
        if (!r.name || new Date(r.time) < since) return;
        const k = r.name.trim().toLowerCase() + '|' + (r.cls || '');
        m[k] = m[k] || { name: r.name.trim(), cls: r.cls || '', avatar: r.avatar || '', stars: 0, games: 0 };
        m[k].stars += +r.stars || 0; m[k].games++;
      });
      rows = Object.values(m).sort((a, b) => b.stars - a.stars);
    }
    const onlyClass = state.boardClass !== false && !!prof.cls;
    const list = (onlyClass ? rows.filter(r => r.cls === prof.cls) : rows).slice(0, 20);
    $app.innerHTML = `<h2 class="screen-title">🏆 This week · هذا الأسبوع</h2>
      ${prof.cls ? `<div class="row"><button class="chip ${onlyClass ? 'on' : ''}" id="myClass">My class ${esc(prof.cls)}</button><button class="chip ${onlyClass ? '' : 'on'}" id="everyone">Everyone</button></div>` : ''}
      <div class="card board">${list.length ? list.map((r, i) => `<div class="board-row ${r.name.toLowerCase() === mine ? 'me' : ''}">
        <span class="rank">${['🥇', '🥈', '🥉'][i] || i + 1}</span><span class="who" dir="auto">${r.avatar || '🙂'} ${esc(r.name)} ${r.cls ? `<small class="muted">${esc(r.cls)}</small>` : ''}</span>
        <span class="pts">⭐ ${r.stars}</span></div>`).join('') : '<p class="center muted">No games this week yet.</p>'}</div>
      <p class="center muted small">Stars earned in the last 7 days. Keep playing to climb! 🚀</p>`;
    const a = $app.querySelector('#myClass'), b = $app.querySelector('#everyone');
    if (a) a.onclick = () => { state.boardClass = true; board(); };
    if (b) b.onclick = () => { state.boardClass = false; board(); };
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
    document.getElementById('backBtn').hidden = state.screen === 'home' || state.screen === 'player';
    ({ player, home, subjects, hub, game, result, badges, board })[state.screen]();
  }

  if (!Progress.player()) state.screen = 'player';
  updatePlayer();
  render();
  Progress.flush();
  // Homework and leaderboard come from the Sheet when it's connected.
  const pull = async () => { if (await Progress.refreshPublic() && state.screen === 'home') home(); };
  pull(); setInterval(pull, 5 * 60 * 1000);
})();
