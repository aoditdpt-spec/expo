/**
 * AOD for Exhibitors: receives bookings from the expo page and keeps them in this Google Sheet.
 *
 * - Every booking gets a row on the "All expo bookings" tab and on a tab named after its expo
 *   (made the first time that expo gets a booking).
 * - The payment screenshot is saved in a Drive folder ("AOD expo payment screenshots") and the
 *   company logo, when one is added, in "AOD expo company logos"; their links go in the row.
 * - The team gets an email for each booking (NOTIFY_EMAIL below; leave it empty for no email).
 *
 * Setup is in sheetsguide.md.
 */

const NOTIFY_EMAIL = "communication.aod@gmail.com";
const FOLDER_NAME = "AOD expo payment screenshots";
const LOGO_FOLDER_NAME = "AOD expo company logos";
const ALL_TAB = "All expo bookings";
const HEADERS = [
  "Received at",
  "Reference",
  "Expo",
  "Company",
  "Company logo",
  "Stall",
  "Package",
  "Amount",
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

    // The payment screenshot and the logo (optional), into Drive.
    const name = ref + " " + clean(d.company, 60);
    const proofUrl = saveImage(d.proof, FOLDER_NAME, name, "the screenshot");
    const logoUrl = d.logo && d.logo.data ? saveImage(d.logo, LOGO_FOLDER_NAME, name + " logo", "the logo") : "";

    // A filled spam-trap field doesn't drop the booking (browser autofill has filled one before);
    // the row is marked so someone checks it.
    const check = d.trap ? "Possible spam: the hidden field was filled" : "";
    const row = [
      new Date(),
      ref,
      clean(d.expoName, 120) + (d.expoDates ? " (" + clean(d.expoDates, 60) + ")" : ""),
      clean(d.company, 120),
      logoUrl,
      clean(d.stall, 40),
      clean(d.package, 120),
      clean(d.amountText, 80),
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

// Saves an image the page sent ({ type, data } with data as base64) and returns its Drive link.
function saveImage(image, folderName, name, what) {
  try {
    const type = image.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = Utilities.newBlob(Utilities.base64Decode(image.data), type, name + (type === "image/png" ? ".png" : ".jpg"));
    return folder(folderName).createFile(blob).getUrl();
  } catch (err) {
    return "Couldn't save " + what + ": " + err;
  }
}

function folder(name) {
  const found = DriveApp.getFoldersByName(name);
  return found.hasNext() ? found.next() : DriveApp.createFolder(name);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
