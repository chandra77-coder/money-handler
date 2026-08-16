import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useFinance } from "../context/FinanceContext";
import { THEMES, THEME_CONFIG } from "../constants/theme";
import { todayStr } from "../utils/formatters";
import { parseFinanceCommand } from "../utils/commandParser";
import { CelebrationBurst } from "./CelebrationBurst";

export function CommandBar() {
  const { addTransaction, accounts, categories, theme } = useFinance();
  const T = (THEMES[theme] || THEMES.light).colors;
  const G = (THEMES[theme] || THEMES.light).gradient;
  const R = THEME_CONFIG.radius;
  const [command, setCommand] = useState("");
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [successPulse, setSuccessPulse] = useState(false);

  const parse = value => {
    setCommand(value);
    setMessage("");
    if (value.trim().length > 4) setPreview(parseFinanceCommand(value, { categories, accounts }));
    else setPreview(null);
  };

  const submit = event => {
    event.preventDefault();
    const parsed = parseFinanceCommand(command, { categories, accounts });
    setPreview(parsed);
    if (!parsed.ok) return;
    if (!parsed.account) { setMessage("Add an account first, then the command can route this transaction."); return; }
    if (parsed.type === "transfer" && !parsed.toAccount) { setMessage("For a transfer, include a destination account, like ‘from Bank to Cash’."); return; }
    addTransaction({ type: parsed.type, category: parsed.category, icon: parsed.icon, amount: parsed.amount, note: parsed.note, date: todayStr(), account: parsed.account, toAccount: parsed.toAccount, method: parsed.type === "income" ? "Online / UPI" : "UPI / Online", photo: null });
    setCommand("");
    setPreview(null);
    setSuccessPulse(true);
    window.setTimeout(() => setSuccessPulse(false), 850);
    setMessage("Transaction synced to your ledger.");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="cyber-scanline" style={{ position: "relative", background: T.glassStrong, border: `1px solid ${T.glassBorder}`, borderRadius: R.xl, padding: 12, marginBottom: 14, boxShadow: T.cyberGlow || THEME_CONFIG.shadow.card, backdropFilter: "blur(16px)" }}>
      <CelebrationBurst show={successPulse} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><span style={{ color: T.teal500, fontSize: 16 }}>⌁</span><div><div style={{ color: T.ink, fontSize: 12, fontWeight: 900, letterSpacing: .2 }}>Neural command</div><div style={{ color: T.inkSoft, fontSize: 10 }}>Describe a transaction in plain language</div></div><div style={{ marginLeft: "auto", color: T.teal500, fontSize: 9, fontWeight: 900, letterSpacing: 1 }}>LOCAL PARSER</div></div>
      <form onSubmit={submit} style={{ display: "flex", gap: 8 }}>
        <input aria-label="Natural language transaction command" value={command} onChange={event => parse(event.target.value)} placeholder="Try: spent ₹250 on Food" style={{ flex: 1, minWidth: 0, padding: "12px 13px", borderRadius: R.md, border: `1px solid ${T.glassBorder}`, background: T.bgSoft, color: T.ink, outline: "none", fontSize: 13, fontFamily: THEME_CONFIG.font.body }} />
        <motion.button type="submit" whileTap={{ scale: .92 }} style={{ border: "none", borderRadius: R.md, padding: "0 14px", background: G.primary, color: "white", fontWeight: 900, cursor: "pointer", boxShadow: T.cyberGlow || THEME_CONFIG.shadow.button }}>↗</motion.button>
      </form>
      <AnimatePresence mode="wait">
        {preview?.ok && <motion.div key="preview" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center", marginTop: 9 }}><span style={{ fontSize: 10, color: T.inkSoft }}>Detected</span><span style={{ padding: "5px 8px", borderRadius: R.pill, background: preview.type === "income" ? T.incomeSoft : preview.type === "expense" ? T.expenseSoft : T.transferSoft, color: preview.type === "income" ? T.income : preview.type === "expense" ? T.expense : T.transfer, fontSize: 10, fontWeight: 800 }}>{preview.icon} {preview.type}</span><span style={{ padding: "5px 8px", borderRadius: R.pill, background: T.bgSoft, color: T.ink, fontSize: 10, fontWeight: 800 }}>₹{preview.amount.toLocaleString("en-IN")} · {preview.category}</span><span style={{ fontSize: 10, color: T.inkSoft }}>{preview.confidence}</span></motion.div>}
        {preview && !preview.ok && <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: T.expense, fontSize: 11, marginTop: 8 }}>{preview.error}</motion.div>}
      </AnimatePresence>
      {message && <div role="status" style={{ color: T.income, fontSize: 11, marginTop: 8 }}>✓ {message}</div>}
    </motion.div>
  );
}
