/* Shared helpers used by the data files and the games. */
const U = {
  rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; },
  pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },
  sample(arr, n) { return U.shuffle(arr).slice(0, n); },
  gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; },

  /* Build a shuffled list of n unique choices that contains the answer. */
  choices(answer, distractors, n = 4) {
    const out = [String(answer)];
    for (const d of U.shuffle(distractors.map(String))) {
      if (out.length >= n) break;
      if (!out.includes(d)) out.push(d);
    }
    return U.shuffle(out);
  },

  /* Numeric answer choices near the correct answer. */
  numChoices(ans, { extra = [], allowNeg = false, fmt = String, n = 4 } = {}) {
    const ds = [...extra];
    for (let i = 1; i <= 4; i++) ds.push(ans + i, ans - i);
    ds.push(ans + 10, ans - 10);
    const pool = ds.filter(x => x !== ans && (allowNeg || x >= 0));
    // Prefer the "smart" extra distractors first, then fill with near numbers.
    const out = [ans];
    for (const d of [...U.shuffle(extra.filter(x => x !== ans && (allowNeg || x >= 0))), ...U.shuffle(pool)]) {
      if (out.length >= n) break;
      if (!out.includes(d)) out.push(d);
    }
    return U.shuffle(out.map(fmt));
  },

  /* Turn a list of [a, b] pairs into a question generator ("given a, pick b"). */
  fromPairs(list, makeQ) {
    return () => {
      const [a, b] = U.pick(list);
      const others = list.filter(p => p[1] !== b && p[0] !== a).map(p => p[1]);
      const q = makeQ(a, b);
      // Optional "wrong" list: plausible mistakes, used before random distractors.
      const wrong = (q.wrong || []).filter(w => w !== b);
      const ch = [b];
      for (const d of [...U.shuffle([...new Set(wrong)]), ...U.shuffle(others)]) { if (ch.length >= 4) break; if (!ch.includes(d)) ch.push(d); }
      delete q.wrong;
      return Object.assign({ answer: b, choices: U.shuffle(ch) }, q);
    };
  },
  pairsOf(list) { return () => U.pick(list); },

  esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  },
};

/* Registry filled by js/data/*.js */
const SUBJECTS = {};
