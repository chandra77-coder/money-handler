export const sortByDateDesc = (arr) => [...arr].sort((a, b) => {
  const da = new Date(a.date + "T" + (a.time || "00:00"));
  const db = new Date(b.date + "T" + (b.time || "00:00"));
  return db - da || (b.createdAt || 0) - (a.createdAt || 0);
});

export const monthYearStr = () => new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });

export const getLast6Months = (transactions) => {
  const now = new Date();
  const res = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM in local time
    const label = d.toLocaleDateString("en-IN", { month: "short" });
    const inc = transactions.filter(t => t.type === "income" && (t.date || "").startsWith(key)).reduce((s, t) => s + toAmount(t.amount), 0);
    const exp = transactions.filter(t => t.type === "expense" && (t.date || "").startsWith(key)).reduce((s, t) => s + toAmount(t.amount), 0);
    res.push({ key, label, income: inc, expense: exp, isCurrentMonth: i === 0 });
  }
  return res;
};
export const avatarColor = (name) => {
  const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEEAD", "#D4A5A5", "#9B59B6", "#3498DB", "#E67E22"];
  const charCode = (name || "?").charCodeAt(0);
  return colors[charCode % colors.length];
};
export const genWorkCode = (existingCodes) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const len = 4;
  let code;
  do {
    code = "";
    for (let i = 0; i < len; i++) code += chars[Math.floor(Math.random() * chars.length)];
  } while (existingCodes.has(code));
  return code;
};

export const applySpendAmountChange = (currentTotal, oldAmount, newAmount) =>
  currentTotal - (newAmount - oldAmount);
export const smartSearch = (items, query, fields) => {
  if (!query) return items;
  const q = query.toLowerCase().trim();
  
  // Handle amount filters like >500 or <1000
  if (q.startsWith(">") || q.startsWith("<")) {
    const operator = q[0];
    const amount = parseFloat(q.slice(1));
    if (!isNaN(amount)) {
      return items.filter(item => operator === ">" ? item.amount > amount : item.amount < amount);
    }
  }

  return items.filter(item => 
    fields.some(field => (item[field] || "").toString().toLowerCase().includes(q))
  );
};

export const toAmount = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;

export const createId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const advanceRecurringDate = (dateStr, frequency = "monthly") => {
  const date = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  if (frequency === "weekly") {
    date.setDate(date.getDate() + 7);
  } else {
    const originalDay = date.getDate();
    const targetMonth = date.getMonth() + 1;
    const lastDay = new Date(date.getFullYear(), targetMonth + 1, 0).getDate();
    date.setMonth(targetMonth, Math.min(originalDay, lastDay));
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export const progressPercent = (current, target) => {
  const safeTarget = toAmount(target);
  if (safeTarget <= 0) return 0;
  return Math.min(100, Math.max(0, (toAmount(current) / safeTarget) * 100));
};
