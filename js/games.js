/* Sound, speech and the five game types. Each game gets a ctx:
   { root, gen(), pairs(n), words, lang, t(key), end({score,total,stars}) } */
const Sound = {
  on: true, ctx: null,
  tone(freq, dur = 0.12, type = 'sine', when = 0, vol = 0.15) {
    if (!this.on) return;
    try {
      this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
      const c = this.ctx, o = c.createOscillator(), g = c.createGain(), t0 = c.currentTime + when;
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      o.connect(g).connect(c.destination); o.start(t0); o.stop(t0 + dur);
    } catch (e) { /* audio not available */ }
  },
  good() { this.tone(660, 0.1); this.tone(990, 0.15, 'sine', 0.08); },
  bad() { this.tone(180, 0.25, 'square', 0, 0.06); },
  pop() { this.tone(500, 0.06, 'triangle'); },
  flip() { this.tone(400, 0.05, 'triangle', 0, 0.08); },
  win() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.18, 'sine', i * 0.12)); },
};

function speak(text, lang) {
  if (!text || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
  u.rate = 0.85;
  const v = speechSynthesis.getVoices().find(v => v.lang && v.lang.toLowerCase().startsWith(lang));
  if (v) u.voice = v;
  speechSynthesis.speak(u);
}

const Games = (() => {
  const esc = U.esc;

  function questionHTML(q) {
    let h = `<div class="q-prompt">${esc(q.prompt)}${q.say ? ' <button class="speak" title="Listen">🔈</button>' : ''}</div>`;
    if (q.big) h += `<div class="q-big ${q.bigClass || ''}">${esc(q.big)}</div>`;
    if (q.tiles) h += `<div class="q-tiles">${q.tiles.map(c => `<span class="tile ${c === '_' ? 'blank' : ''}">${c === '_' ? '?' : esc(c)}</span>`).join('')}</div>`;
    return h;
  }
  function bindSpeak(root, q, lang) {
    const b = root.querySelector('.speak');
    if (b) b.onclick = () => speak(q.say, lang);
  }
  const head = (left, right, pct) =>
    `<div class="game-head"><span class="pill">${left}</span><div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div><span class="pill">${right}</span></div>`;

  /* ---------- 1. Quiz: 10 multiple-choice questions ---------- */
  function quiz(ctx) {
    const total = 10; let n = 0, score = 0, q, locked;
    const next = () => {
      if (n >= total) return ctx.end({ score, total, stars: score >= 10 ? 3 : score >= 8 ? 2 : score >= 5 ? 1 : 0 });
      q = ctx.gen(); n++; locked = false;
      ctx.root.innerHTML = head(`${ctx.t('question')} ${n}/${total}`, `⭐ ${score}`, ((n - 1) / total) * 100) +
        `<div class="card question">${questionHTML(q)}</div>
         <div class="answers">${q.choices.map(c => `<button class="answer">${esc(c)}</button>`).join('')}</div>
         <div class="feedback"></div>`;
      bindSpeak(ctx.root, q, ctx.lang);
      ctx.root.querySelectorAll('.answer').forEach(b => (b.onclick = () => choose(b)));
    };
    const choose = (b) => {
      if (locked) return; locked = true;
      const fb = ctx.root.querySelector('.feedback');
      if (b.textContent === q.answer) {
        score++; b.classList.add('correct'); Sound.good(); fb.textContent = U.pick(ctx.t('praise'));
        setTimeout(next, 900);
      } else {
        b.classList.add('wrong'); Sound.bad(); fb.textContent = ctx.t('oops');
        ctx.root.querySelectorAll('.answer').forEach(x => { if (x.textContent === q.answer) x.classList.add('correct'); });
        setTimeout(next, 1700);
      }
    };
    next();
  }

  /* ---------- 2. Time Attack: as many as possible in 60 seconds ---------- */
  function timeAttack(ctx) {
    const LIMIT = 60; let left = LIMIT, score = 0, streak = 0, q, locked, timer;
    const finish = () => { clearInterval(timer); ctx.end({ score, total: null, stars: score >= 18 ? 3 : score >= 12 ? 2 : score >= 6 ? 1 : 0 }); };
    const draw = () => {
      ctx.root.innerHTML = head(`⏱️ <b class="time">${left}</b>s`, `⭐ ${score} ${streak >= 3 ? '🔥' + streak : ''}`, (left / LIMIT) * 100) +
        `<div class="card question">${questionHTML(q)}</div>
         <div class="answers">${q.choices.map(c => `<button class="answer">${esc(c)}</button>`).join('')}</div>`;
      bindSpeak(ctx.root, q, ctx.lang);
      ctx.root.querySelectorAll('.answer').forEach(b => (b.onclick = () => choose(b)));
    };
    const next = () => { q = ctx.gen(); locked = false; draw(); };
    const choose = (b) => {
      if (locked) return; locked = true;
      if (b.textContent === q.answer) { score++; streak++; b.classList.add('correct'); Sound.good(); setTimeout(next, 350); }
      else {
        streak = 0; b.classList.add('wrong'); Sound.bad();
        ctx.root.querySelectorAll('.answer').forEach(x => { if (x.textContent === q.answer) x.classList.add('correct'); });
        setTimeout(next, 900);
      }
    };
    timer = setInterval(() => {
      if (!ctx.alive()) return clearInterval(timer);
      left--;
      const t = ctx.root.querySelector('.time'), f = ctx.root.querySelector('.bar-fill');
      if (t) t.textContent = left;
      if (f) f.style.width = (left / LIMIT) * 100 + '%';
      if (left <= 0) finish();
    }, 1000);
    next();
  }

  /* ---------- 3. Balloon Pop: pop the balloon with the right answer ---------- */
  function balloons(ctx) {
    const total = 10, colors = ['#ff6b6b', '#4dabf7', '#51cf66', '#fcc419', '#cc5de8', '#ff922b'];
    let n = 0, score = 0, lives = 3, q, items = [], raf, last, busy;
    ctx.root.innerHTML = `<div class="balloon-head"></div><div class="card question small"></div><div class="sky"></div>`;
    const sky = ctx.root.querySelector('.sky');
    const drawHead = () => {
      ctx.root.querySelector('.balloon-head').innerHTML =
        head(`${ctx.t('question')} ${Math.min(n, total)}/${total}`, `${'❤️'.repeat(lives)}${'🤍'.repeat(3 - lives)}  ⭐ ${score}`, (n / total) * 100);
    };
    const finish = () => { cancelAnimationFrame(raf); ctx.end({ score, total, stars: score >= 9 ? 3 : score >= 7 ? 2 : score >= 4 ? 1 : 0 }); };
    const next = () => {
      if (n >= total || lives <= 0) return finish();
      q = ctx.gen(); n++; busy = false; drawHead();
      const qc = ctx.root.querySelector('.question'); qc.innerHTML = questionHTML(q); bindSpeak(qc, q, ctx.lang);
      sky.innerHTML = ''; items = [];
      const lanes = U.shuffle([...Array(q.choices.length).keys()]), H = sky.clientHeight;
      q.choices.forEach((c, i) => {
        const el = document.createElement('button');
        el.className = 'balloon'; el.style.setProperty('--c', colors[(i + n) % colors.length]);
        el.innerHTML = `<span>${esc(c)}</span>`;
        el.style.left = ((lanes[i] + 0.5) / q.choices.length) * 100 + '%';
        const it = { el, text: c, y: -40 - Math.random() * 120, speed: 38 + Math.random() * 22 + n * 2, H };
        el.onclick = () => hit(it);
        sky.appendChild(el); items.push(it);
      });
    };
    const hit = (it) => {
      if (busy) return;
      if (it.text === q.answer) {
        busy = true; score++; Sound.pop(); Sound.good(); it.el.classList.add('popped');
        setTimeout(next, 600);
      } else {
        Sound.bad(); lives--; it.el.classList.add('wrong-b'); it.el.disabled = true; drawHead();
        if (lives <= 0) { busy = true; setTimeout(finish, 700); }
      }
    };
    const loop = (ts) => {
      if (!ctx.alive()) return;
      const dt = last ? Math.min((ts - last) / 1000, 0.05) : 0; last = ts;
      const H = sky.clientHeight;
      if (!busy) {
        for (const it of items) {
          it.y += it.speed * dt;
          it.el.style.bottom = it.y + 'px';
          if (it.text === q.answer && it.y > H) { // the right balloon escaped
            busy = true; lives--; Sound.bad(); drawHead();
            it.el.classList.add('escaped');
            setTimeout(next, 700);
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    next(); raf = requestAnimationFrame(loop);
  }

  /* ---------- 4. Memory Match: flip cards to find pairs ---------- */
  function memory(ctx) {
    const pairs = ctx.pairs(ctx.grade <= 2 ? 6 : 8);
    if (pairs.length < 3) { ctx.root.innerHTML = `<p class="card">${ctx.t('noGame')}</p>`; return; }
    let cards = [];
    pairs.forEach(([a, b], i) => { cards.push({ id: i, text: a }, { id: i, text: b }); });
    cards = U.shuffle(cards);
    let open = [], found = 0, moves = 0, lock = false;
    const draw = () => {
      ctx.root.innerHTML = head(`${ctx.t('moves')}: <b class="moves">${moves}</b>`, `✅ <b class="found">${found}</b>/${pairs.length}`, 0) +
        `<p class="hint">${ctx.t('memoryHint')}</p><div class="memory grid-${cards.length}">${cards.map((c, i) =>
          `<button class="mcard" data-i="${i}"><span class="front">❓</span><span class="back ${/\p{Extended_Pictographic}/u.test(c.text) && c.text.length <= 24 ? 'emo' : ''}">${esc(c.text)}</span></button>`).join('')}</div>`;
      ctx.root.querySelectorAll('.mcard').forEach(b => (b.onclick = () => flip(b)));
    };
    const flip = (b) => {
      const c = cards[b.dataset.i];
      if (lock || b.classList.contains('open') || b.classList.contains('done')) return;
      b.classList.add('open'); Sound.flip(); open.push(b);
      if (open.length < 2) return;
      moves++; ctx.root.querySelector('.moves').textContent = moves;
      const [x, y] = open, cx = cards[x.dataset.i], cy = cards[y.dataset.i];
      if (cx.id === cy.id) {
        x.classList.add('done'); y.classList.add('done'); open = []; found++; Sound.good();
        ctx.root.querySelector('.found').textContent = found;
        if (found === pairs.length) {
          const p = pairs.length;
          setTimeout(() => ctx.end({ score: found, total: p, moves, stars: moves <= p + 3 ? 3 : moves <= p * 2 ? 2 : 1 }), 700);
        }
      } else {
        lock = true;
        setTimeout(() => { x.classList.remove('open'); y.classList.remove('open'); open = []; lock = false; }, 1000);
      }
    };
    draw();
  }

  /* ---------- 5. Word Builder: tap letters to spell the picture ---------- */
  function builder(ctx) {
    const list = U.sample(ctx.words, Math.min(8, ctx.words.length));
    if (!list.length) { ctx.root.innerHTML = `<p class="card">${ctx.t('noGame')}</p>`; return; }
    let n = 0, score = 0, mistakes = 0, word, letters, slots, pool, usedHint;
    const extraPool = ctx.lang === 'ar' ? 'ابتثجحخدرزسشصعفقكلمنهوي' : 'abcdefghilmnoprstu';
    const next = () => {
      if (n >= list.length) {
        const total = list.length;
        return ctx.end({ score, total, stars: score === total && mistakes <= 2 ? 3 : score >= total * 0.75 ? 2 : score >= total / 2 ? 1 : 0 });
      }
      const [w, e] = list[n]; n++;
      word = w; letters = [...w]; usedHint = false; let wrongTries = 0;
      const decoys = ctx.grade >= 3 ? U.sample([...extraPool].filter(c => !letters.includes(c)), 2) : [];
      pool = U.shuffle([...letters, ...decoys]).map((c, i) => ({ c, i, used: false }));
      slots = letters.map(() => null);
      const draw = () => {
        ctx.root.innerHTML = head(`${ctx.t('word')} ${n}/${list.length}`, `⭐ ${score}`, ((n - 1) / list.length) * 100) +
          `<div class="card question"><div class="q-prompt">${ctx.t('spell')} <button class="speak">🔈</button></div><div class="q-big emoji">${e}</div>
           <div class="slots">${slots.map((s, i) => `<button class="slot ${s ? 'filled' : ''}" data-i="${i}">${s ? esc(s.c) : ''}</button>`).join('')}</div></div>
           <div class="letters">${pool.map((p, i) => `<button class="letter-tile" data-i="${i}" ${p.used ? 'disabled' : ''}>${esc(p.c)}</button>`).join('')}</div>
           <div class="row"><button class="btn ghost hint-btn">💡 ${ctx.t('hint')}</button></div><div class="feedback"></div>`;
        ctx.root.querySelector('.speak').onclick = () => speak(word, ctx.lang);
        ctx.root.querySelectorAll('.letter-tile').forEach(b => (b.onclick = () => place(+b.dataset.i)));
        ctx.root.querySelectorAll('.slot').forEach(b => (b.onclick = () => removeAt(+b.dataset.i)));
        ctx.root.querySelector('.hint-btn').onclick = hint;
      };
      const place = (pi) => {
        const p = pool[pi], si = slots.indexOf(null);
        if (p.used || si < 0) return;
        p.used = true; slots[si] = p; Sound.flip(); draw(); check();
      };
      const removeAt = (si) => { if (!slots[si]) return; slots[si].used = false; slots[si] = null; draw(); };
      const hint = () => {
        // Clear wrong letters, then place the next correct letter.
        slots.forEach((s, i) => { if (s && s.c !== letters[i]) { s.used = false; slots[i] = null; } });
        const si = slots.indexOf(null); if (si < 0) return;
        const p = pool.find(p => !p.used && p.c === letters[si]);
        if (p) { p.used = true; slots[si] = p; usedHint = true; draw(); check(); }
      };
      const check = () => {
        if (slots.includes(null)) return;
        const fb = ctx.root.querySelector('.feedback');
        if (slots.map(s => s.c).join('') === word) {
          if (!usedHint && wrongTries === 0) score++;
          Sound.good(); fb.textContent = U.pick(ctx.t('praise')); ctx.root.querySelector('.slots').classList.add('good');
          speak(word, ctx.lang);
          setTimeout(next, 1300);
        } else {
          wrongTries++; mistakes++; Sound.bad(); fb.textContent = ctx.t('tryAgain');
          ctx.root.querySelector('.slots').classList.add('shake');
          setTimeout(() => { slots.forEach(s => (s.used = false)); slots = letters.map(() => null); draw(); }, 800);
        }
      };
      draw();
    };
    next();
  }

  return {
    list: [
      { id: 'quiz', icon: '❓', run: quiz, needs: 'gen' },
      { id: 'time', icon: '⏱️', run: timeAttack, needs: 'gen' },
      { id: 'balloon', icon: '🎈', run: balloons, needs: 'short' },
      { id: 'memory', icon: '🃏', run: memory, needs: 'pair' },
      { id: 'builder', icon: '🧩', run: builder, needs: 'words' },
    ],
  };
})();
