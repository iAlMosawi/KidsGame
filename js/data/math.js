/* Math content: every topic generates fresh random questions. */
(function () {
  const { rand, pick, choices, numChoices, gcd } = U;
  const neg = n => (n < 0 ? '−' + Math.abs(n) : String(n));

  // Helper: an arithmetic question shown as a big expression.
  const mq = (expr, ans, opts = {}) => ({
    prompt: opts.prompt || 'Solve:',
    big: expr,
    answer: String(opts.fmt ? opts.fmt(ans) : ans),
    choices: opts.choices || numChoices(ans, opts),
  });
  // Math topics can be used in Memory Match: expression ↔ answer.
  const T = (id, name, gen, extra = {}) =>
    Object.assign({ id, name, gen, pair: extra.noPair ? null : () => { const q = gen(); return [q.big, q.answer]; } }, extra);

  const grades = {
    1: {
      topics: [
        T('add20', 'Addition to 20', () => { const a = rand(0, 10), b = rand(0, 10); return mq(`${a} + ${b} = ?`, a + b); }),
        T('sub20', 'Subtraction to 20', () => { const a = rand(1, 20), b = rand(0, a); return mq(`${a} − ${b} = ?`, a - b); }),
        T('count', 'Counting', () => {
          const n = rand(1, 10), e = pick(['🍎', '⭐', '🐟', '🎈', '🐞', '🌸', '🍪', '🚗', '🐥', '⚽']);
          return { prompt: `How many ${e} do you see?`, big: e.repeat(n), bigClass: 'emoji-row', answer: String(n), choices: numChoices(n) };
        }, { pair: () => { const n = rand(1, 9); return ['🍎'.repeat(n), String(n)]; } }),
        T('compare', 'Bigger or smaller', () => {
          const a = rand(0, 20), b = Math.random() < 0.2 ? a : rand(0, 20);
          const s = a > b ? '>' : a < b ? '<' : '=';
          return { prompt: 'Choose the right sign:', big: `${a}  ☐  ${b}`, answer: s, choices: ['<', '=', '>'] };
        }, { noPair: true }),
      ],
    },
    2: {
      topics: [
        T('add100', 'Addition to 100', () => { const a = rand(10, 80), b = rand(1, 99 - a); return mq(`${a} + ${b} = ?`, a + b); }),
        T('sub100', 'Subtraction to 100', () => { const a = rand(20, 99), b = rand(1, a - 1); return mq(`${a} − ${b} = ?`, a - b); }),
        T('place', 'Tens and ones', () => {
          const n = rand(11, 99), t = Math.floor(n / 10), o = n % 10;
          if (Math.random() < 0.5) return mq(`${t} tens and ${o} ones`, n, { prompt: 'What number is this?', extra: [o * 10 + t, t + o] });
          return mq(`${n}`, t, { prompt: 'How many TENS are in this number?', extra: [o, n] });
        }),
        T('skip', 'Skip counting', () => {
          const st = pick([2, 5, 10]), s = st * rand(0, 6), ans = s + 3 * st;
          return mq(`${s}, ${s + st}, ${s + 2 * st}, ?`, ans, { prompt: 'What comes next?', extra: [ans + st, ans - st, ans + 1] });
        }, { noPair: true }),
        T('evenodd', 'Even or odd', () => {
          const n = rand(1, 60);
          return { prompt: 'Is this number even or odd?', big: String(n), answer: n % 2 ? 'Odd' : 'Even', choices: ['Even', 'Odd'] };
        }, { noPair: true }),
      ],
    },
    3: {
      topics: [
        T('mult', 'Times tables', () => { const a = rand(2, 10), b = rand(2, 10); return mq(`${a} × ${b} = ?`, a * b, { extra: [a * b + a, a * b - b, a + b] }); }),
        T('div', 'Division facts', () => { const b = rand(2, 10), q = rand(2, 10); return mq(`${b * q} ÷ ${b} = ?`, q); }),
        T('add1000', 'Addition to 1000', () => { const a = rand(100, 800), b = rand(10, 999 - a); return mq(`${a} + ${b} = ?`, a + b, { extra: [a + b + 100, a + b - 100] }); }),
        T('sub1000', 'Subtraction to 1000', () => { const a = rand(200, 999), b = rand(10, a - 50); return mq(`${a} − ${b} = ?`, a - b, { extra: [a - b + 100, a - b - 100] }); }),
        T('fracOf', 'Fractions of a number', () => {
          const d = pick([2, 3, 4, 5]), k = rand(1, 10);
          return mq(`1/${d} of ${d * k} = ?`, k, { extra: [d * k, k * 2, d] });
        }),
      ],
    },
    4: {
      topics: [
        T('mult21', 'Multiplying big numbers', () => { const a = rand(12, 99), b = rand(2, 9); return mq(`${a} × ${b} = ?`, a * b, { extra: [a * b + b, a * b - 10, a * b + 10] }); }),
        T('divLong', 'Long division', () => { const b = rand(2, 9), q = rand(11, 50); return mq(`${b * q} ÷ ${b} = ?`, q, { extra: [q + 10, q - 10] }); }),
        T('round', 'Rounding', () => {
          const n = rand(101, 989), to = pick([10, 100]);
          const r = Math.round(n / to) * to, lo = Math.floor(n / to) * to, hi = lo + to;
          return mq(`${n}`, r, { prompt: `Round to the nearest ${to}:`, extra: [lo, hi, Math.round(n / (110 - to)) * (110 - to), r + to] });
        }),
        T('perim', 'Perimeter', () => {
          const l = rand(3, 15), w = rand(2, 10);
          return mq(`${l} cm × ${w} cm`, 2 * (l + w), { prompt: 'Perimeter of this rectangle (cm)?', extra: [l * w, l + w] });
        }),
        T('equiv', 'Equivalent fractions', () => {
          const d = pick([2, 3, 4, 5]), n = rand(1, d - 1), k = rand(2, 5);
          return mq(`${n}/${d} = ?/${d * k}`, n * k, { prompt: 'Find the missing number:', extra: [n + k, d * k - n, n * k + 1] });
        }),
      ],
    },
    5: {
      topics: [
        T('dec', 'Decimals', () => {
          const a = rand(10, 99), b = rand(10, 99), add = Math.random() < 0.6;
          const [x, y] = add ? [a, b] : [Math.max(a, b), Math.min(a, b)];
          const ans = add ? x + y : x - y, f = v => (v / 10).toFixed(1);
          return mq(`${f(x)} ${add ? '+' : '−'} ${f(y)} = ?`, ans, { fmt: f, extra: [ans + 10, ans - 10, ans + 1, ans - 1] });
        }),
        T('fracAdd', 'Adding fractions', () => {
          const d = rand(5, 12), a = rand(1, d - 3), b = rand(1, d - 1 - a);
          const ans = `${a + b}/${d}`;
          return { prompt: 'Solve:', big: `${a}/${d} + ${b}/${d} = ?`, answer: ans, choices: choices(ans, [`${a + b}/${2 * d}`, `${a + b + 1}/${d}`, `${a * b}/${d}`, `${a + b - 1}/${d}`]) };
        }),
        T('mult22', '2-digit × 2-digit', () => { const a = rand(11, 40), b = rand(11, 30); return mq(`${a} × ${b} = ?`, a * b, { extra: [a * b + 10, a * b - 10, a * b + a] }); }),
        T('area', 'Area', () => {
          if (Math.random() < 0.5) { const l = rand(3, 15), w = rand(2, 12); return mq(`rectangle ${l} cm × ${w} cm`, l * w, { prompt: 'Area in cm²?', extra: [2 * (l + w), l + w] }); }
          const b = rand(2, 10) * 2, h = rand(2, 12);
          return mq(`triangle: base ${b} cm, height ${h} cm`, (b * h) / 2, { prompt: 'Area in cm²?', extra: [b * h, b + h] });
        }),
        T('ops', 'Order of operations', () => {
          const a = rand(2, 9), b = rand(2, 9), c = rand(2, 9), f = rand(0, 2);
          if (f === 0) return mq(`${a} + ${b} × ${c} = ?`, a + b * c, { extra: [(a + b) * c] });
          if (f === 1) return mq(`(${a} + ${b}) × ${c} = ?`, (a + b) * c, { extra: [a + b * c] });
          return mq(`${a * b} − ${c} × 2 = ?`, a * b - c * 2, { allowNeg: true, extra: [(a * b - c) * 2] });
        }),
      ],
    },
    6: {
      topics: [
        T('pct', 'Percentages', () => {
          const p = pick([10, 20, 25, 50, 75]), n = rand(1, 20) * 20, ans = (p * n) / 100;
          return mq(`${p}% of ${n} = ?`, ans, { extra: [ans * 2, n - ans, p] });
        }),
        T('negs', 'Negative numbers', () => {
          const a = rand(-10, 10), b = rand(-10, 10);
          const bs = b < 0 ? `(${neg(b)})` : b;
          if (Math.random() < 0.5) return mq(`${neg(a)} + ${bs} = ?`, a + b, { allowNeg: true, fmt: neg, extra: [a - b, -(a + b)] });
          return mq(`${neg(a)} − ${bs} = ?`, a - b, { allowNeg: true, fmt: neg, extra: [a + b, -(a - b)] });
        }),
        T('pow', 'Exponents', () => {
          if (Math.random() < 0.6) { const b = rand(2, 12); return mq(`${b}² = ?`, b * b, { extra: [b * 2, b * b + b] }); }
          const b = rand(2, 5); return mq(`${b}³ = ?`, b ** 3, { extra: [b * 3, b * b] });
        }),
        T('eq', 'Equations', () => {
          const x = rand(1, 20), a = rand(2, 15), f = rand(0, 2);
          if (f === 0) return mq(`x + ${a} = ${x + a}`, x, { prompt: 'Find x:', extra: [x + 2 * a, a] });
          if (f === 1) return mq(`x − ${a} = ${x}`, x + a, { prompt: 'Find x:', extra: [x, x - a] });
          const k = rand(2, 9); return mq(`${k}x = ${k * x}`, x, { prompt: 'Find x:', extra: [k * x - k, x + k] });
        }),
        T('gcf', 'Greatest common factor', () => {
          const g = rand(2, 9), m = rand(2, 7); let n = rand(2, 7); if (n === m) n = m + 1;
          const a = g * m, b = g * n, ans = gcd(a, b);
          return mq(`GCF of ${a} and ${b}`, ans, { prompt: 'Find the greatest common factor:', extra: [g === ans ? 1 : g, ans * 2, Math.min(a, b)] });
        }),
        T('ratio', 'Ratios', () => {
          let a, b; do { a = rand(1, 5); b = rand(1, 6); } while (a === b || gcd(a, b) !== 1);
          const g = rand(2, 6), ans = `${a}:${b}`;
          return { prompt: 'Simplify the ratio:', big: `${a * g}:${b * g}`, answer: ans, choices: choices(ans, [`${b}:${a}`, `${a + 1}:${b}`, `${a}:${b + 1}`, `${g}:${a}`]) };
        }),
      ],
    },
  };

  SUBJECTS.math = { id: 'math', name: 'Math', nameAr: 'الرياضيات', icon: '🔢', lang: 'en', grades };
})();
