# cardBalance

Credit Card & Paycheck Cash-Flow Planner

cardBalance helps you track credit card spending, manage recurring bills, and plan cash flow around your pay schedule. Built on Google Apps Script and Google Sheets.

-----

## Quick Start Guide

1. Copy the template spreadsheet
1. Run the installer from the cardBalance menu
1. Deploy the web app
1. Complete the setup wizard
1. Start logging transactions

-----

## Full Installation Guide

### Step 1 — Copy the Sheet

1. Open the shared Google Sheet link
1. Go to **File → Make a copy**
1. Save it to your own Google Drive — this is your personal instance

### Step 2 — Run the Installer

1. After copying, open the sheet
1. A **📊 cardBalance** menu will appear in the toolbar
1. Click **cardBalance → 📦 Install**
1. The installer will check for the required sheets (Config, Transactions, Bills, Payments)
1. If any sheets already exist, you will be prompted per sheet to keep or replace them
1. After the sheets are ready, a dialog will walk you through deploying the web app

### Step 3 — Deploy as a Web App

1. In your sheet, go to **Extensions → Apps Script**
1. Click **Deploy → New deployment**
1. Click the gear icon next to “Select type” and choose **Web app**
1. Set the following:
- Description: `cardBalance`
- Execute as: **Me**
- Who has access: **Only myself** for personal use, or **Anyone with the link** if sharing
1. Click **Deploy**
1. Copy the web app URL — this is your personal app link
1. Bookmark it for easy access

> **Important:** Always set **Execute as: Me**. If set to “User accessing the app,” other users will not be able to save transactions.

> **Note:** On first deploy, Google will ask you to authorize the app. Click **Review permissions → Allow**.

-----

## First-Time Setup

When you open the app for the first time, a welcome screen will appear. Click **Get Started** to go directly to Setup.

Work through the steps in order:

1. **Cards** — add each credit card you want to track, with an optional hex color
1. **Types & Budgets** — add your expense types and set a budget amount for each. Select your budget frequency at the top of this step
1. **Pay Period** — choose your pay frequency and enter an anchor date (any past payday). Semi-monthly requires two anchor dates
1. **Bills** *(optional)* — add recurring bills to use the BillBalance feature

Click **Save Setup** when done. The app will generate your pay schedule and activate all features. The setup wizard switches to a standard tab interface after your first successful save. Step indicators turn green as you complete each section.

-----

## How cardBalance Works

cardBalance plans spending around your paycheck schedule. It combines your pay frequency, recurring bills, and credit card transactions to show how much you’ve spent, what’s owed, and what’s coming up. Budgets are scaled proportionally to the exact date range you’re viewing — a 14-day pay period shows 14 days’ worth of budget, a 31-day month shows the full month’s budget.

-----

## Features

### Transactions

Log credit card charges by card, expense type, amount, and date. Mark transactions as **reimbursable** if someone is paying you back — reimbursable transactions still appear in Payables (they still need to be paid on the card) but are excluded from budget calculations and shown separately on the Dashboard and Reports.

Transactions can be edited or deleted. On mobile, swipe left on a row to reveal Edit and Delete. On desktop, Edit and Delete buttons appear inline on each row.

### Payables

All unpaid transactions appear in the Payables list. Select one or more and tap **Pay** to mark them paid. All selected transactions are processed in a single server call. Reimbursable transactions are marked with an **R** badge. Sort by date, amount, card, or expense type. Filter by card, type, or date range. Pull down on mobile to refresh, or use the refresh icon on desktop.

### Dashboard

See your total amount owed, spending for the current window, budget remaining, and a breakdown by expense type with progress bars. Switch between **Calendar Month** and **Pay Period** views. Reimbursable spending is shown as a separate line and does not count against your budget.

### BillBalance

Shows recurring bills assigned to each paycheck for the selected month, so you can plan which check covers which bills. Includes the last paycheck before the month starts (for bills due early in the month) through the last paycheck within the month. Paychecks with no bills due are shown with a $0 total. Check off bills as paid — paid bills are highlighted green and excluded from the remaining total. Paid state resets automatically at the start of each month.

### Reports

Four panels, all filtered by a date range selector with presets (This Pay Period, Last Pay Period, This Month, Last Month, Last 30 Days, Custom):

- **Budget vs Actual** — spending by expense type vs budget for the selected range. Reimbursable transactions shown as a separate row, excluded from budget comparison
- **By Card** — donut chart and table showing charged, paid, and outstanding balance per card
- **Cash Flow** — per pay period breakdown of bills due and card spending within the selected range
- **Trend** — monthly spending bars with a cumulative line. Reimbursable amounts shown as a separate bar per month

-----

## Pay Frequency Options

|Frequency   |How it works                                                       |
|------------|-------------------------------------------------------------------|
|Weekly      |Generates a pay date every 7 days from your anchor                 |
|Bi-Weekly   |Every 14 days from your anchor                                     |
|Semi-Monthly|Two dates per month (e.g. 1st and 15th) — requires two anchor dates|
|Monthly     |One date per month from your anchor                                |

-----

## Budget Frequency

Budget amounts are entered as a **per-period** amount matching your budget frequency. The app scales them to match whatever date range you’re viewing using a daily rate:

- A monthly $600 grocery budget shows exactly $600 for any full calendar month
- For a 14-day pay period in a 31-day month it shows $600 × (14/31) = $271.05
- This keeps Dashboard and Reports numbers consistent with each other

-----

## Reimbursable Transactions

Check the **Reimbursable** box when adding or editing a transaction to mark it as a pass-through expense (e.g. buying something for someone who will pay you back).

|Where           |How reimbursable transactions appear                                   |
|----------------|-----------------------------------------------------------------------|
|Payables        |Listed normally with an **R** badge — still need to be paid on the card|
|Dashboard       |Excluded from budget tracking; shown as a separate “Reimbursable” line |
|Budget vs Actual|Separate row at the bottom, not counted against budget                 |
|Trend chart     |Separate bar per month alongside regular spending                      |

-----

## Version Mismatch Detection

If `Code.gs` and `Index.html` are ever out of sync (e.g. one file was updated but not the other), a red banner appears at the top of the app: *“⚠️ Version mismatch — script vX.X.X / html vX.X.X. Please update both files and redeploy.”* The banner disappears automatically once both files are at the same version.

-----

## cardBalance Menu

After installation, a **📊 cardBalance** menu is available in the Google Sheets toolbar:

|Menu Item           |Description                                                                                                                                                 |
|--------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
|📦 Install           |Creates required sheets and guides you through deployment                                                                                                   |
|🔄 Check for Updates |Compares your version against the latest release on GitHub. Only prompts for an update when the remote version is strictly newer than your installed version|
|📖 Open Documentation|Displays a link to this README                                                                                                                              |

-----

## Updating to a New Version

### Via the Menu (Recommended)

1. Open your sheet and click **cardBalance → 🔄 Check for Updates**
1. If an update is available, the dialog will show what’s new and provide direct links to the updated files on GitHub
1. Replace `Code.gs` and `Index.html` in your script editor with the new versions
1. Redeploy as a new version

### Manually

1. Open **Extensions → Apps Script** in your sheet
1. Replace the contents of `Code.gs` and `Index.html` with the new versions from GitHub
1. Go to **Deploy → Manage deployments**
1. Click the edit (pencil) icon on your existing deployment
1. Change version to **New version** and click **Deploy**

Your data is stored in the spreadsheet and is never affected by code updates. New columns added by updates (such as `Reimbursable`) are added automatically to existing sheets on first load — no manual sheet editing required.

-----

## Sheets Reference

|Sheet       |Contents                                                                    |
|------------|----------------------------------------------------------------------------|
|Config      |Cards, expense types, budgets, pay schedule (1,000 pre-calculated pay dates)|
|Transactions|All logged transactions including reimbursable flag                         |
|Bills       |Recurring bill definitions (name, amount, day due each month)               |
|Payments    |Payment records linked to transactions                                      |

Do not rename or delete these sheets. You can view and export data from them at any time.

-----

## Troubleshooting

**App shows a blank screen or spinner that never loads**
Run the **Connection Test** in Tools to verify the app can reach your spreadsheet.

**Other users or shared devices can’t save transactions**
Make sure the web app is deployed with **Execute as: Me**. If set to “User accessing the app,” only the sheet owner can write data.

**Version mismatch banner appears after updating**
Both `Code.gs` and `Index.html` must be updated and the app must be redeployed. Updating only one file will trigger the mismatch banner.

**BillBalance shows no data**
Make sure you have at least one bill added in Setup → Bills, then save.

**BillBalance shows the wrong paychecks for the selected month**
Go to Setup → Pay Period, confirm your frequency and anchor date, and save again to regenerate pay dates.

**Pay dates look wrong after changing frequency**
Go to Setup → Pay Period, confirm your frequency and anchor date, and save again. The app will regenerate all 1,000 pay dates.

**Budget numbers look higher than expected**
Check that your **Budget Frequency** in Setup matches how you entered your budget amounts. If you entered a monthly amount but set frequency to bi-weekly, the app will scale it up.

**“Missing: at least one card” error on save**
Complete all required fields in Setup before saving: at least one card, one expense type, and a pay frequency with anchor date.

**Welcome screen appears even though I already have data**
This happens on first load after a new deployment. Save your setup once to set the completion flag — the welcome screen will not appear again.

**cardBalance menu is not showing in the toolbar**
Close and reopen the sheet. The menu is added by `onOpen()` which runs when the sheet loads. If it still does not appear, open Extensions → Apps Script and run the `onOpen` function manually once.

**Update checker says an update is available when I’m already on the latest version**
Make sure both `Code.gs` and `Index.html` are at the same version and the app has been redeployed. The update checker only prompts when the GitHub version is strictly newer than your installed version.