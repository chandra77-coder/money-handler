import { toAmount } from "./dataHelpers.js";
import { todayStr } from "./formatters.js";

const monthKey = date => String(date).slice(0, 7);
const shiftMonth = (base, offset) => {
  const [year, month] = base.split("-").map(Number);
  const date = new Date(year, month - 1 + offset, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

export const buildForecast = ({ transactions = [], currentBalance = 0, recurring = [], horizon = 6 }) => {
  const currentMonth = monthKey(todayStr());
  const historyKeys = [0, -1, -2].map(offset => shiftMonth(currentMonth, offset));
  const historical = historyKeys.map(key => transactions.filter(tx => monthKey(tx.date) === key).reduce((sum, tx) => {
    if (tx.type === "income") return sum + toAmount(tx.amount);
    if (tx.type === "expense") return sum - toAmount(tx.amount);
    return sum;
  }, 0));
  const observedMonths = historical.filter(value => value !== 0).length;
  const historicalAverage = historical.reduce((sum, value) => sum + value, 0) / Math.max(historyKeys.length, 1);
  const recurringMonthly = recurring.filter(rule => rule.active !== false).reduce((sum, rule) => {
    const amount = toAmount(rule.amount) * (rule.frequency === "weekly" ? 4.345 : 1);
    return sum + (rule.type === "income" ? amount : -amount);
  }, 0);
  const monthlyNet = historicalAverage + recurringMonthly;
  const points = [{ label: "Now", value: toAmount(currentBalance), projected: false }];
  for (let month = 1; month <= horizon; month += 1) {
    points.push({ label: shiftMonth(currentMonth, month).slice(5), value: toAmount(currentBalance) + monthlyNet * month, projected: true });
  }
  return {
    points,
    monthlyNet,
    historicalAverage,
    recurringMonthly,
    confidence: observedMonths >= 2 ? "High confidence" : observedMonths === 1 ? "Early signal" : "Rule-based estimate",
    horizon,
  };
};
