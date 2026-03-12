# cardBalance

Credit Card & Paycheck Cash-Flow Planner

cardBalance helps you track credit card spending and plan upcoming bills around your paychecks.

Built on Google AppScript and Google Sheets

---

## Quick Start Guide

1. Copy the template spreadsheet
2. Deploy the web app
3. Complete the setup wizard
4. Start logging transactions

---

## Full Installation Guide

### Step 1 — Copy the Sheet

1. Open the shared Google Sheet link
2. Go to **File → Make a copy**
3. Save it to your own Google Drive — this is your personal instance

### Step 2 — Open the Script Editor

1. In your copied sheet, go to **Extensions → Apps Script**
2. You should see two files: `Code.gs` and `Index.html`

### Step 3 — Deploy as a Web App

1. Click **Deploy → New deployment**
2. Click the gear icon next to "Select type" and choose **Web app**
3. Set the following:
   - Description: `cardBalance`
   - Execute as: **Me**
   - Who has access:
   - **Only myself** – for personal use
   - Anyone with the link – if sharing with a spouse or partner
4. Click **Deploy**
5. Copy the web app URL — this is your personal app link
6. Bookmark it for easy access

> **Note:** On first deploy, Google will ask you to authorize the app to access your spreadsheet. Click **Review permissions → Allow**.

---

## First-Time Setup

When you open the app for the first time, a welcome screen will appear. Click **Get Started** to go directly to Setup.

Work through the steps in order:

1. **Cards** — add each credit card you want to track, with an optional color
2. **Expense Types and Budgets** — set a budget amount and frequency for each expense type (e.g. Grocery, Gas, Other)
3. **Pay Period** — choose your pay frequency and enter an anchor date (any past payday)
4. **Bills** *(optional)* — add recurring bills to use the BillBalance feature

Click **Save Setup** when done. The app will generate your pay schedule and activate all features.

---

## How cardBalance Works ##

cardBalance plans spending around your paycheck schedule.

It combines:
- your pay frequency
- recurring bills
- credit card transactions

to calculate how much money remains available for your paychecks.

---

## Features

**Transactions** — log credit card charges by card, type, and amount. Mark transactions as paid when you settle your balance.

**Dashboard** — see your total amount owed, spending for the current window, budget remaining, and a breakdown by expense type. Switch between Calendar Month and Pay Period views.

**BillBalance** — shows upcoming bills assigned to each paycheck so you can plan cash flow. Requires at least one bill in Setup.

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

## Updating to a New Version

When a new version is released:

1. Open **Extensions → Apps Script** in your sheet
2. Replace the contents of `Code.gs` and `Index.html` with the new versions
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

Do not rename or delete these sheets. You can view and export data from them at any time.

---

## Troubleshooting

**App shows a blank screen or spinner that never loads**
Run the **Connection Test** in Tools to verify the app can reach your spreadsheet.

**BillBalance shows no data**
Make sure you have at least one bill added in Setup → Bills, then save.

**Pay dates look wrong after changing frequency**
Go to Setup → Pay Period, confirm your frequency and anchor date, and save again. The app will regenerate all pay dates.

**"Missing: at least one card" error on save**
Complete all required fields in Setup before saving: at least one card, one expense type, and a pay frequency with anchor date.
