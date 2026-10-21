/**
 * AOD for Exhibitors: receives bookings from the expo page and keeps them in this Google Sheet.
 *
 * - Every booking gets a row on the "All expo bookings" tab and on a tab named after its expo
 *   (made the first time that expo gets a booking).
 * - The payment screenshot is saved in a Drive folder ("AOD expo payment screenshots") and its
 *   link goes in the row.
 * - The team gets an email for each booking (NOTIFY_EMAIL below; leave it empty for no email).
 *
 * Setup is in README.md ("Saving bookings to a Google Sheet").
 */

const NOTIFY_EMAIL = "communication.aod@gmail.com";
const FOLDER_NAME = "AOD expo payment screenshots";
const ALL_TAB = "All expo bookings";
const HEADERS = [
  "Received at",
  "Reference",
  "Expo",
  "Company",
  "Stall",
  "Package",
  "Contact person",
  "Designation",
  "Phone",
  "Email",
  "Shoot dates",
  "Brief for the artists",
  "Payment screenshot",
  "Met by",
  "Check",
  "Page",
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const d = JSON.parse(e.postData.contents);
    const ref = String(d.ref || "").slice(0, 40) || "EXP-" + Date.now();
    const clean = (v, n) => String(v == null ? "" : v).slice(0, n || 500);

    // Basic checks, the same as the page's.
    const missing = ["expoName", "company", "stall", "name", "role", "phone", "email"].filter((k) => !clean(d[k]).trim());
    if (missing.length || !Array.isArray(d.days) || !d.days.length || !d.proof || !d.proof.data) {
      return json({ ok: false, error: "Some details are missing." });
    }

    // The payment screenshot, into Drive.
    let proofUrl = "";
    try {
      const bytes = Utilities.base64Decode(d.proof.data);
      const blob = Utilities.newBlob(bytes, "image/jpeg", ref + " " + clean(d.company, 60) + ".jpg");
      const file = folder().createFile(blob);
      proofUrl = file.getUrl();
    } catch (err) {
      proofUrl = "Couldn't save the screenshot: " + err;
    }

    // A filled spam-trap field doesn't drop the booking (browser autofill has filled one before);
    // the row is marked so someone checks it.
    const check = d.trap ? "Possible spam: the hidden field was filled" : "";
    const row = [
      new Date(),
      ref,
      clean(d.expoName, 120) + (d.expoDates ? " (" + clean(d.expoDates, 60) + ")" : ""),
      clean(d.company, 120),
      clean(d.stall, 40),
      clean(d.package, 120),
      clean(d.name, 80),
      clean(d.role, 80),
      "'+91 " + clean(d.phone, 15),
      clean(d.email, 120),
      d.days.map((x) => clean(x, 10)).join(", "),
      clean(d.brief, 2000),
      proofUrl,
      clean(d.metBy, 60),
      check,
      clean(d.page, 300),
    ];
    tab(ALL_TAB).appendRow(row);
    tab(clean(d.expoName, 90) || "Other expos").appendRow(row);

    if (NOTIFY_EMAIL) {
      const subject = (check ? "[Check: possible spam] " : "") + "New expo booking " + ref + " · " + clean(d.company, 80) + " · stall " + clean(d.stall, 40);
      // Every filled column but the time and the page, without the ' that keeps the phone as text.
      const body = HEADERS.slice(1, HEADERS.length - 1)
        .map((h, i) => [h, String(row[i + 1]).replace(/^'/, "")])
        .filter(([, v]) => v)
        .map(([h, v]) => h + ": " + v)
        .join("\n");
      MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
    }

    return json({ ok: true, ref: ref });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Opening the web app's address in a browser just says it's running.
function doGet() {
  return json({ ok: true, service: "AOD expo bookings" });
}

function tab(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const safe = name.replace(/[\[\]\*\?\/\\:]/g, " ").slice(0, 90);
  let sheet = ss.getSheetByName(safe);
  if (!sheet) {
    sheet = ss.insertSheet(safe);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }
  return sheet;
}

function folder() {
  const found = DriveApp.getFoldersByName(FOLDER_NAME);
  return found.hasNext() ? found.next() : DriveApp.createFolder(FOLDER_NAME);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
