# Changelog

All notable changes to cardBalance will be documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
