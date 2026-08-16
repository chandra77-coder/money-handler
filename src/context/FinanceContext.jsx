import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useLS } from "../hooks/useLocalStorage";
import { 
  SEED_ACCOUNTS, SEED_TX, SEED_LOANS, SEED_UPI, SEED_PROFILE,
  SEED_CATEGORIES, SEED_WORK_RECORDS, SEED_WORK_NAMES
} from "../constants/seedData";
import { todayStr } from "../utils/formatters";
import { advanceRecurringDate, createId } from "../utils/dataHelpers";

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
  const [recurringState, setRecurringState] = useLS("fm_recurring", []);
  const [savingsGoalsState, setSavingsGoalsState] = useLS("fm_savings_goals", []);
  const [budgetsState, setBudgetsState] = useLS("fm_budgets", []);
  const [onboardingCompleteState, setOnboardingCompleteState] = useLS("fm_onboarding_complete", false);
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
  const recurring = Array.isArray(recurringState) ? recurringState : [];
  const savingsGoals = Array.isArray(savingsGoalsState) ? savingsGoalsState : [];
  const budgets = Array.isArray(budgetsState) ? budgetsState : [];
  const onboardingComplete = Boolean(onboardingCompleteState || profile.name || accounts.length || transactions.length);

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
    const result = typeof next === "function" ? next(current) : next;
    return Array.isArray(result) ? result : current;
  });
  const setRecurring = (next) => setRecurringState(prev => {
    const current = Array.isArray(prev) ? prev : [];
    const result = typeof next === "function" ? next(current) : next;
    return Array.isArray(result) ? result : current;
  });
  const setSavingsGoals = (next) => setSavingsGoalsState(prev => {
    const current = Array.isArray(prev) ? prev : [];
    const result = typeof next === "function" ? next(current) : next;
    return Array.isArray(result) ? result : current;
  });
  const setBudgets = (next) => setBudgetsState(prev => {
    const current = Array.isArray(prev) ? prev : [];
    const result = typeof next === "function" ? next(current) : next;
    return Array.isArray(result) ? result : current;
  });
  const completeOnboarding = () => setOnboardingCompleteState(true);
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

  const addRecurring = (rule) => setRecurring(prev => [{ ...rule, id: createId(), active: true, nextDue: rule.nextDue || todayStr(), createdAt: Date.now() }, ...prev]);
  const updateRecurring = (id, rule) => setRecurring(prev => prev.map(item => item.id === id ? { ...item, ...rule, id } : item));
  const deleteRecurring = (id) => setRecurring(prev => prev.filter(item => item.id !== id));
  const toggleRecurring = (id) => setRecurring(prev => prev.map(item => item.id === id ? { ...item, active: item.active === false } : item));

  const addSavingsGoal = (goal) => setSavingsGoals(prev => [{ ...goal, id: createId(), current: amountOf(goal.current), target: amountOf(goal.target), createdAt: Date.now() }, ...prev]);
  const updateSavingsGoal = (id, goal) => setSavingsGoals(prev => prev.map(item => item.id === id ? { ...item, ...goal, id, current: amountOf(goal.current), target: amountOf(goal.target) } : item));
  const deleteSavingsGoal = (id) => setSavingsGoals(prev => prev.filter(item => item.id !== id));
  const contributeToSavingsGoal = (id, amount) => {
    const contribution = amountOf(amount);
    if (contribution <= 0) return;
    setSavingsGoals(prev => prev.map(item => item.id === id ? { ...item, current: Math.min(item.target, amountOf(item.current) + contribution) } : item));
  };

  const addBudget = (budget) => setBudgets(prev => [{ ...budget, id: createId(), limit: amountOf(budget.limit), active: true }, ...prev]);
  const updateBudget = (id, budget) => setBudgets(prev => prev.map(item => item.id === id ? { ...item, ...budget, id, limit: amountOf(budget.limit) } : item));
  const deleteBudget = (id) => setBudgets(prev => prev.filter(item => item.id !== id));
  const currentMonth = todayStr().slice(0, 7);
  const budgetSnapshot = useMemo(() => budgets.map(budget => {
    const spent = transactions.filter(tx => tx.type === "expense" && tx.category === budget.category && (tx.date || "").startsWith(currentMonth)).reduce((sum, tx) => sum + amountOf(tx.amount), 0);
    return { ...budget, spent, remaining: amountOf(budget.limit) - spent, percent: amountOf(budget.limit) > 0 ? (spent / amountOf(budget.limit)) * 100 : 0 };
  }), [budgets, transactions, currentMonth]);

  useEffect(() => {
    const today = todayStr();
    const generated = [];
    let changed = false;
    const nextRecurring = recurring.map(rule => {
      if (rule.active === false) return rule;
      let dueDate = rule.nextDue || today;
      let runs = 0;
      let ruleChanged = false;
      while (dueDate && dueDate <= today && runs < 120) {
        const nextDate = advanceRecurringDate(dueDate, rule.frequency);
        generated.push({
          type: rule.type,
          category: rule.category,
          icon: rule.icon,
          amount: amountOf(rule.amount),
          note: rule.note,
          date: dueDate,
          account: rule.account,
          toAccount: rule.toAccount || "",
          method: rule.method || "",
          photo: rule.photo || null,
          recurringId: rule.id,
          createdAt: Date.now() + runs,
          id: createId(),
        });
        changed = true;
        ruleChanged = true;
        runs += 1;
        if (nextDate === dueDate) break;
        dueDate = nextDate;
      }
      return ruleChanged ? { ...rule, nextDue: dueDate, lastRun: today } : rule;
    });

    if (changed) {
      setTransactions(prev => {
        const existingKeys = new Set(prev.filter(item => item.recurringId).map(item => `${item.recurringId}:${item.date}`));
        const additions = generated.filter(item => !existingKeys.has(`${item.recurringId}:${item.date}`));
        return additions.length ? [...additions, ...prev] : prev;
      });
      setRecurringState(nextRecurring);
    }
  }, [recurring]);

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
    recurring, setRecurring, addRecurring, updateRecurring, deleteRecurring, toggleRecurring,
    savingsGoals, setSavingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, contributeToSavingsGoal,
    budgets, setBudgets, addBudget, updateBudget, deleteBudget, budgetSnapshot,
    onboardingComplete, completeOnboarding,
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
