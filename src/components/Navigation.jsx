import React from "react";
import { motion } from "framer-motion";
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
          <motion.button key={tab.id} onClick={() => setActiveTab(tab.id)}
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 420, damping: 26 }}
            style={{
              position: "relative", background: "none", border: "none", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 4, cursor: "pointer", padding: "8px 12px",
              color: isActive ? T.teal500 : T.inkSoft
            }}>
            {isActive && <motion.span layoutId="active-nav-pill" transition={{ type: "spring", stiffness: 420, damping: 32 }} style={{ position: "absolute", top: 1, left: 7, right: 7, height: 3, borderRadius: 999, background: T.teal500 }} />}
            <motion.span animate={{ y: isActive ? -1 : 0, scale: isActive ? 1.08 : 1, opacity: isActive ? 1 : 0.6 }} transition={{ type: "spring", stiffness: 420, damping: 26 }} style={{ fontSize: 22 }}>{tab.icon}</motion.span>
            <motion.span animate={{ opacity: isActive ? 1 : 0.72 }} transition={{ duration: 0.16 }} style={{ fontSize: 10, fontWeight: isActive ? 700 : 500 }}>{tab.label}</motion.span>
          </motion.button>
        );
      })}
    </div>
  );
}
