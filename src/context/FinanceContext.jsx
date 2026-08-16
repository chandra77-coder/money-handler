import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useLS } from "../hooks/useLocalStorage";
import { 
  SEED_ACCOUNTS, SEED_TX, SEED_LOANS, SEED_UPI, SEED_PROFILE,
  SEED_CATEGORIES, SEED_WORK_RECORDS, SEED_WORK_NAMES
} from "../constants/seedData";
import { todayStr } from "../utils/formatters";
import { createId } from "../utils/dataHelpers";

const FinanceContext = createContext();

const EMPTY_TRASH = { transactions: [], loans: [], work: [], categories: { income: [], expense: [] } };
const normalizeTrash = (raw) => ({
  ...EMPTY_TRASH,
  ...(raw || {}),
  transactions: Array.isArray(raw?.transactions) ? raw.transactions : [],
  loans: Array.isArray(raw?.loans) ? raw.loans : [],
  work: Array.isArray(raw?.work) ? raw.work : [],
  categories: {
    ...EMPTY_TRASH.categories,
    ...(raw?.categories || {}),
    income: Array.isArray(raw?.categories?.income) ? raw.categories.income : [],
    expense: Array.isArray(raw?.categories?.expense) ? raw.categories.expense : [],
  },
});
const amountOf = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error("useFinance must be used within a FinanceProvider");
  return context;
};

export const FinanceProvider = ({ children }) => {
  // --- Core State ---
  const [transactionsState, setTransactionsState] = useLS("fm_transactions", SEED_TX);
  const [loansState, setLoansState] = useLS("fm_loans", SEED_LOANS);
  const [accountsState, setAccountsState] = useLS("fm_accounts", SEED_ACCOUNTS);
  const [openingBalance, setOpeningBalance] = useLS("fm_opening", 0);
  const [declaredAmount, setDeclaredAmount] = useLS("fm_declared", 0);
  const [goalAmount, setGoalAmount] = useLS("fm_goal", 0);
  const [manualCheck, setManualCheck] = useLS("fm_manual", 0);
  const [profileState, setProfileState] = useLS("fm_profile", SEED_PROFILE);
  const [categoriesState, setCategoriesState] = useLS("fm_categories", SEED_CATEGORIES);
  const [upiListState, setUpiListState] = useLS("fm_upi", SEED_UPI);
  const [workRecordsState, setWorkRecordsState] = useLS("fm_work_records", SEED_WORK_RECORDS);
  const [workNamesState, setWorkNamesState] = useLS("fm_work_names", SEED_WORK_NAMES);
  const [trashState, setTrashState] = useLS("fm_trash", EMPTY_TRASH);
  const transactions = Array.isArray(transactionsState) ? transactionsState : [];
  const loans = Array.isArray(loansState) ? loansState : [];
  const accounts = Array.isArray(accountsState) ? accountsState : [];
  const profile = profileState && typeof profileState === "object" ? profileState : SEED_PROFILE;
  const workRecords = Array.isArray(workRecordsState) ? workRecordsState : [];
  const workNames = Array.isArray(workNamesState) ? workNamesState : [];
  const trash = normalizeTrash(trashState);
  const categories = {
    income: Array.isArray(categoriesState?.income) ? categoriesState.income : SEED_CATEGORIES.income,
    expense: Array.isArray(categoriesState?.expense) ? categoriesState.expense : SEED_CATEGORIES.expense,
  };
  const upiList = Array.isArray(upiListState) ? upiListState : [];

  const setTransactions = (next) => setTransactionsState(prev => {
    const current = Array.isArray(prev) ? prev : [];
    const result = typeof next === "function" ? next(current) : next;
    return Array.isArray(result) ? result : current;
  });
  const setLoans = (next) => setLoansState(prev => {
    const current = Array.isArray(prev) ? prev : [];
    const result = typeof next === "function" ? next(current) : next;
    return Array.isArray(result) ? result : current;
  });
  const setAccounts = (next) => setAccountsState(prev => {
    const current = Array.isArray(prev) ? prev : [];
    const result = typeof next === "function" ? next(current) : next;
    return Array.isArray(result) ? result : current;
  });
  const setProfile = (next) => setProfileState(prev => {
    const current = prev && typeof prev === "object" ? prev : SEED_PROFILE;
    const result = typeof next === "function" ? next(current) : next;
    return result && typeof result === "object" ? result : current;
  });
  const setWorkRecords = (next) => setWorkRecordsState(prev => {
    const current = Array.isArray(prev) ? prev : [];
    const result = typeof next === "function" ? next(current) : next;
    return Array.isArray(result) ? result : current;
  });
  const setWorkNames = (next) => setWorkNamesState(prev => {
    const current = Array.isArray(prev) ? prev : [];
    const result = typeof next === "function" ? next(current) : next;
    return Array.isArray(result) ? result : current;
  });
  const setCategories = (next) => setCategoriesState(prev => {
    const current = { income: Array.isArray(prev?.income) ? prev.income : SEED_CATEGORIES.income, expense: Array.isArray(prev?.expense) ? prev.expense : SEED_CATEGORIES.expense };
    return typeof next === "function" ? next(current) : next;
  });
  const setUpiList = (next) => setUpiListState(prev => {
    const current = Array.isArray(prev) ? prev : [];
    return typeof next === "function" ? next(current) : next;
  });
  const setTrash = (next) => setTrashState(prev => normalizeTrash(typeof next === "function" ? next(normalizeTrash(prev)) : next));

  // --- UI State ---
  const [activeTab, setActiveTab] = useState("dashboard");
  const [theme, setThemeState] = useState(profile.theme || "system");
  const setTheme = (nextTheme) => {
    setThemeState(nextTheme);
    setProfile(prev => ({ ...prev, theme: nextTheme }));
  };
  useEffect(() => {
    if (profile.theme && profile.theme !== theme) setThemeState(profile.theme);
  }, [profile.theme]);

  // --- PIN Settings ---
  const [pin, setPin] = useLS("fm_pin", "");
  const [pinEnabled, setPinEnabled] = useLS("fm_pin_enabled", false);
  const [notifyEnabled, setNotifyEnabled] = useLS("fm_notify_enabled", true);

  // --- Calculations ---
  const accountBalances = useMemo(() => {
    return accounts.map(acc => {
      const income   = transactions.filter(t => t.type === "income"  && t.account === acc.name).reduce((s, t) => s + amountOf(t.amount), 0);
      const expense  = transactions.filter(t => t.type === "expense" && t.account === acc.name).reduce((s, t) => s + amountOf(t.amount), 0);
      const tOut     = transactions.filter(t => t.type === "transfer" && t.account === acc.name).reduce((s, t) => s + amountOf(t.amount), 0);
      const tIn      = transactions.filter(t => t.type === "transfer" && t.toAccount === acc.name).reduce((s, t) => s + amountOf(t.amount), 0);
      return { ...acc, balance: amountOf(acc.opening) + income - expense - tOut + tIn };
    });
  }, [accounts, transactions]);

  const totalTracked = useMemo(() => {
    return accountBalances.reduce((s, a) => s + amountOf(a.balance), 0) + amountOf(openingBalance);
  }, [accountBalances, openingBalance]);

  const workBalance = useMemo(() => {
    return workRecords.reduce((total, record) => 
      total + (record.type === "spend" ? -amountOf(record.amount) : amountOf(record.amount)), 0
    );
  }, [workRecords]);

  const totals = useMemo(() => {
    const validAccountNames = new Set(accounts.map(a => a.name));
    const income = transactions.filter(t => t.type === "income" && validAccountNames.has(t.account)).reduce((s, t) => s + amountOf(t.amount), 0);
    const expense = transactions.filter(t => t.type === "expense" && validAccountNames.has(t.account)).reduce((s, t) => s + amountOf(t.amount), 0);
    return { income, expense };
  }, [transactions, accounts]);

  // --- Actions ---
  const addTransaction = (tx) => setTransactions(prev => [{ ...tx, id: createId(), createdAt: Date.now() }, ...prev]);
  const updateTransaction = (id, tx) => setTransactions(prev => prev.map(t => t.id === id ? { ...tx, id } : t));
  const deleteTransaction = (id) => {
    const tx = transactions.find(t => t.id === id);
    if (tx) {
      setTrash(prev => ({ ...prev, transactions: [...prev.transactions, tx] }));
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const addLoan = (loan) => setLoans(prev => [{ ...loan, id: createId(), createdAt: Date.now() }, ...prev]);
  const updateLoan = (id, loan) => setLoans(prev => prev.map(l => l.id === id ? { ...loan, id } : l));
  const deleteLoan = (id) => {
    const loan = loans.find(l => l.id === id);
    if (loan) {
      setTrash(prev => ({ ...prev, loans: [...prev.loans, loan] }));
      setLoans(prev => prev.filter(l => l.id !== id));
    }
  };

  const addWorkRecord = (record) => setWorkRecords(prev => [{ ...record, id: createId(), createdAt: Date.now() }, ...prev]);
  const updateWorkRecord = (id, record) => setWorkRecords(prev => prev.map(w => w.id === id ? { ...record, id } : w));
  const deleteWorkRecord = (id) => {
    const record = workRecords.find(w => w.id === id);
    if (record) {
      setTrash(prev => ({ ...prev, work: [...prev.work, record] }));
      setWorkRecords(prev => prev.filter(w => w.id !== id));
    }
  };

  const value = {
    transactions, setTransactions, addTransaction, updateTransaction, deleteTransaction,
    loans, setLoans, addLoan, updateLoan, deleteLoan,
    accounts, setAccounts,
    openingBalance, setOpeningBalance,
    declaredAmount, setDeclaredAmount,
    goalAmount, setGoalAmount,
    manualCheck, setManualCheck,
    profile, setProfile,
    categories, setCategories,
    upiList, setUpiList,
    workRecords, setWorkRecords, addWorkRecord, updateWorkRecord, deleteWorkRecord,
    workNames, setWorkNames,
    trash, setTrash,
    activeTab, setActiveTab,
    theme, setTheme,
    pin, setPin,
    pinEnabled, setPinEnabled,
    notifyEnabled, setNotifyEnabled,
    accountBalances,
    totalTracked,
    workBalance,
    totals
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};
