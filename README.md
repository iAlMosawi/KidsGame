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

> ✅ **Connected.** `js/config.js` holds this project's Sheet URL, so results from every device already go to the Sheet.
> Follow the steps below only if you ever want to use a different Sheet.

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

## What kids get
- **Name, animal avatar and class.** Kids pick an animal and can enter their class (e.g. `3A`).
- **Explanations.** A wrong answer shows *why* (for example "7 × 8 means 8 groups of 7…") and waits for **Next ▶**.
- **Practice my mistakes ♻️.** Every missed question is saved and comes back until the child gets it right.
  When there are no saved mistakes, it practises the child's weak topics (below 60%).
- **Daily Challenge 📅.** 5 mixed questions a day from the child's grade, with a 🔥 day streak.
- **Levels and 17 badges 🏅.** A level goes up every 15 stars. Badges include first game, 3 days in a row, times-table master, homework done, fixed 10 mistakes and more.
- **Homework 📌.** Homework assigned in the admin dashboard shows on the home screen, with a ✅ when done.
- **Leaderboard 🏆** (optional; the admin switches it on). Shows this week's stars, for everyone or just the child's class.

## Admin dashboard extras
- Filter by **class**, and see each child's class and avatar.
- **Homework.** Choose grade, subject, topic, game, class, due date and a note. See who finished it.
- **Settings.** Turn the kids' leaderboard on or off.
- **🖨️ Weekly report for parents.** One click per child gives a printable page (or *Save as PDF*).
- Without a Google Sheet, homework and settings only apply to the same browser. With the Sheet, they reach every device.
  **If you set up the Sheet before this update, paste the new `apps-script/Code.gs`, then use Deploy → Manage deployments → ✏️ → New version.**

## Games
| Game | What it is |
|---|---|
| ❓ Quiz | 10 multiple-choice questions |
| ⏱️ Time Attack | Answer as many as you can in 60 seconds |
| 🎈 Balloon Pop | Pop the balloon with the right answer before it floats away (3 lives) |
| 🃏 Memory Match | Flip cards to match pairs (word ↔ picture, sum ↔ answer, …) |
| 🧩 Word Builder | Spell the pictured word with letter tiles (English & Arabic) |
| 🔀 Put in Order | Drag (or tap) words into a sentence, or numbers from smallest to biggest |

Each game gives up to 3 stars. The best stars are saved in your browser.
Questions with a 🔈 button can be read aloud (this uses the browser's built-in text-to-speech).

## Topics by grade
| Grade | English | Math | Arabic |
|---|---|---|---|
| 1 | Picture words, first letter, rhymes, listening, reading | Add/subtract to 20, counting, compare, shapes, o'clock, word problems | الحرف الأول، أسماء الحروف، صورة وكلمة، الحركات، استمع واختر |
| 2 | Missing letter, plurals, opposites, listening, reading | Add/subtract to 100, tens & ones, skip counting, even/odd, half past, money, shapes, word problems | الحرف الناقص، الأضداد، المثنى، الحركات والسكون، التنوين، الشدة، القراءة |
| 3 | Synonyms, past tense, nouns/verbs/adjectives, listening, reading | Times tables, division, to 1000, fractions, quarter past/to, money, shapes, word problems | الجمع، المذكر والمؤنث، الأضداد، التنوين، القراءة |
| 4 | Homophones, compound words, irregular plurals, reading | Big multiplication, long division, rounding, perimeter, equivalent fractions, 5-minute clocks, word problems | أنواع الكلمة، أزمنة الفعل، المرادفات، القراءة |
| 5 | Prefixes & suffixes, antonyms, parts of speech, reading | Decimals, adding fractions, 2-digit × 2-digit, area, order of operations, word problems | أنواع الجمع، الضمائر، حروف الجر، القراءة |
| 6 | Idioms, analogies, verb tenses, reading | Percentages, negative numbers, exponents, equations, GCF, ratios, word problems | الفاعل والمفعول به، كان وإنّ وأخواتهما، المبتدأ والخبر، القراءة |

Word problems appear in both English and Arabic. Every topic shows an explanation after a wrong answer.

**Arabic voice:** many devices have no Arabic voice, so Arabic can't be read aloud on them, and the "استمع واختر"
topic is hidden there. To make it work everywhere, add recordings as described in [`audio/README.md`](audio/README.md).

## Adding content
All content is in `js/data/english.js`, `js/data/math.js` and `js/data/arabic.js`.
To add questions, add word pairs to the lists there. Math questions are generated at random, so they never run out.
