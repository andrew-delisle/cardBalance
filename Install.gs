// ============================================================
//  cardBalance — Install.gs
//  Handles installation, updates, and the custom Sheets menu.
// ============================================================

var APP_VERSION  = "1.1.0";
var GITHUB_RAW   = "https://raw.githubusercontent.com/andrew-delisle/cardBalance/main/";
var VERSION_URL  = GITHUB_RAW + "version.json";
var DOCS_URL     = "https://github.com/andrew-delisle/cardBalance#readme";

var REQUIRED_SHEETS = ["Config", "Transactions", "Bills", "Payments"];

// ============================================================
//  MENU
// ============================================================
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("📊 cardBalance")
    .addItem("📦 Install",            "installCardBalance")
    .addItem("🔄 Check for Updates",  "checkForUpdates")
    .addSeparator()
    .addItem("📖 Open Documentation", "openDocumentation")
    .addToUi();
}

// ============================================================
//  INSTALL
// ============================================================
function installCardBalance() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var created = [], skipped = [];

  REQUIRED_SHEETS.forEach(function(name) {
    var existing = ss.getSheetByName(name);
    if (existing) {
      var response = ui.alert(
        "Sheet already exists",
        "The \"" + name + "\" sheet already exists. Overwrite it with a blank sheet?\n\nDefault: No (keep existing data)",
        ui.ButtonSet.YES_NO
      );
      if (response === ui.Button.YES) {
        ss.deleteSheet(existing);
        ss.insertSheet(name);
        created.push(name + " (replaced)");
      } else {
        skipped.push(name);
      }
    } else {
      ss.insertSheet(name);
      created.push(name);
    }
  });

  var summary = "";
  if (created.length > 0) summary += "✅ Created: " + created.join(", ") + "\n";
  if (skipped.length > 0) summary += "⏭️ Kept existing: " + skipped.join(", ") + "\n";

  Logger.log("installCardBalance | summary: " + summary);

  try {
    var template = HtmlService.createTemplateFromFile("Install");
    template.mode    = "install";
    template.summary = summary;
    template.version = APP_VERSION;
    Logger.log("installCardBalance | template created, showing dialog");
    ui.showModalDialog(
      template.evaluate().setWidth(540).setHeight(600),
      "cardBalance — Installation"
    );
    Logger.log("installCardBalance | dialog shown successfully");
  } catch(e) {
    Logger.log("installCardBalance | dialog error: " + e.message);
    ui.alert("Installation Complete", "Sheets are ready.\n\n" + summary + "\nNow go to Extensions → Apps Script → Deploy → New deployment to launch your web app.", ui.ButtonSet.OK);
  }
}

// ============================================================
//  CHECK FOR UPDATES
// ============================================================
function checkForUpdates() {
  var ui = SpreadsheetApp.getUi();
  try {
    Logger.log("checkForUpdates | fetching: " + VERSION_URL);
    var response = UrlFetchApp.fetch(VERSION_URL, { muteHttpExceptions: true });
    var code = response.getResponseCode();
    Logger.log("checkForUpdates | response code: " + code);

    if (code !== 200) {
      Logger.log("checkForUpdates | non-200 response: " + response.getContentText().substring(0, 200));
      ui.alert("Update Check Failed", "GitHub returned status " + code + ". Please try again later.", ui.ButtonSet.OK);
      return;
    }

    var raw = response.getContentText();
    Logger.log("checkForUpdates | raw response: " + raw.substring(0, 300));
    var remote = JSON.parse(raw);
    var remoteVersion = remote.version || "0.0.0";
    Logger.log("checkForUpdates | local=" + APP_VERSION + " remote=" + remoteVersion);

    try {
      var template = HtmlService.createTemplateFromFile("Install");
      template.mode          = "update";
      template.summary       = "";
      template.version       = APP_VERSION;
      template.remoteVersion = remoteVersion;
      template.releaseNotes  = remote.notes       || "";
      template.releaseDate   = remote.releaseDate || "";
      template.codeUrl       = remote.codeUrl     || (GITHUB_RAW + "Code.gs");
      template.htmlUrl       = remote.htmlUrl     || (GITHUB_RAW + "Index.html");
      template.isUpToDate    = (APP_VERSION === remoteVersion);
      ui.showModalDialog(
        template.evaluate().setWidth(540).setHeight(600),
        "cardBalance — Updates"
      );
    } catch(dialogErr) {
      Logger.log("checkForUpdates | dialog error: " + dialogErr.message);
      if (APP_VERSION === remoteVersion) {
        ui.alert("cardBalance Updates", "You are up to date! Version " + APP_VERSION + " is the latest.", ui.ButtonSet.OK);
      } else {
        ui.alert("Update Available", "Version " + remoteVersion + " is available (you have " + APP_VERSION + ").\n\nVisit " + GITHUB_RAW + " to update.", ui.ButtonSet.OK);
      }
    }
  } catch(e) {
    Logger.log("checkForUpdates | fetch error: " + e.message);
    ui.alert("Update Check Failed", "Error: " + e.message + "\n\nMake sure the script has permission to access external URLs.", ui.ButtonSet.OK);
  }
}

// ============================================================
//  DOCUMENTATION
// ============================================================
function openDocumentation() {
  SpreadsheetApp.getUi().alert(
    "cardBalance Documentation",
    "Visit the documentation at:\n\n" + DOCS_URL + "\n\nCopy the link above and open it in your browser.",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}
