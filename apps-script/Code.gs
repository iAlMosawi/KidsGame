/**
 * Learn & Play — results collector for Google Sheets.
 * Setup steps are in the README ("Collect results from all devices").
 */
const ADMIN_PIN = '201819';   // ← PIN for the admin dashboard (change it if you like)
const SHEET_NAME = 'Results';
const HEAD = ['id', 'time', 'name', 'grade', 'subject', 'topic', 'game', 'score', 'total', 'stars', 'seconds'];

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) { sh = ss.insertSheet(SHEET_NAME); sh.appendRow(HEAD); sh.setFrozenRows(1); }
  return sh;
}

// Stop spreadsheet formulas being injected through a child's name.
function safe_(v) {
  if (typeof v !== 'string') return v;
  v = v.slice(0, 60);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse(e.postData.contents);
    const rows = (Array.isArray(data) ? data : [data]).slice(0, 200);
    const sh = sheet_();
    const last = sh.getLastRow();
    const existing = new Set(last > 1 ? sh.getRange(2, 1, last - 1, 1).getValues().map(r => String(r[0])) : []);
    const add = rows.filter(r => r && r.id && !existing.has(String(r.id))).map(r => HEAD.map(h => safe_(r[h] === undefined ? '' : r[h])));
    if (add.length) sh.getRange(sh.getLastRow() + 1, 1, add.length, HEAD.length).setValues(add);
    return json_({ ok: true, added: add.length });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  if ((e.parameter.pin || '') !== ADMIN_PIN) return json_({ ok: false, error: 'Wrong PIN' });
  const values = sheet_().getDataRange().getValues();
  const head = values.shift();
  const results = values.map(r => { const o = {}; head.forEach((h, i) => { o[h] = r[i] instanceof Date ? r[i].toISOString() : r[i]; }); return o; });
  return json_({ ok: true, results });
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
