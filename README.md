# MoneyMate - Personal Finance Tracker

A mobile-first personal finance tracking app built with **React** and **Vite**. Track your transactions, manage loans, set savings goals, and monitor your wealth with a beautiful, intuitive interface.

## Features

✅ **Transaction Management** — Record income, expenses, and transfers with categories and notes  
✅ **Account Management** — Create and manage multiple accounts (Cash, Bank, Wallet, etc.)  
✅ **Loan Tracking** — Track money you've lent or borrowed with status updates  
✅ **Savings Goals** — Set targets and monitor progress with visual indicators  
✅ **Wealth Overview** — Compare declared wealth vs. tracked amount  
✅ **Manual Check** — Verify app calculations against physical cash counts  
✅ **PIN Security** — Protect your financial data with a 4-digit PIN  
✅ **Offline-First** — All data stored in localStorage, works without internet  
✅ **Mobile-First Design** — Optimized for 420px width (mobile devices)  
✅ **No External Dependencies** — Pure React with inline styles (except React itself)

## Tech Stack

- **React 18** — UI framework
- **Vite** — Fast build tool
- **localStorage** — Data persistence
- **Inline CSS** — No external stylesheets

## Installation & Setup

### Prerequisites
- Node.js 16+ and npm/pnpm

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/chandra77-coder/money-handler.git
   cd money-handler
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```
   The app will open at `http://localhost:5173`

4. **Build for production**
   ```bash
   npm run build
   # or
   pnpm build
   ```
   Output will be in the `dist/` directory.

## Project Structure

```
money-handler/
├── App.jsx              # Main app component (all logic in one file)
├── main.jsx             # React entry point
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── package.json         # Dependencies
└── README.md            # This file
```

## Usage

### Dashboard Tab
- View your total available balance
- See income and expense summaries
- Monitor all accounts at a glance
- Check wealth overview and manual verification

### Transactions Tab
- Add income, expenses, or transfers
- Search transactions by category, note, or account
- View transactions grouped by date
- Type "create" in the search bar to quickly add a transaction

### Loans Tab
- Track money you've lent (gave) or borrowed (took)
- Mark loans as settled or pending
- Edit or delete loan records
- View net position (money owed vs. owed to you)

### Goal Tab
- Set a savings target
- Track progress with a visual progress bar
- See estimated time to reach your goal
- Get motivational messages based on progress

### Settings Tab
- **Manage Accounts** — Add, edit, or delete accounts with opening balances
- **Opening Balance** — Set a global starting amount
- **Declared Total** — Enter your known total wealth
- **Savings Goal** — Set your target amount
- **Manual Check** — Enter your physical cash count
- **PIN Lock** — Set, change, or disable a 4-digit PIN

## Data Storage

All data is stored in the browser's `localStorage` under these keys:
- `fm_transactions` — All transactions
- `fm_loans` — All loans
- `fm_accounts` — All accounts
- `fm_opening` — Opening balance
- `fm_declared` — Declared total wealth
- `fm_goal` — Savings goal amount
- `fm_manual` — Manual check amount
- `fm_pin` — Encrypted PIN (4 digits)
- `fm_pin_enabled` — PIN lock status

**Note:** Data persists across browser sessions but is device-specific. Clearing browser data will reset the app.

## Calculation Rules

### Account Balance
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
- Positive (Red): Untracked/missing money
- Negative (Orange): More tracked than declared
- Zero (Green): Perfectly balanced
```

### Manual Check Difference
```
Manual Diff = Your Physical Count - Total Tracked
- Positive (Orange): You counted more (missed income)
- Negative (Red): You counted less (missed expense)
- Zero (Green): Perfect match
```

## Color Scheme

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Dark | #1E3A5F | Headers, primary text |
| Primary Mid | #2D6A9F | Buttons, accents |
| Income | #1DB954 | Income amounts, positive values |
| Expense | #E53E3E | Expense amounts, negative values |
| Transfer | #7B5EA7 | Transfer transactions |
| Background | #F0F4F8 | Page background |
| Card | White | Card backgrounds |

## Security

- **PIN Lock** — 4-digit PIN protects app access
- **localStorage** — Data stored locally on your device
- **No Cloud Sync** — Your financial data never leaves your device
- **No Tracking** — No analytics or user tracking

## Responsive Design

- **Mobile-First** — Designed for 420px width
- **Touch-Friendly** — Large buttons and tap targets
- **Offline-Capable** — Works without internet connection
- **PWA-Ready** — Can be installed as a web app

## Building for Android APK

To build as an Android APK using Capacitor:

1. **Install Capacitor CLI**
   ```bash
   npm install -g @capacitor/cli
   ```

2. **Build web assets**
   ```bash
   npm run build
   ```

3. **Initialize Capacitor**
   ```bash
   npx cap init moneymate com.rmtelecom.moneymate
   ```

4. **Add Android platform**
   ```bash
   npx cap add android
   ```

5. **Build APK**
   ```bash
   npx cap build android
   ```

## Troubleshooting

### Data not persisting?
- Check if localStorage is enabled in your browser
- Clear browser cache and reload
- Check browser console for errors

### PIN not working?
- PIN must be exactly 4 digits
- Make sure you confirmed the PIN correctly
- Try disabling and re-enabling PIN lock

### App not loading?
- Clear browser cache
- Try a different browser
- Check browser console for JavaScript errors

## Contributing

Feel free to fork, modify, and improve this project. Some ideas:
- Add data export/import (CSV, JSON)
- Add recurring transactions
- Add budget limits and alerts
- Add charts and analytics
- Add multi-currency support

## License

This project is open source and available under the MIT License.

## Author

Created by **chandra77-coder**  
GitHub: https://github.com/chandra77-coder

## Support

For issues, feature requests, or questions:
1. Check existing GitHub Issues
2. Create a new Issue with details
3. Include screenshots if applicable

---

**Happy tracking! 💰**
