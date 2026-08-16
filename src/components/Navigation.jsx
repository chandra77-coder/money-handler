import React from "react";
import { useFinance } from "../context/FinanceContext";
import { THEMES, THEME_CONFIG } from "../constants/theme";

export function Navigation() {
  const { activeTab, setActiveTab, theme } = useFinance();
  const T = (THEMES[theme] || THEMES.light).colors;
  const SH = THEME_CONFIG.shadow;

  const tabs = [
    { id: "dashboard", icon: "🏠", label: "Home" },
    { id: "transactions", icon: "📋", label: "Trans" },
    { id: "loans", icon: "🤝", label: "Loans" },
    { id: "work", icon: "💼", label: "Work" },
  ];

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, height: 72,
      background: T.card, borderTop: `1px solid ${T.line}`,
      display: "flex", justifyContent: "space-around", alignItems: "center",
      boxShadow: SH.nav, zIndex: 200, paddingBottom: "env(safe-area-inset-bottom)"
    }}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            background: "none", border: "none", display: "flex", flexDirection: "column",
            alignItems: "center", gap: 4, cursor: "pointer", padding: "8px 12px",
            color: isActive ? T.teal500 : T.inkSoft, transition: "all 0.2s"
          }}>
            <span style={{ fontSize: 22, opacity: isActive ? 1 : 0.6 }}>{tab.icon}</span>
            <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500 }}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
