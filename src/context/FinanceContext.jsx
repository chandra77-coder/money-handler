import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useLS } from "../hooks/useLocalStorage";
import { 
  SEED_ACCOUNTS, SEED_TX, SEED_LOANS, SEED_PROFILE, 
  SEED_WORK_RECORDS, SEED_WORK_NAMES 
} from "../constants/seedData";
import { todayStr } from "../utils/formatters";

const FinanceContext = createContext();

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error("useFinance must be used within a FinanceProvider");
  return context;
};

export const FinanceProvider = ({ children }) => {
  // --- Core State ---
  const [transactions, setTransactions] = useLS("fm_transactions", SEED_TX);
  const [loans, setLoans] = useLS("fm_loans", SEED_LOANS);
  const [accounts, setAccounts] = useLS("fm_accounts", SEED_ACCOUNTS);
  const [openingBalance, setOpeningBalance] = useLS("fm_opening", 0);
  const [declaredAmount, setDeclaredAmount] = useLS("fm_declared", 0);
  const [goalAmount, setGoalAmount] = useLS("fm_goal", 0);
  const [manualCheck, setManualCheck] = useLS("fm_manual", 0);
  const [profile, setProfile] = useLS("fm_profile", SEED_PROFILE);
  const [workRecords, setWorkRecords] = useLS("fm_work_records", SEED_WORK_RECORDS);
  const [workNames, setWorkNames] = useLS("fm_work_names", SEED_WORK_NAMES);
  const [trash, setTrash] = useLS("fm_trash", { transactions: [], loans: [], work: [] });

  // --- UI State ---
  const [activeTab, setActiveTab] = useState("dashboard");
  const [theme, setTheme] = useState(profile.theme || "system");

  // --- PIN Settings ---
  const [pin, setPin] = useLS("fm_pin", "");
  const [pinEnabled, setPinEnabled] = useLS("fm_pin_enabled", false);

  // --- Calculations ---
  const accountBalances = useMemo(() => {
    return accounts.map(acc => {
      const income   = transactions.filter(t => t.type === "income"  && t.account === acc.name).reduce((s, t) => s + t.amount, 0);
      const expense  = transactions.filter(t => t.type === "expense" && t.account === acc.name).reduce((s, t) => s + t.amount, 0);
      const tOut     = transactions.filter(t => t.type === "transfer" && t.account === acc.name).reduce((s, t) => s + t.amount, 0);
      const tIn      = transactions.filter(t => t.type === "transfer" && t.toAccount === acc.name).reduce((s, t) => s + t.amount, 0);
      return { ...acc, balance: acc.opening + income - expense - tOut + tIn };
    });
  }, [accounts, transactions]);

  const totalTracked = useMemo(() => {
    return accountBalances.reduce((s, a) => s + a.balance, 0) + openingBalance;
  }, [accountBalances, openingBalance]);

  const workBalance = useMemo(() => {
    return workRecords.reduce((total, record) => 
      total + (record.type === "spend" ? -(Number(record.amount) || 0) : (Number(record.amount) || 0)), 0
    );
  }, [workRecords]);

  const totals = useMemo(() => {
    const validAccountNames = new Set(accounts.map(a => a.name));
    const income = transactions.filter(t => t.type === "income" && validAccountNames.has(t.account)).reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.type === "expense" && validAccountNames.has(t.account)).reduce((s, t) => s + t.amount, 0);
    return { income, expense };
  }, [transactions, accounts]);

  // --- Actions ---
  const addTransaction = (tx) => setTransactions(prev => [{ ...tx, id: Date.now(), createdAt: Date.now() }, ...prev]);
  const updateTransaction = (id, tx) => setTransactions(prev => prev.map(t => t.id === id ? { ...tx, id } : t));
  const deleteTransaction = (id) => {
    const tx = transactions.find(t => t.id === id);
    if (tx) {
      setTrash(prev => ({ ...prev, transactions: [...prev.transactions, tx] }));
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const addLoan = (loan) => setLoans(prev => [{ ...loan, id: Date.now(), createdAt: Date.now() }, ...prev]);
  const updateLoan = (id, loan) => setLoans(prev => prev.map(l => l.id === id ? { ...loan, id } : l));
  const deleteLoan = (id) => {
    const loan = loans.find(l => l.id === id);
    if (loan) {
      setTrash(prev => ({ ...prev, loans: [...prev.loans, loan] }));
      setLoans(prev => prev.filter(l => l.id !== id));
    }
  };

  const addWorkRecord = (record) => setWorkRecords(prev => [{ ...record, id: Date.now(), createdAt: Date.now() }, ...prev]);
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
    workRecords, setWorkRecords, addWorkRecord, updateWorkRecord, deleteWorkRecord,
    workNames, setWorkNames,
    trash, setTrash,
    activeTab, setActiveTab,
    theme, setTheme,
    pin, setPin,
    pinEnabled, setPinEnabled,
    accountBalances,
    totalTracked,
    workBalance,
    totals
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};
