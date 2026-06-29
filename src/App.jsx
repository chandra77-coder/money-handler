import React, { useState, useEffect, useMemo, useCallback } from "react";

// 2. fmt, todayStr, yesterdayStr, avatarColor helpers
const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const todayStr = () => new Date().toISOString().slice(0, 10);
const yesterdayStr = () =>
  new Date(Date.now() - 86400000).toISOString().slice(0, 10);
const currentMonthYear = () =>
  new Date().toLocaleString("en-IN", { month: "long", year: "numeric" }).toUpperCase();
const avatarColor = (name) => {
  if (!name || name.length === 0) return "#4F7CAC";
  return [
    "#4F7CAC",
    "#E07B54",
    "#5BA858",
    "#9B59B6",
    "#E74C3C",
    "#1ABC9C",
    "#E67E22",
  ][name.charCodeAt(0) % 7];
};

// 3. useLS hook with enhanced error handling
const useLS = (key, defaultVal) => {
  const [value, setValue] = useState(() => {
    try {
      if (typeof window === "undefined") return defaultVal;
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultVal;
    } catch (error) {
      console.warn(`[useLS] Error reading ${key}:`, error.message);
      return defaultVal;
    }
  });

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.warn(`[useLS] Error writing ${key}:`, error.message);
      if (error.name === "QuotaExceededError") {
        console.error("Local storage quota exceeded. Some data may not be saved.");
      }
    }
  }, [key, value]);

  return [value, setValue];
};

// 4. SEED_ACCOUNTS, SEED_TX, SEED_LOANS constants
// Empty by default - users can add their own accounts
const SEED_ACCOUNTS = [];

// Empty by default - users can add their own transactions
const SEED_TX = [];

// Empty by default - users can add their own loans
const SEED_LOANS = [];

// 5. TX_CATS, INCOME_METHODS, EXPENSE_METHODS, ACCOUNT_TYPES constants
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

// 6. Shared Components (Sheet, FInput, FBtn, SearchBar, TypeToggle, Label, ChipRow)
const Sheet = ({ children, show, onClose }) => {
  if (!show) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 300,
        display: "flex",
        alignItems: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "24px 24px 0 0",
          padding: "20px 18px 48px",
          maxHeight: "92vh",
          overflowY: "auto",
          width: "100%",
          boxSizing: "border-box",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: "40px",
            height: "4px",
            backgroundColor: "#DDD",
            borderRadius: "2px",
            margin: "auto auto 18px",
          }}
        ></div>
        {children}
      </div>
    </div>
  );
};

const FInput = ({ value, onChange, placeholder, type = "text", style }) => (
  <input
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    type={type}
    style={{
      width: "100%",
      padding: "12px 14px",
      borderRadius: "12px",
      border: "1.5px solid #E8EDF3",
      outline: "none",
      fontFamily: "inherit",
      boxSizing: "border-box",
      ...style,
    }}
  />
);

const FBtn = ({ outline, bg, color = "#1E3A5F", style, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      fontFamily: "inherit",
      fontWeight: 700,
      fontSize: "14px",
      borderRadius: "12px",
      cursor: "pointer",
      border: outline ? `1.5px solid ${color}` : "none",
      background: outline ? "white" : bg || "linear-gradient(135deg,#2D6A9F,#1E3A5F)",
      color: outline ? color : "white",
      padding: "12px 14px",
      width: "100%",
      boxSizing: "border-box",
      ...style,
    }}
  >
    {children}
  </button>
);

const SearchBar = ({ value, onChange, onClear }) => (
  <div style={{ position: "relative", margin: "0 16px 12px" }}>
    <span
      style={{
        position: "absolute",
        left: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        color: "#999",
      }}
    >
      🔍
    </span>
    <input
      value={value}
      onChange={onChange}
      placeholder="Search..."
      style={{
        width: "100%",
        padding: "11px 36px",
        borderRadius: "14px",
        border: "none",
        fontSize: "13px",
        backgroundColor: "rgba(255,255,255,0.95)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        boxSizing: "border-box",
        fontFamily: "inherit",
        outline: "none",
        color: "#222",
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
          cursor: "pointer",
          color: "#999",
        }}
      >
        ✕
      </span>
    )}
  </div>
);

const TypeToggle = ({ options, value, onChange, colors = {} }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "row",
      backgroundColor: "#F0F4F8",
      borderRadius: "12px",
      padding: "3px",
      gap: "3px",
      marginBottom: "14px",
    }}
  >
    {options.map(([optValue, label]) => (
      <div
        key={optValue}
        onClick={() => onChange(optValue)}
        style={{
          flex: 1,
          borderRadius: "10px",
          padding: "10px 4px",
          fontWeight: 700,
          fontSize: "12px",
          textAlign: "center",
          cursor: "pointer",
          background:
            value === optValue
              ? colors[optValue] || "linear-gradient(135deg,#2D6A9F,#1E3A5F)"
              : "transparent",
          color: value === optValue ? "white" : "#999",
        }}
      >
        {label}
      </div>
    ))}
  </div>
);

const Label = ({ children, style }) => (
  <div
    style={{
      fontSize: "11px",
      color: "#999",
      fontWeight: 700,
      letterSpacing: "0.5px",
      marginBottom: "6px",
      ...style,
    }}
  >
    {children}
  </div>
);

const ChipRow = ({ items, value, onChange, activeColor, activeBg }) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "6px",
      marginBottom: "12px",
    }}
  >
    {items.map((item) => {
      const itemValue = typeof item === "string" ? item : item.l;
      const isActive = value === itemValue;
      return (
        <div
          key={itemValue}
          onClick={() => onChange(itemValue)}
          style={{
            padding: "7px 12px",
            borderRadius: "20px",
            border: `1.5px solid ${
              isActive ? activeColor || "#1E3A5F" : "#E8EDF3"
            }`,
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: "12px",
            fontWeight: 600,
            backgroundColor:
              isActive ? activeBg || "#EEF4FB" : "white",
            color:
              isActive ? activeColor || "#1E3A5F" : "#888",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {item.icon && <span>{item.icon}</span>}
          {itemValue}
        </div>
      );
    })}
  </div>
);

// 7. PinScreen component
const PinScreen = ({ mode, savedPin, onSuccess, onCancel }) => {
  const [digits, setDigits] = useState("");
  const [step, setStep] = useState(mode === "set" ? "enter" : "verify");
  const [firstPin, setFirstPin] = useState("");
  const [error, setError] = useState("");

  const handleTap = useCallback((digit) => {
    setError("");
    setDigits((prev) => {
      if (prev.length >= 4) return prev;
      const newDigits = prev + digit;
      if (newDigits.length === 4) {
        setTimeout(() => {
          if (step === "verify") {
            if (newDigits === savedPin) {
              onSuccess();
            } else {
              setError("Incorrect PIN");
              setDigits("");
            }
          } else if (step === "enter") {
            setFirstPin(newDigits);
            setStep("confirm");
            setDigits("");
          } else if (step === "confirm") {
            if (newDigits === firstPin) {
              onSuccess(newDigits);
            } else {
              setError("PINs do not match");
              setDigits("");
              setStep("enter");
              setFirstPin("");
            }
          }
        }, 150);
      }
      return newDigits;
    });
  }, [step, savedPin, firstPin, onSuccess]);

  const handleDelete = useCallback(() => {
    setError("");
    setDigits((prev) => prev.slice(0, -1));
  }, []);

  const keypad = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "",
    "0",
    "⌫",
  ];

  const titleText = step === "enter" ? "Set Your PIN" : step === "confirm" ? "Confirm Your PIN" : "Enter Your PIN";
  const subtitleText = step === "enter" ? "Choose a 4-digit PIN to secure your app." : step === "confirm" ? "Re-enter your PIN to confirm." : "Please enter your 4-digit PIN to unlock.";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
        background: "linear-gradient(135deg,#1E3A5F,#2D6A9F)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div style={{ fontSize: "44px", marginBottom: "16px" }}>🔒</div>
      <div style={{ fontSize: "20px", fontWeight: 800 }}>{titleText}</div>
      <div
        style={{
          fontSize: "13px",
          opacity: 0.7,
          padding: "0 40px",
          textAlign: "center",
          marginBottom: "32px",
        }}
      >
        {subtitleText}
      </div>
      <div style={{ display: "flex", gap: "14px", marginBottom: "24px" }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              backgroundColor:
                digits.length > i
                  ? "white"
                  : "rgba(255,255,255,0.3)",
              transition: "background 0.15s",
            }}
          ></div>
        ))}
      </div>
      <div style={{ height: "24px", marginBottom: "16px" }}>
        {error && (
          <div
            style={{
              fontSize: "12px",
              color: "#FF9E9E",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,72px)",
          gap: "14px",
        }}
      >
        {keypad.map((key, index) =>
          key === "" ? (
            <div key={index}></div>
          ) : (
            <button
              key={key}
              onClick={() => (key === "⌫" ? handleDelete() : handleTap(key))}
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                backgroundColor:
                  key === "⌫"
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(255,255,255,0.15)",
                color: "white",
                fontSize: key === "⌫" ? "20px" : "24px",
                fontWeight: 700,
                fontFamily: "inherit",
              }}
            >
              {key}
            </button>
          )
        )}
      </div>
      {onCancel && (
        <button
          onClick={onCancel}
          style={{
            marginTop: "28px",
            backgroundColor: "transparent",
            border: "none",
            color: "white",
            fontSize: "14px",
            cursor: "pointer",
            fontFamily: "inherit",
            opacity: 0.8,
          }}
        >
          Cancel
        </button>
      )}
    </div>
  );
};

// 8. calcAccountBalances utility function with memoization
const calcAccountBalances = (accounts, transactions) => {
  return accounts.map((account) => {
    let balance = parseFloat(account.opening) || 0;
    transactions.forEach((tx) => {
      const amount = parseFloat(tx.amount) || 0;
      if (tx.type === "income" && tx.account === account.name) {
        balance += amount;
      } else if (tx.type === "expense" && tx.account === account.name) {
        balance -= amount;
      } else if (tx.type === "transfer") {
        if (tx.account === account.name) {
          balance -= amount;
        }
        if (tx.toAccount === account.name) {
          balance += amount;
        }
      }
    });
    return { ...account, balance };
  });
};

// 9. Dashboard component
const Dashboard = ({ transactions, loans, accounts, declaredAmount, manualCheck }) => {
  const accountBalances = useMemo(() => calcAccountBalances(accounts, transactions), [accounts, transactions]);
  
  const { totalIncome, totalExpense } = useMemo(() => {
    const income = transactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);
    const expense = transactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);
    return { totalIncome: income, totalExpense: expense };
  }, [transactions]);

  const totalTracked = useMemo(() => {
    return accountBalances.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  }, [accountBalances]);

  const { pendingGave, pendingTook } = useMemo(() => {
    const gave = loans
      .filter((loan) => loan.type === "gave" && loan.status === "pending")
      .reduce((sum, loan) => sum + (parseFloat(loan.amount) || 0), 0);
    const took = loans
      .filter((loan) => loan.type === "took" && loan.status === "pending")
      .reduce((sum, loan) => sum + (parseFloat(loan.amount) || 0), 0);
    return { pendingGave: gave, pendingTook: took };
  }, [loans]);

  const declaredDiff = (declaredAmount || 0) - totalTracked;
  const manualDiff = (manualCheck || 0) - totalTracked;

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  return (
    <div>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg,#1E3A5F,#2D6A9F)",
          padding: "28px 20px 72px",
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "11px",
                opacity: 0.65,
                letterSpacing: "1px",
              }}
            >
              {currentMonthYear()}
            </div>
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
            }}
          >
            👤
          </div>
        </div>

        {/* Balance Card */}
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.13)",
            borderRadius: "20px",
            padding: "18px 20px",
            border: "1px solid rgba(255,255,255,0.18)",
            marginTop: "20px",
          }}
        >
          <div style={{ fontSize: "12px", opacity: 0.7, marginBottom: "4px" }}>
            Total Available
          </div>
          <div
            style={{
              fontSize: "36px",
              fontWeight: 800,
              letterSpacing: "-1px",
              color: totalTracked >= 0 ? "#7EFFC5" : "#FF9E9E",
            }}
          >
            {fmt(totalTracked)}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginTop: "16px",
            }}
          >
            <div
              style={{
                flex: 1,
                borderRight: "1px solid rgba(255,255,255,0.2)",
                paddingRight: "14px",
              }}
            >
              <div style={{ fontSize: "12px", opacity: 0.7 }}>↑ INCOME</div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#1DB954" }}>
                {fmt(totalIncome)}
              </div>
            </div>
            <div style={{ flex: 1, paddingLeft: "14px" }}>
              <div style={{ fontSize: "12px", opacity: 0.7 }}>↓ EXPENSE</div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#E53E3E" }}>
                {fmt(totalExpense)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "0 16px", marginTop: "-36px", marginBottom: "80px", maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
        {/* Accounts card */}
        {accounts.length > 0 && (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "18px",
              padding: "16px",
              marginBottom: "14px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                marginBottom: "12px",
              }}
            >
              🏦 My Accounts
            </div>
            {accountBalances.map((account) => (
              <div
                key={account.id}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "12px",
                  marginBottom: "10px",
                  alignItems: "center",
                }}
              >
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
                  {account.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#222",
                    }}
                  >
                    {account.name}
                  </div>
                  <div style={{ fontSize: "11px", color: "#AAA" }}>
                    {account.type}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 800,
                    color: account.balance >= 0 ? "#1E3A5F" : "#E53E3E",
                  }}
                >
                  {fmt(account.balance)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loan Snapshot */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "10px",
            marginBottom: "14px",
          }}
        >
          <div
            style={{
              flex: 1,
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "14px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              borderTop: "3px solid #1DB954",
            }}
          >
            <div style={{ fontSize: "11px", color: "#999", marginBottom: "4px" }}>
              🟢 They owe me
            </div>
            <div style={{ fontSize: "17px", fontWeight: 800, color: "#1DB954" }}>
              {fmt(pendingGave)}
            </div>
          </div>
          <div
            style={{
              flex: 1,
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "14px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              borderTop: "3px solid #E53E3E",
            }}
          >
            <div style={{ fontSize: "11px", color: "#999", marginBottom: "4px" }}>
              🔴 I owe them
            </div>
            <div style={{ fontSize: "17px", fontWeight: 800, color: "#E53E3E" }}>
              {fmt(pendingTook)}
            </div>
          </div>
        </div>

        {/* Wealth Overview card */}
        {declaredAmount > 0 && (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "18px",
              padding: "16px",
              marginBottom: "14px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                marginBottom: "12px",
              }}
            >
              💼 Wealth Overview
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#1E3A5F" }}>
                Declared Total
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#1E3A5F" }}>
                {fmt(declaredAmount)}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#2D6A9F" }}>
                Currently Tracked
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#2D6A9F" }}>
                {fmt(totalTracked)}
              </div>
            </div>
            <div
              style={{
                borderBottom: "1px solid #F0F0F0",
                marginBottom: "10px",
              }}
            ></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {
                declaredDiff > 0 ? (
                  <>
                    <div style={{ color: "#E53E3E" }}>▼ Untracked amount</div>
                    <div
                      style={{
                        color: "#E53E3E",
                        fontSize: "15px",
                        fontWeight: 800,
                      }}
                    >
                      {fmt(Math.abs(declaredDiff))} missing
                    </div>
                  </>
                ) : declaredDiff < 0 ? (
                  <>
                    <div style={{ color: "#E07B54" }}>
                      ▲ More tracked than declared
                    </div>
                    <div
                      style={{
                        color: "#E07B54",
                        fontSize: "15px",
                        fontWeight: 800,
                      }}
                    >
                      {fmt(Math.abs(declaredDiff))} over
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ color: "#1DB954" }}>✓ Balanced</div>
                    <div
                      style={{
                        color: "#1DB954",
                        fontSize: "15px",
                        fontWeight: 800,
                      }}
                    >
                      Balanced
                    </div>
                  </>
                )
              }
            </div>
          </div>
        )}

        {/* Manual Check card */}
        {manualCheck > 0 && (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "18px",
              padding: "16px",
              marginBottom: "14px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              borderTop:
                manualDiff === 0
                  ? "3px solid #1DB954"
                  : manualDiff > 0
                  ? "3px solid #E07B54"
                  : "3px solid #E53E3E",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                marginBottom: "12px",
              }}
            >
              🔎 Manual Check
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#1E3A5F" }}>
                App Calculated
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#1E3A5F" }}>
                {fmt(totalTracked)}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#2D6A9F" }}>
                Your Count
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#2D6A9F" }}>
                {fmt(manualCheck)}
              </div>
            </div>
            <div
              style={{
                borderBottom: "1px solid #F0F0F0",
                marginBottom: "10px",
              }}
            ></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {
                manualDiff > 0 ? (
                  <>
                    <div style={{ color: "#E07B54" }}>▲ You counted more</div>
                    <div
                      style={{
                        color: "#E07B54",
                        fontSize: "15px",
                        fontWeight: 800,
                      }}
                    >
                      {fmt(Math.abs(manualDiff))} extra
                    </div>
                  </>
                ) : manualDiff < 0 ? (
                  <>
                    <div style={{ color: "#E53E3E" }}>▼ You counted less</div>
                    <div
                      style={{
                        color: "#E53E3E",
                        fontSize: "15px",
                        fontWeight: 800,
                      }}
                    >
                      {fmt(Math.abs(manualDiff))} short
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ color: "#1DB954" }}>✓ Perfect Match</div>
                    <div
                      style={{
                        color: "#1DB954",
                        fontSize: "15px",
                        fontWeight: 800,
                      }}
                    >
                      Balanced
                    </div>
                  </>
                )
              }
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

        {/* Recent Transactions */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "18px",
            padding: "16px",
            marginBottom: "80px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: 700,
              marginBottom: "12px",
            }}
          >
            Recent Transactions
          </div>
          {recentTransactions.length === 0 ? (
            <div style={{ textAlign: "center", color: "#CCC" }}>
              No transactions yet
            </div>
          ) : (
            recentTransactions.map((tx, index) => (
              <div
                key={tx.id}
                style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "12px",
                  alignItems: "center",
                  borderBottom:
                    index < recentTransactions.length - 1
                      ? "1px solid #F5F5F5"
                      : "none",
                  paddingBottom: "12px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    backgroundColor:
                      tx.type === "income"
                        ? "#E8FBF0"
                        : tx.type === "expense"
                        ? "#FFF0F0"
                        : "#F3EEFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                  }}
                >
                  {tx.icon}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#222",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {tx.type === "transfer"
                      ? `${tx.account} → ${tx.toAccount}`
                      : tx.category}
                  </div>
                  <div style={{ fontSize: "11px", color: "#AAA" }}>
                    {tx.type === "transfer"
                      ? "Transfer"
                      : tx.note || tx.account}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    flexShrink: 0,
                    color:
                      tx.type === "income"
                        ? "#1DB954"
                        : tx.type === "expense"
                        ? "#E53E3E"
                        : "#7B5EA7",
                  }}
                >
                  {tx.type === "expense" && "-"}
                  {tx.type === "transfer" && "⇄"}
                  {fmt(tx.amount)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// 10. EMPTY_TX constant + Transactions component
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

const Transactions = ({ transactions, setTransactions, accounts }) => {
  const [search, setSearch] = useState("");
  const [showSheet, setShowSheet] = useState(false);
  const [form, setForm] = useState(EMPTY_TX);
  const [editId, setEditId] = useState(null);
  const [delId, setDelId] = useState(null);

  const accountNames = accounts.map((acc) => acc.name);

  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    setSearch(value);
    if (value.trim().toLowerCase() === "create") {
      setTimeout(() => {
        setSearch("");
        setForm(EMPTY_TX);
        setShowSheet(true);
      }, 200);
    }
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        (tx.category || "").toLowerCase().includes(s) ||
        (tx.note || "").toLowerCase().includes(s) ||
        (tx.account || "").toLowerCase().includes(s) ||
        ((tx.toAccount || "").toLowerCase().includes(s))
      );
    });
  }, [transactions, search]);

  const groupedTransactions = useMemo(() => {
    return filteredTransactions.reduce((acc, tx) => {
      const dateLabel = tx.date === todayStr() ? "Today" : tx.date === yesterdayStr() ? "Yesterday" : tx.date;
      if (!acc[dateLabel]) {
        acc[dateLabel] = [];
      }
      acc[dateLabel].push(tx);
      return acc;
    }, {});
  }, [filteredTransactions]);

  const handleSave = useCallback(() => {
    const amount = parseFloat(form.amount);
    if (!form.amount || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    let newTx;
    if (form.type === "transfer") {
      if (!form.account || !form.toAccount || form.account === form.toAccount) {
        alert("Please select different accounts");
        return;
      }
      newTx = {
        id: editId || Date.now(),
        type: "transfer",
        category: "Transfer",
        icon: "⇄",
        amount: amount,
        note: form.note,
        date: form.date,
        account: form.account,
        toAccount: form.toAccount,
        method: "",
      };
    } else {
      if (!form.category || !form.account) {
        alert("Please fill all required fields");
        return;
      }
      const categoryIcon = TX_CATS[form.type].find(cat => cat.l === form.category)?.icon || "📦";
      newTx = {
        ...form,
        id: editId || Date.now(),
        amount: amount,
        icon: categoryIcon,
        toAccount: "",
      };
    }
    if (editId) {
      setTransactions((prev) => prev.map((tx) => tx.id === editId ? newTx : tx));
    } else {
      setTransactions((prev) => [newTx, ...prev]);
    }
    setShowSheet(false);
    setEditId(null);
    setForm(EMPTY_TX);
  }, [form, editId, setTransactions]);

  return (
    <div>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg,#1E3A5F,#2D6A9F)",
          padding: "28px 20px 20px",
          color: "white",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            opacity: 0.65,
            letterSpacing: "1px",
          }}
        >
          {currentMonthYear()}
        </div>
        <div style={{ fontSize: "21px", fontWeight: 800, marginBottom: "14px" }}>
          Transactions
        </div>
        <SearchBar
          value={search}
          onChange={handleSearch}
          onClear={() => setSearch("")}
        />
      </div>

      {/* List area */}
      <div style={{ padding: "14px 16px", marginBottom: "80px", maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
        {Object.keys(groupedTransactions).length === 0 ? (
          <div style={{ textAlign: "center", color: "#CCC", padding: "40px 0" }}>
            {search ? "🔍 No results found" : "No transactions yet"}
          </div>
        ) : (
          Object.entries(groupedTransactions).map(([dateLabel, txs]) => (
            <div key={dateLabel} style={{ marginBottom: "20px" }}>
              <div
                style={{
                  fontSize: "11px",
                  color: "#999",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                {dateLabel}
              </div>
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "18px",
                  padding: "4px 14px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                {txs.map((tx, index) => (
                  <div key={tx.id} style={{ borderBottom: index < txs.length - 1 ? "1px solid #F5F5F5" : "none", padding: "12px 0" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "center",
                      }}
                    >
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "13px",
                        backgroundColor:
                          tx.type === "income"
                            ? "#E8FBF0"
                            : tx.type === "expense"
                            ? "#FFF0F0"
                            : "#F3EEFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                      }}
                    >
                      {tx.icon}
                    </div>
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#222",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {tx.type === "transfer"
                          ? `${tx.account} → ${tx.toAccount}`
                          : tx.category}
                      </div>
                      <div style={{ fontSize: "11px", color: "#AAA" }}>
                        {tx.type === "transfer"
                          ? "Transfer"
                          : `${tx.account} · ${tx.method}`}
                      </div>
                      {tx.note && tx.type !== "transfer" && (
                        <div style={{ fontSize: "11px", color: "#BBB" }}>
                          {tx.note}
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        flexShrink: 0,
                        color:
                          tx.type === "income"
                            ? "#1DB954"
                            : tx.type === "expense"
                            ? "#E53E3E"
                            : "#7B5EA7",
                      }}
                    >
                      {tx.type === "expense" && "-"}
                      {tx.type === "transfer" && "⇄"}
                      {fmt(tx.amount)}
                    </div>
                    <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                      <button onClick={() => { setForm({ ...tx, amount: String(tx.amount) }); setEditId(tx.id); setShowSheet(true); }}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "15px", padding: "4px" }}>✏️</button>
                      <button onClick={() => setDelId(delId === tx.id ? null : tx.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "15px", padding: "4px" }}>🗑</button>
                    </div>
                  </div>
                  {delId === tx.id && (
                    <div style={{ backgroundColor: "#FFF5F5", border: "1px solid #FFE8E8", borderRadius: "12px", padding: "12px", marginTop: "8px", textAlign: "center" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#E53E3E", marginBottom: "8px" }}>Delete this transaction?</div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <FBtn outline color="#999" onClick={() => setDelId(null)} style={{ flex: 1, padding: "8px", fontSize: "12px" }}>Cancel</FBtn>
                        <FBtn bg="#E53E3E" onClick={() => { setTransactions(prev => prev.filter(t => t.id !== tx.id)); setDelId(null); }} style={{ flex: 1, padding: "8px", fontSize: "12px" }}>Delete</FBtn>
                      </div>
                    </div>
                  )}
                </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => {
          setForm(EMPTY_TX);
          setEditId(null);
          setShowSheet(true);
        }}
        style={{
          position: "fixed",
          bottom: "90px",
          right: `calc(50% - 210px + 16px)`,
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "linear-gradient(135deg,#2D6A9F,#1E3A5F)",
          color: "white",
          fontSize: "28px",
          border: "none",
          boxShadow: "0 4px 20px rgba(30,58,95,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        +
      </button>

      {/* Add Transaction Sheet */}
      <Sheet show={showSheet} onClose={() => setShowSheet(false)}>
        <div style={{ padding: "0 16px" }}>
          <h3 style={{ marginTop: 0, marginBottom: "20px", fontSize: "18px", fontWeight: 700 }}>
            {editId ? "Edit Transaction" : "Add Transaction"}
          </h3>
          <TypeToggle
            options={[
              ["expense", "↓ Expense"],
              ["income", "↑ Income"],
              ["transfer", "⇄ Transfer"],
            ]}
            value={form.type}
            onChange={(type) => setForm({ ...EMPTY_TX, type })}
            colors={{
              expense: "#E53E3E",
              income: "#1DB954",
              transfer: "#7B5EA7",
            }}
          />

          {form.type === "transfer" ? (
            <>
              <Label>AMOUNT</Label>
              <FInput
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                style={{ fontSize: "20px", fontWeight: 800, marginBottom: "12px" }}
              />
              <Label>FROM ACCOUNT</Label>
              {accountNames.length === 0 ? (
                <div style={{ backgroundColor: "#FFF8F0", color: "#E07B54", padding: "8px 12px", borderRadius: "10px", fontSize: "12px", marginBottom: "12px" }}>
                  Please add an account in Settings.
                </div>
              ) : (
                <ChipRow
                  items={accountNames}
                  value={form.account}
                  onChange={(acc) => setForm({ ...form, account: acc })}
                  activeColor="#7B5EA7"
                  activeBg="#F3EEFF"
                />
              )}
              <div style={{ textAlign: "center", fontSize: "20px", color: "#7B5EA7", margin: "10px 0" }}>
                ⬇
              </div>
              <Label>TO ACCOUNT</Label>
              {accountNames.length === 0 ? (
                <div style={{ backgroundColor: "#FFF8F0", color: "#E07B54", padding: "8px 12px", borderRadius: "10px", fontSize: "12px", marginBottom: "12px" }}>
                  Please add an account in Settings.
                </div>
              ) : (
                <ChipRow
                  items={accountNames.filter((name) => name !== form.account)}
                  value={form.toAccount}
                  onChange={(acc) => setForm({ ...form, toAccount: acc })}
                  activeColor="#7B5EA7"
                  activeBg="#F3EEFF"
                />
              )}
              <Label>NOTE (OPTIONAL)</Label>
              <FInput
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                style={{ marginBottom: "12px" }}
              />
              <Label>DATE</Label>
              <FInput
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                style={{ marginBottom: "20px" }}
              />
              <FBtn onClick={handleSave}>Save Transfer</FBtn>
            </>
          ) : (
            <>
              <Label>AMOUNT</Label>
              <FInput
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                style={{ fontSize: "20px", fontWeight: 800, marginBottom: "12px" }}
              />
              <Label>CATEGORY</Label>
              <ChipRow
                items={TX_CATS[form.type]}
                value={form.category}
                onChange={(cat) =>
                  setForm({
                    ...form,
                    category: cat,
                    icon: TX_CATS[form.type].find((c) => c.l === cat)?.icon || "📦",
                  })
                }
                activeColor={form.type === "income" ? "#1DB954" : "#E53E3E"}
                activeBg={form.type === "income" ? "#E8FBF0" : "#FFF0F0"}
              />
              <Label>
                {form.type === "income" ? "RECEIVED IN" : "PAID FROM"}
              </Label>
              {accountNames.length === 0 ? (
                <div style={{ backgroundColor: "#FFF8F0", color: "#E07B54", padding: "8px 12px", borderRadius: "10px", fontSize: "12px", marginBottom: "12px" }}>
                  Please add an account in Settings.
                </div>
              ) : (
                <ChipRow
                  items={accountNames}
                  value={form.account}
                  onChange={(acc) => setForm({ ...form, account: acc })}
                  activeColor={form.type === "income" ? "#1DB954" : "#E53E3E"}
                  activeBg={form.type === "income" ? "#E8FBF0" : "#FFF0F0"}
                />
              )}
              <Label>HOW</Label>
              <ChipRow
                items={form.type === "income" ? INCOME_METHODS : EXPENSE_METHODS}
                value={form.method}
                onChange={(method) => setForm({ ...form, method: method })}
                activeColor={form.type === "income" ? "#1DB954" : "#E53E3E"}
                activeBg={form.type === "income" ? "#E8FBF0" : "#FFF0F0"}
              />
              <Label>NOTE (OPTIONAL)</Label>
              <FInput
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                style={{ marginBottom: "12px" }}
              />
              <Label>DATE</Label>
              <FInput
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                style={{ marginBottom: "20px" }}
              />
              <FBtn onClick={handleSave}>Save {form.type}</FBtn>
            </>
          )}
        </div>
      </Sheet>
    </div>
  );
};

// 11. EMPTY_LOAN constant + Loans component
const EMPTY_LOAN = {
  type: "took",
  name: "",
  amount: "",
  reason: "",
  date: todayStr(),
  status: "pending",
};

const Loans = ({ loans, setLoans }) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showSheet, setShowSheet] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_LOAN);
  const [delId, setDelId] = useState(null);

  const { totalTook, totalGave, net } = useMemo(() => {
    const took = loans
      .filter((loan) => loan.type === "took" && loan.status === "pending")
      .reduce((sum, loan) => sum + (parseFloat(loan.amount) || 0), 0);
    const gave = loans
      .filter((loan) => loan.type === "gave" && loan.status === "pending")
      .reduce((sum, loan) => sum + (parseFloat(loan.amount) || 0), 0);
    return { totalTook: took, totalGave: gave, net: gave - took };
  }, [loans]);

  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    setSearch(value);
    if (value.trim().toLowerCase() === "create") {
      setTimeout(() => {
        setSearch("");
        setForm(EMPTY_LOAN);
        setEditId(null);
        setShowSheet(true);
      }, 200);
    }
  }, []);

  const visibleLoans = useMemo(() => {
    return loans
      .filter((loan) => {
        if (filter === "took" && loan.type !== "took") return false;
        if (filter === "gave" && loan.type !== "gave") return false;
        if (!search) return true;
        const s = search.toLowerCase();
        return ((loan.name || "").toLowerCase().includes(s) || (loan.reason || "").toLowerCase().includes(s));
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [loans, filter, search]);

  const handleSaveLoan = useCallback(() => {
    const amount = parseFloat(form.amount);
    if (!form.name || !form.amount || amount <= 0) {
      alert("Please fill all required fields with valid amount");
      return;
    }

    const newLoan = {
      ...form,
      amount: amount,
      id: editId || Date.now(),
    };

    if (editId) {
      setLoans((prev) => prev.map((loan) => (loan.id === editId ? newLoan : loan)));
    } else {
      setLoans((prev) => [newLoan, ...prev]);
    }
    setShowSheet(false);
    setEditId(null);
    setForm(EMPTY_LOAN);
  }, [form, editId, setLoans]);

  const toggleStatus = useCallback((id) => {
    setLoans((prev) =>
      prev.map((loan) =>
        loan.id === id
          ? { ...loan, status: loan.status === "pending" ? "returned" : "pending" }
          : loan
      )
    );
  }, [setLoans]);

  const removeLoan = useCallback((id) => {
    setLoans((prev) => prev.filter((loan) => loan.id !== id));
    setDelId(null);
  }, [setLoans]);

  return (
    <div>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg,#1E3A5F,#2D6A9F)",
          padding: "28px 20px 20px",
          color: "white",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            opacity: 0.65,
            letterSpacing: "1px",
          }}
        >
          {currentMonthYear()}
        </div>
        <div style={{ fontSize: "21px", fontWeight: 800, marginBottom: "14px" }}>Loans</div>

        {/* Net Position Card */}
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
            }}
          >
            {net >= 0 && "+"}{fmt(net)}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "20px",
              marginTop: "10px",
            }}
          >
            <div>
              <div style={{ fontSize: "12px", opacity: 0.7 }}>🔴 I OWE</div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#E53E3E" }}>
                {fmt(totalTook)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "12px", opacity: 0.7 }}>🟢 THEY OWE</div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#1DB954" }}>
                {fmt(totalGave)}
              </div>
            </div>
          </div>
        </div>

        <SearchBar
          value={search}
          onChange={handleSearch}
          onClear={() => setSearch("")}
        />
      </div>

      {/* Content */}
      <div style={{ padding: "14px 16px", marginBottom: "80px", maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
        {/* Filter tabs */}
        <div
          style={{
            display: "flex",
            backgroundColor: "white",
            borderRadius: "14px",
            padding: "4px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            gap: "4px",
            marginBottom: "14px",
          }}
        >
          {[["all", "All"], ["took", "🔴 I Took"], ["gave", "🟢 I Gave"]].map(
            ([filterValue, label]) => (
              <button
                key={filterValue}
                onClick={() => setFilter(filterValue)}
                style={{
                  flex: 1,
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 4px",
                  fontWeight: 700,
                  fontSize: "12px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  background:
                    filter === filterValue
                      ? "linear-gradient(135deg,#2D6A9F,#1E3A5F)"
                      : "transparent",
                  color: filter === filterValue ? "white" : "#888",
                }}
              >
                {label}
              </button>
            )
          )}
        </div>

        {visibleLoans.length === 0 ? (
          <div style={{ textAlign: "center", color: "#CCC", padding: "40px 0" }}>
            {search ? "📭 No results found" : "No loans here"}
          </div>
        ) : (
          visibleLoans.map((loan) => (
            <div
              key={loan.id}
              style={{
                backgroundColor: "white",
                borderRadius: "18px",
                padding: "14px 16px",
                marginBottom: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                borderLeft:
                  loan.type === "took" ? "4px solid #E53E3E" : "4px solid #1DB954",
                opacity: loan.status === "returned" ? 0.65 : 1,
              }}
            >
              <div style={{ display: "flex", gap: "12px" }}>
                <div
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "50%",
                    backgroundColor: avatarColor(loan.name),
                    color: "white",
                    fontWeight: 800,
                    fontSize: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {loan.name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "#1A1A2E",
                      }}
                    >
                      {loan.name}
                    </div>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "20px",
                        backgroundColor:
                          loan.status === "pending" ? "#FFF8F0" : "#E8FBF0",
                        color: loan.status === "pending" ? "#E07B54" : "#1DB954",
                      }}
                    >
                      {loan.status === "pending" ? "Pending" : "Returned"}
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>
                    {loan.reason}
                  </div>
                  <div style={{ fontSize: "11px", color: "#BBB", marginTop: "1px" }}>
                    {loan.date}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "17px",
                      fontWeight: 800,
                      color: loan.type === "took" ? "#E53E3E" : "#1DB954",
                    }}
                  >
                    {loan.type === "took" ? "-" : "+"}{fmt(loan.amount)}
                  </div>
                  <div style={{ fontSize: "11px", color: "#BBB" }}>
                    {loan.type === "took" ? "I owe" : "They owe"}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginTop: "12px",
                  paddingTop: "10px",
                  borderTop: "1px solid #F5F5F5",
                }}
              >
                <FBtn
                  outline={loan.status === "pending"}
                  bg={loan.status === "pending" ? "#E8FBF0" : "#F9F9F9"}
                  color={loan.status === "pending" ? "#1DB954" : "#999"}
                  onClick={() => toggleStatus(loan.id)}
                  style={{ flex: 1, padding: "8px 12px", fontSize: "12px" }}
                >
                  {loan.status === "pending" ? "✓ Settled" : "↩ Pending"}
                </FBtn>
                <FBtn
                  outline
                  bg="#F5F8FF"
                  color="#2D6A9F"
                  onClick={() => {
                    setForm({ ...loan, amount: String(loan.amount) });
                    setEditId(loan.id);
                    setShowSheet(true);
                  }}
                  style={{ flex: 1, padding: "8px 12px", fontSize: "12px" }}
                >
                  ✏️ Edit
                </FBtn>
                <FBtn
                  outline
                  bg="#FFF5F5"
                  color="#E53E3E"
                  onClick={() => setDelId(loan.id)}
                  style={{ flex: 1, padding: "8px 12px", fontSize: "12px" }}
                >
                  🗑
                </FBtn>
              </div>

              {delId === loan.id && (
                <div
                  style={{
                    backgroundColor: "#FFF5F5",
                    border: "1px solid #FFE8E8",
                    borderRadius: "12px",
                    padding: "14px",
                    marginTop: "12px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#E53E3E",
                      marginBottom: "10px",
                    }}
                  >
                    Delete this loan?
                  </div>
                  <div style={{ fontSize: "13px", color: "#999", marginBottom: "10px" }}>
                    This cannot be undone.
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <FBtn
                      outline
                      color="#999"
                      onClick={() => setDelId(null)}
                      style={{ flex: 1, padding: "8px 12px", fontSize: "12px" }}
                    >
                      Cancel
                    </FBtn>
                    <FBtn
                      bg="#E53E3E"
                      onClick={() => removeLoan(loan.id)}
                      style={{ flex: 1, padding: "8px 12px", fontSize: "12px" }}
                    >
                      Delete
                    </FBtn>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => {
          setForm(EMPTY_LOAN);
          setEditId(null);
          setShowSheet(true);
        }}
        style={{
          position: "fixed",
          bottom: "90px",
          right: `calc(50% - 210px + 16px)`,
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "linear-gradient(135deg,#2D6A9F,#1E3A5F)",
          color: "white",
          fontSize: "28px",
          border: "none",
          boxShadow: "0 4px 20px rgba(30,58,95,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        +
      </button>

      {/* Add/Edit Loan Sheet */}
      <Sheet show={showSheet} onClose={() => setShowSheet(false)}>
        <div style={{ padding: "0 16px" }}>
          <h3 style={{ marginTop: 0, marginBottom: "20px", fontSize: "18px", fontWeight: 700 }}>
            {editId ? "Edit Loan" : "Add Loan"}
          </h3>
          <TypeToggle
            options={[
              ["took", "🔴 I Took"],
              ["gave", "🟢 I Gave"],
            ]}
            value={form.type}
            onChange={(type) => setForm({ ...form, type })}
            colors={{
              took: "#E53E3E",
              gave: "#1DB954",
            }}
          />
          <Label>PERSON'S NAME</Label>
          <FInput
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{ marginBottom: "12px" }}
          />
          <Label>AMOUNT</Label>
          <FInput
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}
          />
          <Label>REASON (OPTIONAL)</Label>
          <FInput
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            style={{ marginBottom: "12px" }}
          />
          <Label>DATE</Label>
          <FInput
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            style={{ marginBottom: "12px" }}
          />
          <Label>STATUS</Label>
          <div style={{ display: "flex", flexDirection: "row", gap: "8px", marginBottom: "20px" }}>
            <FBtn
              outline={form.status !== "pending"}
              bg={form.status === "pending" ? "#EEF4FB" : "white"}
              color={form.status === "pending" ? "#2D6A9F" : "#999"}
              onClick={() => setForm({ ...form, status: "pending" })}
              style={{ flex: 1, padding: "8px 12px", fontSize: "12px" }}
            >
              ⏳ Pending
            </FBtn>
            <FBtn
              outline={form.status !== "returned"}
              bg={form.status === "returned" ? "#EEF4FB" : "white"}
              color={form.status === "returned" ? "#2D6A9F" : "#999"}
              onClick={() => setForm({ ...form, status: "returned" })}
              style={{ flex: 1, padding: "8px 12px", fontSize: "12px" }}
            >
              ✓ Settled
            </FBtn>
          </div>
          <FBtn onClick={handleSaveLoan}>{editId ? "Update Loan" : "Save Loan"}</FBtn>
        </div>
      </Sheet>
    </div>
  );
};

// 12. Settings component
const Settings = ({
  accounts,
  setAccounts,
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
}) => {
  const [section, setSection] = useState(null);
  const [accForm, setAccForm] = useState({
    name: "",
    type: "Cash",
    icon: "💵",
    opening: "",
  });
  const [editAccId, setEditAccId] = useState(null);
  const [delAccId, setDelAccId] = useState(null);
  const [showPinSet, setShowPinSet] = useState(false);

  const [daTemp, setDaTemp] = useState("");
  const [goalTemp, setGoalTemp] = useState("");
  const [mcTemp, setMcTemp] = useState("");

  const saveAccount = useCallback(() => {
    if (!accForm.name) {
      alert("Please enter account name");
      return;
    }
    const openingVal = parseFloat(String(accForm.opening).replace(/,/g, "")) || 0;
    const newAccount = {
      ...accForm,
      opening: openingVal,
      id: editAccId || Date.now(),
    };
    if (editAccId) {
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === editAccId ? newAccount : acc))
      );
    } else {
      setAccounts((prev) => [...prev, newAccount]);
    }
    setAccForm({ name: "", type: "Cash", icon: "💵", opening: "" });
    setEditAccId(null);
    setSection(null);
  }, [accForm, editAccId, setAccounts]);

  const deleteAccount = useCallback((id) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== id));
    setDelAccId(null);
  }, [setAccounts]);

  const startEditAccount = useCallback((account) => {
    setAccForm({ ...account, opening: String(account.opening) });
    setEditAccId(account.id);
  }, []);

  const toggle = (key) => setSection((s) => (s === key ? null : key));

  const cardStyle = {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "16px",
    marginBottom: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  };

  const menuRowStyle = {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "15px 16px",
    marginBottom: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    display: "flex",
    gap: "14px",
    alignItems: "center",
    cursor: "pointer",
  };

  const menuRowStaticStyle = { ...menuRowStyle, cursor: "default" };

  const iconBoxStyle = {
    width: "44px",
    height: "44px",
    borderRadius: "13px",
    backgroundColor: "#F0F4F8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
  };

  const chevron = (key) => (
    <div
      style={{
        color: "#CCC",
        fontSize: "18px",
        transform: section === key ? "rotate(90deg)" : "rotate(0deg)",
        transition: "transform 0.2s",
      }}
    >
      ›
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg,#1E3A5F,#2D6A9F)",
          padding: "28px 20px",
          color: "white",
        }}
      >
        <div style={{ fontSize: "11px", opacity: 0.65, letterSpacing: "1px" }}>
          PREFERENCES
        </div>
        <div style={{ fontSize: "21px", fontWeight: 800 }}>Settings</div>
      </div>

      {/* Menu Items */}
      <div style={{ padding: "16px", marginBottom: "80px", maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>

        {/* ACCOUNTS */}
        <div onClick={() => toggle("accounts")} style={menuRowStyle}>
          <div style={iconBoxStyle}>🏦</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#222" }}>Manage Accounts</div>
            <div style={{ fontSize: "12px", color: "#999", marginTop: "1px" }}>{accounts.length} account(s)</div>
          </div>
          {chevron("accounts")}
        </div>
        {section === "accounts" && (
          <div style={cardStyle}>
            <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px" }}>My Accounts</div>
            {accounts.map((account) => (
              <div
                key={account.id}
                style={{
                  backgroundColor: "#F8FAFC",
                  borderRadius: "12px",
                  padding: "10px 12px",
                  marginBottom: "10px",
                }}
              >
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <div style={{ fontSize: "22px" }}>{account.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: 600 }}>{account.name}</div>
                    <div style={{ fontSize: "11px", color: "#AAA" }}>{account.type} · {fmt(account.opening)}</div>
                  </div>
                  <FBtn outline color="#2D6A9F" onClick={() => startEditAccount(account)} style={{ padding: "6px 10px", fontSize: "11px", width: "auto" }}>Edit</FBtn>
                  <FBtn outline color="#E53E3E" onClick={() => setDelAccId(account.id)} style={{ padding: "6px 10px", fontSize: "11px", width: "auto" }}>🗑</FBtn>
                </div>
                {delAccId === account.id && (
                  <div style={{ backgroundColor: "#FFF5F5", border: "1px solid #FFE8E8", borderRadius: "12px", padding: "14px", marginTop: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#E53E3E", marginBottom: "10px" }}>Delete this account?</div>
                    <div style={{ fontSize: "13px", color: "#999", marginBottom: "10px" }}>This cannot be undone.</div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <FBtn outline color="#999" onClick={() => setDelAccId(null)} style={{ flex: 1, padding: "8px 12px", fontSize: "12px" }}>Cancel</FBtn>
                      <FBtn bg="#E53E3E" onClick={() => deleteAccount(account.id)} style={{ flex: 1, padding: "8px 12px", fontSize: "12px" }}>Delete</FBtn>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div style={{ paddingTop: "12px", borderTop: "1px solid #F0F0F0", marginTop: "12px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#555", marginBottom: "10px" }}>
                {editAccId ? "Edit Account" : "Add New Account"}
              </div>
              <FInput placeholder="Account Name" value={accForm.name} onChange={(e) => setAccForm({ ...accForm, name: e.target.value })} style={{ marginBottom: "10px" }} />
              <ChipRow
                items={ACCOUNT_TYPES}
                value={accForm.type}
                onChange={(type) => setAccForm({ ...accForm, type, icon: ACCOUNT_TYPES.find((a) => a.type === type)?.icon })}
              />
              <FInput type="number" placeholder="Opening Balance" value={accForm.opening} onChange={(e) => setAccForm({ ...accForm, opening: e.target.value })} style={{ marginBottom: "12px" }} />
              <div style={{ display: "flex", gap: "8px" }}>
                {editAccId && (
                  <FBtn outline color="#999" onClick={() => { setEditAccId(null); setAccForm({ name: "", type: "Cash", icon: "💵", opening: "" }); }} style={{ flex: 1 }}>Cancel</FBtn>
                )}
                <FBtn onClick={saveAccount} style={{ flex: 1 }}>{editAccId ? "Update Account" : "Save Account"}</FBtn>
              </div>
            </div>
          </div>
        )}

        {/* DECLARED TOTAL */}
        <div onClick={() => toggle("declared")} style={menuRowStyle}>
          <div style={iconBoxStyle}>💼</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#222" }}>Declared Total</div>
            <div style={{ fontSize: "12px", color: "#999", marginTop: "1px" }}>{declaredAmount > 0 ? fmt(declaredAmount) : "Not set"}</div>
          </div>
          {chevron("declared")}
        </div>
        {section === "declared" && (
          <div style={cardStyle}>
            <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "6px" }}>Declared Total</div>
            <div style={{ fontSize: "12px", color: "#999", marginBottom: "12px" }}>Your known total wealth — savings, fixed deposits, cash at home etc. Dashboard shows the difference between this and what the app has calculated.</div>
            <FInput
              type="number"
              value={daTemp}
              onChange={(e) => setDaTemp(e.target.value)}
              placeholder={declaredAmount > 0 ? fmt(declaredAmount) : "₹ 0"}
              style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}
            />
            <div style={{ display: "flex", gap: "8px" }}>
              {declaredAmount > 0 && (
                <FBtn bg="#E53E3E" onClick={() => { setDeclaredAmount(0); setDaTemp(""); setSection(null); }} style={{ flex: 1 }}>Remove</FBtn>
              )}
              <FBtn onClick={() => { setDeclaredAmount(parseFloat(daTemp) || 0); setDaTemp(""); setSection(null); }} style={{ flex: 1 }}>Save</FBtn>
            </div>
          </div>
        )}

        {/* SAVINGS GOAL */}
        <div onClick={() => toggle("goal")} style={menuRowStyle}>
          <div style={iconBoxStyle}>🎯</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#222" }}>Savings Goal</div>
            <div style={{ fontSize: "12px", color: "#999", marginTop: "1px" }}>{goalAmount > 0 ? "Target: " + fmt(goalAmount) : "Not set"}</div>
          </div>
          {chevron("goal")}
        </div>
        {section === "goal" && (
          <div style={cardStyle}>
            <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "6px" }}>Savings Goal</div>
            <div style={{ fontSize: "12px", color: "#999", marginBottom: "12px" }}>Set a target amount you want to save. Goal tab shows a progress bar, how much is still needed, and a motivational message.</div>
            <FInput
              type="number"
              value={goalTemp}
              onChange={(e) => setGoalTemp(e.target.value)}
              placeholder={goalAmount > 0 ? fmt(goalAmount) : "₹ 0"}
              style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}
            />
            <div style={{ display: "flex", gap: "8px" }}>
              {goalAmount > 0 && (
                <FBtn bg="#E53E3E" onClick={() => { setGoalAmount(0); setGoalTemp(""); setSection(null); }} style={{ flex: 1 }}>Remove</FBtn>
              )}
              <FBtn onClick={() => { setGoalAmount(parseFloat(goalTemp) || 0); setGoalTemp(""); setSection(null); }} style={{ flex: 1 }}>Save</FBtn>
            </div>
          </div>
        )}

        {/* MANUAL CHECK */}
        <div onClick={() => toggle("manual")} style={menuRowStyle}>
          <div style={iconBoxStyle}>🔎</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#222" }}>Manual Check</div>
            <div style={{ fontSize: "12px", color: "#999", marginTop: "1px" }}>{manualCheck > 0 ? "Your count: " + fmt(manualCheck) : "Not set"}</div>
          </div>
          {chevron("manual")}
        </div>
        {section === "manual" && (
          <div style={cardStyle}>
            <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "6px" }}>Manual Check</div>
            <div style={{ fontSize: "12px", color: "#999", marginBottom: "12px" }}>Physically count your cash and enter it here. Dashboard compares this against the app's calculated total and tells you if you have more or less than expected.</div>
            <FInput
              type="number"
              value={mcTemp}
              onChange={(e) => setMcTemp(e.target.value)}
              placeholder={manualCheck > 0 ? fmt(manualCheck) : "₹ 0"}
              style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}
            />
            <div style={{ display: "flex", gap: "8px" }}>
              {manualCheck > 0 && (
                <FBtn bg="#E53E3E" onClick={() => { setManualCheck(0); setMcTemp(""); setSection(null); }} style={{ flex: 1 }}>Remove</FBtn>
              )}
              <FBtn onClick={() => { setManualCheck(parseFloat(mcTemp) || 0); setMcTemp(""); setSection(null); }} style={{ flex: 1 }}>Save</FBtn>
            </div>
          </div>
        )}

        {/* PIN LOCK */}
        <div onClick={() => toggle("pin")} style={menuRowStyle}>
          <div style={iconBoxStyle}>🔒</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#222" }}>PIN Lock</div>
            <div style={{ fontSize: "12px", color: "#999", marginTop: "1px" }}>{pinEnabled ? "Enabled · tap to change" : "Disabled"}</div>
          </div>
          {chevron("pin")}
        </div>
        {section === "pin" && (
          <div style={cardStyle}>
            <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "14px" }}>PIN Lock</div>
            {pinEnabled ? (
              <div style={{ display: "flex", gap: "8px" }}>
                <FBtn outline color="#2D6A9F" onClick={() => setShowPinSet(true)} style={{ flex: 1 }}>🔄 Change PIN</FBtn>
                <FBtn bg="#E53E3E" onClick={() => { setPinEnabled(false); setPin(""); setSection(null); }} style={{ flex: 1 }}>🔓 Disable</FBtn>
              </div>
            ) : (
              <FBtn onClick={() => setShowPinSet(true)}>🔒 Set PIN</FBtn>
            )}
            {showPinSet && (
              <PinScreen
                mode="set"
                onSuccess={(newPin) => { setPin(newPin); setPinEnabled(true); setShowPinSet(false); setSection(null); }}
                onCancel={() => setShowPinSet(false)}
              />
            )}
          </div>
        )}

        {/* NON-FUNCTIONAL rows */}
        <div style={menuRowStaticStyle}>
          <div style={iconBoxStyle}>👤</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#222" }}>Profile</div>
            <div style={{ fontSize: "12px", color: "#999", marginTop: "1px" }}>Name, currency</div>
          </div>
        </div>
        <div style={menuRowStaticStyle}>
          <div style={iconBoxStyle}>🔔</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#222" }}>Notifications</div>
            <div style={{ fontSize: "12px", color: "#999", marginTop: "1px" }}>Daily reminders</div>
          </div>
        </div>
        <div style={menuRowStaticStyle}>
          <div style={iconBoxStyle}>💾</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#222" }}>Backup</div>
            <div style={{ fontSize: "12px", color: "#999", marginTop: "1px" }}>Export as CSV</div>
          </div>
        </div>
        <div style={menuRowStaticStyle}>
          <div style={iconBoxStyle}>ℹ️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#222" }}>About</div>
            <div style={{ fontSize: "12px", color: "#999", marginTop: "1px" }}>Version 1.2.0</div>
          </div>
        </div>

      </div>
    </div>
  );
};

// 13. Goal component
const Goal = ({ transactions, accounts, goalAmount }) => {
  const accountBalances = useMemo(() => calcAccountBalances(accounts, transactions), [accounts, transactions]);
  const totalTracked = useMemo(() => {
    return accountBalances.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  }, [accountBalances]);

  const { totalIncome, totalExpense, monthlySaving } = useMemo(() => {
    const income = transactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);
    const expense = transactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);
    return { totalIncome: income, totalExpense: expense, monthlySaving: income - expense };
  }, [transactions]);

  const pct = goalAmount > 0 ? Math.min(100, Math.round((totalTracked / goalAmount) * 100)) : 0;
  const needed = Math.max(0, goalAmount - totalTracked);
  const isAchieved = goalAmount > 0 && totalTracked >= goalAmount;
  const monthsNeeded = monthlySaving > 0 && needed > 0 ? Math.ceil(needed / monthlySaving) : null;

  let message = "";
  if (pct >= 100) message = "🎉 Goal achieved! Set a new one!";
  else if (pct >= 67) message = "Almost there, don't stop now! 🔥";
  else if (pct >= 34) message = "Halfway there, great progress! 🚀";
  else if (pct > 0) message = "Keep saving, you're on your way! 💪";
  else message = "Set a goal from Settings to start!";

  return (
    <div>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg,#1E3A5F,#2D6A9F)",
          padding: "28px 20px 80px",
          color: "white",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            opacity: 0.65,
            letterSpacing: "1px",
          }}
        >
          SAVINGS
        </div>
        <div style={{ fontSize: "22px", fontWeight: 800, marginBottom: "22px" }}>My Goal</div>

        {goalAmount > 0 ? (
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.13)",
              borderRadius: "20px",
              padding: "20px",
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            <div
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.15)",
                marginBottom: "18px",
                paddingBottom: "18px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  opacity: 0.65,
                  letterSpacing: "0.5px",
                  marginBottom: "6px",
                }}
              >
                🎯 MY GOAL
              </div>
              <div style={{ fontSize: "34px", fontWeight: 800, color: "#7EFFC5" }}>
                {fmt(goalAmount)}
              </div>
            </div>
            <div
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.15)",
                marginBottom: "18px",
                paddingBottom: "18px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  opacity: 0.65,
                  letterSpacing: "0.5px",
                  marginBottom: "6px",
                }}
              >
                💰 TOTAL BALANCE
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "white" }}>
                {fmt(totalTracked)}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "11px",
                  opacity: 0.65,
                  letterSpacing: "0.5px",
                  marginBottom: "6px",
                }}
              >
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
              padding: "20px",
              border: "1px solid rgba(255,255,255,0.18)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "36px", marginBottom: "10px" }}>🎯</div>
            <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "6px" }}>
              No Goal Set
            </div>
            <div style={{ fontSize: "12px", opacity: 0.65 }}>
              Go to Settings → Savings Goal to set your target amount
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "0 16px", marginBottom: "80px", marginTop: "-36px", maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
        {goalAmount > 0 && (
          <>
            {/* Progress card */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "18px",
                padding: "18px",
                marginBottom: "14px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#222",
                  }}
                >
                  📊 Progress
                </div>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 800,
                    color: isAchieved ? "#1DB954" : "#2D6A9F",
                  }}
                >
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
                    background:
                      isAchieved
                        ? "#1DB954"
                        : "linear-gradient(90deg,#2D6A9F,#1DB954)",
                    transition: "width 0.6s",
                  }}
                ></div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <div style={{ fontSize: "11px", color: "#AAA" }}>₹0</div>
                <div style={{ fontSize: "11px", color: "#AAA" }}>
                  {fmt(goalAmount)}
                </div>
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
                {message}
              </div>
            </div>

            {/* Summary rows card */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "18px",
                padding: "16px",
                marginBottom: "14px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #F5F5F5",
                  marginBottom: "12px",
                }}
              >
                <div style={{ color: "#666", fontSize: "13px" }}>🎯 Goal Amount</div>
                <div
                  style={{
                    color: "#1E3A5F",
                    fontSize: "15px",
                    fontWeight: 800,
                  }}
                >
                  {fmt(goalAmount)}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #F5F5F5",
                  marginBottom: "12px",
                }}
              >
                <div style={{ color: "#666", fontSize: "13px" }}>💰 Total Balance</div>
                <div
                  style={{
                    color: "#2D6A9F",
                    fontSize: "15px",
                    fontWeight: 800,
                  }}
                >
                  {fmt(totalTracked)}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ color: "#666", fontSize: "13px" }}>📉 Still Needed</div>
                <div
                  style={{
                    color: isAchieved ? "#1DB954" : "#E53E3E",
                    fontSize: "15px",
                    fontWeight: 800,
                  }}
                >
                  {isAchieved ? "₹0 — Achieved!" : fmt(needed)}
                </div>
              </div>
            </div>

            {/* Estimate card */}
            {!isAchieved && (
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "18px",
                  padding: "16px",
                  marginBottom: "14px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#222",
                    marginBottom: "12px",
                  }}
                >
                  ⏱️ Estimate to Reach Goal
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#666" }}>
                    Monthly Surplus
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: monthlySaving > 0 ? "#1DB954" : "#E53E3E",
                    }}
                  >
                    {monthlySaving > 0 ? fmt(monthlySaving) : "No surplus"}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#666" }}>
                    Time Needed
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#2D6A9F",
                    }}
                  >
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

            {/* Achievement banner */}
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
                <div style={{ fontSize: "18px", fontWeight: 800, marginBottom: "6px" }}>
                  Goal Achieved!
                </div>
                <div style={{ fontSize: "13px", opacity: 0.85 }}>
                  You reached your target of {fmt(goalAmount)}. Go to Settings to set a
                  new goal!
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
};

// 14. Main App component
const App = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [accounts, setAccounts] = useLS("fm_accounts", SEED_ACCOUNTS);
  const [transactions, setTransactions] = useLS("fm_transactions", SEED_TX);
  const [loans, setLoans] = useLS("fm_loans", SEED_LOANS);
  const [declaredAmount, setDeclaredAmount] = useLS("fm_declared", 0);
  const [goalAmount, setGoalAmount] = useLS("fm_goal", 0);
  const [manualCheck, setManualCheck] = useLS("fm_manual", 0);
  const [pin, setPin] = useLS("fm_pin", "");
  const [pinEnabled, setPinEnabled] = useLS("fm_pin_enabled", false);
  const [pinVerified, setPinVerified] = useState(!pinEnabled);

  // Reset pinVerified when PIN settings change
  useEffect(() => {
    setPinVerified(!pinEnabled);
  }, [pinEnabled]);

  if (pinEnabled && !pinVerified) {
    return (
      <PinScreen
        mode="verify"
        savedPin={pin}
        onSuccess={() => setPinVerified(true)}
        onCancel={() => setPinVerified(false)}
      />
    );
  }

  return (
    <div
      style={{
        fontFamily: "Inter, system-ui, sans-serif",
        backgroundColor: "#F8FAFC",
        minHeight: "100vh",
        maxWidth: "420px",
        margin: "auto",
        position: "relative",
        boxShadow: "0 0 10px rgba(0,0,0,0.05)",
      }}
    >
      {activeTab === "dashboard" && (
        <Dashboard
          transactions={transactions}
          loans={loans}
          accounts={accounts}
          declaredAmount={declaredAmount}
          manualCheck={manualCheck}
        />
      )}
      {activeTab === "transactions" && (
        <Transactions
          transactions={transactions}
          setTransactions={setTransactions}
          accounts={accounts}
        />
      )}
      {activeTab === "loans" && <Loans loans={loans} setLoans={setLoans} />}
      {activeTab === "goal" && (
        <Goal
          transactions={transactions}
          accounts={accounts}
          goalAmount={goalAmount}
        />
      )}
      {activeTab === "settings" && (
        <Settings
          accounts={accounts}
          setAccounts={setAccounts}
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

      {/* Bottom Nav */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "white",
          borderTop: "1px solid #EEE",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
          padding: "8px 0",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.03)",
          zIndex: 200,
        }}
      >
        {[["dashboard", "🏠", "Home"],
          ["transactions", "💳", "Txns"],
          ["loans", "🤝", "Loans"],
          ["goal", "🎯", "Goal"],
          ["settings", "⚙️", "Settings"],
        ].map(([tab, icon, label]) => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "6px 0",
              cursor: "pointer",
              color: activeTab === tab ? "#1E3A5F" : "#AAA",
              fontSize: "11px",
              fontWeight: activeTab === tab ? 700 : 500,
            }}
          >
            <div style={{ fontSize: "22px", marginBottom: "2px" }}>{icon}</div>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

// 15. Export the App component
export default App;
