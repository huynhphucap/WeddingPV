/**
 * Google Apps Script backend cho thiệp cưới (Phúc & Vy).
 * Dùng chung 1 Web App URL cho: RSVP, Sổ lưu bút, Album ảnh khách mời.
 *
 * CÁCH TRIỂN KHAI (xem thêm SETUP.md):
 * 1. Tạo một Google Sheet mới (hoặc dùng sheet RSVP/Guestbook hiện có).
 * 2. Vào Extensions > Apps Script, xoá code mẫu, dán toàn bộ nội dung file này vào.
 * 3. Deploy > New deployment > chọn loại "Web app".
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy URL Web App vừa tạo, dán vào "scriptURL" trong file js/config.js.
 * 3 sheet con (RSVP, Wishes, Photos) sẽ được tự tạo khi có dữ liệu gửi lên đầu tiên.
 */

const SHEET_RSVP = "RSVP";
const SHEET_WISH = "Wishes";
const SHEET_PHOTO = "Photos";

function getOrCreateSheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function doPost(e) {
  try {
    const params = (e && e.parameter) || {};
    const formType = params.formType || "rsvp";

    if (formType === "rsvp") {
      const sheet = getOrCreateSheet_(SHEET_RSVP, [
        "Thời gian",
        "Họ tên",
        "Tiệc tham dự",
        "Số lượng",
        "Ghi chú",
      ]);
      sheet.appendRow([
        new Date(),
        params.fullName || "",
        params.party || "",
        params.number || "",
        params.note || "",
      ]);
    } else if (formType === "wish") {
      const sheet = getOrCreateSheet_(SHEET_WISH, ["Thời gian", "Họ tên", "Lời chúc"]);
      sheet.appendRow([new Date(), params.name || "", params.message || ""]);
    } else if (formType === "photo") {
      const sheet = getOrCreateSheet_(SHEET_PHOTO, [
        "Thời gian",
        "Họ tên",
        "Lời nhắn",
        "URL ảnh",
      ]);
      sheet.appendRow([new Date(), params.name || "", params.message || "", params.url || ""]);
    } else {
      return jsonResponse_({ status: "error", message: "formType không hợp lệ" });
    }

    return jsonResponse_({ status: "success" });
  } catch (err) {
    return jsonResponse_({ status: "error", message: String(err) });
  }
}

function doGet(e) {
  try {
    const type = ((e && e.parameter && e.parameter.type) || "").toLowerCase();

    if (type === "wishes") {
      const data = readSheetAsObjects_(SHEET_WISH, ["time", "name", "message"]).reverse();
      return jsonResponse_({ status: "success", data: data });
    }

    if (type === "photos") {
      const data = readSheetAsObjects_(SHEET_PHOTO, ["time", "name", "message", "url"]).reverse();
      return jsonResponse_({ status: "success", data: data });
    }

    return jsonResponse_({ status: "error", message: "type không hợp lệ (dùng ?type=wishes hoặc ?type=photos)" });
  } catch (err) {
    return jsonResponse_({ status: "error", message: String(err) });
  }
}

function readSheetAsObjects_(sheetName, keys) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return [];

  const values = sheet.getDataRange().getValues();
  const rows = values.slice(1); // bỏ dòng tiêu đề

  return rows
    .filter((row) => row.some((cell) => cell !== "" && cell !== null))
    .map((row) => {
      const obj = {};
      keys.forEach((key, i) => {
        const cell = row[i];
        obj[key] = cell instanceof Date ? cell.toISOString() : cell;
      });
      return obj;
    });
}
