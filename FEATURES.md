# MoneyMate - Complete Feature Guide

## Overview

MoneyMate is a comprehensive personal finance tracker designed for mobile-first usage. This document provides a detailed overview of all features, their functionality, and how to use them effectively.

## Dashboard (Home Tab)

The Dashboard provides a comprehensive overview of your financial status at a glance.

### Total Available Balance
Displays your complete financial picture by summing all account balances plus any global opening balance. The balance color changes based on your financial status (green for positive, red for negative).

### Income & Expense Summary
Shows side-by-side totals of all income and expenses, helping you quickly understand your cash flow. These figures exclude transfers, which are neutral transactions.

### My Accounts
Lists all your accounts with their current balances. Each account displays its icon, name, type, and real-time balance calculated from all transactions.

### Loan Snapshot
Quick overview of your lending position showing "They owe me" (pending given loans) and "I owe them" (pending taken loans) in a single card.

### Savings Goal Card
When you set a savings goal in Settings, this card appears showing:
- Visual progress bar toward your target
- Current balance and target amount
- Amount still needed
- Estimated time to reach goal
- Celebration message when goal is achieved

### Wealth Overview Card
Compares your declared total wealth against what you're currently tracking:
- Shows if you have untracked money (missing)
- Shows if you've overspent vs. declared amount
- Displays "Balanced" when they match perfectly

### Manual Check Card
Helps verify your app calculations against physical cash counts:
- Compares app calculated total vs. your physical count
- Shows difference with helpful interpretation
- Suggests if you missed recording income or expense

### Recent Transactions
Displays your 4 most recent transactions with icons, categories, amounts, and timestamps for quick reference.

---

## Transactions Tab

Complete transaction management with powerful search and filtering capabilities.

### Add Transaction
Access via the FAB (+) button or by typing "create" in the search bar.

**Income/Expense Entry:**
- Amount (required)
- Category (Salary, Freelance, Business, Gift, Food, Travel, Bills, Shopping, Health, etc.)
- Account (select from your accounts)
- Payment Method (Cash, Online/UPI, Bank Transfer, Cheque)
- Note (optional description)
- Date (defaults to today)

**Transfer Entry:**
- Amount (required)
- From Account (required)
- To Account (required, must be different from source)
- Note (optional)
- Date (defaults to today)

### Search & Filter
- Real-time search by category, note, or account name
- Type "create" to quickly open the add sheet
- Case-insensitive matching
- Filters across all transaction fields

### Transaction Display
- Grouped by Today, Yesterday, and specific dates
- Color-coded: Green (+) for income, Red (−) for expense, Purple (⇄) for transfers
- Shows category icon, description, account, and amount
- Tap to view full details

### Transaction Details
Click any transaction to see:
- Full transaction information
- Option to delete (with confirmation)
- Quick reference for all details

---

## Loans Tab

Track money you've lent or borrowed with full status management.

### Add Loan
Access via FAB (+) or by typing "create" in search.

**Loan Entry Fields:**
- Type: I Took (borrowed) or I Gave (lent)
- Person's Name (required)
- Amount (required)
- Reason (optional, e.g., Medical, Travel, Business)
- Date (defaults to today)
- Status: Pending (⏳) or Settled (✓)

### Net Position Card
Displays your net lending position: Total given loans - Total taken loans. Positive means people owe you; negative means you owe people.

### Filter Tabs
- **All:** View all loans regardless of type
- **I Took:** View only borrowed money
- **I Gave:** View only lent money

### Loan Cards
Each loan shows:
- Avatar with first letter (color-coded by name)
- Person's name
- Status badge (Pending or Settled)
- Reason for loan
- Date
- Amount

### Loan Actions
- **Mark Settled/Pending:** Toggle loan status
- **Edit:** Modify loan details
- **Delete:** Remove loan (with confirmation)

### Search & Filter
- Search by person's name or reason
- Type "create" to add new loan
- Filter by loan type using tabs

---

## Goals Tab

Track your savings progress toward financial targets.

### Set a Savings Goal
Define your target savings amount in Settings → Savings Goal.

### Goal Progress Display
- Visual progress bar showing completion percentage
- Current balance vs. target amount
- Amount still needed to reach goal
- Estimated time based on monthly surplus

### Monthly Surplus Calculation
Automatically calculates your monthly savings rate:
- Compares recent income vs. expenses
- Provides time estimate to reach goal
- Shows if you need to reduce expenses

### Achievement Celebration
When you reach your goal:
- 🎉 Celebration message displayed
- Encouragement to set a new goal
- Progress bar shows 100% completion

---

## Settings Tab

Comprehensive configuration for all app settings.

### Manage Accounts
Create and manage all your financial accounts:
- **Account Name:** Custom name (e.g., "SBI Bank", "PhonePe Wallet")
- **Type:** Cash, Bank, Wallet, or Other
- **Icon:** Visual identifier for quick recognition
- **Opening Balance:** Starting amount for the account

Accounts created here appear as options in transaction entries.

### Opening Balance
Set a global starting amount added to your total balance. Separate from individual account opening balances, useful for tracking wealth from before using the app.

### Declared Total Amount
Enter your known total wealth. The Dashboard shows the difference between this and what you're currently tracking, helping identify untracked money.

### Savings Goal
Set your target savings amount. The Goals tab displays progress toward this target with visual indicators and time estimates.

### Manual Check Amount
Enter the amount you physically counted. The Dashboard compares this against app calculations to verify accuracy.

### PIN Lock
Protect your financial data with a 4-digit PIN:
- **Set PIN:** Create a new PIN (enter twice to confirm)
- **Change PIN:** Update existing PIN
- **Disable PIN:** Remove PIN protection
- PIN required on app load if enabled

### Profile Management
- Upload and customize your avatar
- Set your name
- Choose occupation (Salaried, Business, Freelance, Student, Other)
- Set monthly income
- Select language preference
- Choose date format

### Notifications
- Toggle daily reminder notifications
- In-app banner reminds you to log transactions
- Appears if no transactions recorded today

### Backup & Restore
- **Export Transactions:** Download as CSV for spreadsheet analysis
- **Export Backup:** Complete JSON backup of all data
- **Restore Backup:** Import previously exported backups
- PIN intentionally excluded from backups for security

### UPI Management
- Add multiple UPI IDs with labels
- Upload QR codes for each UPI
- Edit or delete UPI entries
- Quick access from Pay tab

---

## Pay Tab

Quick access to your saved UPI IDs for receiving payments.

### UPI Display
Each UPI ID shows:
- Label (e.g., "Personal UPI")
- UPI ID (e.g., "name@bank")
- Copy button for quick copying
- Optional QR code preview

### QR Code Management
- Tap to expand/collapse QR code
- Full-size preview for easy scanning
- Collapse to save space

### Copy Functionality
- One-click copy to clipboard
- Visual confirmation when copied
- Automatic reset after 1.5 seconds

---

## PIN Security

Protect your app with a 4-digit PIN.

### PIN Entry Screen
- Full-screen overlay with gradient background
- 4 dot indicators showing PIN length
- Number keypad (1-9, 0)
- Backspace for deletion

### PIN Modes

**Verify Mode:** Enter existing PIN to unlock app
- Shown on app load if PIN enabled
- Error message on incorrect entry
- Allows unlimited attempts

**Set Mode:** Create new PIN
- Enter 4 digits
- Confirm by entering again
- Restart if mismatch
- Stored in localStorage

---

## Data Persistence

All data is stored locally in your browser using localStorage.

### Storage Keys
- `fm_transactions` - All transactions
- `fm_loans` - Loan records
- `fm_accounts` - Account definitions
- `fm_opening` - Global opening balance
- `fm_declared` - Declared total wealth
- `fm_goal` - Savings goal amount
- `fm_manual` - Manual check amount
- `fm_pin` - PIN (4 digits)
- `fm_pin_enabled` - PIN lock status

### Data Persistence
- Data survives browser restarts
- Device-specific (not synced to cloud)
- Clearing browser data resets app
- Backup feature allows manual export

---

## Calculations

### Account Balance Formula
```
Account Balance = Opening Balance
                + Income (where account matches)
                - Expenses (where account matches)
                - Outgoing Transfers
                + Incoming Transfers
```

### Total Tracked
```
Total Tracked = Sum of all account balances + Global Opening Balance
```

### Declared Difference
```
Declared Diff = Declared Amount - Total Tracked
```
- Positive (Red): Untracked/missing money
- Negative (Orange): More tracked than declared
- Zero (Green): Perfectly balanced

### Manual Check Difference
```
Manual Diff = Your Physical Count - Total Tracked
```
- Positive (Orange): You counted more (missed income)
- Negative (Red): You counted less (missed expense)
- Zero (Green): Perfect match

### Savings Goal Progress
```
Progress % = (Total Tracked / Goal Amount) × 100
```
- Capped at 100% for display
- Estimated time based on monthly surplus

---

## Color Scheme

| Element | Color | Hex Code | Usage |
|---------|-------|----------|-------|
| Primary Dark | Deep Teal | #1a3a5c | Headers, primary text |
| Primary Mid | Teal | #2D6A9F | Buttons, accents |
| Accent | Mint | #7EFFC5 | Highlights |
| Highlight | Gold | #F5B942 | Important actions |
| Income | Mint Green | #1DB954 | Income amounts |
| Expense | Coral Red | #E53E3E | Expense amounts |
| Transfer | Soft Violet | #7B5EA7 | Transfer transactions |
| Background | Light | #F2F4F8 | Page background |
| Card | White | #FFFFFF | Card backgrounds |

---

## Tips & Best Practices

### Organizing Accounts
- Create separate accounts for different purposes
- Use consistent naming for easy recognition
- Set accurate opening balances for accurate tracking

### Transaction Recording
- Record transactions promptly for accuracy
- Use meaningful notes for future reference
- Categorize correctly for better insights

### Loan Management
- Record loans immediately when they occur
- Update status when loans are settled
- Use the reason field for context

### Goal Setting
- Set realistic, achievable goals
- Review progress regularly
- Adjust goals as circumstances change

### Data Backup
- Export backups regularly
- Store backups in safe location
- Test restore functionality periodically

---

## Troubleshooting

### Data Not Persisting?
- Ensure localStorage is enabled in browser
- Check browser privacy settings
- Try clearing cache and reloading

### PIN Issues?
- PIN must be exactly 4 digits
- Ensure you confirmed correctly
- Try disabling and re-enabling

### Calculations Incorrect?
- Verify account opening balances
- Check transaction account assignments
- Use Manual Check feature to verify

### App Not Loading?
- Clear browser cache
- Try different browser
- Check browser console for errors

---

**For more information, visit:** https://github.com/chandra77-coder/money-handler

**Last Updated:** July 4, 2026
