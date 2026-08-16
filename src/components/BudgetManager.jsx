import React, { useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { THEMES, THEME_CONFIG } from "../constants/theme";
import { toAmount } from "../utils/dataHelpers";
import { FBtn, FInput, Label } from "./Shared";

const emptyBudget = () => ({ category: "", limit: "" });

export function BudgetManager() {
  const { budgets, budgetSnapshot, addBudget, updateBudget, deleteBudget, categories, theme } = useFinance();
  const T = (THEMES[theme] || THEMES.light).colors;
  const R = THEME_CONFIG.radius;
  const SH = THEME_CONFIG.shadow;
  const [form, setForm] = useState(emptyBudget);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const openEdit = budget => { setForm({ category: budget.category, limit: String(budget.limit) }); setEditingId(budget.id); setShowForm(true); };
  const save = () => {
    if (!form.category || toAmount(form.limit) <= 0) return;
    if (editingId) updateBudget(editingId, form);
    else addBudget(form);
    setForm(emptyBudget());
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div style={{ background: T.bgSoft, borderRadius: R.lg, padding: 12, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div><div style={{ fontSize: 14, fontWeight: 800, color: T.ink }}>Smart budgets</div><div style={{ fontSize: 11, color: T.inkSoft, marginTop: 2 }}>Set monthly limits and know before you overspend.</div></div>
        <button onClick={() => { setForm(emptyBudget()); setEditingId(null); setShowForm(true); }} style={{ border: "none", borderRadius: R.pill, padding: "8px 12px", background: T.teal500, color: "white", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>+ Add</button>
      </div>
      {budgets.length === 0 ? <div style={{ background: T.card, borderRadius: R.md, padding: "18px 14px", textAlign: "center", color: T.inkSoft, fontSize: 12 }}>Create a Food, Travel, Bills, or custom category budget to stay in control.</div> : budgetSnapshot.map(budget => {
        const percent = Math.min(100, Math.max(0, budget.percent));
        const over = budget.spent > toAmount(budget.limit);
        const near = percent >= 80;
        const color = over ? T.expense : near ? T.gold : T.teal500;
        return <div key={budget.id} style={{ background: T.card, borderRadius: R.md, padding: 12, marginBottom: 8, boxShadow: SH.soft }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 7 }}><span style={{ fontSize: 13, fontWeight: 800, color: T.ink }}>💰 {budget.category}</span><span style={{ fontSize: 12, fontWeight: 800, color }}>{over ? `₹${toAmount(budget.spent - budget.limit).toLocaleString("en-IN")} over` : `₹${toAmount(budget.remaining).toLocaleString("en-IN")} left`}</span></div>
          <div style={{ height: 8, background: T.line, borderRadius: R.pill, overflow: "hidden" }}><div style={{ width: `${percent}%`, height: "100%", background: color, borderRadius: R.pill, transition: "width .35s ease" }} /></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: T.inkSoft }}><span>{Math.round(budget.percent)}% used this month</span><span>₹{toAmount(budget.spent).toLocaleString("en-IN")} / ₹{toAmount(budget.limit).toLocaleString("en-IN")}</span></div>
          <div style={{ display: "flex", gap: 7, marginTop: 9 }}><button onClick={() => openEdit(budget)} style={{ flex: 1, border: `1px solid ${T.line}`, borderRadius: R.sm, padding: "7px", background: T.bgSoft, color: T.inkSoft, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Edit</button><button onClick={() => window.confirm("Delete this budget?") && deleteBudget(budget.id)} style={{ border: "none", borderRadius: R.sm, padding: "7px 10px", background: T.expenseSoft, color: T.expense, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Delete</button></div>
        </div>;
      })}
      {showForm && <div style={{ background: T.card, borderRadius: R.md, padding: 14, marginTop: 10, boxShadow: SH.card }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: T.ink, marginBottom: 12 }}>{editingId ? "Edit budget" : "New monthly budget"}</div>
        <Label>CATEGORY</Label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 12 }}>{(categories.expense || []).map(category => <button key={category.l} onClick={() => setForm({ ...form, category: category.l })} style={{ border: `1px solid ${form.category === category.l ? T.teal500 : T.line}`, borderRadius: R.pill, padding: "7px 10px", background: form.category === category.l ? T.mintSoft : T.bgSoft, color: form.category === category.l ? T.teal700 : T.inkSoft, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{category.icon} {category.l}</button>)}</div>
        <Label>MONTHLY LIMIT</Label><FInput type="number" value={form.limit} onChange={e => setForm({ ...form, limit: e.target.value })} placeholder="₹ 0" style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }} />
        <div style={{ display: "flex", gap: 8 }}><FBtn outline onClick={() => { setShowForm(false); setEditingId(null); }} style={{ flex: 1 }}>Cancel</FBtn><FBtn onClick={save} style={{ flex: 1 }}>{editingId ? "Update" : "Save Budget"}</FBtn></div>
      </div>}
    </div>
  );
}
