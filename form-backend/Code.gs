/**
 * THE SCRUB DOCTORS — quote-form backend
 * --------------------------------------
 * Every time someone submits the quote form on the website, this:
 *   1) appends a row to the Google Sheet this script is attached to, and
 *   2) emails a notification with all the details.
 *
 * ONE-TIME SETUP (no coding — just paste & click):
 *   1. Make a new Google Sheet (sheet.new).
 *   2. In that Sheet: Extensions ▸ Apps Script.
 *   3. Delete whatever's there, paste THIS whole file, click Save.
 *   4. Deploy ▸ New deployment ▸ (gear) Web app.
 *        - Description: Scrub Doctors form
 *        - Execute as: Me
 *        - Who has access: Anyone
 *      Click Deploy, then Authorize access (pick your Google account ▸ Advanced
 *      ▸ "Go to ... (unsafe)" ▸ Allow — it's your own script, this is normal).
 *   5. Copy the "Web app" URL it gives you and send it to your developer.
 *      (It looks like https://script.google.com/macros/s/AKfyc.../exec)
 *
 * The Sheet auto-shares with scrubdoctorss@gmail.com on the first submission.
 * To share it immediately instead, pick "shareSheet" in the toolbar function
 * dropdown and click Run once.
 */

// Lead notifications are emailed here. Add more, comma-separated, in the quotes.
var NOTIFY_EMAILS = "thedrplants@gmail.com";

// The Sheet is automatically shared (as an editor) with this address.
var SHARE_WITH = "scrubdoctorss@gmail.com";

/**
 * Optional: run this once from the Apps Script editor (Run ▸ shareSheet) to
 * share the Sheet with SHARE_WITH right now. Otherwise it auto-shares on the
 * first form submission. Safe to run repeatedly.
 */
function shareSheet() {
  if (SHARE_WITH) SpreadsheetApp.getActiveSpreadsheet().addEditor(SHARE_WITH);
}

function doPost(e) {
  try {
    var p = (e && e.parameter) ? e.parameter : {};
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Leads");
    if (!sheet) {
      sheet = ss.insertSheet("Leads");
      sheet.appendRow(["Received", "Name", "Address", "Email", "Phone", "# Windows", "Plan", "Notes"]);
      sheet.getRange("A1:H1").setFontWeight("bold");
      sheet.setFrozenRows(1);
      try { if (SHARE_WITH) ss.addEditor(SHARE_WITH); } catch (shareErr) {}
    }

    var when = new Date();
    var plan = p.plan || "One-time cleaning";
    sheet.appendRow([
      when,
      p.name || "",
      p.address || "",
      p.email || "",
      p.phone || "",
      p.windows || "",
      plan,
      p.message || ""
    ]);

    var body =
      "New quote request from thescrubdoctors.com:\n\n" +
      "Name:           " + (p.name || "") + "\n" +
      "Address:        " + (p.address || "") + "\n" +
      "Email:          " + (p.email || "") + "\n" +
      "Phone:          " + (p.phone || "") + "\n" +
      "Approx windows: " + (p.windows || "") + "\n" +
      "Interested in:  " + plan + "\n" +
      "Notes:          " + (p.message || "(none)") + "\n\n" +
      "Received " + when;

    MailApp.sendEmail({
      to: NOTIFY_EMAILS,
      subject: "New quote request — " + (p.name || "website"),
      replyTo: p.email || NOTIFY_EMAILS,
      body: body
    });

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput("The Scrub Doctors quote form endpoint is live.");
}
