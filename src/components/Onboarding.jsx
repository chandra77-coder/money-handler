import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFinance } from "../context/FinanceContext";
import { THEMES, THEME_CONFIG } from "../constants/theme";
import { ACCOUNT_TYPES } from "../constants/seedData";
import { createId } from "../utils/dataHelpers";
import { FBtn, FInput, Label } from "./Shared";

export function Onboarding({ onComplete }) {
  const { theme, setProfile, setAccounts } = useFinance();
  const currentTheme = THEMES[theme] || THEMES.light;
  const T = currentTheme.colors;
  const G = currentTheme.gradient;
  const R = THEME_CONFIG.radius;
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState("Bank");
  const [error, setError] = useState("");

  const finish = () => {
    if (accountName.trim()) {
      const option = ACCOUNT_TYPES.find(item => item.type === accountType);
      setAccounts(prev => prev.length ? prev : [{ id: createId(), name: accountName.trim(), type: accountType, icon: option?.icon || "🏦", opening: 0 }]);
    }
    if (name.trim()) setProfile(prev => ({ ...prev, name: name.trim() }));
    onComplete();
  };

  const next = () => {
    if (step === 1 && !accountName.trim()) { setError("Add an account name or choose Skip for now."); return; }
    setError("");
    if (step >= 2) finish(); else setStep(current => current + 1);
  };

  return (
    <div style={{ minHeight: "100vh", background: G.header, color: "white", display: "flex", alignItems: "center", justifyContent: "center", padding: 22, fontFamily: THEME_CONFIG.font.body }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 34 }}>{[0, 1, 2].map(index => <div key={index} style={{ height: 4, flex: 1, borderRadius: R.pill, background: index <= step ? T.gold : "rgba(255,255,255,.22)", transition: "background .25s" }} />)}</div>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: .22 }}>
            {step === 0 && <>
              <div style={{ fontSize: 56, marginBottom: 18 }}>💸</div>
              <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1, fontFamily: THEME_CONFIG.font.money }}>MoneyMate</div>
              <div style={{ fontSize: 16, opacity: .72, lineHeight: 1.5, marginTop: 10, maxWidth: 320 }}>A calm, private place to understand your money and make progress toward what matters.</div>
              <div style={{ display: "grid", gap: 10, marginTop: 28 }}><div style={{ background: T.glass, border: `1px solid ${T.glassBorder}`, borderRadius: R.md, padding: 13 }}>⚡ Fast, local-first tracking</div><div style={{ background: T.glass, border: `1px solid ${T.glassBorder}`, borderRadius: R.md, padding: 13 }}>🎯 Goals, budgets, and insights</div><div style={{ background: T.glass, border: `1px solid ${T.glassBorder}`, borderRadius: R.md, padding: 13 }}>🔒 Your data stays on your device</div></div>
            </>}
            {step === 1 && <>
              <div style={{ fontSize: 42, marginBottom: 14 }}>👋</div><div style={{ fontSize: 26, fontWeight: 900, fontFamily: THEME_CONFIG.font.money }}>Make it yours</div><div style={{ fontSize: 14, opacity: .72, lineHeight: 1.5, margin: "8px 0 24px" }}>What should MoneyMate call you? You can change this later.</div><Label>YOUR NAME (OPTIONAL)</Label><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Alex" style={{ width: "100%", boxSizing: "border-box", padding: 14, borderRadius: R.md, border: `1px solid ${T.glassBorder}`, background: T.glassStrong, color: "white", outline: "none", fontSize: 16 }} />
            </>}
            {step === 2 && <>
              <div style={{ fontSize: 42, marginBottom: 14 }}>🏦</div><div style={{ fontSize: 26, fontWeight: 900, fontFamily: THEME_CONFIG.font.money }}>Start with an account</div><div style={{ fontSize: 14, opacity: .72, lineHeight: 1.5, margin: "8px 0 24px" }}>Add the account you use most. You can add cash, wallets, and banks later.</div><Label>ACCOUNT NAME</Label><input value={accountName} onChange={e => { setAccountName(e.target.value); setError(""); }} placeholder="e.g. Main Bank" style={{ width: "100%", boxSizing: "border-box", padding: 14, borderRadius: R.md, border: `1px solid ${T.glassBorder}`, background: T.glassStrong, color: "white", outline: "none", fontSize: 16, marginBottom: 14 }} /><Label>ACCOUNT TYPE</Label><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{ACCOUNT_TYPES.map(option => <button key={option.type} onClick={() => setAccountType(option.type)} style={{ border: `1px solid ${accountType === option.type ? T.gold : T.glassBorder}`, borderRadius: R.pill, padding: "9px 12px", background: accountType === option.type ? "rgba(232,199,126,.18)" : T.glass, color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{option.icon} {option.type}</button>)}</div>{error && <div style={{ color: "#FCA5A5", fontSize: 12, marginTop: 12 }}>{error}</div>}
            </>}
          </motion.div>
        </AnimatePresence>
        <div style={{ display: "flex", gap: 10, marginTop: 32 }}>
          {step > 0 && <FBtn outline color="rgba(255,255,255,.72)" onClick={() => setStep(current => current - 1)} style={{ flex: 1 }}>Back</FBtn>}
          {step === 2 && <button onClick={finish} style={{ flex: 1, padding: "13px 16px", borderRadius: R.md, border: "1px solid rgba(255,255,255,.24)", background: "transparent", color: "rgba(255,255,255,.72)", fontWeight: 700, cursor: "pointer" }}>Skip for now</button>}
          <FBtn onClick={next} style={{ flex: 1 }}>{step === 2 ? "Enter MoneyMate" : "Continue"}</FBtn>
        </div>
        {step === 0 && <button onClick={onComplete} style={{ width: "100%", marginTop: 14, border: "none", background: "transparent", color: "rgba(255,255,255,.55)", cursor: "pointer", fontSize: 12 }}>Skip onboarding</button>}
      </div>
    </div>
  );
}
