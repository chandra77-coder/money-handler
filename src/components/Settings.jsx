import React, { useState, useEffect } from "react";
import { useFinance } from "../context/FinanceContext";
import { THEMES, THEME_CONFIG } from "../constants/theme";
import { Sheet, FBtn, FInput, ToggleSwitch } from "./Shared";
import { CategoryManager, TrashManager, UPIManager, AccountManager } from "./SettingsComponents";
import { compressImage } from "../utils/formatters";
import { PinScreen } from "./PinScreen";
import { RecurringTransactions } from "./RecurringTransactions";
import { SavingsGoals } from "./SavingsGoals";
import { BudgetManager } from "./BudgetManager";

export function Settings({ open, onClose }) {
  const { 
    profile, setProfile, theme, setTheme, pin, setPin, pinEnabled, setPinEnabled,
    notifyEnabled, setNotifyEnabled,
    openingBalance, setOpeningBalance, declaredAmount, setDeclaredAmount,
    goalAmount, setGoalAmount, manualCheck, setManualCheck, transactions
  } = useFinance();

  const [section, setSection] = useState(null);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const currentTheme = THEMES[theme] || THEMES.light;
  const T = currentTheme.colors;
  const G = currentTheme.gradient;
  const R = THEME_CONFIG.radius;
  const SH = THEME_CONFIG.shadow;

  const [nameTemp, setNameTemp] = useState(profile.name || "");
  const [editingProfile, setEditingProfile] = useState(false);

  useEffect(() => {
    if (!open) { setSection(null); setEditingProfile(false); setShowPinSetup(false); }
  }, [open]);

  const toggle = (key) => setSection(prev => prev === key ? null : key);

  const handleGenerateReport = async () => {
    const { generateTransactionReport } = await import("../utils/reportGenerator");
    generateTransactionReport(transactions);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImage(file, (compressed) => setProfile(p => ({ ...p, avatar: compressed })));
  };

  const menuRow = (icon, title, sub, key, onPress) => (
    <div onClick={() => onPress ? onPress() : key && toggle(key)}
      style={{ background: T.card, borderRadius: R.lg, padding: "10px 12px", marginBottom: 10,
        boxShadow: SH.card, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: T.bgSoft, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{title}</div>
        <div style={{ fontSize: 11, color: T.inkSoft, marginTop: 1 }}>{sub}</div>
      </div>
      {(key || onPress) && <div style={{ color: "#9FB3AD", fontSize: 16,
        transform: section === key ? "rotate(90deg)" : "none", transition: "transform .2s" }}>›</div>}
    </div>
  );

  const initials = (profile.name || "U").trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <>
    <Sheet open={open} onClose={onClose}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "4px 0 18px", borderBottom: `1px solid ${T.line}`, marginBottom: 16 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          {profile.avatar
            ? <img src={profile.avatar} alt="Avatar" style={{ width: 62, height: 62, borderRadius: "50%", objectFit: "cover", border: `2px solid ${T.mintSoft}` }} />
            : <div style={{ width: 62, height: 62, borderRadius: "50%", background: G.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 22, fontWeight: 800 }}>{initials}</div>
          }
          <label style={{ position: "absolute", bottom: 0, right: 0, width: 22, height: 22, borderRadius: "50%", background: T.teal500, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, cursor: "pointer", border: "2px solid white", color: "white" }}>
            📷 <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
          </label>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {editingProfile ? (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input value={nameTemp} onChange={e => setNameTemp(e.target.value)} placeholder="Your name" style={{ flex: 1, padding: "8px 10px", borderRadius: 10, border: `1.5px solid ${T.teal500}`, fontSize: 14, fontWeight: 600, outline: "none" }} />
              <button onClick={() => { setProfile(p => ({ ...p, name: nameTemp })); setEditingProfile(false); }} style={{ padding: "8px 12px", borderRadius: 10, background: T.income, color: "white", border: "none", fontWeight: 700 }}>Save</button>
            </div>
          ) : (
            <div onClick={() => { setNameTemp(profile.name || ""); setEditingProfile(true); }} style={{ cursor: "pointer" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.ink }}>{profile.name || "Set your name"}</div>
              <div style={{ fontSize: 11, color: T.inkSoft, marginTop: 2 }}>{profile.occupation || "Finance Enthusiast"} · Tap to edit</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ paddingBottom: 40 }}>
        {menuRow("🏦", "Manage Accounts", "Add or edit your accounts", "accounts")}
        {section === "accounts" && <AccountManager />}

        {menuRow("📂", "Categories", "Customize income & expense types", "categories")}
        {section === "categories" && <CategoryManager />}

        {menuRow("💳", "UPI Manager", "Manage your UPI IDs & QR codes", "upi")}
        {section === "upi" && <UPIManager />}

        {menuRow("🔁", "Recurring Transactions", "Automate regular income and expenses", "recurring")}
        {section === "recurring" && <RecurringTransactions />}

        {menuRow("🎯", "Savings Goals", "Track what you are building toward", "savings")}
        {section === "savings" && <SavingsGoals />}

        {menuRow("📊", "Smart Budgets", "Set category limits for this month", "budgets")}
        {section === "budgets" && <BudgetManager />}

        {menuRow("🔔", "Daily Reminder", notifyEnabled ? "Remind me to log today's activity" : "Reminders are off", "reminder")}
        {section === "reminder" && (
          <div style={{ padding: "10px", background: T.bgSoft, borderRadius: R.md, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Show dashboard reminder</span>
              <ToggleSwitch on={notifyEnabled} onChange={setNotifyEnabled} />
            </div>
          </div>
        )}

        {menuRow("🔒", "PIN Lock", pinEnabled ? "App is protected" : "Enable extra security", "pin")}
        {section === "pin" && (
          <div style={{ padding: "10px", background: T.bgSoft, borderRadius: R.md, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{pin ? "PIN Lock" : "Set a PIN first"}</span>
              <ToggleSwitch on={pinEnabled && !!pin} onChange={(enabled) => {
                if (enabled && !pin) setShowPinSetup(true);
                else setPinEnabled(enabled);
              }} />
            </div>
            <button onClick={() => setShowPinSetup(true)} style={{ width: "100%", padding: "9px 10px", borderRadius: R.sm, border: `1px solid ${T.line}`, background: T.card, color: T.teal500, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              {pin ? "Change PIN" : "Set PIN"}
            </button>
          </div>
        )}

        {menuRow("🌓", "Theme", `Currently: ${theme}`, "theme")}
        {section === "theme" && (
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {["future", "light", "dark", "system"].map(m => (
              <button key={m} onClick={() => setTheme(m)} style={{ flex: 1, padding: "10px", borderRadius: R.sm, border: `1.5px solid ${theme === m ? T.teal500 : T.line}`, background: theme === m ? T.mintSoft : T.card, color: theme === m ? T.teal700 : T.inkSoft, fontWeight: 700, fontSize: 12, textTransform: "capitalize" }}>{m}</button>
            ))}
          </div>
        )}

        {menuRow("🗑️", "Recently Deleted", "Restore items from trash", "trash")}
        {section === "trash" && <TrashManager />}

        {menuRow("📄", "Generate Report", "Export transactions as PDF", null, handleGenerateReport)}
      </div>
    </Sheet>
    {showPinSetup && <PinScreen mode="set" onSuccess={(newPin) => { setPin(newPin); setPinEnabled(true); setShowPinSetup(false); }} onCancel={() => setShowPinSetup(false)} />}
  </>
  );
}
