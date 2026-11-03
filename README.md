# 🎈 Learn & Play · تعلّم والعب

Fun learning games for elementary school (Grades 1–6) in **English**, **Math**, and **Arabic**.
Plain HTML/CSS/JavaScript. You don't need to install or build anything.

## How to play
- Open `index.html` in any browser, **or**
- Host it for free on GitHub Pages: go to *Settings → Pages* and deploy from this branch's root.

Pick a grade, then a subject, then a topic (or "All topics"), then a game.

## Links
- 🎮 Games: https://ialmosawi.github.io/KidsGame/
- 📊 Admin dashboard: https://ialmosawi.github.io/KidsGame/admin.html

## Players and the admin dashboard
- Each child types their name before playing. The name shows at the top, and **👤** switches to another child.
  Names used on a device are listed, so a child can tap their own name next time.
- Every finished game is saved with the child's name, grade, subject, topic, game, score, stars and time played.
- `admin.html` shows every child: average score, level, results per subject, minutes played and last played.
  You can filter by grade, subject and date, and export to CSV.
  Click a child to see what they're good at, what needs practice, and every game they played.
- The admin PIN is `201819`. Change `LOCAL_ADMIN_PIN` in `js/config.js` (and `ADMIN_PIN` in `apps-script/Code.gs` if you use a Google Sheet).

## Collect results from all devices (Google Sheet, free, about 5 minutes)
Without this step, each device only keeps its own results, and the dashboard shows only the device it's opened on.
To gather results from every phone, tablet and computer in one place:

1. Create a new Google Sheet (for example "Kids Game Results").
2. In the Sheet, open **Extensions → Apps Script**.
3. Delete what's there and paste everything from [`apps-script/Code.gs`](apps-script/Code.gs).
   The PIN is set to `201819` at the top (`ADMIN_PIN`); change it if you like. Click 💾 **Save**.
4. Click **Deploy → New deployment**. Under "Select type" (⚙️), choose **Web app**. Then set:
   - *Execute as*: **Me**
   - *Who has access*: **Anyone**

   Click **Deploy**, allow the permissions it asks for, and copy the **Web app URL** (it ends in `/exec`).
5. Open `js/config.js` in this repo and paste the URL: `SHEET_URL: 'https://script.google.com/macros/s/…/exec',`
   Commit the change. GitHub Pages updates within a minute or two.
6. Open the admin dashboard and enter the PIN from step 3.

Results now go into the "Results" tab of your Sheet, and the dashboard reads them from there.
If a device is offline, its results are sent the next time it's online.
If you later edit `Code.gs`, use **Deploy → Manage deployments → ✏️ → Version: New version** so the same URL keeps working.

> Privacy: store first names only. The game site is public, so don't put anything secret in `js/config.js`.
> Your admin PIN lives only in the Apps Script, which runs in your Google account.

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
