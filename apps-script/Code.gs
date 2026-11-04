/**
 * Learn & Play — results collector for Google Sheets.
 * Setup steps are in the README ("Collect results from all devices").
 * After changing this code: Deploy → Manage deployments → ✏️ → Version: New version → Deploy.
 */
const ADMIN_PIN = '201819';   // ← PIN for the admin dashboard (change it if you like)
const SHEET_NAME = 'Results';
const SETTINGS_SHEET = 'Settings';
const HEAD = ['id', 'time', 'name', 'cls', 'avatar', 'grade', 'subject', 'topic', 'topicId', 'game', 'score', 'total', 'stars', 'seconds'];

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) { sh = ss.insertSheet(SHEET_NAME); sh.appendRow(HEAD); sh.setFrozenRows(1); }
  // Add any new columns to an older sheet.
  const have = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), 1)).getValues()[0].map(String);
  const missing = HEAD.filter(h => have.indexOf(h) < 0);
  if (missing.length) sh.getRange(1, have.filter(String).length + 1, 1, missing.length).setValues([missing]);
  return sh;
}
function header_(sh) { return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String); }

// Stop spreadsheet formulas being injected through a child's name.
function safe_(v) {
  if (typeof v !== 'string') return v;
  v = v.slice(0, 80);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function getSettings_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SETTINGS_SHEET);
  if (!sh) return { leaderboard: false, homework: [] };
  try { return JSON.parse(sh.getRange(1, 1).getValue() || '{}'); } catch (e) { return { leaderboard: false, homework: [] }; }
}
function setSettings_(s) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SETTINGS_SHEET) || ss.insertSheet(SETTINGS_SHEET);
  sh.getRange(1, 1).setValue(JSON.stringify({ leaderboard: !!s.leaderboard, homework: (s.homework || []).slice(0, 100) }));
}

function readResults_() {
  const values = sheet_().getDataRange().getValues();
  const head = values.shift().map(String);
  return values.map(r => { const o = {}; head.forEach((h, i) => { o[h] = r[i] instanceof Date ? r[i].toISOString() : r[i]; }); return o; });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse(e.postData.contents);
    if (data && data.action === 'settings') {
      if (String(data.pin || '') !== ADMIN_PIN) return json_({ ok: false, error: 'Wrong PIN' });
      setSettings_(data.settings || {});
      return json_({ ok: true });
    }
    const rows = (Array.isArray(data) ? data : [data]).slice(0, 200);
    const sh = sheet_(), head = header_(sh);
    const last = sh.getLastRow();
    const existing = new Set(last > 1 ? sh.getRange(2, 1, last - 1, 1).getValues().map(r => String(r[0])) : []);
    const add = rows.filter(r => r && r.id && !existing.has(String(r.id))).map(r => head.map(h => safe_(r[h] === undefined ? '' : r[h])));
    if (add.length) sh.getRange(sh.getLastRow() + 1, 1, add.length, head.length).setValues(add);
    return json_({ ok: true, added: add.length });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const p = e.parameter || {};
  // Public: homework list and (if switched on) this week's leaderboard. No PIN needed.
  if (p.public) {
    const s = getSettings_();
    let board = [];
    if (s.leaderboard) {
      const since = Date.now() - 7 * 864e5, m = {};
      readResults_().forEach(r => {
        if (!r.name || new Date(r.time).getTime() < since) return;
        const k = String(r.name).trim().toLowerCase() + '|' + (r.cls || '');
        m[k] = m[k] || { name: String(r.name).trim(), cls: r.cls || '', avatar: r.avatar || '', stars: 0, games: 0 };
        m[k].stars += +r.stars || 0; m[k].games++;
      });
      board = Object.keys(m).map(k => m[k]).sort((a, b) => b.stars - a.stars).slice(0, 50);
    }
    return json_({ ok: true, settings: s, leaderboard: board });
  }
  if ((p.pin || '') !== ADMIN_PIN) return json_({ ok: false, error: 'Wrong PIN' });
  return json_({ ok: true, results: readResults_(), settings: getSettings_() });
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
