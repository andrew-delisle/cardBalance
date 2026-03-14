// ============================================================
//  CREDITBALANCE — Code.gs
//  Container-bound: uses SpreadsheetApp.getActiveSpreadsheet()
//  No hardcoded Spreadsheet ID needed.
// ============================================================

var APP_VERSION = "1.2.1";

/** Callable from Install.gs so the version lives in exactly one place. */
function getAppVersion() {
  return APP_VERSION;
}

var SHEET = {
  TRANSACTIONS: "Transactions",
  PAYMENTS:     "Payments",
  CONFIG:       "Config",
  BILLS:        "Bills"
};

// ============================================================
//  WEB APP ENTRY POINT
// ============================================================
function doGet(e) {
  return HtmlService
    .createHtmlOutputFromFile("Index")
    .setTitle("cardBalance")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ============================================================
//  HELPERS
// ============================================================
function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet(name) {
  var ss    = getSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error("Sheet '" + name + "' not found. Please create it.");
  return sheet;
}

function getSheetOrNull(name) {
  return getSpreadsheet().getSheetByName(name);
}

function getOrCreateSheet(name, headers) {
  var ss    = getSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers) sheet.appendRow(headers);
  } else if (sheet.getLastRow() === 0 && headers) {
    sheet.appendRow(headers);
  }
  return sheet;
}

function generateID(prefix) {
  var now = new Date();
  var pad = function(n) { return String(n).padStart(2, "0"); };
  return prefix + "-" +
    now.getFullYear() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) + "-" +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds());
}

function formatDate(date) {
  var d = parseSheetDate(date);
  if (!d) return String(date);
  return (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
}

function parseSheetDate(val) {
  if (!val && val !== 0) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  var s = String(val).trim();
  if (!s || s === "undefined") return null;
  // M/D/YYYY or MM/DD/YYYY
  var mdy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdy) return new Date(parseInt(mdy[3]), parseInt(mdy[1]) - 1, parseInt(mdy[2]));
  // YYYY-MM-DD
  var ymd = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymd) return new Date(parseInt(ymd[1]), parseInt(ymd[2]) - 1, parseInt(ymd[3]));
  var d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function toYMD(d) {
  if (!d) return "";
  return d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0");
}

function dateToStr(val) {
  // Safely convert any date value from a sheet to M/D/YYYY string
  if (!val && val !== 0) return "";
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return "";
    return (val.getMonth() + 1) + "/" + val.getDate() + "/" + val.getFullYear();
  }
  return String(val);
}

function sheetToObjects(sheet) {
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (!data || data.length <= 1) return [];
  var headers = data[0];
  if (!headers || !headers.length) return [];
  return data.slice(1).map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) { obj[String(h).trim()] = row[i] !== undefined ? row[i] : ""; });
    return obj;
  });
}

function safeStr(val) {
  if (val === null || val === undefined) return "";
  return String(val).trim();
}

function safeFloat(val) {
  var f = parseFloat(val);
  return isNaN(f) ? 0 : f;
}

// ============================================================
//  CONFIG READER
// ============================================================
function readConfig() {
  var sheet = getSheetOrNull(SHEET.CONFIG);
  if (!sheet || sheet.getLastRow() < 1) {
    return { cards: [], expenseTypes: [], cardColors: {}, budgets: {}, payDays: [], anchorDate: "" };
  }

  var data    = sheet.getDataRange().getValues();
  var headers = data[0].map(function(h) { return safeStr(h).toLowerCase(); });

  var col = function(name) { return headers.indexOf(name); };
  var colCard        = col("cardname");
  var colType        = col("expensetype");
  var colColor       = col("cardcolor");
  var colBudgetAmt   = col("budgetamount");
  var colPayDays     = col("paydays");
  var colAnchor      = col("paydatereference");
  var colAnchor2     = col("paydatereference2");
  var colFreq        = col("payfrequency");
  var colBudgetFreq  = col("budgetfrequency");

  var cards = [], expenseTypes = [], cardColors = {}, budgets = {}, payDays = [], anchorDate = "", anchorDate2 = "", payFrequency = "", budgetFrequency = "";

  for (var i = 1; i < data.length; i++) {
    var row = data[i];

    if (colCard !== -1) {
      var cardName = safeStr(row[colCard]);
      if (cardName && cardName !== "undefined") {
        if (cards.indexOf(cardName) === -1) cards.push(cardName);
        if (colColor !== -1 && row[colColor]) {
          cardColors[cardName] = safeStr(row[colColor]);
        }
      }
    }

    if (colType !== -1) {
      var expType = safeStr(row[colType]);
      if (expType && expType !== "undefined" && expenseTypes.indexOf(expType) === -1) {
        expenseTypes.push(expType);
      }
      // Budget amount lives on the same row as ExpenseType
      if (expType && expType !== "undefined" && colBudgetAmt !== -1) {
        var bAmt = safeFloat(row[colBudgetAmt]);
        if (bAmt > 0) budgets[expType] = bAmt;
      }
    }

    if (colPayDays !== -1 && row[colPayDays]) {
      var pd = row[colPayDays];
      var pdDate = parseSheetDate(pd);
      if (pdDate) payDays.push(toYMD(pdDate));
    }

    if (colAnchor !== -1 && row[colAnchor] && !anchorDate) {
      var anchor = parseSheetDate(row[colAnchor]);
      if (anchor) anchorDate = toYMD(anchor);
    }

    if (colAnchor2 !== -1 && row[colAnchor2] && !anchorDate2) {
      var anchor2 = parseSheetDate(row[colAnchor2]);
      if (anchor2) anchorDate2 = toYMD(anchor2);
    }

    if (colFreq !== -1 && row[colFreq] && !payFrequency) {
      payFrequency = safeStr(row[colFreq]);
    }

    if (colBudgetFreq !== -1 && row[colBudgetFreq] && !budgetFrequency) {
      budgetFrequency = safeStr(row[colBudgetFreq]);
    }
  }

  payDays.sort();
  return { cards: cards, expenseTypes: expenseTypes, cardColors: cardColors, budgets: budgets, payDays: payDays, anchorDate: anchorDate, anchorDate2: anchorDate2, payFrequency: payFrequency, budgetFrequency: budgetFrequency };
}

// ============================================================
//  BATCH LOAD — single call on app startup
// ============================================================
function getAppData() {
  try {
    var config = readConfig();

    // Guard: ensure config arrays are always arrays even if readConfig returns partial data
    var safeCards       = Array.isArray(config.cards)       ? config.cards       : [];
    var safeTypes       = Array.isArray(config.expenseTypes) ? config.expenseTypes : [];
    var safePayDays     = Array.isArray(config.payDays)      ? config.payDays      : [];
    var safeCardColors  = (config.cardColors && typeof config.cardColors === "object") ? config.cardColors : {};
    var safeBudgets     = (config.budgets    && typeof config.budgets    === "object") ? config.budgets    : {};

    var unpaid = getUnpaidTransactionsInternal();

    // Load bills for Setup pre-population
    var billSheet = getSheetOrNull(SHEET.BILLS);
    var billRows  = (billSheet && billSheet.getLastRow() > 1) ? sheetToObjects(billSheet) : [];
    var bills = billRows.map(function(r) {
      return { name: safeStr(r["BillName"]), amount: safeFloat(r["Amount"]), dayDue: parseInt(safeStr(r["DayDue"])) || 1 };
    }).filter(function(b) { return b.name; });

    var isConfigured = safeCards.length > 0 && safeTypes.length > 0 && !!config.payFrequency;

    // setupComplete is true only if flag is set AND data actually exists
    var userProps  = PropertiesService.getUserProperties();
    var setupFlag  = userProps.getProperty('setupComplete') === 'true';

    // Migration: auto-write flag for existing users who are already configured
    if (isConfigured && !setupFlag) {
      userProps.setProperty('setupComplete', 'true');
      setupFlag = true;
    }

    var setupComplete = setupFlag && isConfigured;

    return JSON.parse(JSON.stringify({
      success:         true,
      isConfigured:    isConfigured,
      setupComplete:   setupComplete,
      cards:           safeCards,
      expenseTypes:    safeTypes,
      cardColors:      safeCardColors,
      budgets:         safeBudgets,
      payDays:         safePayDays,
      anchorDate:      config.anchorDate      || "",
      anchorDate2:     config.anchorDate2     || "",
      payFrequency:    config.payFrequency    || "",
      budgetFrequency: config.budgetFrequency || "monthly",
      transactions:    unpaid,
      bills:           bills
    }));
  } catch(err) {
    return { success: false, error: "getAppData failed: " + err.message };
  }
}

// ============================================================
//  TRANSACTIONS
// ============================================================
function getUnpaidTransactionsInternal() {
  var txnSheet = getSheetOrNull(SHEET.TRANSACTIONS);
  var paySheet = getSheetOrNull(SHEET.PAYMENTS);
  if (!txnSheet || txnSheet.getLastRow() <= 1) return [];

  var txnData = sheetToObjects(txnSheet);
  var payData = (paySheet && paySheet.getLastRow() > 1) ? sheetToObjects(paySheet) : [];

  var paidMap = {};
  payData.forEach(function(p) {
    var id  = safeStr(p["TransactionID"]);
    var amt = safeFloat(p["Amount"]);
    paidMap[id] = (paidMap[id] || 0) + amt;
  });

  var unpaid = [];
  txnData.forEach(function(t) {
    var id       = safeStr(t["TransactionID"]);
    var original = safeFloat(t["Amount"]);
    var paid     = Math.round((paidMap[id] || 0) * 100) / 100;
    var owed     = Math.round((original - paid) * 100) / 100;
    if (owed > 0) {
      var rawDate = parseSheetDate(t["TransactionDate"]);
      var isoDate = rawDate ? toYMD(rawDate) : safeStr(t["TransactionDate"]);
      unpaid.push({
        transactionID:   id,
        date:            isoDate,
        transactionDate: dateToStr(t["TransactionDate"]),
        card:            safeStr(t["CreditCard"]),
        expenseType:     safeStr(t["ExpenseType"]),
        originalAmount:  original,
        totalPaid:       paid,
        amountOwed:      owed
      });
    }
  });
  Logger.log("getUnpaidTransactionsInternal | count=%s | sample.date=%s | sample.transactionDate=%s",
    unpaid.length,
    unpaid.length ? unpaid[0].date : "n/a",
    unpaid.length ? unpaid[0].transactionDate : "n/a"
  );
  return unpaid;
}

function submitTransaction(payload) {
  try {
    if (!payload || !payload.date)        throw new Error("Date is required.");
    if (!payload.card)                    throw new Error("Credit card is required.");
    if (!payload.expenseType)             throw new Error("Expense type is required.");
    var amount = safeFloat(payload.amount);
    if (amount <= 0)                      throw new Error("Amount must be greater than 0.");

    var config = readConfig();
    var safeCards = Array.isArray(config.cards)        ? config.cards        : [];
    var safeTypes = Array.isArray(config.expenseTypes) ? config.expenseTypes : [];
    if (!safeCards.length || !safeTypes.length)
      throw new Error("Setup is incomplete. Please add at least one Card and one Expense Type in Tools → Setup before adding transactions.");
    if (safeCards.indexOf(payload.card) === -1)
      throw new Error("Card '" + payload.card + "' not found in Config. Please check Setup.");
    if (safeTypes.indexOf(payload.expenseType) === -1)
      throw new Error("Expense type '" + payload.expenseType + "' not found in Config. Please check Setup.");

    var sheet = getOrCreateSheet(SHEET.TRANSACTIONS,
      ["TransactionID","TransactionDate","CreditCard","ExpenseType","Amount","SubmittedBy","CreatedAt"]);

    var txnID = generateID("TXN");
    sheet.appendRow([txnID, formatDate(payload.date), payload.card, payload.expenseType,
      amount, safeStr(Session.getActiveUser().getEmail()) || "unknown", new Date()]);

    return JSON.parse(JSON.stringify({ success: true, transactionID: txnID }));
  } catch(err) {
    return { success: false, error: err.message };
  }
}

function updateTransaction(payload) {
  try {
    if (!payload || !payload.transactionID) throw new Error("TransactionID is required.");
    if (!payload.date)                      throw new Error("Date is required.");
    if (!payload.card)                      throw new Error("Credit card is required.");
    if (!payload.expenseType)               throw new Error("Expense type is required.");
    var amount = safeFloat(payload.amount);
    if (amount <= 0)                        throw new Error("Amount must be greater than 0.");

    var sheet = getSheet(SHEET.TRANSACTIONS);
    var data  = sheet.getDataRange().getValues();
    if (data.length < 2) throw new Error("No transactions found.");

    var headers = data[0].map(function(h) { return safeStr(h); });
    var colID   = headers.indexOf("TransactionID");
    var colDate = headers.indexOf("TransactionDate");
    var colCard = headers.indexOf("CreditCard");
    var colType = headers.indexOf("ExpenseType");
    var colAmt  = headers.indexOf("Amount");

    if (colID === -1) throw new Error("TransactionID column not found.");

    var rowIndex = -1;
    for (var i = 1; i < data.length; i++) {
      if (safeStr(data[i][colID]) === safeStr(payload.transactionID)) {
        rowIndex = i + 1; // 1-based sheet row
        break;
      }
    }
    if (rowIndex === -1) throw new Error("Transaction not found: " + payload.transactionID);

    if (colDate !== -1) sheet.getRange(rowIndex, colDate + 1).setValue(formatDate(payload.date));
    if (colCard !== -1) sheet.getRange(rowIndex, colCard + 1).setValue(payload.card);
    if (colType !== -1) sheet.getRange(rowIndex, colType + 1).setValue(payload.expenseType);
    if (colAmt  !== -1) sheet.getRange(rowIndex, colAmt  + 1).setValue(amount);

    return JSON.parse(JSON.stringify({ success: true }));
  } catch(err) {
    return { success: false, error: err.message };
  }
}

function deleteTransaction(transactionID) {
  try {
    if (!transactionID) throw new Error("TransactionID is required.");
    var sheet = getSheet(SHEET.TRANSACTIONS);
    var data  = sheet.getDataRange().getValues();
    if (data.length < 2) throw new Error("No transactions found.");

    var colID = data[0].map(function(h) { return safeStr(h); }).indexOf("TransactionID");
    if (colID === -1) throw new Error("TransactionID column not found.");

    for (var i = data.length - 1; i >= 1; i--) {
      if (safeStr(data[i][colID]) === safeStr(transactionID)) {
        sheet.deleteRow(i + 1);
        return { success: true };
      }
    }
    throw new Error("Transaction not found: " + transactionID);
  } catch(err) {
    return { success: false, error: err.message };
  }
}

// ============================================================
//  PAYMENTS
// ============================================================
function submitPayment(payload) {
  try {
    if (!payload || !payload.transactionID) throw new Error("TransactionID is required.");
    if (!payload.paymentDate)               throw new Error("Payment date is required.");
    var inputAmount = safeFloat(payload.amount);
    if (inputAmount <= 0)                   throw new Error("Amount must be a positive number.");

    var txnSheet = getSheet(SHEET.TRANSACTIONS);
    var paySheet = getOrCreateSheet(SHEET.PAYMENTS,
      ["PaymentID","TransactionID","PaymentDate","Amount","SubmittedBy","CreatedAt"]);

    var txnData = txnSheet.getLastRow() > 1 ? sheetToObjects(txnSheet) : [];
    var payData = paySheet.getLastRow()  > 1 ? sheetToObjects(paySheet) : [];

    var txn = null;
    txnData.forEach(function(t) {
      if (safeStr(t["TransactionID"]) === safeStr(payload.transactionID)) txn = t;
    });
    if (!txn) throw new Error("Transaction not found: " + payload.transactionID);

    var original  = safeFloat(txn["Amount"]);
    var totalPaid = 0;
    payData.forEach(function(p) {
      if (safeStr(p["TransactionID"]) === safeStr(payload.transactionID))
        totalPaid += safeFloat(p["Amount"]);
    });
    totalPaid   = Math.round(totalPaid * 100) / 100;
    var amtOwed = Math.round((original - totalPaid) * 100) / 100;

    if (inputAmount > amtOwed)
      throw new Error("Payment of $" + inputAmount.toFixed(2) +
        " exceeds amount owed ($" + amtOwed.toFixed(2) + ").");

    var payID = generateID("PAY");
    paySheet.appendRow([payID, payload.transactionID, formatDate(payload.paymentDate),
      inputAmount, safeStr(Session.getActiveUser().getEmail()) || "unknown", new Date()]);

    return JSON.parse(JSON.stringify({ success: true, paymentID: payID }));
  } catch(err) {
    return { success: false, error: err.message };
  }
}

// ============================================================
//  PAY DAY GENERATION
// ============================================================
function generatePayDays(frequency, anchorDate, anchorDate2) {
  var payDays = [];
  if (!anchorDate) return payDays;

  var anchor = parseSheetDate(anchorDate);
  if (!anchor) return payDays;

  if (frequency === "weekly") {
    var d = new Date(anchor);
    for (var i = 0; i < 1000; i++) {
      payDays.push(toYMD(d));
      d.setDate(d.getDate() + 7);
    }

  } else if (frequency === "biweekly" || !frequency) {
    var d = new Date(anchor);
    for (var i = 0; i < 1000; i++) {
      payDays.push(toYMD(d));
      d.setDate(d.getDate() + 14);
    }

  } else if (frequency === "monthly") {
    var d = new Date(anchor);
    var dayOfMonth = d.getDate();
    for (var i = 0; i < 1000; i++) {
      // Clamp to last day of month in case dayOfMonth > days in month
      var lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      var effectiveDay = Math.min(dayOfMonth, lastDay);
      payDays.push(toYMD(new Date(d.getFullYear(), d.getMonth(), effectiveDay)));
      d.setMonth(d.getMonth() + 1);
    }

  } else if (frequency === "semimonthly") {
    var anchor2 = anchorDate2 ? parseSheetDate(anchorDate2) : null;
    var day1 = anchor.getDate();
    var day2 = anchor2 ? anchor2.getDate() : day1 + 15; // fallback if no second anchor

    // Generate from the anchor's month for 500 months (yields ~1000 dates)
    var startYear  = anchor.getFullYear();
    var startMonth = anchor.getMonth();
    for (var m = 0; m < 500; m++) {
      var year  = startYear + Math.floor((startMonth + m) / 12);
      var month = (startMonth + m) % 12;
      var lastDay = new Date(year, month + 1, 0).getDate();
      payDays.push(toYMD(new Date(year, month, Math.min(day1, lastDay))));
      payDays.push(toYMD(new Date(year, month, Math.min(day2, lastDay))));
    }
    payDays.sort();
    // Trim to 1000
    payDays = payDays.slice(0, 1000);
  }

  return payDays;
}

// ============================================================
//  SETUP — save config data from web app
// ============================================================
function saveSetup(payload) {
  try {
    if (!payload) throw new Error("No payload received.");

    var ss    = getSpreadsheet();
    var sheet = ss.getSheetByName(SHEET.CONFIG);
    if (!sheet) sheet = ss.insertSheet(SHEET.CONFIG);

    // Determine how many rows we need
    var cards        = payload.cards        || [];
    var expenseTypes = payload.expenseTypes || [];
    var budgets      = payload.budgets      || {}; // { expenseType: amount }
    var anchorDate      = payload.anchorDate      || "";
    var anchorDate2     = payload.anchorDate2     || "";
    var payFrequency    = payload.payFrequency    || "biweekly";
    var budgetFrequency = payload.budgetFrequency || "monthly";

    // Regenerate PayDays from frequency and anchor(s)
    var payDays = generatePayDays(payFrequency, anchorDate, anchorDate2);

    var maxRows = Math.max(cards.length, expenseTypes.length, payDays.length, 1);

    var headers = ["CardName","ExpenseType","CardColor","BudgetAmount","PayDateReference","PayDays","PayFrequency","PayDateReference2","BudgetFrequency"];

    var rows = [headers];
    for (var r = 0; r < maxRows; r++) {
      var card            = cards[r]        || {};
      var expType         = expenseTypes[r] || "";
      var budgetAmt       = expType ? (budgets[expType] || "") : "";
      var payDay          = payDays[r]      || "";
      var anchorCell      = r === 0 ? anchorDate      : "";
      var anchor2Cell     = r === 0 ? anchorDate2     : "";
      var freqCell        = r === 0 ? payFrequency    : "";
      var budgetFreqCell  = r === 0 ? budgetFrequency : "";

      rows.push([
        card.name  || "",
        expType,
        card.color || "",
        budgetAmt,
        anchorCell,
        payDay,
        freqCell,
        anchor2Cell,
        budgetFreqCell
      ]);
    }

    // Validate rows before touching the sheet
    if (!rows || rows.length < 2) throw new Error("No data to save — aborting to protect existing config.");

    // Read existing data as backup before clearing
    var backup = null;
    try {
      if (sheet.getLastRow() > 0) backup = sheet.getDataRange().getValues();
    } catch(e) { /* backup unavailable, proceed anyway */ }

    try {
      sheet.clearContents();
      sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
    } catch(writeErr) {
      // Attempt to restore backup if write failed mid-way
      if (backup) {
        try {
          sheet.clearContents();
          sheet.getRange(1, 1, backup.length, backup[0].length).setValues(backup);
        } catch(restoreErr) { /* restore failed — sheet may be in inconsistent state */ }
      }
      throw new Error("Failed to write config: " + writeErr.message);
    }

    // Mark setup as complete if minimum viable config is present
    if (cards.length > 0 && expenseTypes.length > 0 && payFrequency) {
      PropertiesService.getUserProperties().setProperty('setupComplete', 'true');
    }

    return { success: true };
  } catch(err) {
    return { success: false, error: "saveSetup failed: " + err.message };
  }
}

function getSetupData() {
  try {
    var config = readConfig();
    // Build cards array with colors
    var cards = config.cards.map(function(name) {
      return { name: name, color: config.cardColors[name] || "" };
    });
    return JSON.parse(JSON.stringify({
      success:      true,
      cards:        cards,
      expenseTypes: config.expenseTypes,
      budgets:      config.budgets,  // { expenseType: amount }
      anchorDate:   config.anchorDate
    }));
  } catch(err) {
    return { success: false, error: err.message };
  }
}

// ============================================================
//  DASHBOARD + REPORTS HELPERS
// ============================================================
function getAllTransactionSummaries() {
  var txnSheet = getSheetOrNull(SHEET.TRANSACTIONS);
  var paySheet = getSheetOrNull(SHEET.PAYMENTS);
  if (!txnSheet || txnSheet.getLastRow() <= 1) return [];

  var txnData = sheetToObjects(txnSheet);
  var payData = (paySheet && paySheet.getLastRow() > 1) ? sheetToObjects(paySheet) : [];

  var paidMap = {};
  payData.forEach(function(p) {
    var id = safeStr(p["TransactionID"]);
    paidMap[id] = (paidMap[id] || 0) + safeFloat(p["Amount"]);
  });

  return txnData.map(function(t) {
    var id       = safeStr(t["TransactionID"]);
    var original = safeFloat(t["Amount"]);
    var paid     = Math.round((paidMap[id] || 0) * 100) / 100;
    var owed     = Math.round((original - paid) * 100) / 100;
    var rawDate  = parseSheetDate(t["TransactionDate"]);
    return {
      transactionID: id,
      date:          rawDate ? toYMD(rawDate) : safeStr(t["TransactionDate"]),
      card:          safeStr(t["CreditCard"]),
      expenseType:   safeStr(t["ExpenseType"]),
      amount:        original,
      totalPaid:     paid,
      amountOwed:    Math.max(owed, 0)
    };
  });
}

function getPayPeriod(payDays, targetDate) {
  var target = toYMD(targetDate);
  var start  = null, end = null;
  for (var i = 0; i < payDays.length; i++) {
    if (payDays[i] <= target) start = payDays[i];
    if (payDays[i] > target && end === null) end = payDays[i];
  }
  if (end) {
    var endDate = parseSheetDate(end);
    endDate.setDate(endDate.getDate() - 1);
    end = toYMD(endDate);
  }
  return { start: start || target, end: end || target };
}

// ============================================================
//  BUDGET NORMALIZATION
// ============================================================
function normalizeBudgetToMonthly(amount, frequency) {
  var result;
  switch (frequency) {
    case "weekly":      result = amount * 52 / 12; break;
    case "biweekly":    result = amount * 26 / 12; break;
    case "semimonthly": result = amount * 2;        break;
    case "monthly":
    default:            result = amount;            break;
  }
  Logger.log("normalizeBudgetToMonthly | frequency: %s | input: %s | output: %s", frequency, amount, result.toFixed(2));
  return result;
}

/**
 * Scales a per-period budget amount to match an arbitrary date range.
 * Converts to a daily rate first, then multiplies by the number of days
 * in the range. This means any date range — pay period, month, 30 days,
 * custom — gets a proportionally correct budget figure.
 *
 * @param {number} amount        - Raw budget amount per budgetFrequency period
 * @param {string} frequency     - budgetFrequency: weekly/biweekly/semimonthly/monthly
 * @param {string} startDate     - ISO date "YYYY-MM-DD"
 * @param {string} endDate       - ISO date "YYYY-MM-DD"
 * @returns {number}
 */
function normalizeBudgetToRange(amount, frequency, startDate, endDate) {
  var daysInRange = Math.round(
    (new Date(endDate + 'T00:00:00') - new Date(startDate + 'T00:00:00')) / 86400000
  ) + 1;

  var daysPerPeriod;
  switch (frequency) {
    case "weekly":      daysPerPeriod = 7;          break;
    case "biweekly":    daysPerPeriod = 14;         break;
    case "semimonthly": daysPerPeriod = 365.25 / 24; break;
    case "monthly":
    default:            daysPerPeriod = 365.25 / 12; break;
  }

  var result = amount * (daysInRange / daysPerPeriod);
  Logger.log("normalizeBudgetToRange | frequency=%s | amount=%s | daysInRange=%s | daysPerPeriod=%s | result=%s",
    frequency, amount, daysInRange, daysPerPeriod.toFixed(2), result.toFixed(2));
  return result;
}

// ============================================================
//  DASHBOARD
// ============================================================
function getDashboardData(mode) {
  try {
    var config = readConfig();
    var today  = new Date();
    var windowStart, windowEnd;

    if (mode === "period") {
      if (!config.payDays || !config.payDays.length)
        throw new Error("No pay dates found in Config. Please set an anchor date in Setup.");
      var period  = getPayPeriod(config.payDays, today);
      windowStart = period.start;
      windowEnd   = period.end;
    } else {
      windowStart = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-01";
      var lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      windowEnd   = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(lastDay).padStart(2, "0");
    }

    var txns = getAllTransactionSummaries();

    var totalOwed = 0, owedByCard = {};
    txns.forEach(function(t) {
      if (t.amountOwed > 0) {
        totalOwed += t.amountOwed;
        owedByCard[t.card] = Math.round(((owedByCard[t.card] || 0) + t.amountOwed) * 100) / 100;
      }
    });

    var windowSpend = 0, windowSpendByType = {};
    txns.forEach(function(t) {
      if (t.date >= windowStart && t.date <= windowEnd) {
        windowSpend += t.amount;
        windowSpendByType[t.expenseType] = Math.round(
          ((windowSpendByType[t.expenseType] || 0) + t.amount) * 100) / 100;
      }
    });

    var budgetFrequency = config.budgetFrequency || "monthly";
    var normalizedBudgets = {};
    Object.keys(config.budgets).forEach(function(k) {
      // In period mode, budget is already per-period — no normalization needed
      // In month mode, normalize from per-period to monthly equivalent
      var normalized = mode === "month"
        ? normalizeBudgetToMonthly(config.budgets[k], budgetFrequency)
        : config.budgets[k];
      normalizedBudgets[k] = Math.round(normalized * 100) / 100;
    });

    var totalBudget = Object.keys(normalizedBudgets).reduce(function(s, k) { return s + normalizedBudgets[k]; }, 0);

    Logger.log("getDashboardData | mode: %s | budgetFrequency: %s | rawBudgets: %s | normalizedBudgets: %s | totalBudget: %s | windowStart: %s | windowEnd: %s | windowSpend: %s",
      mode, budgetFrequency, JSON.stringify(config.budgets), JSON.stringify(normalizedBudgets), totalBudget.toFixed(2), windowStart, windowEnd, windowSpend.toFixed(2));

    var owedByCardArr = Object.keys(owedByCard).map(function(c) {
      return { card: c, owed: owedByCard[c] };
    }).sort(function(a, b) { return b.owed - a.owed; });

    return JSON.parse(JSON.stringify({
      success: true, mode: mode,
      windowStart:     windowStart,
      windowEnd:       windowEnd,
      totalOwed:       Math.round(totalOwed   * 100) / 100,
      totalBudget:     Math.round(totalBudget * 100) / 100,
      windowSpend:     Math.round(windowSpend * 100) / 100,
      remaining:       Math.round((totalBudget - windowSpend) * 100) / 100,
      owedByCard:      owedByCardArr,
      spendByType:     windowSpendByType,
      budgets:         normalizedBudgets,
      budgetFrequency: budgetFrequency
    }));
  } catch(err) {
    return { success: false, error: err.message };
  }
}

// ============================================================
//  REPORTS
// ============================================================
function getReportsData(startDate, endDate) {
  try {
    var config = readConfig();
    var txns   = getAllTransactionSummaries();
    var now    = new Date();

    // Build available months list from all transactions
    var monthSet = {};
    txns.forEach(function(t) { monthSet[t.date.substring(0, 7)] = true; });
    var availableMonths = Object.keys(monthSet).sort();

    // Default to current month if no dates provided
    if (!startDate || !endDate) {
      var ym = toYMD(now).substring(0, 7);
      startDate = ym + '-01';
      var lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      endDate = ym + '-' + String(lastDay).padStart(2, '0');
    }

    // Filter transactions to date range
    var filtered = txns.filter(function(t) { return t.date >= startDate && t.date <= endDate; });

    // Months within range (for stacked bar and trend)
    var startYM = startDate.substring(0, 7);
    var endYM   = endDate.substring(0, 7);
    var rangeMonths = availableMonths.filter(function(ym) { return ym >= startYM && ym <= endYM; });

    // ── BVA ──────────────────────────────────────────────────
    var budgetFrequency  = config.budgetFrequency || 'monthly';
    var normalizedBudgets = {};
    Object.keys(config.budgets).forEach(function(k) {
      normalizedBudgets[k] = Math.round(normalizeBudgetToRange(config.budgets[k], budgetFrequency, startDate, endDate) * 100) / 100;
    });

    var actualByType = {}, txnCountByType = {};
    filtered.forEach(function(t) {
      actualByType[t.expenseType]   = Math.round(((actualByType[t.expenseType]   || 0) + t.amount) * 100) / 100;
      txnCountByType[t.expenseType] = (txnCountByType[t.expenseType] || 0) + 1;
    });

    var allTypes = Object.keys(normalizedBudgets).concat(Object.keys(actualByType))
      .filter(function(v, i, a) { return a.indexOf(v) === i; }).sort();

    var budgetVsActual = allTypes.map(function(type) {
      var budget = normalizedBudgets[type] || 0;
      var actual = actualByType[type]      || 0;
      return {
        expenseType: type,
        budget:   budget,
        actual:   actual,
        variance: Math.round((budget - actual) * 100) / 100,
        pctUsed:  budget > 0 ? Math.round((actual / budget) * 1000) / 10 : null,
        txnCount: txnCountByType[type] || 0
      };
    });

    // ── STACKED BAR (months in range) ────────────────────────
    var allExpenseTypes = [];
    txns.forEach(function(t) { if (allExpenseTypes.indexOf(t.expenseType) === -1) allExpenseTypes.push(t.expenseType); });
    allExpenseTypes.sort();

    var stackedBar = rangeMonths.map(function(ym) {
      var byType = {};
      txns.forEach(function(t) {
        if (t.date.substring(0, 7) === ym)
          byType[t.expenseType] = Math.round(((byType[t.expenseType] || 0) + t.amount) * 100) / 100;
      });
      return { month: ym, byType: byType };
    });

    // ── CUMULATIVE TREND (months in range) ───────────────────
    var runningTotal = 0;
    var cumulative = rangeMonths.map(function(ym) {
      var monthTotal = 0;
      txns.forEach(function(t) { if (t.date.substring(0, 7) === ym) monthTotal += t.amount; });
      runningTotal += monthTotal;
      return { month: ym, monthTotal: Math.round(monthTotal * 100) / 100, cumulative: Math.round(runningTotal * 100) / 100 };
    });

    // ── SPENDING BY CARD ─────────────────────────────────────
    var spendByCard = {}, paidByCard = {};
    filtered.forEach(function(t) {
      spendByCard[t.card] = Math.round(((spendByCard[t.card] || 0) + t.amount)     * 100) / 100;
      paidByCard[t.card]  = Math.round(((paidByCard[t.card]  || 0) + t.totalPaid)  * 100) / 100;
    });
    var cardSpending = (config.cards || []).map(function(card) {
      var charged  = spendByCard[card] || 0;
      var paid     = paidByCard[card]  || 0;
      return { card: card, charged: charged, paid: paid, balance: Math.round((charged - paid) * 100) / 100 };
    }).filter(function(c) { return c.charged > 0; });

    // ── PAY PERIOD CASH FLOW ─────────────────────────────────
    var payDays  = config.payDays || [];
    var billData = [];
    try {
      var billSheet = getSheetOrNull(SHEET.BILLS);
      if (billSheet && billSheet.getLastRow() > 1) {
        var bRows = billSheet.getRange(2, 1, billSheet.getLastRow() - 1, 3).getValues();
        bRows.forEach(function(r) {
          var name   = (r[0] || '').toString().trim();
          var amount = parseFloat(r[1]) || 0;
          var dayDue = parseInt(r[2])   || 1;
          if (name && amount > 0) billData.push({ name: name, amount: amount, dayDue: dayDue });
        });
      }
    } catch(e) {}

    // Find pay periods overlapping the date range
    var cashFlow = [];
    for (var pi = 0; pi < payDays.length; pi++) {
      var periodStart = payDays[pi];
      var periodEnd   = pi + 1 < payDays.length ? shiftDate(payDays[pi + 1], -1) : shiftDate(payDays[pi], 13);
      if (periodEnd < startDate || periodStart > endDate) continue;

      // Bills due in this period
      var billsTotal = 0;
      var billsDetail = [];
      billData.forEach(function(b) {
        // Find the bill's due date within this period's month
        var pStart  = new Date(periodStart + 'T00:00:00');
        var pEnd    = new Date(periodEnd   + 'T00:00:00');
        var dueYear = pStart.getFullYear(), dueMonth = pStart.getMonth() + 1;
        var maxDay  = new Date(dueYear, dueMonth, 0).getDate();
        var clampedDay = Math.min(b.dayDue, maxDay);
        var dueDate = dueYear + '-' + String(dueMonth).padStart(2, '0') + '-' + String(clampedDay).padStart(2, '0');
        if (dueDate >= periodStart && dueDate <= periodEnd) {
          billsTotal += b.amount;
          billsDetail.push({ name: b.name, amount: b.amount });
        }
      });

      // Transactions in this period
      var txnTotal = 0;
      filtered.forEach(function(t) {
        if (t.date >= periodStart && t.date <= periodEnd) txnTotal += t.amount;
      });
      txnTotal = Math.round(txnTotal * 100) / 100;

      cashFlow.push({
        periodStart:  periodStart,
        periodEnd:    periodEnd,
        bills:        Math.round(billsTotal * 100) / 100,
        billsDetail:  billsDetail,
        transactions: txnTotal,
        total:        Math.round((billsTotal + txnTotal) * 100) / 100
      });
    }

    return JSON.parse(JSON.stringify({
      success:         true,
      startDate:       startDate,
      endDate:         endDate,
      availableMonths: availableMonths,
      budgetVsActual:  budgetVsActual,
      stackedBar:      stackedBar,
      cumulative:      cumulative,
      allExpenseTypes: allExpenseTypes,
      totalBudget:     Object.keys(normalizedBudgets).reduce(function(s, k) { return s + normalizedBudgets[k]; }, 0),
      cardSpending:    cardSpending,
      cardColors:      config.cardColors || {},
      cashFlow:        cashFlow
    }));
  } catch(err) {
    return { success: false, error: 'getReportsData: ' + err.message };
  }
}

function shiftDate(ymd, days) {
  var d = new Date(ymd + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return toYMD(d);
}


// ============================================================
//  BILLS
// ============================================================

/**
 * Returns bill data for the given year+month.
 * Each bill is assigned to the last pay date that falls BEFORE its due date.
 * Returns:
 *   { paychecks: ['2026-02-12', ...],   // sorted pay dates that appear in this month's bill assignments
 *     bills: [{ name, amount, dayDue, dueDate, paycheck }],
 *     totalsByPaycheck: { '2026-02-12': 123.45, ... },
 *     grandTotal: 999.99 }
 */
function getBillsData(year, month) {
  try {
    var config    = readConfig();
    var billSheet = getSheetOrNull(SHEET.BILLS);

    if (!billSheet || billSheet.getLastRow() <= 1) {
      return JSON.parse(JSON.stringify({
        success: true, paychecks: [], bills: [], totalsByPaycheck: {}, grandTotal: 0
      }));
    }

    var billData = sheetToObjects(billSheet);
    var payDays  = Array.isArray(config.payDays) ? config.payDays : [];

    // Guard: payDays must exist to assign bills to paychecks
    if (!payDays.length) {
      return JSON.parse(JSON.stringify({
        success:          true,
        paychecks:        [],
        bills:            [],
        totalsByPaycheck: {},
        grandTotal:       0,
        warning:          "No pay dates configured. Please set an anchor date in Setup → Pay Period."
      }));
    }

    // Resolve due date for each bill in the target month
    // If dayDue > last day of month, clamp to last day
    var lastDay = new Date(year, month, 0).getDate(); // day 0 of next month = last day of this month

    var bills = [];
    billData.forEach(function(row) {
      var name   = safeStr(row["BillName"]);
      var amount = safeFloat(row["Amount"]);
      var dayDue = parseInt(safeStr(row["DayDue"])) || 1;
      if (!name) return;

      // Clamp day to last day of month
      var effectiveDay = Math.min(dayDue, lastDay);
      var dueDate      = new Date(year, month - 1, effectiveDay);
      var dueDateYMD   = toYMD(dueDate);

      // Find the last pay date strictly before the due date
      var paycheck = null;
      for (var i = 0; i < payDays.length; i++) {
        if (payDays[i] < dueDateYMD) paycheck = payDays[i];
        else break;
      }
      // If no pay date precedes the due date, use the first available pay date
      if (!paycheck) paycheck = payDays[0];

      bills.push({
        name:     name,
        amount:   amount,
        dayDue:   dayDue,
        dueDate:  dueDateYMD,
        paycheck: paycheck
      });
    });

    // Sort bills by due date
    bills.sort(function(a, b) { return a.dueDate.localeCompare(b.dueDate); });

    // Collect unique paychecks that appear, sorted
    var paycheckSet = {};
    bills.forEach(function(b) { paycheckSet[b.paycheck] = true; });
    var paychecks = Object.keys(paycheckSet).sort();

    // Totals per paycheck
    var totalsByPaycheck = {};
    var grandTotal = 0;
    paychecks.forEach(function(p) { totalsByPaycheck[p] = 0; });
    bills.forEach(function(b) {
      totalsByPaycheck[b.paycheck] = Math.round(
        ((totalsByPaycheck[b.paycheck] || 0) + b.amount) * 100) / 100;
      grandTotal = Math.round((grandTotal + b.amount) * 100) / 100;
    });

    return JSON.parse(JSON.stringify({
      success:          true,
      paychecks:        paychecks,
      bills:            bills,
      totalsByPaycheck: totalsByPaycheck,
      grandTotal:       grandTotal
    }));

  } catch(err) {
    return { success: false, error: err.message };
  }
}

/**
 * Rewrites the Bills sheet from Setup payload.
 * payload: { bills: [{ name, amount, dayDue }] }
 */
function saveBills(payload) {
  try {
    if (!payload || !payload.bills) throw new Error("No bills data received.");

    var sheet = getOrCreateSheet(SHEET.BILLS, ["BillName","Amount","DayDue"]);
    sheet.clearContents();
    sheet.appendRow(["BillName","Amount","DayDue"]);

    (payload.bills || []).forEach(function(b) {
      var name   = safeStr(b.name);
      var amount = safeFloat(b.amount);
      var dayDue = parseInt(b.dayDue) || 1;
      if (name) sheet.appendRow([name, amount, dayDue]);
    });

    return { success: true };
  } catch(err) {
    return { success: false, error: err.message };
  }
}

// Also include bills in getAppData so Setup can pre-populate
// (bills array added inline — see getAppData above, updated below)

// ============================================================
//  BILL PAID STATE
// ============================================================
function getBillPaidState() {
  try {
    var props = PropertiesService.getUserProperties();
    var raw   = props.getProperty('billPaidState');
    if (!raw) return { success: true, month: '', paid: [] };
    var state = JSON.parse(raw);
    // Auto-reset if stored month doesn't match current month
    var now          = new Date();
    var currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    if (state.month !== currentMonth) {
      return { success: true, month: currentMonth, paid: [] };
    }
    return { success: true, month: state.month, paid: state.paid || [] };
  } catch(err) {
    return { success: false, error: err.message };
  }
}

function setBillPaid(payload) {
  try {
    var now          = new Date();
    var currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    var props        = PropertiesService.getUserProperties();
    var raw          = props.getProperty('billPaidState');
    var state        = raw ? JSON.parse(raw) : { month: currentMonth, paid: [] };

    // Reset if month rolled over
    if (state.month !== currentMonth) {
      state = { month: currentMonth, paid: [] };
    }

    var name   = payload.name;
    var isPaid = payload.isPaid;
    var idx    = state.paid.indexOf(name);

    if (isPaid && idx === -1) {
      state.paid.push(name);
    } else if (!isPaid && idx !== -1) {
      state.paid.splice(idx, 1);
    }

    props.setProperty('billPaidState', JSON.stringify(state));
    return { success: true, paid: state.paid };
  } catch(err) {
    return { success: false, error: err.message };
  }
}


function ping() {
  try {
    var ss     = getSpreadsheet();
    var sheets = ss.getSheets().map(function(s) { return s.getName(); });
    return { success: true, spreadsheetName: ss.getName(), sheets: sheets };
  } catch(err) {
    return { success: false, error: err.message };
  }
}
