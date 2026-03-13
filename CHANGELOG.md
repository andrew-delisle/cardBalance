# Changelog

All notable changes to cardBalance will be documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2026-03-13

### Added
- Reports page fully overhauled — replaced month picker with a date range filter bar supporting presets: This Pay Period, Last Pay Period, This Month, Last Month, Last 30 Days, and Custom date range
- Reports now show four panels: Budget vs Actual, By Card, Cash Flow, and Trend
- By Card panel — Chart.js donut chart plus a table showing charged, paid, and outstanding balance per card
- Cash Flow panel — table of pay periods within the selected date range showing bills due, card spending, and total outgoing per period
- Payables list sort controls — sort by Date ↓↑, Amount ↓↑, Card A–Z, Type A–Z on both mobile and desktop
- Payables list filter controls — compact single-row bar with expandable filter panel; filter by card, expense type, and date range; Filter button highlights when filters are active
- Desktop payables rows now show inline Edit and Delete buttons — no swipe required
- Pull-to-refresh on mobile Payables page — pull down from the top of the list to trigger a full data reload
- Refresh icon button on desktop Payables control bar — spins while loading
- Chart.js 4.4.1 loaded from cdnjs for donut chart rendering
- Logging added to `applyTxnControls` and `renderPayables` for sort/filter state tracing
- Server-side `Logger.log` added to `getUnpaidTransactionsInternal` confirming ISO date field on every call

### Fixed
- Bulk pay (mark all selected as paid) was only processing a subset of transactions — parallel `google.script.run` calls hit Apps Script's concurrency limit; replaced with sequential chained processing; button now shows live "Saving X of Y…" progress
- Sort by date had no effect — transactions in `appData.transactions` were missing the `date` (ISO) field; `getUnpaidTransactionsInternal` only returned `transactionDate` (display string); added `date` field via `parseSheetDate` → `toYMD`
- Date filter had no effect for the same reason as above
- Sort controls on desktop silently reset to `date-desc` after every change — both mobile and desktop selects exist in the DOM simultaneously; loop was letting the inactive select overwrite the active one; fixed by passing prefix explicitly from each `onchange` handler
- By Card report always showed $0.00 paid — `getReportsData` checked `t.paid` (field doesn't exist) and accumulated `t.amount` instead of `t.totalPaid`; fixed to use `t.totalPaid` unconditionally
- Stray dropdown arrows appearing beside sort/filter selects inside `.txn-controls` — caused by `.select-wrap::after` CSS triangle applying globally; suppressed inside `.txn-controls` and restored native browser appearance on those selects
- Refresh button was visible on mobile where pull-to-refresh already handles reload; hidden on mobile via body class CSS

### Changed
- `getReportsData` signature changed from `(year, month)` to `(startDate, endDate)` ISO date strings
- `getUnpaidTransactionsInternal` now returns a `date` field (ISO `YYYY-MM-DD`) alongside the existing `transactionDate` display string
- `loadAppData` now accepts an optional callback, used by `triggerRefresh` to stop the spinner on completion
- Report panels reorganized from 3 (BVA, Allocation, Trend) to 4 (BVA, By Card, Cash Flow, Trend); desktop shows all four in a 2×2 grid

---

## [1.1.0] - 2026-03-12

### Added
- Setup wizard with numbered step indicators and first-run welcome screen
- Merged Types & Budgets into a single setup step — expense type name and budget amount on the same row
- Bill paid/unpaid tracking in BillBalance — checkbox per bill, green highlight when paid, excluded from remaining total
- Bill paid state persists across sessions via UserProperties and auto-resets at the start of each new month
- Loading screen with cardBalance logo and animated dots on app start
- Smooth fade-out transition when app data finishes loading
- cardBalance installer menu in Google Sheets toolbar (📦 Install, 🔄 Check for Updates, 📖 Open Documentation)
- Install function creates required sheets with per-sheet prompts if sheets already exist
- Check for Updates fetches version.json from GitHub and shows guided update instructions if a new version is available
- `Install.gs` as a separate script file — keeps installer logic independent from `Code.gs`
- `version.json` in repo root for version tracking
- `appsscript.json` manifest with explicit OAuth scopes for UI dialogs and external requests
- Desktop layout constraints for setup rows — list capped at 560px and centered within the card
- Setup UI switches from wizard to standard tab interface after first successful save
- Step indicators update immediately when navigating between wizard steps based on current form state
- Migration: existing configured users automatically receive the setupComplete flag on first load — no wizard shown

### Fixed
- Welcome overlay flash on initial page load — overlay now starts hidden and is shown only after data loads
- Multi-user transaction saving — documented and enforced `Execute as: Me` deployment requirement
- Step checkmarks were never visible because UI switched to tab mode before user could see them
- Separate Budgets tab removed — budget amounts now live alongside expense types

---

## [1.0.0] - 2026-03-11

### Added
- Initial release
- Transaction logging by card, expense type, amount, and date
- Mark transactions as paid individually or in bulk
- Pay schedule generation from an anchor date supporting weekly, bi-weekly, semi-monthly, and monthly frequencies
- Semi-monthly edge case handling — clamps to last day of month
- BillBalance — assigns recurring bills to upcoming paychecks for cash flow planning
- Budget frequency support — budgets entered per-period and normalized to monthly equivalents for display (bi-weekly ×26/12, weekly ×52/12)
- Dashboard with Calendar Month and Pay Period views
- Dashboard snap cards — total owed, period spending, budget remaining, and budget frequency label
- Reports — Budget vs Actual table, spending allocation chart, and cumulative trend chart
- Month picker for reports
- Appearance settings — light, dark, and system theme
- Config Diagnostic, Connection Test, Scale Diagnostic, and Nav Diagnostic tools
- Config sheet columns: CardName, ExpenseType, CardColor, BudgetAmount, PayDateReference, PayDays, PayFrequency, PayDateReference2, BudgetFrequency
- 1,000 pay days pre-calculated and stored in the Config sheet on save
- PropertiesService used for setupComplete flag and bill paid state — persists across sessions and deployments
- Mobile and desktop responsive layout with device class detection
- Swipe-to-delete on transaction rows (mobile)
- BillBalance stale data cleared after setup save
