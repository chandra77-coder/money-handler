import React, { useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { THEMES, THEME_CONFIG } from "../constants/theme";

export function PinScreen({ mode = "verify", onSuccess, onCancel }) {
  const { pin: savedPin, theme } = useFinance();
  const currentTheme = THEMES[theme] || THEMES.light;
  const T = currentTheme.colors;
  const G = currentTheme.gradient;

  const [digits, setDigits] = useState("");
  const [err, setErr] = useState("");
  const [step, setStep] = useState("enter");
  const [first, setFirst] = useState("");

  const tap = (d) => {
    if (digits.length >= 4) return;
    const next = digits + d;
    setDigits(next);
    setErr("");
    if (next.length === 4) {
      setTimeout(() => {
        if (mode === "verify") {
          if (next === savedPin) onSuccess();
          else { setErr("Wrong PIN. Try again."); setDigits(""); }
        } else {
          if (step === "enter") { setFirst(next); setStep("confirm"); setDigits(""); }
          else {
            if (next === first) onSuccess(next);
            else { setErr("PINs don't match. Try again."); setDigits(""); setStep("enter"); setFirst(""); }
          }
        }
      }, 120);
    }
  };

  const del = () => { setDigits(d => d.slice(0, -1)); setErr(""); };

  const title = mode === "verify" ? "Enter PIN" : step === "enter" ? "Set New PIN" : "Confirm PIN";
  const sub = mode === "verify" ? "Enter your 4-digit PIN to continue" : step === "enter" ? "Choose a 4-digit PIN" : "Re-enter your PIN to confirm";

  return (
    <div style={{ position: "fixed", inset: 0, background: G.header, zIndex: 999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white", fontFamily: THEME_CONFIG.font.body }}>
      <div style={{ width: 64, height: 64, borderRadius: 20, background: T.glass, border: `1px solid ${T.glassBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, marginBottom: 18 }}>🔒</div>
      <div style={{ fontSize: 19, fontWeight: 700, marginBottom: 6, fontFamily: THEME_CONFIG.font.money }}>{title}</div>
      <div style={{ fontSize: 13, opacity: .65, marginBottom: 32, textAlign: "center", padding: "0 40px" }}>{sub}</div>
      <div style={{ display: "flex", gap: 14, marginBottom: 4 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: i < digits.length ? T.gold : "rgba(255,255,255,0.25)", boxShadow: i < digits.length ? `0 0 10px ${T.gold}` : "none", transition: "background .15s, box-shadow .15s" }} />
        ))}
      </div>
      <div style={{ height: 24, display: "flex", alignItems: "center", marginBottom: 8 }}>
        {err && <div style={{ fontSize: 12, color: T.expense }}>{err}</div>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,72px)", gap: 16 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"].map((k, i) => (
          k === "" ? <div key={i} /> :
            <button key={i} onClick={() => k === "⌫" ? del() : tap(String(k))} style={{ width: 72, height: 72, borderRadius: "50%", border: `1px solid ${T.glassBorder}`, cursor: "pointer", fontFamily: THEME_CONFIG.font.body, background: k === "⌫" ? "rgba(255,255,255,0.08)" : T.glass, color: "white", fontSize: k === "⌫" ? 20 : 24, fontWeight: 700, backdropFilter: "blur(6px)" }}>{k}</button>
        ))}
      </div>
      {onCancel && (
        <button onClick={onCancel} style={{ marginTop: 28, background: "none", border: "none", color: "rgba(255,255,255,0.55)", fontSize: 14, cursor: "pointer", fontFamily: THEME_CONFIG.font.body }}>Cancel</button>
      )}
    </div>
  );
}
