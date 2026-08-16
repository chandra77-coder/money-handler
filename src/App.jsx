import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FinanceProvider, useFinance } from "./context/FinanceContext";
import { GlobalStyles } from "./styles/GlobalStyles";
import { Navigation } from "./components/Navigation";
import { Dashboard } from "./components/Dashboard";
import { Transactions } from "./components/Transactions";
import { Loans } from "./components/Loans";
import { Work } from "./components/Work";
import { Settings } from "./components/Settings";
import { PinScreen } from "./components/PinScreen";

function AppContent() {
  const { activeTab, pinEnabled, pin, theme } = useFinance();
  const [isLocked, setIsLocked] = useState(pinEnabled && !!pin);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setIsLocked(pinEnabled && !!pin);
  }, [pinEnabled, pin]);

  if (isLocked) {
    return <PinScreen mode="verify" onSuccess={() => setIsLocked(false)} />;
  }

  return (
    <div style={{ paddingBottom: 80, minHeight: "100vh" }}>
      <GlobalStyles themeMode={theme} />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "dashboard" && <Dashboard onOpenSettings={() => setShowSettings(true)} />}
          {activeTab === "transactions" && <Transactions />}
          {activeTab === "loans" && <Loans />}
          {activeTab === "work" && <Work />}
        </motion.div>
      </AnimatePresence>
      
      <Settings open={showSettings} onClose={() => setShowSettings(false)} />
      <Navigation />
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}
