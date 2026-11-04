/* Math content: every topic generates fresh random questions, each with an explanation. */
(function () {
  const { rand, pick, choices, numChoices, gcd, shuffle } = U;
  const neg = n => (n < 0 ? '−' + Math.abs(n) : String(n));

  // An arithmetic question shown as a big expression.
  const mq = (expr, ans, opts = {}) => ({
    prompt: opts.prompt || 'Solve:',
    big: expr,
    answer: String(opts.fmt ? opts.fmt(ans) : ans),
    choices: opts.choices || numChoices(ans, opts),
    explain: opts.explain || '',
  });
  // Math topics can be used in Memory Match: expression ↔ answer.
  const T = (id, name, gen, extra = {}) =>
    Object.assign({ id, name, gen, pair: extra.noPair ? null : () => { const q = gen(); return [q.big, q.answer]; } }, extra);

  /* ---------- Pictures drawn in code ---------- */
  function clockSVG(h, m) {
    const ticks = [...Array(12).keys()].map(i => {
      const a = (i * 30) * Math.PI / 180, x1 = 50 + 40 * Math.sin(a), y1 = 50 - 40 * Math.cos(a), x2 = 50 + 44 * Math.sin(a), y2 = 50 - 44 * Math.cos(a);
      const tx = 50 + 34 * Math.sin(a), ty = 50 - 34 * Math.cos(a) + 3.5;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#495057" stroke-width="1.5"/><text x="${tx}" y="${ty}" font-size="9" text-anchor="middle" font-weight="700" fill="#343a40">${i === 0 ? 12 : i}</text>`;
    }).join('');
    const ha = ((h % 12) + m / 60) * 30 * Math.PI / 180, ma = m * 6 * Math.PI / 180;
    return `<svg viewBox="0 0 100 100" class="pic" role="img" aria-label="clock"><circle cx="50" cy="50" r="47" fill="#fff" stroke="#4dabf7" stroke-width="4"/>${ticks}
      <line x1="50" y1="50" x2="${50 + 22 * Math.sin(ha)}" y2="${50 - 22 * Math.cos(ha)}" stroke="#e8590c" stroke-width="4.5" stroke-linecap="round"/>
      <line x1="50" y1="50" x2="${50 + 33 * Math.sin(ma)}" y2="${50 - 33 * Math.cos(ma)}" stroke="#1c7ed6" stroke-width="3" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="3" fill="#343a40"/></svg>`;
  }
  const poly = (n, r = 38, rot = -90) => [...Array(n).keys()].map(i => { const a = (rot + i * 360 / n) * Math.PI / 180; return (50 + r * Math.cos(a)).toFixed(1) + ',' + (50 + r * Math.sin(a)).toFixed(1); }).join(' ');
  const SHAPES = {
    circle: { sides: 0, svg: '<circle cx="50" cy="50" r="38"/>', fact: 'A circle is round and has no straight sides or corners.' },
    triangle: { sides: 3, svg: `<polygon points="${poly(3, 42, -90)}"/>`, fact: 'A triangle has 3 sides and 3 corners.' },
    square: { sides: 4, svg: '<rect x="18" y="18" width="64" height="64"/>', fact: 'A square has 4 equal sides and 4 corners.' },
    rectangle: { sides: 4, svg: '<rect x="8" y="28" width="84" height="44"/>', fact: 'A rectangle has 4 sides: 2 long and 2 short.' },
    pentagon: { sides: 5, svg: `<polygon points="${poly(5)}"/>`, fact: 'A pentagon has 5 sides.' },
    hexagon: { sides: 6, svg: `<polygon points="${poly(6, 38, 0)}"/>`, fact: 'A hexagon has 6 sides, like a honeycomb cell.' },
    octagon: { sides: 8, svg: `<polygon points="${poly(8, 38, 22.5)}"/>`, fact: 'An octagon has 8 sides, like a STOP sign.' },
    oval: { sides: 0, svg: '<ellipse cx="50" cy="50" rx="42" ry="28"/>', fact: 'An oval is like a stretched circle, like an egg.' },
  };
  const shapeSVG = (name, color) => `<svg viewBox="0 0 100 100" class="pic" role="img" aria-label="shape"><g fill="${color}" stroke="#343a40" stroke-width="2.5">${SHAPES[name].svg}</g></svg>`;
  const COLORS = ['#ff8787', '#74c0fc', '#8ce99a', '#ffd43b', '#da77f2', '#ffa94d'];
  const shapeTopic = (names) => ({
    id: 'shapes', name: 'Shapes', noPair: true, pair: null,
    gen: () => {
      const n = pick(names), s = SHAPES[n];
      if (s.sides && Math.random() < 0.4)
        return { prompt: 'How many sides does this shape have?', svg: shapeSVG(n, pick(COLORS)), answer: String(s.sides), choices: numChoices(s.sides, { extra: [s.sides + 1, s.sides - 1] }), explain: s.fact };
      return { prompt: 'What shape is this?', svg: shapeSVG(n, pick(COLORS)), answer: n, choices: choices(n, names), explain: s.fact };
    },
  });

  /* ---------- Clocks ---------- */
  const timeText = (h, m) => (m === 0 ? `${h} o'clock` : m === 30 ? `half past ${h}` : m === 15 ? `quarter past ${h}` : m === 45 ? `quarter to ${h % 12 + 1}` : `${h}:${String(m).padStart(2, '0')}`);
  const clockTopic = (mins) => ({
    id: 'clock', name: 'Telling time', pair: null,
    gen: () => {
      const h = rand(1, 12), m = pick(mins), ans = timeText(h, m);
      const wrong = [timeText(h % 12 + 1, m), timeText(h, pick(mins.filter(x => x !== m)) ?? (m + 30) % 60), timeText((h + 10) % 12 + 1, m), timeText(m / 5 || 12, h * 5 % 60)];
      const why = m === 0 ? `The long (blue) hand points to 12, so it is exactly ${h} o'clock.`
        : `The short (orange) hand shows the hour (${h}). The long (blue) hand shows the minutes: it points to ${m / 5 || 12}, which means ${m} minutes.`;
      return { prompt: 'What time is it?', svg: clockSVG(h, m), answer: ans, choices: choices(ans, wrong.filter(w => w !== ans)), explain: why };
    },
  });

  /* ---------- Money ---------- */
  const moneyTopic = (max) => ({
    id: 'money', name: 'Money', pair: null,
    gen: () => {
      if (Math.random() < 0.5) {
        const price = rand(1, max - 1), paid = [5, 10, 20, 50, 100].find(x => x > price) || max;
        return mq(`💵 Pay ${paid} for a toy that costs ${price}`, paid - price, { prompt: 'How much change do you get?', explain: `Change = money paid − price = ${paid} − ${price} = ${paid - price}.`, extra: [paid + price, price] });
      }
      const a = rand(1, Math.floor(max / 2)), b = rand(1, Math.floor(max / 2));
      return mq(`🍎 ${a} + 🧃 ${b}`, a + b, { prompt: 'An apple and a juice. How much in total?', explain: `Add the prices: ${a} + ${b} = ${a + b}.` });
    },
  });

  /* ---------- Word problems (English and Arabic) ---------- */
  const wp = (en, ar, ans, explain, extra = []) => {
    const useAr = Math.random() < 0.5;
    return { prompt: useAr ? 'مسألة كلامية:' : 'Word problem:', big: useAr ? ar : en, bigClass: 'sentence', say: useAr ? ar : en, sayLang: useAr ? 'ar' : 'en', answer: String(ans), choices: numChoices(ans, { extra }), explain };
  };
  // [English name, Arabic name, is a girl] — Arabic verbs change with gender.
  const names = [['Sara', 'سارة', 1], ['Ali', 'علي', 0], ['Mona', 'منى', 1], ['Omar', 'عمر', 0], ['Lina', 'لينا', 1], ['Yusuf', 'يوسف', 0]];
  const wordTopic = (level) => ({
    id: 'word', name: 'Word problems', long: true, pair: null,
    gen: () => {
      const [en, ar, f] = pick(names), v = (m, w) => (f ? w : m), k = rand(0, level >= 3 ? 3 : 1);
      if (level <= 2 || k === 0) {
        const a = rand(2, level === 1 ? 9 : 40), b = rand(1, level === 1 ? 9 : 40);
        if (Math.random() < 0.5)
          return wp(`${en} has ${a} stickers and gets ${b} more. How many stickers now?`, `مع ${ar} ملصقات عددها ${a}، ثم ${v('حصل', 'حصلت')} على ${b} أخرى. كم أصبح عدد الملصقات؟`, a + b, `"More" means add: ${a} + ${b} = ${a + b}.`, [a - b]);
        const big = Math.max(a, b) + rand(1, 5), small = Math.min(a, b);
        return wp(`${en} has ${big} candies and eats ${small}. How many are left?`, `مع ${ar} حلوى عددها ${big}، ${v('أكل', 'أكلت')} منها ${small}. كم بقي؟`, big - small, `"Left" means subtract: ${big} − ${small} = ${big - small}.`, [big + small]);
      }
      if (k === 1) {
        const boxes = rand(3, 9), each = rand(2, level >= 4 ? 25 : 10);
        return wp(`There are ${boxes} boxes with ${each} pencils in each box. How many pencils in all?`, `توجد ${boxes} صناديق، في كل صندوق ${each} من الأقلام. كم قلماً في الصناديق كلها؟`, boxes * each, `Equal groups means multiply: ${boxes} × ${each} = ${boxes * each}.`, [boxes + each]);
      }
      if (k === 2) {
        const kids = rand(3, 9), each = rand(2, level >= 4 ? 15 : 9);
        return wp(`${kids * each} cookies are shared equally by ${kids} children. How many does each child get?`, `وُزِّعت ${kids * each} من الكعك بالتساوي على ${kids} أطفال. كم يأخذ كل طفل؟`, each, `Sharing equally means divide: ${kids * each} ÷ ${kids} = ${each}.`, [kids * each - kids]);
      }
      if (level >= 6) {
        const n = rand(2, 10) * 10, p = pick([10, 20, 50]), ans = n * p / 100;
        return wp(`A class has ${n} students. ${p}% of them like football. How many students like football?`, `عدد طلاب الصف ${n}، و${p}% منهم يحبون كرة القدم. كم طالباً يحب كرة القدم؟`, ans, `${p}% of ${n} = ${n} × ${p} ÷ 100 = ${ans}.`, [n - ans, p]);
      }
      const price = rand(5, 40), qty = rand(3, 9);
      return wp(`One book costs ${price}. ${en} buys ${qty} books. How much does ${en} pay?`, `ثمن الكتاب الواحد ${price}. ${v('اشترى', 'اشترت')} ${ar} ${qty} كتب. كم ${v('دفع', 'دفعت')}؟`, price * qty, `${qty} books × ${price} each = ${price * qty}.`, [price + qty]);
    },
  });

  /* Numbers to put in order (used by the "Put in Order" game). */
  const orderNums = {
    1: () => U.sample([...Array(21).keys()], 5),
    2: () => U.sample([...Array(90).keys()].map(x => x + 10), 5),
    3: () => U.sample([...Array(900).keys()].map(x => x + 100), 5),
    4: () => { const s = new Set(); while (s.size < 5) s.add(rand(1000, 9999)); return [...s]; },
    5: () => { const s = new Set(); while (s.size < 5) s.add(rand(1, 99) / 10); return [...s].map(x => x.toFixed(1)); },
    6: () => { const s = new Set(); while (s.size < 5) s.add(rand(-20, 20)); return [...s]; },
  };
  const orderFor = g => () => {
    const items = orderNums[g]().map(String), num = v => +String(v).replace('−', '-');
    const sorted = items.slice().sort((a, b) => num(a) - num(b));
    return { prompt: 'Put the numbers in order: smallest → biggest', items: shuffle(items.map(x => (num(x) < 0 ? '−' + Math.abs(num(x)) : x))), answer: sorted.map(x => (num(x) < 0 ? '−' + Math.abs(num(x)) : x)), explain: 'Smallest to biggest: ' + sorted.map(x => (num(x) < 0 ? '−' + Math.abs(num(x)) : x)).join(' < ') };
  };

  const factors = n => [...Array(n).keys()].map(i => i + 1).filter(i => n % i === 0);

  const grades = {
    1: {
      topics: [
        T('add20', 'Addition to 20', () => { const a = rand(0, 10), b = rand(0, 10); return mq(`${a} + ${b} = ?`, a + b, { explain: `Start at ${a} and count on ${b}: ${a} + ${b} = ${a + b}.` }); }),
        T('sub20', 'Subtraction to 20', () => { const a = rand(1, 20), b = rand(0, a); return mq(`${a} − ${b} = ?`, a - b, { explain: `Start at ${a} and count back ${b}: ${a - b}. Check: ${a - b} + ${b} = ${a}.` }); }),
        T('count', 'Counting', () => {
          const n = rand(1, 10), e = pick(['🍎', '⭐', '🐟', '🎈', '🐞', '🌸', '🍪', '🚗', '🐥', '⚽']);
          return { prompt: `How many ${e} do you see?`, big: e.repeat(n), bigClass: 'emoji-row', answer: String(n), choices: numChoices(n), explain: `Touch each one as you count: there are ${n}.` };
        }, { pair: () => { const n = rand(1, 9); return ['🍎'.repeat(n), String(n)]; } }),
        T('compare', 'Bigger or smaller', () => {
          const a = rand(0, 20), b = Math.random() < 0.2 ? a : rand(0, 20);
          const s = a > b ? '>' : a < b ? '<' : '=';
          return { prompt: 'Choose the right sign:', big: `${a}  ☐  ${b}`, answer: s, choices: ['<', '=', '>'],
            explain: a === b ? `${a} and ${b} are the same, so we use =.` : `${a} is ${a > b ? 'bigger' : 'smaller'} than ${b}. The open mouth of the sign always faces the bigger number: ${a} ${s} ${b}.` };
        }, { noPair: true }),
        shapeTopic(['circle', 'triangle', 'square', 'rectangle', 'oval']),
        clockTopic([0]),
        wordTopic(1),
      ],
      order: orderFor(1),
    },
    2: {
      topics: [
        T('add100', 'Addition to 100', () => { const a = rand(10, 80), b = rand(1, 99 - a); return mq(`${a} + ${b} = ?`, a + b, { explain: `Add the tens, then the ones: ${a} + ${b} = ${a + b}.` }); }),
        T('sub100', 'Subtraction to 100', () => { const a = rand(20, 99), b = rand(1, a - 1); return mq(`${a} − ${b} = ?`, a - b, { explain: `${a} − ${b} = ${a - b}. Check: ${a - b} + ${b} = ${a}.` }); }),
        T('place', 'Tens and ones', () => {
          const n = rand(11, 99), t = Math.floor(n / 10), o = n % 10;
          if (Math.random() < 0.5) return mq(`${t} tens and ${o} ones`, n, { prompt: 'What number is this?', extra: [o * 10 + t, t + o], explain: `${t} tens = ${t * 10}, plus ${o} ones = ${n}.` });
          return mq(`${n}`, t, { prompt: 'How many TENS are in this number?', extra: [o, n], explain: `In ${n}, the first digit (${t}) is the tens and the last digit (${o}) is the ones.` });
        }),
        T('skip', 'Skip counting', () => {
          const st = pick([2, 5, 10]), s = st * rand(0, 6), ans = s + 3 * st;
          return mq(`${s}, ${s + st}, ${s + 2 * st}, ?`, ans, { prompt: 'What comes next?', extra: [ans + st, ans - st, ans + 1], explain: `The numbers go up by ${st} each time: ${s + 2 * st} + ${st} = ${ans}.` });
        }, { noPair: true }),
        T('evenodd', 'Even or odd', () => {
          const n = rand(1, 60);
          return { prompt: 'Is this number even or odd?', big: String(n), answer: n % 2 ? 'Odd' : 'Even', choices: ['Even', 'Odd'], explain: `${n} ends in ${n % 10}. Numbers ending in 0, 2, 4, 6 or 8 are even; the others are odd.` };
        }, { noPair: true }),
        clockTopic([0, 30]),
        moneyTopic(20),
        shapeTopic(['circle', 'triangle', 'square', 'rectangle', 'pentagon', 'hexagon']),
        wordTopic(2),
      ],
      order: orderFor(2),
    },
    3: {
      topics: [
        T('mult', 'Times tables', () => { const a = rand(2, 10), b = rand(2, 10); return mq(`${a} × ${b} = ?`, a * b, { extra: [a * b + a, a * b - b, a + b], explain: `${a} × ${b} means ${b} groups of ${a}: ${Array(b).fill(a).join(' + ')} = ${a * b}.` }); }),
        T('div', 'Division facts', () => { const b = rand(2, 10), q = rand(2, 10); return mq(`${b * q} ÷ ${b} = ?`, q, { explain: `Think of times tables: ${b} × ${q} = ${b * q}, so ${b * q} ÷ ${b} = ${q}.` }); }),
        T('add1000', 'Addition to 1000', () => { const a = rand(100, 800), b = rand(10, 999 - a); return mq(`${a} + ${b} = ?`, a + b, { extra: [a + b + 100, a + b - 100], explain: `Add hundreds, tens and ones separately, carrying when a column reaches 10: ${a} + ${b} = ${a + b}.` }); }),
        T('sub1000', 'Subtraction to 1000', () => { const a = rand(200, 999), b = rand(10, a - 50); return mq(`${a} − ${b} = ?`, a - b, { extra: [a - b + 100, a - b - 100], explain: `${a} − ${b} = ${a - b}. Check by adding: ${a - b} + ${b} = ${a}.` }); }),
        T('fracOf', 'Fractions of a number', () => {
          const d = pick([2, 3, 4, 5]), k = rand(1, 10);
          return mq(`1/${d} of ${d * k} = ?`, k, { extra: [d * k, k * 2, d], explain: `1/${d} means split into ${d} equal parts: ${d * k} ÷ ${d} = ${k}.` });
        }),
        clockTopic([0, 15, 30, 45]),
        moneyTopic(50),
        shapeTopic(['triangle', 'square', 'rectangle', 'pentagon', 'hexagon', 'octagon']),
        wordTopic(3),
      ],
      order: orderFor(3),
    },
    4: {
      topics: [
        T('mult21', 'Multiplying big numbers', () => {
          const a = rand(12, 99), b = rand(2, 9), t = Math.floor(a / 10) * 10, o = a % 10;
          return mq(`${a} × ${b} = ?`, a * b, { extra: [a * b + b, a * b - 10, a * b + 10], explain: `Split ${a} into ${t} + ${o}: ${t} × ${b} = ${t * b}, ${o} × ${b} = ${o * b}, total ${a * b}.` });
        }),
        T('divLong', 'Long division', () => { const b = rand(2, 9), q = rand(11, 50); return mq(`${b * q} ÷ ${b} = ?`, q, { extra: [q + 10, q - 10], explain: `Check with multiplication: ${b} × ${q} = ${b * q}.` }); }),
        T('round', 'Rounding', () => {
          const n = rand(101, 989), to = pick([10, 100]);
          const r = Math.round(n / to) * to, lo = Math.floor(n / to) * to, hi = lo + to, dig = to === 10 ? n % 10 : Math.floor(n / 10) % 10;
          return mq(`${n}`, r, { prompt: `Round to the nearest ${to}:`, extra: [lo, hi, Math.round(n / (110 - to)) * (110 - to), r + to],
            explain: `Look at the ${to === 10 ? 'ones' : 'tens'} digit: ${dig}. ${dig >= 5 ? '5 or more → round up' : 'Less than 5 → round down'} → ${r}.` });
        }),
        T('perim', 'Perimeter', () => {
          const l = rand(3, 15), w = rand(2, 10);
          return mq(`${l} cm × ${w} cm`, 2 * (l + w), { prompt: 'Perimeter of this rectangle (cm)?', extra: [l * w, l + w], explain: `Perimeter is the distance all the way around: ${l} + ${w} + ${l} + ${w} = ${2 * (l + w)} cm.` });
        }),
        T('equiv', 'Equivalent fractions', () => {
          const d = pick([2, 3, 4, 5]), n = rand(1, d - 1), k = rand(2, 5);
          return mq(`${n}/${d} = ?/${d * k}`, n * k, { prompt: 'Find the missing number:', extra: [n + k, d * k - n, n * k + 1], explain: `The bottom was multiplied by ${k} (${d} × ${k} = ${d * k}), so multiply the top by ${k} too: ${n} × ${k} = ${n * k}.` });
        }),
        clockTopic([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]),
        wordTopic(4),
      ],
      order: orderFor(4),
    },
    5: {
      topics: [
        T('dec', 'Decimals', () => {
          const a = rand(10, 99), b = rand(10, 99), add = Math.random() < 0.6;
          const [x, y] = add ? [a, b] : [Math.max(a, b), Math.min(a, b)];
          const ans = add ? x + y : x - y, f = v => (v / 10).toFixed(1);
          return mq(`${f(x)} ${add ? '+' : '−'} ${f(y)} = ?`, ans, { fmt: f, extra: [ans + 10, ans - 10, ans + 1, ans - 1], explain: `Line up the decimal points and ${add ? 'add' : 'subtract'} like whole numbers: ${f(x)} ${add ? '+' : '−'} ${f(y)} = ${f(ans)}.` });
        }),
        T('fracAdd', 'Adding fractions', () => {
          const d = rand(5, 12), a = rand(1, d - 3), b = rand(1, d - 1 - a);
          const ans = `${a + b}/${d}`;
          return { prompt: 'Solve:', big: `${a}/${d} + ${b}/${d} = ?`, answer: ans, choices: choices(ans, [`${a + b}/${2 * d}`, `${a + b + 1}/${d}`, `${a * b}/${d}`, `${a + b - 1}/${d}`]),
            explain: `The bottom numbers are the same, so add only the tops: ${a} + ${b} = ${a + b}. The bottom stays ${d}.` };
        }),
        T('mult22', '2-digit × 2-digit', () => {
          const a = rand(11, 40), b = rand(11, 30), t = Math.floor(b / 10) * 10, o = b % 10;
          return mq(`${a} × ${b} = ?`, a * b, { extra: [a * b + 10, a * b - 10, a * b + a], explain: `${a} × ${t} = ${a * t}, ${a} × ${o} = ${a * o}, and ${a * t} + ${a * o} = ${a * b}.` });
        }),
        T('area', 'Area', () => {
          if (Math.random() < 0.5) { const l = rand(3, 15), w = rand(2, 12); return mq(`rectangle ${l} cm × ${w} cm`, l * w, { prompt: 'Area in cm²?', extra: [2 * (l + w), l + w], explain: `Area of a rectangle = length × width = ${l} × ${w} = ${l * w} cm².` }); }
          const b = rand(2, 10) * 2, h = rand(2, 12);
          return mq(`triangle: base ${b} cm, height ${h} cm`, (b * h) / 2, { prompt: 'Area in cm²?', extra: [b * h, b + h], explain: `Area of a triangle = base × height ÷ 2 = ${b} × ${h} ÷ 2 = ${(b * h) / 2} cm².` });
        }),
        T('ops', 'Order of operations', () => {
          const a = rand(2, 9), b = rand(2, 9), c = rand(2, 9), f = rand(0, 2);
          if (f === 0) return mq(`${a} + ${b} × ${c} = ?`, a + b * c, { extra: [(a + b) * c], explain: `Multiply before adding: ${b} × ${c} = ${b * c}, then ${a} + ${b * c} = ${a + b * c}.` });
          if (f === 1) return mq(`(${a} + ${b}) × ${c} = ?`, (a + b) * c, { extra: [a + b * c], explain: `Brackets first: ${a} + ${b} = ${a + b}, then × ${c} = ${(a + b) * c}.` });
          return mq(`${a * b} − ${c} × 2 = ?`, a * b - c * 2, { allowNeg: true, extra: [(a * b - c) * 2], explain: `Multiply first: ${c} × 2 = ${c * 2}, then ${a * b} − ${c * 2} = ${a * b - c * 2}.` });
        }),
        wordTopic(5),
      ],
      order: orderFor(5),
    },
    6: {
      topics: [
        T('pct', 'Percentages', () => {
          const p = pick([10, 20, 25, 50, 75]), n = rand(1, 20) * 20, ans = (p * n) / 100;
          return mq(`${p}% of ${n} = ?`, ans, { extra: [ans * 2, n - ans, p], explain: `${p}% means ${p} out of 100: ${n} ÷ 100 × ${p} = ${ans}.` });
        }),
        T('negs', 'Negative numbers', () => {
          const a = rand(-10, 10), b = rand(-10, 10);
          const bs = b < 0 ? `(${neg(b)})` : b;
          if (Math.random() < 0.5) return mq(`${neg(a)} + ${bs} = ?`, a + b, { allowNeg: true, fmt: neg, extra: [a - b, -(a + b)], explain: `On a number line, start at ${neg(a)} and move ${Math.abs(b)} step(s) ${b >= 0 ? 'right' : 'left'}: ${neg(a + b)}.` });
          return mq(`${neg(a)} − ${bs} = ?`, a - b, { allowNeg: true, fmt: neg, extra: [a + b, -(a - b)], explain: `Subtracting ${neg(b)} is the same as adding ${neg(-b)}: ${neg(a)} + ${-b < 0 ? '(' + neg(-b) + ')' : -b} = ${neg(a - b)}.` });
        }),
        T('pow', 'Exponents', () => {
          if (Math.random() < 0.6) { const b = rand(2, 12); return mq(`${b}² = ?`, b * b, { extra: [b * 2, b * b + b], explain: `${b}² means ${b} × ${b} = ${b * b} (not ${b} × 2).` }); }
          const b = rand(2, 5); return mq(`${b}³ = ?`, b ** 3, { extra: [b * 3, b * b], explain: `${b}³ means ${b} × ${b} × ${b} = ${b ** 3}.` });
        }),
        T('eq', 'Equations', () => {
          const x = rand(1, 20), a = rand(2, 15), f = rand(0, 2);
          if (f === 0) return mq(`x + ${a} = ${x + a}`, x, { prompt: 'Find x:', extra: [x + 2 * a, a], explain: `Do the opposite of + ${a}: x = ${x + a} − ${a} = ${x}.` });
          if (f === 1) return mq(`x − ${a} = ${x}`, x + a, { prompt: 'Find x:', extra: [x, x - a], explain: `Do the opposite of − ${a}: x = ${x} + ${a} = ${x + a}.` });
          const k = rand(2, 9); return mq(`${k}x = ${k * x}`, x, { prompt: 'Find x:', extra: [k * x - k, x + k], explain: `${k}x means ${k} × x. Divide both sides by ${k}: x = ${k * x} ÷ ${k} = ${x}.` });
        }),
        T('gcf', 'Greatest common factor', () => {
          const g = rand(2, 9), m = rand(2, 7); let n = rand(2, 7); if (n === m) n = m + 1;
          const a = g * m, b = g * n, ans = gcd(a, b);
          return mq(`GCF of ${a} and ${b}`, ans, { prompt: 'Find the greatest common factor:', extra: [g === ans ? 1 : g, ans * 2, Math.min(a, b)],
            explain: `Factors of ${a}: ${factors(a).join(', ')}. Factors of ${b}: ${factors(b).join(', ')}. The biggest one in both lists is ${ans}.` });
        }),
        T('ratio', 'Ratios', () => {
          let a, b; do { a = rand(1, 5); b = rand(1, 6); } while (a === b || gcd(a, b) !== 1);
          const g = rand(2, 6), ans = `${a}:${b}`;
          return { prompt: 'Simplify the ratio:', big: `${a * g}:${b * g}`, answer: ans, choices: choices(ans, [`${b}:${a}`, `${a + 1}:${b}`, `${a}:${b + 1}`, `${g}:${a}`]), explain: `Divide both sides by ${g}: ${a * g} ÷ ${g} = ${a} and ${b * g} ÷ ${g} = ${b}.` };
        }),
        wordTopic(6),
      ],
      order: orderFor(6),
    },
  };

  SUBJECTS.math = { id: 'math', name: 'Math', nameAr: 'الرياضيات', icon: '🔢', lang: 'en', grades };
})();
