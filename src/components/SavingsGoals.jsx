import React, { useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { THEMES, THEME_CONFIG } from "../constants/theme";
import { toAmount, progressPercent } from "../utils/dataHelpers";
import { FBtn, FInput, Label } from "./Shared";

const emptyGoal = () => ({ name: "", target: "", current: "", emoji: "🎯", deadline: "" });

export function SavingsGoals() {
  const { savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, contributeToSavingsGoal, theme } = useFinance();
  const T = (THEMES[theme] || THEMES.light).colors;
  const G = (THEMES[theme] || THEMES.light).gradient;
  const R = THEME_CONFIG.radius;
  const SH = THEME_CONFIG.shadow;
  const [form, setForm] = useState(emptyGoal);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [contributeId, setContributeId] = useState(null);
  const [contribution, setContribution] = useState("");

  const save = () => {
    if (!form.name.trim() || toAmount(form.target) <= 0) return;
    const payload = { ...form, name: form.name.trim(), target: toAmount(form.target), current: Math.min(toAmount(form.target), toAmount(form.current)), emoji: form.emoji || "🎯" };
    if (editingId) updateSavingsGoal(editingId, payload);
    else addSavingsGoal(payload);
    setForm(emptyGoal());
    setEditingId(null);
    setShowForm(false);
  };

  const openEdit = goal => { setForm({ ...goal, target: String(goal.target), current: String(goal.current || 0) }); setEditingId(goal.id); setShowForm(true); };
  const addContribution = id => {
    contributeToSavingsGoal(id, contribution);
    setContribution("");
    setContributeId(null);
  };

  return (
    <div style={{ background: T.bgSoft, borderRadius: R.lg, padding: 12, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.ink }}>Savings goals</div>
          <div style={{ fontSize: 11, color: T.inkSoft, marginTop: 2 }}>Turn plans into visible progress.</div>
        </div>
        <button onClick={() => { setForm(emptyGoal()); setEditingId(null); setShowForm(true); }} style={{ border: "none", borderRadius: R.pill, padding: "8px 12px", background: T.teal500, color: "white", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>+ Add</button>
      </div>

      {savingsGoals.length === 0 ? (
        <div style={{ background: T.card, borderRadius: R.md, padding: "18px 14px", textAlign: "center", color: T.inkSoft, fontSize: 12 }}>Create a goal for an emergency fund, trip, device, or anything important to you.</div>
      ) : savingsGoals.map(goal => {
        const target = toAmount(goal.target);
        const current = Math.min(target, toAmount(goal.current));
        const progress = progressPercent(current, target);
        const completed = progress >= 100;
        return (
          <div key={goal.id} style={{ background: T.card, borderRadius: R.md, padding: 12, marginBottom: 8, boxShadow: SH.soft }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: R.sm, background: completed ? T.incomeSoft : T.mintSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21 }}>{completed ? "✅" : goal.emoji || "🎯"}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{goal.name}</div>
                <div style={{ fontSize: 11, color: completed ? T.income : T.inkSoft }}>{completed ? "Goal completed" : `${Math.round(progress)}% complete`}{goal.deadline ? ` · by ${goal.deadline}` : ""}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.teal700 }}>₹{current.toLocaleString("en-IN")} <span style={{ color: T.inkSoft, fontWeight: 600 }}>/ ₹{target.toLocaleString("en-IN")}</span></div>
            </div>
            <div style={{ height: 8, background: T.line, borderRadius: R.pill, overflow: "hidden", margin: "12px 0 10px" }}><div style={{ height: "100%", width: `${progress}%`, background: completed ? G.income : G.primary, borderRadius: R.pill, transition: "width .35s ease" }} /></div>
            {contributeId === goal.id && (
              <div style={{ display: "flex", gap: 7, marginBottom: 9 }}>
                <FInput type="number" value={contribution} onChange={e => setContribution(e.target.value)} placeholder="₹ contribution" style={{ flex: 1 }} />
                <FBtn onClick={() => addContribution(goal.id)} style={{ padding: "8px 12px" }}>Add</FBtn>
              </div>
            )}
            <div style={{ display: "flex", gap: 7 }}>
              {!completed && <button onClick={() => { setContributeId(contributeId === goal.id ? null : goal.id); setContribution(""); }} style={{ flex: 1, border: `1px solid ${T.teal500}`, borderRadius: R.sm, padding: "7px 8px", background: T.mintSoft, color: T.teal700, fontSize: 11, fontWeight: 800, cursor: "pointer" }}>+ Contribute</button>}
              <button onClick={() => openEdit(goal)} style={{ flex: 1, border: `1px solid ${T.line}`, borderRadius: R.sm, padding: "7px 8px", background: T.bgSoft, color: T.inkSoft, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Edit</button>
              <button onClick={() => window.confirm("Delete this savings goal?") && deleteSavingsGoal(goal.id)} style={{ border: "none", borderRadius: R.sm, padding: "7px 10px", background: T.expenseSoft, color: T.expense, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Delete</button>
            </div>
          </div>
        );
      })}

      {showForm && (
        <div style={{ background: T.card, borderRadius: R.md, padding: 14, marginTop: 10, boxShadow: SH.card }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.ink, marginBottom: 12 }}>{editingId ? "Edit savings goal" : "New savings goal"}</div>
          <Label>GOAL NAME</Label>
          <FInput value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Emergency fund" style={{ marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}><Label>TARGET</Label><FInput type="number" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} placeholder="₹ 0" /></div>
            <div style={{ flex: 1 }}><Label>ALREADY SAVED</Label><FInput type="number" value={form.current} onChange={e => setForm({ ...form, current: e.target.value })} placeholder="₹ 0" /></div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <div style={{ flex: 1 }}><Label>EMOJI</Label><FInput value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value })} placeholder="🎯" /></div>
            <div style={{ flex: 2 }}><Label>DEADLINE (OPTIONAL)</Label><FInput type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} /></div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}><FBtn outline onClick={() => { setShowForm(false); setEditingId(null); }} style={{ flex: 1 }}>Cancel</FBtn><FBtn onClick={save} style={{ flex: 1 }}>{editingId ? "Update" : "Create Goal"}</FBtn></div>
        </div>
      )}
    </div>
  );
}
