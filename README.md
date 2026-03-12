# cardBalance

Credit Card & Paycheck Cash-Flow Planner

cardBalance helps you track credit card spending and plan upcoming bills around your paychecks.

Built on Google Apps Script and Google Sheets.

---

## Quick Start Guide

1. Copy the template spreadsheet
2. Run the installer from the cardBalance menu
3. Deploy the web app
4. Complete the setup wizard
5. Start logging transactions

---

## Full Installation Guide

### Step 1 — Copy the Sheet

1. Open the shared Google Sheet link
2. Go to **File → Make a copy**
3. Save it to your own Google Drive — this is your personal instance

### Step 2 — Run the Installer

1. After copying, open the sheet
2. A **📊 cardBalance** menu will appear in the toolbar
3. Click **cardBalance → 📦 Install**
4. The installer will check for the required sheets (Config, Transactions, Bills, Payments)
5. If any sheets already exist, you will be prompted per sheet to keep or replace them
6. After the sheets are ready, a dialog will walk you through deploying the web app

### Step 3 — Deploy as a Web App

1. In your sheet, go to **Extensions → Apps Script**
2. Click **Deploy → New deployment**
3. Click the gear icon next to "Select type" and choose **Web app**
4. Set the following:
   - Description: `cardBalance`
   - Execute as: **Me**
   - Who has access: **Only myself** for personal use, or **Anyone with the link** if sharing with a partner
5. Click **Deploy**
6. Copy the web app URL — this is your personal app link
7. Bookmark it for easy access

> **Important:** Set **Execute as: Me**. If set to "User accessing the app," other users will not be able to save transactions.

> **Note:** On first deploy, Google will ask you to authorize the app to access your spreadsheet. Click **Review permissions → Allow**.

---

## First-Time Setup

When you open the app for the first time, a welcome screen will appear. Click **Get Started** to go directly to Setup.

Work through the steps in order:

1. **Cards** — add each credit card you want to track, with an optional color
2. **Types & Budgets** — add your expense types and set a budget amount for each. Select your budget frequency at the top of this step
3. **Pay Period** — choose your pay frequency and enter an anchor date (any past payday). Semi-monthly requires two anchor dates
4. **Bills** *(optional)* — add recurring bills to use the BillBalance feature

Click **Save Setup** when done. The app will generate your pay schedule and activate all features. The setup wizard switches to a standard tab interface after your first successful save.

---

## How cardBalance Works

cardBalance plans spending around your paycheck schedule. It combines your pay frequency, recurring bills, and credit card transactions to calculate how much money remains available across your paychecks.

---

## Features

**Transactions** — log credit card charges by card, type, and amount. Mark transactions as paid when you settle your balance.

**Dashboard** — see your total amount owed, spending for the current window, budget remaining, and a breakdown by expense type. Switch between Calendar Month and Pay Period views.

**BillBalance** — shows upcoming bills assigned to each paycheck so you can plan cash flow. Check off bills as paid — paid bills are highlighted in green and excluded from the remaining total. Paid state resets automatically at the start of each month. Requires at least one bill in Setup.

**Reports** — monthly Budget vs Actual table, spending allocation chart, and cumulative trend chart.

---

## Pay Frequency Options

| Frequency | How it works |
|---|---|
| Weekly | Generates a pay date every 7 days from your anchor |
| Bi-Weekly | Every 14 days from your anchor |
| Semi-Monthly | Two dates per month (e.g. 1st and 15th) — requires two anchor dates |
| Monthly | One date per month from your anchor |

---

## Budget Frequency

Budget amounts are entered as a **per-period** amount matching your budget frequency setting. The app normalizes them to monthly equivalents for display using precise annual multipliers (bi-weekly = ×26/12, weekly = ×52/12).

---

## cardBalance Menu

After installation, a **📊 cardBalance** menu is available in the Google Sheets toolbar:

| Menu Item | Description |
|---|---|
| 📦 Install | Creates required sheets and guides you through deployment |
| 🔄 Check for Updates | Compares your version against the latest release on GitHub |
| 📖 Open Documentation | Displays a link to this README |

---

## Updating to a New Version

### Via the Menu (Recommended)

1. Open your sheet and click **cardBalance → 🔄 Check for Updates**
2. If an update is available, the dialog will show what's new and provide direct links to the updated files on GitHub
3. Follow the steps in the dialog to replace `Code.gs` and `Index.html` in your script editor
4. Redeploy as a new version

### Manually

1. Open **Extensions → Apps Script** in your sheet
2. Replace the contents of `Code.gs` and `Index.html` with the new versions from GitHub
3. Go to **Deploy → Manage deployments**
4. Click the edit (pencil) icon on your existing deployment
5. Change version to **New version** and click **Deploy**

Your data is stored in the spreadsheet and is never affected by code updates.

---

## Sheets Reference

The app manages the following sheets automatically:

| Sheet | Contents |
|---|---|
| Config | Cards, expense types, budgets, pay schedule |
| Transactions | All logged transactions |
| Bills | Recurring bill definitions |
| Payments | Payment records |

Do not rename or delete these sheets. You can view and export data from them at any time.

---

## Troubleshooting

**App shows a blank screen or spinner that never loads**
Run the **Connection Test** in Tools to verify the app can reach your spreadsheet.

**Other users or shared devices can't save transactions**
Make sure the web app is deployed with **Execute as: Me**. If set to "User accessing the app," only the sheet owner can write data.

**BillBalance shows no data**
Make sure you have at least one bill added in Setup → Bills, then save.

**Pay dates look wrong after changing frequency**
Go to Setup → Pay Period, confirm your frequency and anchor date, and save again. The app will regenerate all pay dates.

**"Missing: at least one card" error on save**
Complete all required fields in Setup before saving: at least one card, one expense type, and a pay frequency with anchor date.

**Welcome screen appears even though I already have data**
This happens on first load after a new deployment. Save your setup once to set the completion flag — the welcome screen will not appear again.

**cardBalance menu is not showing in the toolbar**
Close and reopen the sheet. The menu is added by onOpen() which runs when the sheet loads. If it still does not appear, open Extensions → Apps Script and run the onOpen function manually once.
