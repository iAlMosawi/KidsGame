# 🎈 Learn & Play · تعلّم والعب

Fun learning games for elementary school (Grades 1–6) in **English**, **Math**, and **Arabic**.
Plain HTML/CSS/JavaScript. You don't need to install or build anything.

## How to play
- Open `index.html` in any browser, **or**
- Host it for free on GitHub Pages: go to *Settings → Pages* and deploy from this branch's root.

Pick a grade, then a subject, then a topic (or "All topics"), then a game.

## Games
| Game | What it is |
|---|---|
| ❓ Quiz | 10 multiple-choice questions |
| ⏱️ Time Attack | Answer as many as you can in 60 seconds |
| 🎈 Balloon Pop | Pop the balloon with the right answer before it floats away (3 lives) |
| 🃏 Memory Match | Flip cards to match pairs (word ↔ picture, sum ↔ answer, …) |
| 🧩 Word Builder | Spell the pictured word with letter tiles (English & Arabic) |

Each game gives up to 3 stars. The best stars are saved in your browser.
Questions with a 🔈 button can be read aloud (this uses the browser's built-in text-to-speech).

## Topics by grade
| Grade | English | Math | Arabic |
|---|---|---|---|
| 1 | Picture words, first letter, rhymes | Add/subtract to 20, counting, compare | الحرف الأول، أسماء الحروف، صورة وكلمة |
| 2 | Missing letter, plurals, opposites | Add/subtract to 100, tens & ones, skip counting, even/odd | الحرف الناقص، الأضداد، المثنى |
| 3 | Synonyms, past tense, nouns/verbs/adjectives | Times tables, division, to 1000, fractions of a number | الجمع، المذكر والمؤنث، الأضداد |
| 4 | Homophones, compound words, irregular plurals | Big multiplication, long division, rounding, perimeter, equivalent fractions | أنواع الكلمة، أزمنة الفعل، المرادفات |
| 5 | Prefixes & suffixes, antonyms, parts of speech | Decimals, adding fractions, 2-digit × 2-digit, area, order of operations | أنواع الجمع، الضمائر، حروف الجر |
| 6 | Idioms, analogies, verb tenses | Percentages, negative numbers, exponents, equations, GCF, ratios | الفاعل والمفعول به، كان وإنّ وأخواتهما، المبتدأ والخبر |

## Adding content
All content is in `js/data/english.js`, `js/data/math.js` and `js/data/arabic.js`.
To add questions, add word pairs to the lists there. Math questions are generated at random, so they never run out.
