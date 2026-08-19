const SHEET_NAME = "Тіркелгендер";
const HEADERS = ["№", "Қатысушының аты-жөні", "Жұмыс орны", "Лауазымы", "Тіркелген уақыты"];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }
  return sheet;
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const fullName = (data.fullName || "").trim();
    const workplace = (data.workplace || "").trim();
    const position = (data.position || "").trim();

    if (fullName.length < 3 || !workplace || !position) {
      return jsonResponse_({ ok: false, error: "Деректер толық емес" });
    }

    const sheet = getSheet_();
    const nextNumber = sheet.getLastRow(); // header занимает 1 строку
    const timestamp = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      "dd.MM.yyyy HH:mm"
    );

    sheet.appendRow([nextNumber, fullName, workplace, position, timestamp]);

    return jsonResponse_({ ok: true, number: nextNumber });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

function doGet() {
  const sheet = getSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return jsonResponse_({ ok: true, participants: [] });
  }
  const rows = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  const participants = rows.map((r) => ({
    number: r[0],
    fullName: r[1],
    workplace: r[2],
    position: r[3],
    timestamp: r[4],
  }));
  return jsonResponse_({ ok: true, participants });
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
