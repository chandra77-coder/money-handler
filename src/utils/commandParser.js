import { toAmount } from "./dataHelpers.js";

const amountPattern = /(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)/i;
const clean = value => String(value || "").replace(/\s+/g, " ").trim();

export const parseFinanceCommand = (input, { categories = {}, accounts = [] } = {}) => {
  const raw = clean(input);
  if (!raw) return { ok: false, error: "Type a command to begin." };
  const amountMatch = raw.match(amountPattern);
  const amount = toAmount(amountMatch?.[1]);
  if (amount <= 0) return { ok: false, error: "Add an amount, like ₹250 or 250." };

  const lower = raw.toLowerCase();
  const isIncome = /\b(earned|received|income|salary|got paid|made)\b/i.test(lower);
  const isTransfer = /\b(transfer|moved|move)\b/i.test(lower);
  const type = isTransfer ? "transfer" : isIncome ? "income" : "expense";
  const list = type === "income" ? categories.income || [] : categories.expense || [];
  const categoryMatch = list.find(category => lower.includes(String(category.l).toLowerCase()));
  const accountMatch = accounts.find(account => lower.includes(String(account.name).toLowerCase()));
  const fromMatch = accounts.find(account => new RegExp(`from\\s+${String(account.name).replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}`, "i").test(raw));
  const toMatch = accounts.find(account => new RegExp(`to\\s+${String(account.name).replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}`, "i").test(raw));
  const cleanedNote = raw.replace(amountPattern, "").replace(/\b(please|add|log|record|spent|spend|expense|earned|received|income|salary|got paid|made|transfer|transferred|moved|move|from|to|on|for|in)\b/gi, " ").replace(/\s+/g, " ").trim();
  const category = categoryMatch?.l || (type === "transfer" ? "Transfer" : list[0]?.l || "Other");
  const icon = categoryMatch?.icon || (type === "income" ? "💰" : type === "transfer" ? "⇄" : "📦");
  const confidence = categoryMatch || accountMatch || fromMatch || toMatch ? "high" : "guided";

  return {
    ok: true,
    type,
    amount,
    category,
    icon,
    account: fromMatch?.name || accountMatch?.name || accounts[0]?.name || "",
    toAccount: toMatch?.name || (type === "transfer" ? accounts.find(account => account.name !== (fromMatch?.name || accountMatch?.name))?.name || "" : ""),
    note: cleanedNote || raw,
    confidence,
    raw,
  };
};
