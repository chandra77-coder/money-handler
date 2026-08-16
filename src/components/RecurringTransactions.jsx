import React, { useMemo, useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { THEMES, THEME_CONFIG } from "../constants/theme";
import { todayStr } from "../utils/formatters";
import { toAmount } from "../utils/dataHelpers";
import { FBtn, FInput, Label, TypeToggle } from "./Shared";

const emptyRule = () => ({
  type: "expense", category: "", icon: "📦", amount: "", note: "", account: "",
  frequency: "monthly", nextDue: todayStr(), active: true,
});

export function RecurringTransactions() {
  const { recurring, addRecurring, updateRecurring, deleteRecurring, toggleRecurring, accounts, categories, theme } = useFinance();
  const T = (THEMES[theme] || THEMES.light).colors;
  const G = (THEMES[theme] || THEMES.light).gradient;
  const R = THEME_CONFIG.radius;
  const SH = THEME_CONFIG.shadow;
  const [form, setForm] = useState(emptyRule);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const categoryOptions = useMemo(() => categories?.[form.type] || [], [categories, form.type]);
  const openAdd = () => { setForm(emptyRule()); setEditingId(null); setShowForm(true); };
  const openEdit = (rule) => { setForm({ ...rule, amount: String(rule.amount), nextDue: rule.nextDue || todayStr() }); setEditingId(rule.id); setShowForm(true); };
  const save = () => {
    const amount = toAmount(form.amount);
    if (amount <= 0 || !form.category || !form.account || !form.nextDue) return;
    const selected = categoryOptions.find(item => item.l === form.category);
    const payload = { ...form, amount, icon: selected?.icon || form.icon || "📦", frequency: form.frequency === "weekly" ? "weekly" : "monthly" };
    if (editingId) updateRecurring(editingId, payload);
    else addRecurring(payload);
    setShowForm(false);
    setEditingId(null);
    setForm(emptyRule());
  };

  return (
    <div style={{ background: T.bgSoft, borderRadius: R.lg, padding: 12, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.ink }}>Recurring transactions</div>
          <div style={{ fontSize: 11, color: T.inkSoft, marginTop: 2 }}>Automatically add scheduled income and expenses.</div>
        </div>
        <button onClick={openAdd} style={{ border: "none", borderRadius: R.pill, padding: "8px 12px", background: T.teal500, color: "white", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>+ Add</button>
      </div>

      {recurring.length === 0 ? (
        <div style={{ background: T.card, borderRadius: R.md, padding: "18px 14px", textAlign: "center", color: T.inkSoft, fontSize: 12 }}>No recurring rules yet. Add rent, subscriptions, salary, or regular bills.</div>
      ) : recurring.map(rule => (
        <div key={rule.id} style={{ background: T.card, borderRadius: R.md, padding: "12px", marginBottom: 8, boxShadow: SH.soft, opacity: rule.active === false ? 0.58 : 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: R.sm, background: rule.type === "income" ? T.incomeSoft : T.expenseSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19 }}>{rule.icon || "🔁"}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rule.category || "Recurring transaction"}</div>
              <div style={{ fontSize: 10, color: T.inkSoft }}>{rule.frequency === "weekly" ? "Weekly" : "Monthly"} · next {rule.nextDue || "today"}{rule.account ? ` · ${rule.account}` : ""}</div>
            </div>
            <div style={{ color: rule.type === "income" ? T.income : T.expense, fontWeight: 800, fontSize: 14 }}>{rule.type === "income" ? "+" : "−"}₹{toAmount(rule.amount).toLocaleString("en-IN")}</div>
          </div>
          <div style={{ display: "flex", gap: 7, marginTop: 10 }}>
            <button onClick={() => toggleRecurring(rule.id)} style={{ flex: 1, border: `1px solid ${T.line}`, borderRadius: R.sm, padding: "7px 8px", background: T.bgSoft, color: T.inkSoft, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{rule.active === false ? "▶ Resume" : "Ⅱ Pause"}</button>
            <button onClick={() => openEdit(rule)} style={{ flex: 1, border: `1px solid ${T.line}`, borderRadius: R.sm, padding: "7px 8px", background: T.bgSoft, color: T.teal500, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Edit</button>
            <button onClick={() => window.confirm("Delete this recurring transaction rule?") && deleteRecurring(rule.id)} style={{ border: "none", borderRadius: R.sm, padding: "7px 10px", background: T.expenseSoft, color: T.expense, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Delete</button>
          </div>
        </div>
      ))}

      {showForm && (
        <div style={{ background: T.card, borderRadius: R.md, padding: 14, marginTop: 10, boxShadow: SH.card }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.ink, marginBottom: 12 }}>{editingId ? "Edit recurring rule" : "New recurring rule"}</div>
          <TypeToggle options={[["expense", "↓ Expense"], ["income", "↑ Income"]]} value={form.type} onChange={type => setForm({ ...emptyRule(), ...form, type, category: "", icon: type === "income" ? "💰" : "📦" })} colors={{ expense: G.expense, income: G.income }} />
          <Label>AMOUNT</Label>
          <FInput type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="₹ 0" style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }} />
          <Label>CATEGORY</Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 12 }}>
            {categoryOptions.map(item => <button key={item.l} onClick={() => setForm({ ...form, category: item.l, icon: item.icon })} style={{ border: `1px solid ${form.category === item.l ? T.teal500 : T.line}`, borderRadius: R.pill, padding: "7px 10px", background: form.category === item.l ? T.mintSoft : T.bgSoft, color: form.category === item.l ? T.teal700 : T.inkSoft, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{item.icon} {item.l}</button>)}
          </div>
          <Label>ACCOUNT</Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 12 }}>
            {accounts.map(account => <button key={account.id} onClick={() => setForm({ ...form, account: account.name })} style={{ border: `1px solid ${form.account === account.name ? T.teal500 : T.line}`, borderRadius: R.pill, padding: "7px 10px", background: form.account === account.name ? T.mintSoft : T.bgSoft, color: form.account === account.name ? T.teal700 : T.inkSoft, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{account.icon} {account.name}</button>)}
          </div>
          <Label>FREQUENCY</Label>
          <div style={{ display: "flex", gap: 7, marginBottom: 12 }}>
            {["weekly", "monthly"].map(frequency => <button key={frequency} onClick={() => setForm({ ...form, frequency })} style={{ flex: 1, border: `1px solid ${form.frequency === frequency ? T.teal500 : T.line}`, borderRadius: R.sm, padding: "8px", background: form.frequency === frequency ? T.mintSoft : T.bgSoft, color: form.frequency === frequency ? T.teal700 : T.inkSoft, fontSize: 12, fontWeight: 800, cursor: "pointer", textTransform: "capitalize" }}>{frequency}</button>)}
          </div>
          <Label>NEXT RUN DATE</Label>
          <FInput type="date" value={form.nextDue} onChange={e => setForm({ ...form, nextDue: e.target.value })} style={{ marginBottom: 10 }} />
          <Label>NOTE (OPTIONAL)</Label>
          <FInput value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="e.g. Netflix, rent, salary" style={{ marginBottom: 12 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <FBtn outline onClick={() => { setShowForm(false); setEditingId(null); }} style={{ flex: 1 }}>Cancel</FBtn>
            <FBtn onClick={save} style={{ flex: 1 }}>{editingId ? "Update" : "Save Rule"}</FBtn>
          </div>
        </div>
      )}
    </div>
  );
}
