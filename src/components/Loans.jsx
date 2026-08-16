import React, { useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { THEMES, THEME_CONFIG } from "../constants/theme";
import { fmt, todayStr } from "../utils/formatters";
import { monthYearStr, avatarColor } from "../utils/dataHelpers";
import { Sheet, TypeToggle, Label, FInput, FBtn, SearchBar } from "./Shared";

const makeEmptyLoan = () => ({ type: "took", name: "", amount: "", reason: "", date: todayStr(), dueDate: "", status: "pending", payments: [] });

export function Loans() {
  const { 
    loans, setLoans, addLoan, updateLoan, deleteLoan, profile 
  } = useFinance();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showSheet, setShowSheet] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(makeEmptyLoan);
  const [delId, setDelId] = useState(null);
  const [payLoanId, setPayLoanId] = useState(null);
  const [payAmount, setPayAmount] = useState("");

  const theme = profile.theme || "system";
  const currentTheme = THEMES[theme] || THEMES.light;
  const T = currentTheme.colors;
  const G = currentTheme.gradient;
  const R = THEME_CONFIG.radius;
  const SH = THEME_CONFIG.shadow;

  const handleSearch = (e) => {
    const v = e.target.value;
    setSearch(v);
    if (v.trim().toLowerCase() === "create") {
      setTimeout(() => { setSearch(""); setForm(makeEmptyLoan()); setShowSheet(true); }, 200);
    }
  };

  const totalTook = loans.filter(l => l.type === "took" && l.status === "pending").reduce((s, l) => s + l.amount, 0);
  const totalGave = loans.filter(l => l.type === "gave" && l.status === "pending").reduce((s, l) => s + l.amount, 0);
  const net = totalGave - totalTook;

  const visible = loans
    .filter(l => filter === "all" || l.type === filter)
    .filter(l => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (l.name || "").toLowerCase().includes(q) || (l.reason || "").toLowerCase().includes(q);
    });

  const openAdd = () => { setForm(makeEmptyLoan()); setEditId(null); setShowSheet(true); };
  const openEdit = (l) => { setForm({ ...l, amount: String(l.amount) }); setEditId(l.id); setShowSheet(true); };

  const save = () => {
    if (!form.name || !form.amount || parseFloat(form.amount) <= 0) return;
    const entry = { ...form, amount: parseFloat(form.amount), payments: form.payments || [] };
    if (editId) updateLoan(editId, entry);
    else addLoan(entry);
    setShowSheet(false); setEditId(null);
  };

  const addPayment = (loanId) => {
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) return;
    setLoans(prev => prev.map(l => {
      if (l.id !== loanId) return l;
      const payments = [...(l.payments || []), { id: Date.now(), amount: amt, date: todayStr() }];
      const paid = payments.reduce((s, p) => s + p.amount, 0);
      const status = paid >= l.amount ? "returned" : "pending";
      return { ...l, payments, status };
    }));
    setPayAmount("");
    setPayLoanId(null);
  };

  const toggleStatus = (id) =>
    setLoans(prev => prev.map(l => l.id === id ? { ...l, status: l.status === "pending" ? "returned" : "pending" } : l));

  return (
    <div>
      <div style={{ background: G.header, padding: "22px 16px 18px", color: "white", borderRadius: `0 0 ${R.xl}px ${R.xl}px`, boxShadow: SH.card }}>
        <div style={{ fontSize: 11, opacity: .6, letterSpacing: 1.5, fontWeight: 600 }}>{monthYearStr()}</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 14, fontFamily: THEME_CONFIG.font.money }}>Loans</div>
        <div style={{ background: T.glassStrong, borderRadius: R.lg, padding: "15px 18px", border: `1px solid ${T.glassBorder}`, marginBottom: 14, backdropFilter: "blur(12px)" }}>
          <div style={{ fontSize: 11, opacity: .65, marginBottom: 4, fontWeight: 600 }}>NET POSITION</div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5, color: net >= 0 ? T.mint : "#FCA5A5", fontFamily: THEME_CONFIG.font.money }}>
            {net >= 0 ? "+" : ""}{fmt(Math.abs(net))}
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
            <div>
              <div style={{ fontSize: 11, opacity: .6 }}>🔴 I OWE</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#FCA5A5" }}>{fmt(totalTook)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, opacity: .6 }}>🟢 THEY OWE</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.mint }}>{fmt(totalGave)}</div>
            </div>
          </div>
        </div>
        <SearchBar value={search} onChange={handleSearch} placeholder='Search or type "create"…' />
      </div>

      <div style={{ padding: "10px 12px" }}>
        <div style={{ display: "flex", background: T.card, borderRadius: R.md, padding: 4, marginBottom: 14, boxShadow: SH.card, gap: 4 }}>
          {[["all", "All"], ["took", "🔴 I Took"], ["gave", "🟢 I Gave"]].map(([v, lbl]) => (
            <button key={v} onClick={() => setFilter(v)} style={{
              flex: 1, padding: "11px 4px", border: "none",
              borderRadius: R.sm, cursor: "pointer", fontWeight: 700, fontSize: 12, fontFamily: THEME_CONFIG.font.body,
              background: filter === v ? G.primary : "transparent",
              boxShadow: filter === v ? SH.soft : "none",
              color: filter === v ? "white" : T.inkSoft
            }}>{lbl}</button>
          ))}
        </div>

        {visible.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#9FB3AD" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{search ? "No results" : "No loans here"}</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Tap + or type "create" to add one</div>
          </div>
        )}

        {visible.map(loan => {
          const payments = loan.payments || [];
          const paidAmt = payments.reduce((s, p) => s + p.amount, 0);
          const remaining = Math.max(0, loan.amount - paidAmt);
          const paidPct = Math.min(100, loan.amount > 0 ? (paidAmt / loan.amount) * 100 : 0);
          const isOverdue = loan.dueDate && loan.dueDate < todayStr() && loan.status === "pending";
          return (
            <div key={loan.id} style={{
              background: T.card, borderRadius: R.lg, padding: "10px 12px", marginBottom: 12,
              boxShadow: SH.card,
              borderLeft: `4px solid ${isOverdue ? "#E53E3E" : loan.type === "took" ? T.expense : T.income}`,
              opacity: loan.status === "returned" ? .65 : 1
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
                  background: avatarColor(loan.name), display: "flex", alignItems: "center",
                  justifyContent: "center", color: "white", fontWeight: 800, fontSize: 18,
                  boxShadow: "0 3px 8px rgba(0,0,0,0.18)"
                }}>
                  {(loan.name || "?")[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>{loan.name}</div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: R.pill,
                      background: loan.status === "returned" ? T.incomeSoft : isOverdue ? T.expenseSoft : T.goldSoft,
                      color: loan.status === "returned" ? "#1E8E5A" : isOverdue ? T.expense : "#946A1F"
                    }}>
                      {loan.status === "returned" ? "✓ Settled" : isOverdue ? "⚠️ Overdue" : "Pending"}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 2 }}>{loan.reason || "—"}</div>
                  <div style={{ fontSize: 11, color: "#A8B8B3", marginTop: 1 }}>
                    {loan.date}{loan.dueDate ? ` · Due: ${loan.dueDate}` : ""}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: loan.type === "took" ? T.expense : T.income, fontFamily: THEME_CONFIG.font.money }}>
                    {loan.type === "took" ? "−" : "+"}{fmt(loan.amount)}
                  </div>
                  {paidAmt > 0 && <div style={{ fontSize: 11, color: T.inkSoft, marginTop: 1 }}>Paid: {fmt(paidAmt)}</div>}
                </div>
              </div>

              {paidAmt > 0 && loan.status !== "returned" && (
                <div style={{ margin: "10px 0 4px" }}>
                  <div style={{ height: 5, borderRadius: R.pill, background: T.bgSoft, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${paidPct}%`, background: T.income, borderRadius: R.pill, transition: "width .3s" }} />
                  </div>
                  <div style={{ fontSize: 10, color: T.inkSoft, marginTop: 3 }}>
                    {fmt(paidAmt)} paid · {fmt(remaining)} remaining
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 8, marginTop: 12, paddingTop: 10, borderTop: `1px solid ${T.line}`, flexWrap: "wrap" }}>
                <button onClick={() => toggleStatus(loan.id)} style={{
                  flex: 1, minWidth: 80, padding: "9px 0", borderRadius: R.sm,
                  border: "1.5px solid", cursor: "pointer", fontFamily: THEME_CONFIG.font.body, fontWeight: 700, fontSize: 11,
                  borderColor: loan.status === "returned" ? T.line : T.income,
                  background: loan.status === "returned" ? T.bgSoft : T.incomeSoft,
                  color: loan.status === "returned" ? T.inkSoft : "#1E8E5A"
                }}>
                  {loan.status === "returned" ? "↩ Pending" : "✓ Settle"}
                </button>
                {loan.status !== "returned" && (
                  <button onClick={() => { setPayLoanId(loan.id); setPayAmount(""); }} style={{
                    flex: 1, minWidth: 80, padding: "9px 0", borderRadius: R.sm,
                    border: `1.5px solid ${T.teal500}`, background: T.mintSoft, color: T.teal700,
                    fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: THEME_CONFIG.font.body
                  }}>
                    💰 Pay Part
                  </button>
                )}
                <button onClick={() => openEdit(loan)} style={{
                  padding: "9px 12px", borderRadius: R.sm,
                  border: `1.5px solid ${T.line}`, background: "#F0F6FF", color: T.teal500,
                  fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: THEME_CONFIG.font.body
                }}>✏️</button>
                <button onClick={() => setDelId(loan.id)} style={{
                  padding: "9px 12px", borderRadius: R.sm,
                  border: "1.5px solid #FBD5D5", background: T.expenseSoft, color: T.expense,
                  fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: THEME_CONFIG.font.body
                }}>🗑</button>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={openAdd}
        onMouseDown={e => e.currentTarget.style.transform = "scale(0.93)"}
        onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
        style={{
          position: "fixed", bottom: 90, right: "max(16px, calc(50% - 210px + 16px))",
          width: 58, height: 58, borderRadius: R.pill, background: G.gold,
          color: T.teal900, fontSize: 28, border: "none", cursor: "pointer", fontWeight: 700,
          boxShadow: "0 8px 22px rgba(232,199,126,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform .12s ease"
        }}>+</button>

      {delId && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(10,26,24,0.55)", zIndex: 400,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(2px)"
        }}>
          <div style={{ background: T.card, borderRadius: R.xl, padding: "28px 24px", width: "100%", maxWidth: 320, textAlign: "center", boxShadow: SH.raised }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🗑️</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: T.ink }}>Delete this loan?</div>
            <div style={{ fontSize: 13, color: T.inkSoft, marginBottom: 22 }}>This cannot be undone.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <FBtn onClick={() => setDelId(null)} outline color={T.inkSoft} style={{ flex: 1 }}>Cancel</FBtn>
              <FBtn onClick={() => { deleteLoan(delId); setDelId(null); }} bg={G.expense} style={{ flex: 1 }}>Delete</FBtn>
            </div>
          </div>
        </div>
      )}

      {payLoanId && (() => {
        const loan = loans.find(l => l.id === payLoanId);
        if (!loan) return null;
        const paid = (loan.payments || []).reduce((s, p) => s + p.amount, 0);
        const remaining = loan.amount - paid;
        return (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(10,26,24,0.55)", zIndex: 400,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(2px)"
          }}>
            <div style={{ background: T.card, borderRadius: R.xl, padding: "24px", width: "100%", maxWidth: 340, boxShadow: SH.raised }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.ink, marginBottom: 4 }}>💰 Record Payment</div>
              <div style={{ fontSize: 12, color: T.inkSoft, marginBottom: 14 }}>
                {loan.name} · Remaining: {fmt(Math.max(0, remaining))}
              </div>
              <FInput value={payAmount} onChange={e => setPayAmount(e.target.value)}
                placeholder="₹ amount paid" type="number"
                style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, fontFamily: THEME_CONFIG.font.money }} />
              <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                {[remaining * 0.25, remaining * 0.5, remaining].map((v, i) => (
                  <button key={i} onClick={() => setPayAmount(String(Math.round(v)))} style={{
                    flex: 1, padding: "8px 4px", borderRadius: R.sm, border: `1px solid ${T.line}`,
                    background: T.bgSoft, color: T.teal700, fontSize: 11, fontWeight: 700, cursor: "pointer"
                  }}>{["25%", "50%", "Full"][i]}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <FBtn onClick={() => { setPayLoanId(null); setPayAmount(""); }} outline color={T.inkSoft} style={{ flex: 1 }}>Cancel</FBtn>
                <FBtn onClick={() => addPayment(payLoanId)} style={{ flex: 1 }}>Save</FBtn>
              </div>
            </div>
          </div>
        );
      })()}

      <Sheet open={showSheet} onClose={() => setShowSheet(false)}>
        <div style={{ fontSize: 17, fontWeight: 800, color: T.ink, marginBottom: 14, fontFamily: THEME_CONFIG.font.money }}>{editId ? "Edit Loan" : "Add Loan"}</div>
        <TypeToggle options={[["took", "🔴 I Took"], ["gave", "🟢 I Gave"]]} value={form.type}
          onChange={v => { if (!editId) setForm({ ...makeEmptyLoan(), type: v }); else setForm({ ...form, type: v }); }} colors={{ took: G.expense, gave: G.income }} />
        <Label>PERSON'S NAME</Label>
        <FInput value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Rahul Sharma" style={{ marginBottom: 10 }} />
        <Label>AMOUNT</Label>
        <FInput value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
          placeholder="₹ 0" type="number" style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, fontFamily: THEME_CONFIG.font.money }} />
        <Label>REASON (OPTIONAL)</Label>
        <FInput value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
          placeholder="e.g. Medical, Travel…" style={{ marginBottom: 10 }} />
        <Label>DATE</Label>
        <FInput value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} type="date" style={{ marginBottom: 10 }} />
        <Label>DUE DATE (OPTIONAL)</Label>
        <FInput value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} type="date" style={{ marginBottom: 16 }} />
        <FBtn onClick={save} style={{ width: "100%", padding: "15px" }}>{editId ? "Update Loan" : "Confirm Loan"}</FBtn>
      </Sheet>
    </div>
  );
}
