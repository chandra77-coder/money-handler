import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFinance } from "../context/FinanceContext";
import { THEMES, THEME_CONFIG } from "../constants/theme";
import { fmt, todayStr, fmtTime, compressImage } from "../utils/formatters";
import { sortByDateDesc, monthYearStr, smartSearch, toAmount } from "../utils/dataHelpers";
import { TransactionDetailSheet } from "./TransactionDetailSheet";
import { Sheet, TypeToggle, Label, FInput, ChipRow, FBtn, SearchBar, EmptyState } from "./Shared";
import { INCOME_METHODS, EXPENSE_METHODS } from "../constants/seedData";

const makeEmptyTx = () => ({type:"expense",category:"",icon:"📦",amount:"",note:"",date:todayStr(),account:"",toAccount:"",method:"",photo:null});

export function Transactions() {
  const { 
    transactions, addTransaction, updateTransaction, deleteTransaction,
    accounts, categories, theme
  } = useFinance();

  const [search, setSearch] = useState("");
  const [showSheet, setShowSheet] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(makeEmptyTx);
  const [selectedTx, setSelectedTx] = useState(null);
  const [viewPhoto, setViewPhoto] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [filterMonth, setFilterMonth] = useState("");

  const currentTheme = THEMES[theme] || THEMES.light;
  const T = currentTheme.colors;
  const G = currentTheme.gradient;
  const R = THEME_CONFIG.radius;
  const SH = THEME_CONFIG.shadow;

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImage(file, (compressed) => {
      setForm(f => ({ ...f, photo: compressed }));
    });
  };

  const openEdit = (tx) => {
    setEditId(tx.id);
    setForm({ ...tx, amount: String(tx.amount) });
    setShowSheet(true);
  };

  const handleListPhoto = (id, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImage(file, compressed => {
      const tx = transactions.find(t => t.id === id);
      if (tx) updateTransaction(id, { ...tx, photo: compressed });
    });
    e.target.value = "";
  };

  const save = () => {
    if (!form.amount || parseFloat(form.amount) <= 0) return;
    let entry;
    if (form.type === "transfer") {
      if (!form.account || !form.toAccount || form.account === form.toAccount) return;
      entry = {
        type: "transfer", category: "Transfer", icon: "⇄",
        amount: parseFloat(form.amount), note: form.note, date: form.date,
        account: form.account, toAccount: form.toAccount, method: "",
        photo: form.photo || null,
      };
    } else {
      if (!form.category || !form.account) return;
      const cat = [...(categories?.income || []), ...(categories?.expense || [])].find(c => c.l === form.category);
      entry = { ...form, icon: cat?.icon || "💰", amount: parseFloat(form.amount), toAccount: "", photo: form.photo || null };
    }

    if (editId) {
      updateTransaction(editId, entry);
    } else {
      addTransaction(entry);
    }

    setShowSheet(false);
    setEditId(null);
    setForm(makeEmptyTx());
  };

  const handleSearch = (e) => {
    const v = e.target.value;
    setSearch(v);
    if (v.trim().toLowerCase() === "create") {
      setTimeout(() => { setSearch(""); setForm(makeEmptyTx()); setShowSheet(true); }, 200);
    }
  };

  const yesterdayStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  };

  const baseFiltered = sortByDateDesc(transactions).filter(t => {
    if (filterType !== "all" && t.type !== filterType) return false;
    if (filterMonth && !(t.date || "").startsWith(filterMonth)) return false;
    return true;
  });

  const filtered = smartSearch(baseFiltered, search, ["category", "note", "account", "toAccount"]);

  const grouped = filtered.reduce((acc, t) => {
    const lbl = t.date === todayStr() ? "Today" : t.date === yesterdayStr() ? "Yesterday" : t.date;
    (acc[lbl] || (acc[lbl] = [])).push(t);
    return acc;
  }, {});

  const monthOptions = (() => {
    const opts = [{ value: "", label: "All Months" }];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
      const lbl = d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
      opts.push({ value: val, label: lbl });
    }
    return opts;
  })();

  const accountNames = accounts.map(a => a.name);
  const methods = form.type === "income" ? INCOME_METHODS : EXPENSE_METHODS;
  const today = todayStr();
  const todayInc = transactions.filter(t => t.type === "income" && t.date === today).reduce((s, t) => s + toAmount(t.amount), 0);
  const todayExp = transactions.filter(t => t.type === "expense" && t.date === today).reduce((s, t) => s + toAmount(t.amount), 0);
  const txColor = t => t.type === "income" ? T.income : t.type === "transfer" ? "#9F8AE8" : T.expense;
  const txBg = t => t.type === "income" ? T.incomeSoft : t.type === "transfer" ? T.transferSoft : T.expenseSoft;
  const txPrefix = t => t.type === "income" ? "+" : t.type === "transfer" ? "⇄" : "−";

  return (
    <div>
      <div style={{ background: G.header, padding: "22px 16px 18px", color: "white", borderRadius: `0 0 ${R.xl}px ${R.xl}px`, boxShadow: SH.card }}>
        <div style={{ fontSize: 11, opacity: .6, letterSpacing: 1.5, fontWeight: 600 }}>{monthYearStr()}</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, fontFamily: THEME_CONFIG.font.money }}>Transactions</div>
        <SearchBar value={search} onChange={handleSearch} placeholder='Search or type "create"…' />
      </div>

      <div style={{ padding: "10px 12px" }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1, background: T.card, borderRadius: R.md, padding: "12px", boxShadow: SH.card, borderTop: `3px solid ${T.income}` }}>
            <div style={{ fontSize: 10, color: T.inkSoft, marginBottom: 3, fontWeight: 600 }}>TODAY IN</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: T.income, fontFamily: THEME_CONFIG.font.money }}>{fmt(todayInc)}</div>
          </div>
          <div style={{ flex: 1, background: T.card, borderRadius: R.md, padding: "12px", boxShadow: SH.card, borderTop: `3px solid ${T.expense}` }}>
            <div style={{ fontSize: 10, color: T.inkSoft, marginBottom: 3, fontWeight: 600 }}>TODAY OUT</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: T.expense, fontFamily: THEME_CONFIG.font.money }}>{fmt(todayExp)}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 10, overflowX: "auto", paddingBottom: 2 }}>
          {[["all", "All"], ["income", "↑ In"], ["expense", "↓ Out"], ["transfer", "⇄"]].map(([v, lbl]) => (
            <button key={v} onClick={() => setFilterType(v)} style={{
              flexShrink: 0, padding: "7px 12px", borderRadius: R.pill,
              border: `1.5px solid ${filterType === v ? T.teal500 : T.line}`,
              background: filterType === v ? T.mintSoft : T.card,
              color: filterType === v ? T.teal700 : T.inkSoft,
              fontSize: 12, fontWeight: 700, cursor: "pointer"
            }}>{lbl}</button>
          ))}
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{
            flexShrink: 0, padding: "7px 10px", borderRadius: R.pill,
            border: `1.5px solid ${filterMonth ? T.teal500 : T.line}`,
            background: filterMonth ? T.mintSoft : T.card,
            color: filterMonth ? T.teal700 : T.inkSoft,
            fontSize: 12, fontWeight: 700, cursor: "pointer", outline: "none"
          }}>
            {monthOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {Object.keys(grouped).length === 0 && (
          <EmptyState icon={search || filterType !== "all" || filterMonth ? "🔍" : "🧾"} title={search || filterType !== "all" || filterMonth ? "No matching transactions" : "Your ledger is ready"} description={search || filterType !== "all" || filterMonth ? "Try a different search or filter." : "Add your first income, expense, or transfer to see your money story here."} actionLabel={search || filterType !== "all" || filterMonth ? undefined : "Add transaction"} onAction={search || filterType !== "all" || filterMonth ? undefined : () => { setForm(makeEmptyTx()); setShowSheet(true); }} />
        )}
        {Object.entries(grouped).map(([lbl, txns]) => (
          <div key={lbl} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: T.inkSoft, fontWeight: 700, letterSpacing: .6, marginBottom: 8 }}>{lbl.toUpperCase()}</div>
            <div style={{ background: T.card, borderRadius: R.lg, padding: "4px 14px", boxShadow: SH.card }}>
              {txns.map((t, i) => (
                <motion.div key={t.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.035, duration: 0.26, ease: [0.22, 1, 0.36, 1] }} whileTap={{ scale: 0.985 }} onClick={() => setSelectedTx(t)} className="smooth-card" style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "13px 0",
                  borderBottom: i < txns.length - 1 ? `1px solid ${T.line}` : "none", cursor: "pointer"
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: R.sm, background: txBg(t),
                    display: "flex", alignItems: "center", justifyCenter: "center", fontSize: 20, flexShrink: 0
                  }}>{t.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {t.type === "transfer" ? `${t.account} → ${t.toAccount}` : t.category}
                      </div>
                      {t.recurringId && <span style={{ fontSize: 9, background: T.mintSoft, color: T.teal700, borderRadius: R.pill, padding: "2px 6px", fontWeight: 700, flexShrink: 0 }}>🔁</span>}
                    </div>
                    <div style={{ fontSize: 11, color: T.inkSoft }}>
                      {t.type === "transfer" ? "Transfer" : `${t.account}${t.method ? " · " + t.method : ""}`}
                      {fmtTime(t.createdAt) ? ` · ${fmtTime(t.createdAt)}` : ""}
                    </div>
                    {t.note && t.type !== "transfer" && <div style={{ fontSize: 11, color: "#A8B8B3" }}>{t.note}</div>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: txColor(t), fontFamily: THEME_CONFIG.font.money }}>
                      {txPrefix(t)}{fmt(t.amount)}
                    </div>
                    <div style={{ display: "flex", gap: 5 }}>
                      {t.photo && <button onClick={e => { e.stopPropagation(); setViewPhoto(t.photo); }} aria-label="View transaction photo" style={{ width: 28, height: 26, padding: 0, border: `1px solid ${T.teal500}`, borderRadius: 7, background: T.mintSoft, color: T.teal700, fontSize: 13, cursor: "pointer" }}>👁️</button>}
                      <label onClick={e => e.stopPropagation()} aria-label={t.photo ? "Replace transaction photo" : "Add transaction photo"} style={{ width: 28, height: 26, padding: 0, border: `1px solid ${T.line}`, borderRadius: 7, background: T.bgSoft, color: T.teal500, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        📷
                        <input type="file" accept="image/*" onChange={e => handleListPhoto(t.id, e)} style={{ display: "none" }} />
                      </label>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => { setForm(makeEmptyTx()); setShowSheet(true); }}
        onMouseDown={e => e.currentTarget.style.transform = "scale(0.93)"}
        onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
        style={{
          position: "fixed", bottom: 90, right: "max(16px, calc(50% - 210px + 16px))",
          width: 58, height: 58, borderRadius: R.pill, background: G.gold,
          color: T.teal900, fontSize: 28, border: "none", cursor: "pointer", fontWeight: 700,
          boxShadow: "0 8px 22px rgba(232,199,126,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform .12s ease"
        }}>+</button>

      <Sheet open={showSheet} onClose={() => setShowSheet(false)}>
        <div style={{ fontSize: 17, fontWeight: 800, color: T.ink, marginBottom: 14, fontFamily: THEME_CONFIG.font.money }}>{editId ? "Edit Transaction" : "Add Transaction"}</div>
        <TypeToggle
          options={[["expense", "↓ Expense"], ["income", "↑ Income"], ["transfer", "⇄ Transfer"]]}
          value={form.type} onChange={v => setForm({ ...makeEmptyTx(), type: v })}
          colors={{ expense: G.expense, income: G.income, transfer: G.transfer }} />

        <Label>AMOUNT</Label>
        <FInput value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
          placeholder="₹ 0" type="number" style={{ fontSize: 19, fontWeight: 700, marginBottom: 12, fontFamily: THEME_CONFIG.font.money }} />

        {form.type === "transfer" ? (<>
          <Label>FROM ACCOUNT</Label>
          {accountNames.length === 0
            ? <div style={{ fontSize: 12, color: "#946A1F", marginBottom: 12, padding: "10px 12px", background: T.goldSoft, borderRadius: R.sm }}>
              ⚠️ No accounts. Add accounts in Settings first.
            </div>
            : <ChipRow items={accountNames} selected={form.account}
              onSelect={v => setForm({ ...form, account: v, toAccount: form.toAccount === v ? "" : form.toAccount })}
              activeColor="#7C66D9" activeBg={T.transferSoft} />
          }
          <div style={{ textAlign: "center", fontSize: 20, marginBottom: 10, color: "#9F8AE8" }}>⬇</div>
          <Label>TO ACCOUNT</Label>
          <ChipRow items={accountNames.filter(a => a !== form.account)} selected={form.toAccount}
            onSelect={v => setForm({ ...form, toAccount: v })}
            activeColor="#7C66D9" activeBg={T.transferSoft} />
        </>) : (<>
          <Label>CATEGORY</Label>
          <ChipRow items={categories?.[form.type] || []} selected={form.category}
            onSelect={v => {
              const cat = (categories?.[form.type] || []).find(c => c.l === v);
              setForm({ ...form, category: v, icon: cat?.icon || "💰" });
            }} />
          <Label>{form.type === "income" ? "RECEIVED IN" : "PAID FROM"}</Label>
          {accountNames.length === 0
            ? <div style={{ fontSize: 12, color: "#946A1F", marginBottom: 12, padding: "10px 12px", background: T.goldSoft, borderRadius: R.sm }}>
              ⚠️ No accounts. Add accounts in Settings first.
            </div>
            : <ChipRow items={accountNames} selected={form.account} onSelect={v => setForm({ ...form, account: v })} />
          }
          <Label>HOW</Label>
          <ChipRow items={methods} selected={form.method} onSelect={v => setForm({ ...form, method: v })} />
        </>)}

        <Label>NOTE (OPTIONAL)</Label>
        <FInput value={form.note} onChange={e => setForm({ ...form, note: e.target.value })}
          placeholder="Add a note…" style={{ marginBottom: 10 }} />

        <Label>PHOTO (OPTIONAL)</Label>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <label style={{ flex: 1, padding: "10px 8px", borderRadius: R.sm, border: `1.5px solid ${T.line}`, background: T.bgSoft, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, fontWeight: 700, color: T.teal500, cursor: "pointer" }}>
              📷 Camera
              <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: "none" }} />
            </label>
            <label style={{ flex: 1, padding: "10px 8px", borderRadius: R.sm, border: `1.5px solid ${T.line}`, background: T.bgSoft, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, fontWeight: 700, color: T.teal500, cursor: "pointer" }}>
              🖼️ Gallery
              <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
            </label>
          </div>
          {form.photo && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <img src={form.photo} alt="Preview" style={{ width: 48, height: 48, borderRadius: R.sm, objectFit: "cover", border: `1px solid ${T.teal500}` }} />
                <button onClick={() => setForm({ ...form, photo: null })} style={{ position: "absolute", top: -6, right: -6, background: T.expense, color: "white", border: "none", borderRadius: "50%", width: 18, height: 18, fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              </div>
              <div style={{ fontSize: 12, color: T.inkSoft }}>Photo attached. Use buttons above to replace.</div>
            </div>
          )}
        </div>

        <Label>DATE</Label>
        <FInput value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
          type="date" style={{ marginBottom: 16 }} />
        <FBtn onClick={save} style={{ width: "100%", padding: "15px" }}>{editId ? "Update Transaction" : "Save Transaction"}</FBtn>
      </Sheet>

      <TransactionDetailSheet tx={selectedTx} onClose={() => setSelectedTx(null)} onDelete={deleteTransaction} onEdit={openEdit} />

      <AnimatePresence>
        {viewPhoto && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} onClick={() => setViewPhoto(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <motion.img initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 26 }} src={viewPhoto} alt="Transaction photo" style={{ maxWidth: "100%", maxHeight: "85%", objectFit: "contain", borderRadius: R.lg, boxShadow: "0 0 30px rgba(0,0,0,0.5)" }} />
            <button onClick={() => setViewPhoto(null)} aria-label="Close photo" style={{ position: "absolute", top: 30, right: 20, background: "white", border: "none", borderRadius: "50%", width: 40, height: 40, fontSize: 20, fontWeight: 700, cursor: "pointer" }}>✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
