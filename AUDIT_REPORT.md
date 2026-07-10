# Logic Audit & Bug Hunt Report - July 10, 2026

## Identified Issues

### 1. Work Tab Integration with Home Totals
- **Issue**: The user requested that "Work" records should NOT interfere with existing Total Available / Income / Expense totals on the Home tab.
- **Current State**: The `Work` component is isolated, and its records are stored in `fm_work_records`. The `Dashboard` component calculates totals using `fm_transactions`.
- **Finding**: This is correct and follows the user's technical constraints.

### 2. Work Analysis for Empty Categories
- **Issue**: The `analysis` calculation uses `workNames.map`. If a work name exists but has no records, it shows `0`.
- **Finding**: This is acceptable, but we should ensure it doesn't clutter the UI if there are many unused names. Currently, it's fine.

### 3. "Spend" Type in Work Tab
- **Issue**: The user requested a "Work / Spend toggle".
- **Current State**: I implemented a `type` toggle between `work` and `spend`.
- **Logic Bug**: The `todayEarning` and `paidCount` / `unpaidCount` stats only filter by `status === "paid"`. They don't distinguish between `type === "work"` and `type === "spend"`.
- **Fix**: Update stats to only count `type === "work"` for earnings and counts, or handle `spend` separately.

### 4. Search Functionality "create" Keyword
- **Issue**: Typing "create" in search opens the add sheet.
- **Current State**: Implemented in `handleSearch`.
- **Finding**: Works as intended.

### 5. Photo Storage & Compression
- **Issue**: Photos must be stored independently and compressed.
- **Current State**: Using `compressImage` and storing as Base64 in `localStorage`.
- **Finding**: Works as intended, but Base64 in `localStorage` has a ~5MB limit. Large photos might hit this.
- **Fix**: Ensure `MAX` size in `compressImage` is reasonable (currently 800px).

### 6. Delete Confirmation for Work Records
- **Issue**: Delete should ask for confirmation and delete the photo.
- **Current State**: Implemented with `delId` state and confirmation modal.
- **Finding**: Works as intended.

### 7. Form Validation
- **Issue**: Payment status logic must be enforced.
- **Current State**: Partial validation in `save` function.
- **Fix**: Add explicit validation for `Online/Cash` when status is `Paid`.

## Planned Fixes

1.  **Refine Work Stats**: Only include `type === "work"` in earning and status counts.
2.  **Enhance Form Validation**: Add check for payment method when status is `paid`.
3.  **Optimize Analysis**: Only show work names that have at least one record, or show all but clearly.
4.  **UI Consistency**: Ensure all text in Dark Mode is bright (already partially addressed, will double-check).
