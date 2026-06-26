import { useState, useEffect } from "react";

// ============ HELPERS ============
const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const todayStr = () => new Date().toISOString().slice(0, 10);
const yesterdayStr = () => new Date(Date.now() - 86400000).toISOString().slice(0, 10);
const avatarColor = (name) => {
  const colors = ["#4F7CAC", "#E07B54", "#5BA858", "#9B59B6", "#E74C3C", "#1ABC9C", "#E67E22"];
  return colors[name.charCodeAt(0) % 7];
};

// ============ USELOCALSTORAGE HOOK ============
function useLS(key, defaultVal) {
  const [state, setState] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultVal;
    } catch {
      return defaultVal;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [state, key]);

  return [state, setState];
}

// ============ SEED DATA ============
const SEED_ACCOUNTS = [
  { id: 1, name: "Cash", type: "Cash", icon: "💵", opening: 8500 },
  { id: 2, name: "SBI Bank", type: "Bank", icon: "🏦", opening: 42000 },
  { id: 3, name: "PhonePe", type: "Wallet", icon: "📱", opening: 1200 },
];

const SEED_TX = [
  { id: 1, type: "income", category: "Salary", icon: "💼", amount: 18000, note: "June salary", date: "2026-06-24", account: "SBI Bank", toAccount: "", method: "Bank Transfer" },
  { id: 2, type: "expense", category: "Food", icon: "🍛", amount: 450, note: "Lunch & dinner", date: "2026-06-24", account: "Cash", toAccount: "", method: "Cash" },
  { id: 3, type: "expense", category: "Travel", icon: "🚌", amount: 120, note: "Bus fare", date: "2026-06-23", account: "Cash", toAccount: "", method: "Cash" },
  { id: 4, type: "income", category: "Freelance", icon: "💻", amount: 3500, note: "Web project", date: "2026-06-22", account: "PhonePe", toAccount: "", method: "Online / UPI" },
  { id: 5, type: "expense", category: "Bills", icon: "📄", amount: 800, note: "Electricity", date: "2026-06-21", account: "SBI Bank", toAccount: "", method: "Online / UPI" },
  { id: 6, type: "transfer", category: "Transfer", icon: "⇄", amount: 3000, note: "Moving to bank", date: "2026-06-20", account: "Cash", toAccount: "SBI Bank", method: "" },
];

const SEED_LOANS = [
  { id: 1, type: "took", name: "Rahul Sharma", amount: 5000, reason: "Medical emergency", date: "2026-06-10", status: "pending" },
  { id: 2, type: "took", name: "Suresh Das", amount: 2000, reason: "Travel", date: "2026-06-15", status: "pending" },
  { id: 3, type: "gave", name: "Amit Roy", amount: 3000, reason: "Business help", date: "2026-06-12", status: "pending" },
  { id: 4, type: "gave", name: "Priya Sen", amount: 1500, reason: "Personal", date: "2026-06-05", status: "returned" },
];

// ============ CONSTANTS ============
const TX_CATS = {
  income: [
    { l: "Salary", icon: "💼" },
    { l: "Freelance", icon: "💻" },
    { l: "Business", icon: "🏪" },
    { l: "Gift", icon: "🎁" },
    { l: "Other", icon: "💰" },
  ],
  expense: [
    { l: "Food", icon: "🍛" },
    { l: "Travel", icon: "🚌" },
    { l: "Bills", icon: "📄" },
    { l: "Shopping", icon: "🛍️" },
    { l: "Health", icon: "💊" },
    { l: "Other", icon: "📦" },
  ],
};

const INCOME_METHODS = ["Cash", "Online / UPI", "Bank Transfer", "Cheque"];
const EXPENSE_METHODS = ["Cash", "UPI / Online", "Card", "Bank Transfer"];
const ACCOUNT_TYPES = [
  { type: "Cash", icon: "💵" },
  { type: "Bank", icon: "🏦" },
  { type: "Wallet", icon: "📱" },
  { type: "Other", icon: "💰" },
];

const COLORS = {
  primaryDark: "#1E3A5F",
  primaryMid: "#2D6A9F",
  income: "#1DB954",
  expense: "#E53E3E",
  transfer: "#7B5EA7",
  background: "#F0F4F8",
  card: "white",
};

// ============ SHARED COMPONENTS ============

function Sheet({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 300,
          cursor: "pointer",
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "420px",
          maxWidth: "100%",
          backgroundColor: "white",
          borderRadius: "24px 24px 0 0",
          padding: "20px 18px 48px",
          maxHeight: "92vh",
          overflowY: "auto",
          zIndex: 301,
          cursor: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ width: "40px", height: "4px", backgroundColor: "#DDD", borderRadius: "2px", margin: "0 auto 18px" }} />
        {title && <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px", color: "#1E3A5F" }}>{title}</h2>}
        {children}
      </div>
    </>
  );
}

function FInput({ value, onChange, placeholder, type = "text", style = {} }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "12px 14px",
        borderRadius: "12px",
        border: "1.5px solid #E8EDF3",
        outline: "none",
        fontFamily: "inherit",
        fontSize: "14px",
        boxSizing: "border-box",
        ...style,
      }}
    />
  );
}

function FBtn({ children, onClick, outline = false, bg = null, color = "#1E3A5F", style = {} }) {
  const defaultBg = "linear-gradient(135deg,#2D6A9F,#1E3A5F)";
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "inherit",
        fontWeight: 700,
        fontSize: "14px",
        borderRadius: "12px",
        cursor: "pointer",
        border: outline ? `1.5px solid white` : "none",
        backgroundColor: outline ? "transparent" : bg || defaultBg,
        color: outline ? "white" : color,
        padding: "12px 16px",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function SearchBar({ value, onChange, onClear }) {
  return (
    <div style={{ position: "relative", margin: "0 16px 12px" }}>
      <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "16px" }}>🔍</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search..."
        style={{
          width: "100%",
          padding: "11px 36px",
          borderRadius: "14px",
          border: "1.5px solid #E8EDF3",
          fontSize: "13px",
          backgroundColor: "white",
          boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
          boxSizing: "border-box",
          outline: "none",
        }}
      />
      {value && (
        <span
          onClick={onClear}
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          ✕
        </span>
      )}
    </div>
  );
}

function TypeToggle({ value, onChange, options, colors = {} }) {
  return (
    <div style={{ display: "flex", backgroundColor: "#F0F4F8", borderRadius: "12px", padding: "3px", gap: "3px", marginBottom: "14px" }}>
      {options.map(([val, label]) => (
        <button
          key={val}
          onClick={() => onChange(val)}
          style={{
            flex: 1,
            borderRadius: "10px",
            padding: "10px 4px",
            fontWeight: 700,
            fontSize: "12px",
            border: "none",
            cursor: "pointer",
            backgroundColor: value === val ? (colors[val] || "#2D6A9F") : "transparent",
            color: value === val ? "white" : "#999",
            fontFamily: "inherit",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Label({ children }) {
  return <div style={{ fontSize: "11px", color: "#999", fontWeight: 700, letterSpacing: "0.5px", marginBottom: "6px" }}>{children}</div>;
}

function ChipRow({ items, activeValue, onSelect, activeColor = "#1E3A5F", activeBg = "#EEF4FB" }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
      {items.map((item, idx) => {
        const isString = typeof item === "string";
        const key = isString ? item : item.l;
        const label = isString ? item : item.l;
        const icon = !isString && item.icon ? item.icon : null;
        const isActive = activeValue === key;

        return (
          <button
            key={idx}
            onClick={() => onSelect(key)}
            style={{
              padding: "7px 12px",
              borderRadius: "20px",
              border: `1.5px solid ${isActive ? activeColor : "#E8EDF3"}`,
              backgroundColor: isActive ? activeBg : "white",
              color: isActive ? activeColor : "#888",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "12px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {icon && <span>{icon}</span>}
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ============ PIN SCREEN ============
function PinScreen({ mode, savedPin, onSuccess, onCancel }) {
  const [digits, setDigits] = useState("");
  const [step, setStep] = useState(mode === "verify" ? "enter" : "enter");
  const [first, setFirst] = useState("");
  const [err, setErr] = useState("");

  const tap = (d) => {
    if (digits.length >= 4) return;
    const newDigits = digits + d;
    setDigits(newDigits);

    if (newDigits.length === 4) {
      setTimeout(() => {
        if (mode === "verify") {
          if (newDigits === savedPin) {
            onSuccess();
          } else {
            setErr("Incorrect PIN");
            setDigits("");
          }
        } else {
          if (step === "enter") {
            setFirst(newDigits);
            setStep("confirm");
            setDigits("");
          } else {
            if (newDigits === first) {
              onSuccess(newDigits);
            } else {
              setErr("PINs don't match");
              setDigits("");
              setStep("enter");
              setFirst("");
            }
          }
        }
      }, 120);
    }
  };

  const del = () => {
    setDigits(digits.slice(0, -1));
    setErr("");
  };

  const keypad = [1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(135deg, #1E3A5F, #2D6A9F)",
        zIndex: 999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
      }}
    >
      <div style={{ fontSize: "44px", marginBottom: "16px" }}>🔒</div>
      <div style={{ fontSize: "20px", fontWeight: 800, marginBottom: "8px" }}>
        {mode === "verify" ? "Unlock" : step === "enter" ? "Set PIN" : "Confirm PIN"}
      </div>
      <div style={{ fontSize: "13px", opacity: 0.7, padding: "0 40px", textAlign: "center", marginBottom: "32px" }}>
        {mode === "verify" ? "Enter your PIN" : step === "enter" ? "Enter a 4-digit PIN" : "Confirm your PIN"}
      </div>

      <div style={{ display: "flex", gap: "14px", marginBottom: "32px", justifyContent: "center" }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              backgroundColor: i < digits.length ? "white" : "rgba(255,255,255,0.3)",
              transition: "background 0.15s",
            }}
          />
        ))}
      </div>

      <div style={{ height: "24px", fontSize: "12px", color: "#FF9E9E", textAlign: "center", marginBottom: "16px" }}>
        {err}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 72px)", gap: "14px", marginBottom: "28px" }}>
        {keypad.map((key, idx) => {
          if (key === "") return <div key={idx} />;
          if (key === "⌫") {
            return (
              <button
                key={idx}
                onClick={del}
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  border: "none",
                  color: "white",
                  fontSize: "20px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                ⌫
              </button>
            );
          }
          return (
            <button
              key={idx}
              onClick={() => tap(String(key))}
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.15)",
                border: "none",
                color: "white",
                fontSize: "24px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {key}
            </button>
          );
        })}
      </div>

      {onCancel && (
        <button
          onClick={onCancel}
          style={{
            marginTop: "28px",
            padding: "12px 24px",
            backgroundColor: "rgba(255,255,255,0.2)",
            border: "1px solid white",
            color: "white",
            borderRadius: "12px",
            cursor: "pointer",
            fontFamily: "inherit",
            fontWeight: 700,
          }}
        >
          Cancel
        </button>
      )}
    </div>
  );
}

// ============ UTILITY FUNCTIONS ============
function calcAccountBalances(accounts, transactions) {
  return accounts.map((acc) => {
    let balance = acc.opening;
    transactions.forEach((tx) => {
      if (tx.type === "income" && tx.account === acc.name) balance += tx.amount;
      if (tx.type === "expense" && tx.account === acc.name) balance -= tx.amount;
      if (tx.type === "transfer" && tx.account === acc.name) balance -= tx.amount;
      if (tx.type === "transfer" && tx.toAccount === acc.name) balance += tx.amount;
    });
    return { ...acc, balance };
  });
}

// ============ DASHBOARD TAB ============
function Dashboard({ transactions, loans, accounts, openingBalance, declaredAmount, manualCheck }) {
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const accountBalances = calcAccountBalances(accounts, transactions);
  const totalTracked = accountBalances.reduce((s, a) => s + a.balance, 0) + openingBalance;
  const pendingGave = loans.filter((l) => l.type === "gave" && l.status === "pending").reduce((s, l) => s + l.amount, 0);
  const pendingTook = loans.filter((l) => l.type === "took" && l.status === "pending").reduce((s, l) => s + l.amount, 0);
  const declaredDiff = declaredAmount - totalTracked;
  const manualDiff = manualCheck - totalTracked;
  const recent = transactions.slice(0, 4);

  return (
    <div style={{ paddingBottom: "80px" }}>
      <div
        style={{
          background: "linear-gradient(135deg,#1E3A5F,#2D6A9F)",
          padding: "28px 20px 72px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div style={{ fontSize: "11px", opacity: 0.65, letterSpacing: "1px" }}>JUNE 2026</div>
          <div style={{ fontSize: "22px", fontWeight: 800 }}>My Finance</div>
        </div>
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
          }}
        >
          👤
        </div>
      </div>

      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.13)",
          borderRadius: "20px",
          padding: "18px 20px",
          border: "1px solid rgba(255,255,255,0.18)",
          margin: "-36px 16px 14px",
          color: "white",
        }}
      >
        <div style={{ fontSize: "12px", opacity: 0.7, marginBottom: "4px" }}>Total Available</div>
        <div style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "-1px", color: totalTracked >= 0 ? "#7EFFC5" : "#FF9E9E", marginBottom: "12px" }}>
          {fmt(totalTracked)}
        </div>
        {openingBalance > 0 && <div style={{ fontSize: "11px", opacity: 0.55, marginBottom: "12px" }}>Includes {fmt(openingBalance)} opening balance</div>}
        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{ borderRight: "1px solid rgba(255,255,255,0.2)", paddingRight: "14px" }}>
            <div style={{ fontSize: "10px", opacity: 0.7 }}>↑ INCOME</div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#1DB954" }}>{fmt(totalIncome)}</div>
          </div>
          <div style={{ paddingLeft: "14px" }}>
            <div style={{ fontSize: "10px", opacity: 0.7 }}>↓ EXPENSE</div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#E53E3E" }}>{fmt(totalExpense)}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        {accounts.length > 0 && (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "18px",
              padding: "16px",
              marginBottom: "14px",
              boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "12px" }}>🏦 My Accounts</div>
            {accountBalances.map((acc) => (
              <div key={acc.id} style={{ display: "flex", gap: "12px", marginBottom: "10px", alignItems: "center" }}>
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "11px",
                    backgroundColor: "#F0F4F8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                  }}
                >
                  {acc.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#222" }}>{acc.name}</div>
                  <div style={{ fontSize: "11px", color: "#AAA" }}>{acc.type}</div>
                </div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: acc.balance >= 0 ? "#1E3A5F" : "#E53E3E" }}>{fmt(acc.balance)}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
          <div
            style={{
              flex: 1,
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "14px",
              boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
              borderTop: "3px solid #1DB954",
            }}
          >
            <div style={{ fontSize: "11px", color: "#999", marginBottom: "4px" }}>🟢 They owe me</div>
            <div style={{ fontSize: "17px", fontWeight: 800, color: "#1DB954" }}>{fmt(pendingGave)}</div>
          </div>
          <div
            style={{
              flex: 1,
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "14px",
              boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
              borderTop: "3px solid #E53E3E",
            }}
          >
            <div style={{ fontSize: "11px", color: "#999", marginBottom: "4px" }}>🔴 I owe them</div>
            <div style={{ fontSize: "17px", fontWeight: 800, color: "#E53E3E" }}>{fmt(pendingTook)}</div>
          </div>
        </div>

        {declaredAmount > 0 && (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "18px",
              padding: "16px",
              marginBottom: "14px",
              boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "12px" }}>💼 Wealth Overview</div>
            <div style={{ marginBottom: "8px" }}>
              <div style={{ fontSize: "12px", color: "#999" }}>Declared Total</div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#1E3A5F" }}>{fmt(declaredAmount)}</div>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <div style={{ fontSize: "12px", color: "#999" }}>Currently Tracked</div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#2D6A9F" }}>{fmt(totalTracked)}</div>
            </div>
            <div style={{ borderBottom: "1px solid #F0F0F0", marginBottom: "10px" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                {declaredDiff > 0 && (
                  <>
                    <div style={{ fontSize: "12px", color: "#E53E3E" }}>▼ Untracked amount</div>
                    <div style={{ fontSize: "15px", fontWeight: 800, color: "#E53E3E" }}>{fmt(declaredDiff)} missing</div>
                  </>
                )}
                {declaredDiff < 0 && (
                  <>
                    <div style={{ fontSize: "12px", color: "#E07B54" }}>▲ More tracked than declared</div>
                    <div style={{ fontSize: "15px", fontWeight: 800, color: "#E07B54" }}>{fmt(Math.abs(declaredDiff))} over</div>
                  </>
                )}
                {declaredDiff === 0 && (
                  <>
                    <div style={{ fontSize: "12px", color: "#1DB954" }}>✓ Balanced</div>
                    <div style={{ fontSize: "15px", fontWeight: 800, color: "#1DB954" }}>Balanced</div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {manualCheck > 0 && (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "18px",
              padding: "16px",
              marginBottom: "14px",
              boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
              borderTop: `3px solid ${manualDiff === 0 ? "#1DB954" : manualDiff > 0 ? "#E07B54" : "#E53E3E"}`,
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "12px" }}>🔎 Manual Check</div>
            <div style={{ marginBottom: "8px" }}>
              <div style={{ fontSize: "12px", color: "#999" }}>App Calculated</div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#1E3A5F" }}>{fmt(totalTracked)}</div>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <div style={{ fontSize: "12px", color: "#999" }}>Your Count</div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#2D6A9F" }}>{fmt(manualCheck)}</div>
            </div>
            <div style={{ borderBottom: "1px solid #F0F0F0", marginBottom: "10px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              {manualDiff > 0 && (
                <>
                  <div style={{ fontSize: "12px", color: "#E07B54" }}>▲ You counted more</div>
                  <div style={{ fontSize: "15px", fontWeight: 800, color: "#E07B54" }}>{fmt(Math.abs(manualDiff))} extra</div>
                </>
              )}
              {manualDiff < 0 && (
                <>
                  <div style={{ fontSize: "12px", color: "#E53E3E" }}>▼ You counted less</div>
                  <div style={{ fontSize: "15px", fontWeight: 800, color: "#E53E3E" }}>{fmt(Math.abs(manualDiff))} short</div>
                </>
              )}
              {manualDiff === 0 && (
                <>
                  <div style={{ fontSize: "12px", color: "#1DB954" }}>✓ Perfect Match</div>
                  <div style={{ fontSize: "15px", fontWeight: 800, color: "#1DB954" }}>Balanced</div>
                </>
              )}
            </div>
            {manualDiff !== 0 && (
              <div
                style={{
                  marginTop: "8px",
                  padding: "8px 10px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  backgroundColor: manualDiff > 0 ? "#FFF8F0" : "#FFF5F5",
                  color: manualDiff > 0 ? "#E07B54" : "#E53E3E",
                }}
              >
                {manualDiff > 0
                  ? "You physically have more than the app calculated. You may have missed recording some income."
                  : "You physically have less than the app calculated. You may have missed recording some expense."}
              </div>
            )}
          </div>
        )}

        <div
          style={{
            backgroundColor: "white",
            borderRadius: "18px",
            padding: "16px",
            boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "12px" }}>Recent Transactions</div>
          {recent.length === 0 ? (
            <div style={{ textAlign: "center", color: "#CCC", fontSize: "14px" }}>No transactions yet</div>
          ) : (
            recent.map((tx, idx) => (
              <div key={idx} style={{ display: "flex", gap: "12px", marginBottom: "12px", alignItems: "center" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    backgroundColor:
                      tx.type === "income" ? "#E8FBF0" : tx.type === "expense" ? "#FFF0F0" : "#F3EEFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                  }}
                >
                  {tx.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#222" }}>
                    {tx.type === "transfer" ? `${tx.account} → ${tx.toAccount}` : tx.category}
                  </div>
                  <div style={{ fontSize: "11px", color: "#AAA" }}>
                    {tx.type === "transfer" ? "Transfer" : tx.note || tx.account}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: tx.type === "income" ? "#1DB954" : tx.type === "expense" ? "#E53E3E" : "#7B5EA7",
                  }}
                >
                  {tx.type === "income" ? "+" : tx.type === "expense" ? "−" : "⇄"}
                  {fmt(tx.amount)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ============ TRANSACTIONS TAB ============
const EMPTY_TX = {
  type: "expense",
  category: "",
  icon: "📦",
  amount: "",
  note: "",
  date: todayStr(),
  account: "",
  toAccount: "",
  method: "",
};

function Transactions({ transactions, setTransactions, accounts }) {
  const [search, setSearch] = useState("");
  const [showSheet, setShowSheet] = useState(false);
  const [form, setForm] = useState(EMPTY_TX);

  const handleSearch = (val) => {
    setSearch(val);
    if (val.trim().toLowerCase() === "create") {
      setTimeout(() => {
        setSearch("");
        setForm(EMPTY_TX);
        setShowSheet(true);
      }, 200);
    }
  };

  const filtered = search
    ? transactions.filter(
        (t) =>
          t.category.toLowerCase().includes(search.toLowerCase()) ||
          t.note.toLowerCase().includes(search.toLowerCase()) ||
          t.account.toLowerCase().includes(search.toLowerCase()) ||
          t.toAccount.toLowerCase().includes(search.toLowerCase())
      )
    : transactions;

  const grouped = filtered.reduce((acc, tx) => {
    let key = tx.date;
    if (tx.date === todayStr()) key = "Today";
    else if (tx.date === yesterdayStr()) key = "Yesterday";
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {});

  const handleSave = () => {
    if (!form.amount || parseFloat(form.amount) <= 0) return;

    if (form.type === "transfer") {
      if (!form.account || !form.toAccount || form.account === form.toAccount) return;
      const newTx = {
        id: Date.now(),
        type: "transfer",
        category: "Transfer",
        icon: "⇄",
        amount: parseFloat(form.amount),
        note: form.note,
        date: form.date,
        account: form.account,
        toAccount: form.toAccount,
        method: "",
      };
      setTransactions([newTx, ...transactions]);
    } else {
      if (!form.category || !form.account) return;
      const newTx = {
        ...form,
        id: Date.now(),
        amount: parseFloat(form.amount),
        toAccount: "",
      };
      setTransactions([newTx, ...transactions]);
    }
    setShowSheet(false);
    setForm(EMPTY_TX);
  };

  return (
    <div style={{ paddingBottom: "80px" }}>
      <div
        style={{
          background: "linear-gradient(135deg,#1E3A5F,#2D6A9F)",
          padding: "28px 20px 20px",
          color: "white",
        }}
      >
        <div style={{ fontSize: "11px", opacity: 0.65, letterSpacing: "1px" }}>JUNE 2026</div>
        <div style={{ fontSize: "21px", fontWeight: 800, marginBottom: "14px" }}>Transactions</div>
        <SearchBar value={search} onChange={handleSearch} onClear={() => setSearch("")} />
      </div>

      <div style={{ padding: "14px 16px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#CCC" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>🔍</div>
            <div style={{ fontSize: "14px", fontWeight: 600 }}>{search ? "No results found" : "No transactions yet"}</div>
            <div style={{ fontSize: "12px", marginTop: "8px" }}>Type "create" to add a transaction</div>
          </div>
        ) : (
          Object.entries(grouped).map(([dateKey, txs]) => (
            <div key={dateKey}>
              <div style={{ fontSize: "11px", color: "#999", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px" }}>
                {dateKey}
              </div>
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "18px",
                  padding: "4px 14px",
                  marginBottom: "14px",
                  boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                }}
              >
                {txs.map((tx, idx) => (
                  <div
                    key={tx.id}
                    style={{
                      display: "flex",
                      gap: "12px",
                      padding: "12px 0",
                      borderBottom: idx < txs.length - 1 ? "1px solid #F5F5F5" : "none",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "13px",
                        backgroundColor:
                          tx.type === "income" ? "#E8FBF0" : tx.type === "expense" ? "#FFF0F0" : "#F3EEFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                      }}
                    >
                      {tx.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#222", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {tx.type === "transfer" ? `${tx.account} → ${tx.toAccount}` : tx.category}
                      </div>
                      <div style={{ fontSize: "11px", color: "#AAA" }}>
                        {tx.type === "transfer" ? "Transfer" : `${tx.account} • ${tx.method}`}
                      </div>
                      {tx.note && <div style={{ fontSize: "11px", color: "#BBB" }}>{tx.note}</div>}
                    </div>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        flexShrink: 0,
                        color: tx.type === "income" ? "#1DB954" : tx.type === "expense" ? "#E53E3E" : "#7B5EA7",
                      }}
                    >
                      {tx.type === "income" ? "+" : tx.type === "expense" ? "−" : "⇄"}
                      {fmt(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <button
        onClick={() => setShowSheet(true)}
        style={{
          position: "fixed",
          bottom: "90px",
          right: "calc(50% - 210px + 16px)",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "linear-gradient(135deg,#2D6A9F,#1E3A5F)",
          border: "none",
          color: "white",
          fontSize: "28px",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(30,58,95,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        +
      </button>

      <Sheet isOpen={showSheet} onClose={() => setShowSheet(false)} title="Add Transaction">
        <TypeToggle
          value={form.type}
          onChange={(val) => setForm({ ...EMPTY_TX, type: val })}
          options={[
            ["expense", "↓ Expense"],
            ["income", "↑ Income"],
            ["transfer", "⇄ Transfer"],
          ]}
          colors={{ expense: "#E53E3E", income: "#1DB954", transfer: "#7B5EA7" }}
        />

        {form.type === "transfer" ? (
          <>
            <Label>AMOUNT</Label>
            <FInput
              type="number"
              value={form.amount}
              onChange={(val) => setForm({ ...form, amount: val })}
              placeholder="0"
              style={{ fontSize: "20px", fontWeight: 800, marginBottom: "14px" }}
            />
            <Label>FROM ACCOUNT</Label>
            <ChipRow
              items={accounts.map((a) => a.name)}
              activeValue={form.account}
              onSelect={(val) => setForm({ ...form, account: val })}
              activeColor="#7B5EA7"
              activeBg="#F3EEFF"
            />
            <div style={{ textAlign: "center", fontSize: "20px", color: "#7B5EA7", margin: "12px 0" }}>⬇</div>
            <Label>TO ACCOUNT</Label>
            <ChipRow
              items={accounts.filter((a) => a.name !== form.account).map((a) => a.name)}
              activeValue={form.toAccount}
              onSelect={(val) => setForm({ ...form, toAccount: val })}
              activeColor="#7B5EA7"
              activeBg="#F3EEFF"
            />
            <Label>NOTE (OPTIONAL)</Label>
            <FInput
              value={form.note}
              onChange={(val) => setForm({ ...form, note: val })}
              placeholder="Add a note..."
              style={{ marginBottom: "14px" }}
            />
            <Label>DATE</Label>
            <FInput
              type="date"
              value={form.date}
              onChange={(val) => setForm({ ...form, date: val })}
              style={{ marginBottom: "14px" }}
            />
            <FBtn onClick={handleSave} style={{ width: "100%" }}>
              Save Transfer
            </FBtn>
          </>
        ) : (
          <>
            <Label>AMOUNT</Label>
            <FInput
              type="number"
              value={form.amount}
              onChange={(val) => setForm({ ...form, amount: val })}
              placeholder="0"
              style={{ fontSize: "20px", fontWeight: 800, marginBottom: "14px" }}
            />
            <Label>CATEGORY</Label>
            <ChipRow
              items={TX_CATS[form.type]}
              activeValue={form.category}
              onSelect={(val) => {
                const cat = TX_CATS[form.type].find((c) => c.l === val);
                setForm({ ...form, category: val, icon: cat?.icon || "📦" });
              }}
            />
            <Label>{form.type === "income" ? "RECEIVED IN" : "PAID FROM"}</Label>
            <ChipRow
              items={accounts.map((a) => a.name)}
              activeValue={form.account}
              onSelect={(val) => setForm({ ...form, account: val })}
            />
            <Label>HOW</Label>
            <ChipRow
              items={form.type === "income" ? INCOME_METHODS : EXPENSE_METHODS}
              activeValue={form.method}
              onSelect={(val) => setForm({ ...form, method: val })}
            />
            <Label>NOTE (OPTIONAL)</Label>
            <FInput
              value={form.note}
              onChange={(val) => setForm({ ...form, note: val })}
              placeholder="Add a note..."
              style={{ marginBottom: "14px" }}
            />
            <Label>DATE</Label>
            <FInput
              type="date"
              value={form.date}
              onChange={(val) => setForm({ ...form, date: val })}
              style={{ marginBottom: "14px" }}
            />
            <FBtn onClick={handleSave} style={{ width: "100%" }}>
              Save {form.type === "income" ? "Income" : "Expense"}
            </FBtn>
          </>
        )}
      </Sheet>
    </div>
  );
}

// ============ LOANS TAB ============
const EMPTY_LOAN = {
  type: "took",
  name: "",
  amount: "",
  reason: "",
  date: todayStr(),
  status: "pending",
};

function Loans({ loans, setLoans }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showSheet, setShowSheet] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_LOAN);
  const [delId, setDelId] = useState(null);

  const totalTook = loans.filter((l) => l.type === "took" && l.status === "pending").reduce((s, l) => s + l.amount, 0);
  const totalGave = loans.filter((l) => l.type === "gave" && l.status === "pending").reduce((s, l) => s + l.amount, 0);
  const net = totalGave - totalTook;

  const handleSearch = (val) => {
    setSearch(val);
    if (val.trim().toLowerCase() === "create") {
      setTimeout(() => {
        setSearch("");
        setForm(EMPTY_LOAN);
        setEditId(null);
        setShowSheet(true);
      }, 200);
    }
  };

  const visible = loans.filter(
    (l) =>
      (filter === "all" || l.type === filter) &&
      (l.name.toLowerCase().includes(search.toLowerCase()) || l.reason.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSave = () => {
    if (!form.name || !form.amount || parseFloat(form.amount) <= 0) return;
    if (editId) {
      setLoans(loans.map((l) => (l.id === editId ? { ...form, amount: parseFloat(form.amount), id: editId } : l)));
    } else {
      setLoans([{ ...form, id: Date.now(), amount: parseFloat(form.amount) }, ...loans]);
    }
    setShowSheet(false);
    setForm(EMPTY_LOAN);
    setEditId(null);
  };

  const toggleStatus = (id) => {
    setLoans(
      loans.map((l) =>
        l.id === id ? { ...l, status: l.status === "pending" ? "returned" : "pending" } : l
      )
    );
  };

  const handleDelete = (id) => {
    setLoans(loans.filter((l) => l.id !== id));
    setDelId(null);
  };

  return (
    <div style={{ paddingBottom: "80px" }}>
      <div
        style={{
          background: "linear-gradient(135deg,#1E3A5F,#2D6A9F)",
          padding: "28px 20px 20px",
          color: "white",
        }}
      >
        <div style={{ fontSize: "11px", opacity: 0.65, letterSpacing: "1px" }}>JUNE 2026</div>
        <div style={{ fontSize: "21px", fontWeight: 800, marginBottom: "14px" }}>Loans</div>
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.13)",
            borderRadius: "18px",
            padding: "14px 18px",
            border: "1px solid rgba(255,255,255,0.18)",
            marginBottom: "14px",
          }}
        >
          <div style={{ fontSize: "11px", opacity: 0.7 }}>NET POSITION</div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: 800,
              letterSpacing: "-1px",
              color: net >= 0 ? "#7EFFC5" : "#FF9E9E",
              marginBottom: "10px",
            }}
          >
            {net >= 0 ? "+" : ""}{fmt(net)}
          </div>
          <div style={{ display: "flex", gap: "20px" }}>
            <div>
              <div style={{ fontSize: "10px", opacity: 0.7 }}>🔴 I OWE</div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#E53E3E" }}>{fmt(totalTook)}</div>
            </div>
            <div>
              <div style={{ fontSize: "10px", opacity: 0.7 }}>🟢 THEY OWE</div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#1DB954" }}>{fmt(totalGave)}</div>
            </div>
          </div>
        </div>
        <SearchBar value={search} onChange={handleSearch} onClear={() => setSearch("")} />
      </div>

      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", gap: "4px", marginBottom: "14px", backgroundColor: "white", borderRadius: "14px", padding: "4px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
          {[
            ["all", "All"],
            ["took", "🔴 I Took"],
            ["gave", "🟢 I Gave"],
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "12px",
                fontFamily: "inherit",
                backgroundColor: filter === val ? "linear-gradient(135deg,#2D6A9F,#1E3A5F)" : "transparent",
                color: filter === val ? "white" : "#888",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#CCC" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>📭</div>
            <div style={{ fontSize: "14px", fontWeight: 600 }}>No results</div>
          </div>
        ) : (
          visible.map((loan) => (
            <div key={loan.id}>
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "18px",
                  padding: "14px 16px",
                  marginBottom: "12px",
                  boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                  borderLeft: `4px solid ${loan.type === "took" ? "#E53E3E" : "#1DB954"}`,
                  opacity: loan.status === "returned" ? 0.65 : 1,
                }}
              >
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: "46px",
                      height: "46px",
                      borderRadius: "50%",
                      backgroundColor: avatarColor(loan.name),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "18px",
                      fontWeight: 800,
                    }}
                  >
                    {loan.name[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "#1A1A2E" }}>{loan.name}</div>
                      <div
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "20px",
                          backgroundColor: loan.status === "returned" ? "#E8FBF0" : "#FFF8F0",
                          color: loan.status === "returned" ? "#1DB954" : "#E07B54",
                        }}
                      >
                        {loan.status === "returned" ? "Settled" : "Pending"}
                      </div>
                    </div>
                    <div style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>{loan.reason}</div>
                    <div style={{ fontSize: "11px", color: "#BBB", marginTop: "1px" }}>{loan.date}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "17px",
                        fontWeight: 800,
                        color: loan.type === "took" ? "#E53E3E" : "#1DB954",
                      }}
                    >
                      {loan.type === "took" ? "−" : "+"}
                      {fmt(loan.amount)}
                    </div>
                    <div style={{ fontSize: "11px", color: "#BBB" }}>
                      {loan.type === "took" ? "I owe" : "They owe"}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", marginTop: "12px", paddingTop: "10px", borderTop: "1px solid #F5F5F5" }}>
                  <button
                    onClick={() => toggleStatus(loan.id)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1.5px solid #E8EDF3",
                      backgroundColor: loan.status === "returned" ? "#F9F9F9" : "#E8FBF0",
                      color: loan.status === "returned" ? "#999" : "#1DB954",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: "12px",
                      fontFamily: "inherit",
                    }}
                  >
                    {loan.status === "returned" ? "↩ Pending" : "✓ Settled"}
                  </button>
                  <button
                    onClick={() => {
                      setForm({ ...loan, amount: String(loan.amount) });
                      setEditId(loan.id);
                      setShowSheet(true);
                    }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1.5px solid #E8EDF3",
                      backgroundColor: "#F5F8FF",
                      color: "#2D6A9F",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: "12px",
                      fontFamily: "inherit",
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => setDelId(loan.id)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1.5px solid #FFE8E8",
                      backgroundColor: "#FFF5F5",
                      color: "#E53E3E",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: "12px",
                      fontFamily: "inherit",
                    }}
                  >
                    🗑
                  </button>
                </div>

                {delId === loan.id && (
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "14px",
                      borderRadius: "12px",
                      backgroundColor: "#FFF5F5",
                      border: "1.5px solid #FFE8E8",
                    }}
                  >
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#E53E3E", marginBottom: "10px" }}>
                      Delete this loan?
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => setDelId(null)}
                        style={{
                          flex: 1,
                          padding: "8px",
                          borderRadius: "8px",
                          border: "1.5px solid #E8EDF3",
                          backgroundColor: "white",
                          cursor: "pointer",
                          fontWeight: 700,
                          fontSize: "12px",
                          fontFamily: "inherit",
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(loan.id)}
                        style={{
                          flex: 1,
                          padding: "8px",
                          borderRadius: "8px",
                          border: "none",
                          backgroundColor: "#E53E3E",
                          color: "white",
                          cursor: "pointer",
                          fontWeight: 700,
                          fontSize: "12px",
                          fontFamily: "inherit",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Sheet isOpen={showSheet} onClose={() => setShowSheet(false)} title={editId ? "Edit Loan" : "Add Loan"}>
        <TypeToggle
          value={form.type}
          onChange={(val) => setForm({ ...EMPTY_LOAN, type: val })}
          options={[
            ["took", "🔴 I Took"],
            ["gave", "🟢 I Gave"],
          ]}
          colors={{ took: "#E53E3E", gave: "#1DB954" }}
        />
        <Label>PERSON'S NAME</Label>
        <FInput
          value={form.name}
          onChange={(val) => setForm({ ...form, name: val })}
          placeholder="Enter name..."
          style={{ marginBottom: "14px" }}
        />
        <Label>AMOUNT</Label>
        <FInput
          type="number"
          value={form.amount}
          onChange={(val) => setForm({ ...form, amount: val })}
          placeholder="0"
          style={{ fontSize: "18px", fontWeight: 700, marginBottom: "14px" }}
        />
        <Label>REASON (OPTIONAL)</Label>
        <FInput
          value={form.reason}
          onChange={(val) => setForm({ ...form, reason: val })}
          placeholder="Why..."
          style={{ marginBottom: "14px" }}
        />
        <Label>DATE</Label>
        <FInput
          type="date"
          value={form.date}
          onChange={(val) => setForm({ ...form, date: val })}
          style={{ marginBottom: "14px" }}
        />
        <Label>STATUS</Label>
        <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
          {[
            ["pending", "⏳ Pending"],
            ["returned", "✓ Settled"],
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setForm({ ...form, status: val })}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                border: `1.5px solid ${form.status === val ? "#1E3A5F" : "#E8EDF3"}`,
                backgroundColor: form.status === val ? "#EEF4FB" : "white",
                color: form.status === val ? "#2D6A9F" : "#999",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "12px",
                fontFamily: "inherit",
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <FBtn onClick={handleSave} style={{ width: "100%" }}>
          {editId ? "Update Loan" : "Save Loan"}
        </FBtn>
      </Sheet>
    </div>
  );
}

// ============ GOAL TAB ============
function Goal({ transactions, accounts, openingBalance, goalAmount }) {
  const accountBalances = calcAccountBalances(accounts, transactions);
  const totalTracked = accountBalances.reduce((s, a) => s + a.balance, 0) + openingBalance;
  const pct = goalAmount > 0 ? Math.min(100, Math.round((totalTracked / goalAmount) * 100)) : 0;
  const needed = Math.max(0, goalAmount - totalTracked);
  const isAchieved = goalAmount > 0 && totalTracked >= goalAmount;
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const monthlySaving = totalIncome - totalExpense;
  const monthsNeeded = monthlySaving > 0 && needed > 0 ? Math.ceil(needed / monthlySaving) : null;

  let msg = "Set a goal from Settings to start!";
  if (pct >= 100) msg = "🎉 Goal achieved! Set a new one!";
  else if (pct >= 67) msg = "Almost there, don't stop now! 🔥";
  else if (pct >= 34) msg = "Halfway there, great progress! 🚀";
  else if (pct > 0) msg = "Keep saving, you're on your way! 💪";

  return (
    <div style={{ paddingBottom: "80px" }}>
      <div
        style={{
          background: "linear-gradient(135deg,#1E3A5F,#2D6A9F)",
          padding: "28px 20px 80px",
          color: "white",
        }}
      >
        <div style={{ fontSize: "11px", opacity: 0.65, letterSpacing: "1px" }}>SAVINGS</div>
        <div style={{ fontSize: "22px", fontWeight: 800 }}>My Goal</div>
      </div>

      {goalAmount > 0 ? (
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.13)",
            borderRadius: "20px",
            padding: "20px",
            border: "1px solid rgba(255,255,255,0.18)",
            margin: "-36px 16px 14px",
            color: "white",
          }}
        >
          <div style={{ marginBottom: "18px", paddingBottom: "18px", borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
            <div style={{ fontSize: "11px", opacity: 0.65, letterSpacing: "0.5px", marginBottom: "6px" }}>
              🎯 MY GOAL
            </div>
            <div style={{ fontSize: "34px", fontWeight: 800, color: "#7EFFC5" }}>{fmt(goalAmount)}</div>
          </div>
          <div style={{ marginBottom: "18px", paddingBottom: "18px", borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
            <div style={{ fontSize: "11px", opacity: 0.65, letterSpacing: "0.5px", marginBottom: "6px" }}>
              💰 TOTAL BALANCE
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "white" }}>{fmt(totalTracked)}</div>
          </div>
          <div>
            <div style={{ fontSize: "11px", opacity: 0.65, letterSpacing: "0.5px", marginBottom: "6px" }}>
              {isAchieved ? "✅ STATUS" : "📉 STILL NEEDED"}
            </div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: isAchieved ? "#1DB954" : "#FF9E9E",
              }}
            >
              {isAchieved ? "Goal Achieved!" : fmt(needed)}
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.13)",
            borderRadius: "20px",
            padding: "40px 20px",
            border: "1px solid rgba(255,255,255,0.18)",
            margin: "-36px 16px 14px",
            color: "white",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "36px", marginBottom: "10px" }}>🎯</div>
          <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "6px" }}>No Goal Set</div>
          <div style={{ fontSize: "12px", opacity: 0.65 }}>
            Go to Settings → Savings Goal to set your target amount
          </div>
        </div>
      )}

      <div style={{ padding: "0 16px", marginTop: "-36px" }}>
        {goalAmount > 0 && (
          <>
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "18px",
                padding: "18px",
                marginBottom: "14px",
                boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#222" }}>📊 Progress</div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: isAchieved ? "#1DB954" : "#2D6A9F" }}>
                  {pct}%
                </div>
              </div>
              <div
                style={{
                  height: "14px",
                  backgroundColor: "#F0F4F8",
                  borderRadius: "10px",
                  overflow: "hidden",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    borderRadius: "10px",
                    background: isAchieved
                      ? "solid #1DB954"
                      : "linear-gradient(90deg,#2D6A9F,#1DB954)",
                    transition: "width 0.6s",
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <div style={{ fontSize: "11px", color: "#AAA" }}>₹0</div>
                <div style={{ fontSize: "11px", color: "#AAA" }}>{fmt(goalAmount)}</div>
              </div>
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: "12px",
                  fontSize: "13px",
                  fontWeight: 600,
                  textAlign: "center",
                  backgroundColor: isAchieved ? "#E8FBF0" : "#F0F4F8",
                  color: isAchieved ? "#1DB954" : "#666",
                }}
              >
                {msg}
              </div>
            </div>

            <div
              style={{
                backgroundColor: "white",
                borderRadius: "18px",
                padding: "16px",
                marginBottom: "14px",
                boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ padding: "12px 0", borderBottom: "1px solid #F5F5F5", display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontSize: "13px", color: "#666" }}>🎯 Goal Amount</div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#1E3A5F" }}>{fmt(goalAmount)}</div>
              </div>
              <div style={{ padding: "12px 0", borderBottom: "1px solid #F5F5F5", display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontSize: "13px", color: "#666" }}>💰 Total Balance</div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#2D6A9F" }}>{fmt(totalTracked)}</div>
              </div>
              <div style={{ padding: "12px 0", display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontSize: "13px", color: "#666" }}>📉 Still Needed</div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: isAchieved ? "#1DB954" : "#E53E3E" }}>
                  {isAchieved ? "₹0 — Achieved!" : fmt(needed)}
                </div>
              </div>
            </div>

            {goalAmount > 0 && !isAchieved && (
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "18px",
                  padding: "16px",
                  marginBottom: "14px",
                  boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                }}
              >
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#222", marginBottom: "12px" }}>
                  ⏱️ Estimate to Reach Goal
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div style={{ fontSize: "13px", color: "#666" }}>Monthly Surplus</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: monthlySaving > 0 ? "#1DB954" : "#E53E3E" }}>
                    {monthlySaving > 0 ? fmt(monthlySaving) : "No surplus"}
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontSize: "13px", color: "#666" }}>Time Needed</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#2D6A9F" }}>
                    {monthsNeeded ? `~${monthsNeeded} month(s)` : "—"}
                  </div>
                </div>
                {monthlySaving <= 0 && (
                  <div
                    style={{
                      marginTop: "10px",
                      padding: "8px 12px",
                      borderRadius: "10px",
                      backgroundColor: "#FFF8F0",
                      color: "#E07B54",
                      fontSize: "12px",
                    }}
                  >
                    Reduce your expenses to create a monthly surplus toward your goal.
                  </div>
                )}
              </div>
            )}

            {isAchieved && (
              <div
                style={{
                  background: "linear-gradient(135deg,#1DB954,#0E9E46)",
                  borderRadius: "18px",
                  padding: "22px",
                  marginBottom: "14px",
                  textAlign: "center",
                  color: "white",
                }}
              >
                <div style={{ fontSize: "44px", marginBottom: "8px" }}>🎉</div>
                <div style={{ fontSize: "18px", fontWeight: 800, marginBottom: "6px" }}>Goal Achieved!</div>
                <div style={{ fontSize: "13px", opacity: 0.85 }}>
                  You reached your target of {fmt(goalAmount)}. Go to Settings to set a new goal!
                </div>
              </div>
            )}
          </>
        )}

        {goalAmount === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#BBB", fontSize: "13px" }}>
            Go to ⚙️ Settings → 🎯 Savings Goal to set your target.
          </div>
        )}
      </div>
    </div>
  );
}

// ============ SETTINGS TAB ============
function Settings({
  accounts,
  setAccounts,
  openingBalance,
  setOpeningBalance,
  declaredAmount,
  setDeclaredAmount,
  goalAmount,
  setGoalAmount,
  manualCheck,
  setManualCheck,
  pin,
  setPin,
  pinEnabled,
  setPinEnabled,
}) {
  const [section, setSection] = useState(null);
  const [accForm, setAccForm] = useState({ name: "", type: "Cash", icon: "💵", opening: "" });
  const [editAccId, setEditAccId] = useState(null);
  const [delAccId, setDelAccId] = useState(null);
  const [showPinSet, setShowPinSet] = useState(false);
  const [obTemp, setObTemp] = useState(String(openingBalance));
  const [daTemp, setDaTemp] = useState(String(declaredAmount));
  const [goalTemp, setGoalTemp] = useState(String(goalAmount));
  const [mcTemp, setMcTemp] = useState(String(manualCheck));

  const saveAccount = () => {
    if (!accForm.name) return;
    const entry = { ...accForm, opening: parseFloat(accForm.opening) || 0 };
    if (editAccId) {
      setAccounts(accounts.map((a) => (a.id === editAccId ? { ...entry, id: editAccId } : a)));
    } else {
      setAccounts([...accounts, { ...entry, id: Date.now() }]);
    }
    setAccForm({ name: "", type: "Cash", icon: "💵", opening: "" });
    setEditAccId(null);
  };

  const deleteAcc = (id) => {
    setAccounts(accounts.filter((a) => a.id !== id));
    setDelAccId(null);
  };

  const startEditAcc = (a) => {
    setAccForm({ ...a, opening: String(a.opening) });
    setEditAccId(a.id);
  };

  const menuItems = [
    { icon: "🏦", title: "Manage Accounts", sub: `${accounts.length} account(s)`, key: "accounts" },
    { icon: "💵", title: "Opening Balance", sub: openingBalance > 0 ? fmt(openingBalance) : "Not set", key: "opening" },
    { icon: "💼", title: "Declared Total", sub: declaredAmount > 0 ? fmt(declaredAmount) : "Not set", key: "declared" },
    { icon: "🎯", title: "Savings Goal", sub: goalAmount > 0 ? `Target: ${fmt(goalAmount)}` : "Not set", key: "goal" },
    { icon: "🔎", title: "Manual Check", sub: manualCheck > 0 ? `Your count: ${fmt(manualCheck)}` : "Not set", key: "manual" },
    { icon: "🔒", title: "PIN Lock", sub: pinEnabled ? "Enabled · tap to change" : "Disabled", key: "pin" },
  ];

  return (
    <div style={{ paddingBottom: "80px" }}>
      <div
        style={{
          background: "linear-gradient(135deg,#1E3A5F,#2D6A9F)",
          padding: "28px 20px",
          color: "white",
        }}
      >
        <div style={{ fontSize: "11px", opacity: 0.65, letterSpacing: "1px" }}>PREFERENCES</div>
        <div style={{ fontSize: "21px", fontWeight: 800 }}>Settings</div>
      </div>

      <div style={{ padding: "16px" }}>
        {menuItems.map((item) => (
          <div key={item.key}>
            <div
              onClick={() => setSection(section === item.key ? null : item.key)}
              style={{
                backgroundColor: "white",
                borderRadius: "16px",
                padding: "15px 16px",
                marginBottom: "10px",
                boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                display: "flex",
                gap: "14px",
                cursor: "pointer",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "13px",
                  backgroundColor: "#F0F4F8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                }}
              >
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#222" }}>{item.title}</div>
                <div style={{ fontSize: "12px", color: "#999", marginTop: "1px" }}>{item.sub}</div>
              </div>
              <div
                style={{
                  color: "#CCC",
                  fontSize: "18px",
                  transform: section === item.key ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                }}
              >
                ›
              </div>
            </div>

            {section === item.key && (
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "16px",
                  padding: "16px",
                  marginBottom: "10px",
                  boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                }}
              >
                {item.key === "accounts" && (
                  <>
                    <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px" }}>My Accounts</div>
                    {accounts.map((a) => (
                      <div
                        key={a.id}
                        style={{
                          backgroundColor: "#F8FAFC",
                          borderRadius: "12px",
                          padding: "10px 12px",
                          marginBottom: "10px",
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ fontSize: "22px" }}>{a.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "14px", fontWeight: 600 }}>{a.name}</div>
                          <div style={{ fontSize: "11px", color: "#AAA" }}>
                            {a.type} • {fmt(a.opening)}
                          </div>
                        </div>
                        <button
                          onClick={() => startEditAcc(a)}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "6px",
                            border: "1px solid #E8EDF3",
                            backgroundColor: "white",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontFamily: "inherit",
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setDelAccId(a.id)}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "6px",
                            border: "1px solid #FFE8E8",
                            backgroundColor: "#FFF5F5",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontFamily: "inherit",
                            color: "#E53E3E",
                          }}
                        >
                          🗑
                        </button>
                      </div>
                    ))}

                    {delAccId && (
                      <div
                        style={{
                          backgroundColor: "#FFF5F5",
                          border: "1.5px solid #FFE8E8",
                          borderRadius: "12px",
                          padding: "14px",
                          marginTop: "12px",
                        }}
                      >
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#E53E3E", marginBottom: "10px" }}>
                          Delete this account?
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => setDelAccId(null)}
                            style={{
                              flex: 1,
                              padding: "8px",
                              borderRadius: "8px",
                              border: "1.5px solid #E8EDF3",
                              backgroundColor: "white",
                              cursor: "pointer",
                              fontWeight: 700,
                              fontSize: "12px",
                              fontFamily: "inherit",
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => deleteAcc(delAccId)}
                            style={{
                              flex: 1,
                              padding: "8px",
                              borderRadius: "8px",
                              border: "none",
                              backgroundColor: "#E53E3E",
                              color: "white",
                              cursor: "pointer",
                              fontWeight: 700,
                              fontSize: "12px",
                              fontFamily: "inherit",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}

                    <div style={{ paddingTop: "12px", borderTop: "1px solid #F0F0F0", marginTop: "12px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#555", marginBottom: "10px" }}>
                        {editAccId ? "Edit Account" : "Add New Account"}
                      </div>
                      <FInput
                        value={accForm.name}
                        onChange={(val) => setAccForm({ ...accForm, name: val })}
                        placeholder="Account name..."
                        style={{ marginBottom: "10px" }}
                      />
                      <ChipRow
                        items={ACCOUNT_TYPES}
                        activeValue={accForm.type}
                        onSelect={(val) => {
                          const type = ACCOUNT_TYPES.find((t) => t.type === val);
                          setAccForm({ ...accForm, type: val, icon: type?.icon || "💰" });
                        }}
                      />
                      <FInput
                        type="number"
                        value={accForm.opening}
                        onChange={(val) => setAccForm({ ...accForm, opening: val })}
                        placeholder="Opening balance..."
                        style={{ marginBottom: "12px" }}
                      />
                      <div style={{ display: "flex", gap: "8px" }}>
                        {editAccId && (
                          <button
                            onClick={() => {
                              setAccForm({ name: "", type: "Cash", icon: "💵", opening: "" });
                              setEditAccId(null);
                            }}
                            style={{
                              flex: 1,
                              padding: "10px",
                              borderRadius: "8px",
                              border: "1.5px solid #E8EDF3",
                              backgroundColor: "white",
                              cursor: "pointer",
                              fontWeight: 700,
                              fontSize: "12px",
                              fontFamily: "inherit",
                            }}
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={saveAccount}
                          style={{
                            flex: 1,
                            padding: "10px",
                            borderRadius: "8px",
                            background: "linear-gradient(135deg,#2D6A9F,#1E3A5F)",
                            border: "none",
                            color: "white",
                            cursor: "pointer",
                            fontWeight: 700,
                            fontSize: "12px",
                            fontFamily: "inherit",
                          }}
                        >
                          {editAccId ? "Update" : "Add"}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {item.key === "opening" && (
                  <>
                    <div style={{ fontSize: "12px", color: "#999", marginBottom: "12px" }}>
                      A global starting amount added to your total balance on top of individual account balances.
                    </div>
                    <FInput
                      type="number"
                      value={obTemp}
                      onChange={setObTemp}
                      placeholder="0"
                      style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}
                    />
                    <div style={{ display: "flex", gap: "8px" }}>
                      {openingBalance > 0 && (
                        <button
                          onClick={() => {
                            setOpeningBalance(0);
                            setObTemp("0");
                            setSection(null);
                          }}
                          style={{
                            flex: 1,
                            padding: "10px",
                            borderRadius: "8px",
                            backgroundColor: "#E53E3E",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: 700,
                            fontSize: "12px",
                            fontFamily: "inherit",
                          }}
                        >
                          Remove
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setOpeningBalance(parseFloat(obTemp) || 0);
                          setSection(null);
                        }}
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: "8px",
                          background: "linear-gradient(135deg,#2D6A9F,#1E3A5F)",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: 700,
                          fontSize: "12px",
                          fontFamily: "inherit",
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </>
                )}

                {item.key === "declared" && (
                  <>
                    <div style={{ fontSize: "12px", color: "#999", marginBottom: "12px" }}>
                      Your known total wealth — savings, fixed deposits, cash at home etc. Dashboard shows the difference between this and what the app has calculated.
                    </div>
                    <FInput
                      type="number"
                      value={daTemp}
                      onChange={setDaTemp}
                      placeholder="0"
                      style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}
                    />
                    <div style={{ display: "flex", gap: "8px" }}>
                      {declaredAmount > 0 && (
                        <button
                          onClick={() => {
                            setDeclaredAmount(0);
                            setDaTemp("0");
                            setSection(null);
                          }}
                          style={{
                            flex: 1,
                            padding: "10px",
                            borderRadius: "8px",
                            backgroundColor: "#E53E3E",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: 700,
                            fontSize: "12px",
                            fontFamily: "inherit",
                          }}
                        >
                          Remove
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setDeclaredAmount(parseFloat(daTemp) || 0);
                          setSection(null);
                        }}
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: "8px",
                          background: "linear-gradient(135deg,#2D6A9F,#1E3A5F)",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: 700,
                          fontSize: "12px",
                          fontFamily: "inherit",
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </>
                )}

                {item.key === "goal" && (
                  <>
                    <div style={{ fontSize: "12px", color: "#999", marginBottom: "12px" }}>
                      Set a target amount you want to save. Goal tab shows a progress bar, how much is still needed, and a motivational message.
                    </div>
                    <FInput
                      type="number"
                      value={goalTemp}
                      onChange={setGoalTemp}
                      placeholder="0"
                      style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}
                    />
                    <div style={{ display: "flex", gap: "8px" }}>
                      {goalAmount > 0 && (
                        <button
                          onClick={() => {
                            setGoalAmount(0);
                            setGoalTemp("0");
                            setSection(null);
                          }}
                          style={{
                            flex: 1,
                            padding: "10px",
                            borderRadius: "8px",
                            backgroundColor: "#E53E3E",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: 700,
                            fontSize: "12px",
                            fontFamily: "inherit",
                          }}
                        >
                          Remove
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setGoalAmount(parseFloat(goalTemp) || 0);
                          setSection(null);
                        }}
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: "8px",
                          background: "linear-gradient(135deg,#2D6A9F,#1E3A5F)",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: 700,
                          fontSize: "12px",
                          fontFamily: "inherit",
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </>
                )}

                {item.key === "manual" && (
                  <>
                    <div style={{ fontSize: "12px", color: "#999", marginBottom: "12px" }}>
                      Physically count your cash and enter it here. Dashboard compares this against the app's calculated total and tells you if you have more or less than expected.
                    </div>
                    <FInput
                      type="number"
                      value={mcTemp}
                      onChange={setMcTemp}
                      placeholder="0"
                      style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}
                    />
                    <div style={{ display: "flex", gap: "8px" }}>
                      {manualCheck > 0 && (
                        <button
                          onClick={() => {
                            setManualCheck(0);
                            setMcTemp("0");
                            setSection(null);
                          }}
                          style={{
                            flex: 1,
                            padding: "10px",
                            borderRadius: "8px",
                            backgroundColor: "#E53E3E",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: 700,
                            fontSize: "12px",
                            fontFamily: "inherit",
                          }}
                        >
                          Remove
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setManualCheck(parseFloat(mcTemp) || 0);
                          setSection(null);
                        }}
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: "8px",
                          background: "linear-gradient(135deg,#2D6A9F,#1E3A5F)",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: 700,
                          fontSize: "12px",
                          fontFamily: "inherit",
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </>
                )}

                {item.key === "pin" && (
                  <>
                    <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "14px" }}>PIN Lock</div>
                    {pinEnabled ? (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => setShowPinSet(true)}
                          style={{
                            flex: 1,
                            padding: "10px",
                            borderRadius: "8px",
                            border: "1.5px solid #E8EDF3",
                            backgroundColor: "white",
                            color: "#2D6A9F",
                            cursor: "pointer",
                            fontWeight: 700,
                            fontSize: "12px",
                            fontFamily: "inherit",
                          }}
                        >
                          🔄 Change PIN
                        </button>
                        <button
                          onClick={() => {
                            setPinEnabled(false);
                            setPin("");
                            setSection(null);
                          }}
                          style={{
                            flex: 1,
                            padding: "10px",
                            borderRadius: "8px",
                            backgroundColor: "#E53E3E",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: 700,
                            fontSize: "12px",
                            fontFamily: "inherit",
                          }}
                        >
                          🔓 Disable
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowPinSet(true)}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          background: "linear-gradient(135deg,#2D6A9F,#1E3A5F)",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: 700,
                          fontSize: "12px",
                          fontFamily: "inherit",
                        }}
                      >
                        🔒 Set PIN
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {showPinSet && (
        <PinScreen
          mode="set"
          onSuccess={(newPin) => {
            setPin(newPin);
            setPinEnabled(true);
            setShowPinSet(false);
            setSection(null);
          }}
          onCancel={() => setShowPinSet(false)}
        />
      )}
    </div>
  );
}

// ============ BOTTOM NAVIGATION ============
function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "dashboard", icon: "🏠", label: "Home" },
    { id: "transactions", icon: "💳", label: "Txns" },
    { id: "loans", icon: "🤝", label: "Loans" },
    { id: "goal", icon: "🎯", label: "Goal" },
    { id: "settings", icon: "⚙️", label: "Settings" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "420px",
        maxWidth: "100%",
        backgroundColor: "white",
        borderTop: "1px solid #EEE",
        padding: "8px 0 10px",
        display: "flex",
        zIndex: 100,
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px",
            position: "relative",
            border: "none",
            backgroundColor: "transparent",
            cursor: "pointer",
            fontFamily: "inherit",
            padding: "0",
          }}
        >
          <div style={{ fontSize: "21px" }}>{tab.icon}</div>
          <div
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: activeTab === tab.id ? "#1E3A5F" : "#BBB",
            }}
          >
            {tab.label}
          </div>
          {activeTab === tab.id && (
            <div
              style={{
                position: "absolute",
                bottom: "-10px",
                width: "20px",
                height: "3px",
                borderRadius: "2px",
                backgroundColor: "#1E3A5F",
              }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

// ============ ROOT APP ============
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [transactions, setTransactions] = useLS("fm_transactions", SEED_TX);
  const [loans, setLoans] = useLS("fm_loans", SEED_LOANS);
  const [accounts, setAccounts] = useLS("fm_accounts", SEED_ACCOUNTS);
  const [openingBalance, setOpeningBalance] = useLS("fm_opening", 0);
  const [declaredAmount, setDeclaredAmount] = useLS("fm_declared", 0);
  const [goalAmount, setGoalAmount] = useLS("fm_goal", 0);
  const [manualCheck, setManualCheck] = useLS("fm_manual", 0);
  const [pin, setPin] = useLS("fm_pin", "");
  const [pinEnabled, setPinEnabled] = useLS("fm_pin_enabled", false);
  const [unlocked, setUnlocked] = useState(!pinEnabled);

  useEffect(() => {
    if (!pinEnabled) setUnlocked(true);
  }, [pinEnabled]);

  if (pinEnabled && !unlocked) {
    return (
      <PinScreen
        mode="verify"
        savedPin={pin}
        onSuccess={() => setUnlocked(true)}
      />
    );
  }

  return (
    <div
      style={{
        fontFamily: "Inter, system-ui, sans-serif",
        backgroundColor: COLORS.background,
        minHeight: "100vh",
        maxWidth: "420px",
        margin: "0 auto",
        paddingBottom: "80px",
        overflowX: "hidden",
      }}
    >
      {tab === "dashboard" && (
        <Dashboard
          transactions={transactions}
          loans={loans}
          accounts={accounts}
          openingBalance={openingBalance}
          declaredAmount={declaredAmount}
          manualCheck={manualCheck}
        />
      )}
      {tab === "transactions" && (
        <Transactions
          transactions={transactions}
          setTransactions={setTransactions}
          accounts={accounts}
        />
      )}
      {tab === "loans" && <Loans loans={loans} setLoans={setLoans} />}
      {tab === "goal" && (
        <Goal
          transactions={transactions}
          accounts={accounts}
          openingBalance={openingBalance}
          goalAmount={goalAmount}
        />
      )}
      {tab === "settings" && (
        <Settings
          accounts={accounts}
          setAccounts={setAccounts}
          openingBalance={openingBalance}
          setOpeningBalance={setOpeningBalance}
          declaredAmount={declaredAmount}
          setDeclaredAmount={setDeclaredAmount}
          goalAmount={goalAmount}
          setGoalAmount={setGoalAmount}
          manualCheck={manualCheck}
          setManualCheck={setManualCheck}
          pin={pin}
          setPin={setPin}
          pinEnabled={pinEnabled}
          setPinEnabled={setPinEnabled}
        />
      )}

      <BottomNav activeTab={tab} setActiveTab={setTab} />
    </div>
  );
}
