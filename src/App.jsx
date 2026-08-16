/**
 * MY FINANCE APP — Complete Personal Finance Tracker
 * Built with React + useState + localStorage (no external dependencies)
 *
 * FEATURES:
 * 1. DASHBOARD (Home Tab)
 *    - Total Available Balance = sum of all account balances (each account opening + income - expense - transferOut + transferIn)
 *    - Shows "Includes ₹X opening balance" note if global opening balance > 0
 *    - Income and Expense totals shown side by side
 *    - My Accounts: each account with its live balance
 *    - Loan snapshot: "They owe me" (pending gave loans) and "I owe them" (pending took loans)
 *    - Savings Goal card (only shown if goal amount set in Settings):
 *        progress bar, target, current balance, still needed, milestone message, 🎉 if achieved
 *    - Wealth Overview card (only shown if declared amount set in Settings):
 *        declared total vs currently tracked, difference shown as "missing" or "over" or "Balanced"
 *    - Manual Check card (only shown if manual check amount set in Settings):
 *        app calculated vs your physical count, difference with color and message
 *    - Recent Transactions (top 4)
 *
 * 2. TRANSACTIONS TAB
 *    - Search bar at top: filters list by category/note/account in real time
 *    - Typing exactly "create" (case-insensitive) in search bar auto-opens add sheet and clears search
 *    - FAB (+) button also opens add sheet
 *    - Add sheet has 3 type tabs: ↓ Expense | ↑ Income | ⇄ Transfer
 *    - Income/Expense: choose amount, category, account, payment method, note, date
 *    - Transfer: choose amount, from account, to account, note, date (no category/method)
 *    - Transaction list grouped by Today / Yesterday / date
 *    - Income shown in green (+), Expense in red (−), Transfer in purple (⇄)
 *    - Transfer shows "AccountA → AccountB" as title
 *
 * 3. LOANS TAB
 *    - Search bar at top: filters by name/reason. Typing "create" opens add sheet
 *    - FAB (+) also opens add sheet
 *    - Net Position card: totalGave(pending) - totalTook(pending)
 *    - Filter tabs: All | 🔴 I Took | 🟢 I Gave
 *    - Each loan card: avatar (color by first letter), name, status badge, reason, date, amount
 *    - Actions per card: ✓ Mark Settled / ↩ Mark Pending | ✏️ Edit | 🗑 Delete (with confirm)
 *    - Add/Edit sheet: type (took/gave), name, amount, reason, date, status
 *
 * 4. SETTINGS TAB (single source of truth for all configuration)
 *    - Each item is a tappable accordion row with a › arrow that rotates when open
 *    - 🏦 Manage Accounts: add/edit/delete accounts. Each account has name, type (Cash/Bank/Wallet/Other), icon, opening balance.
 *      Accounts defined here appear as options in the transaction add sheet.
 *    - 💵 Opening Balance: a global extra starting amount added to total balance. Separate from account opening balances.
 *    - 💼 Declared Total Amount: your known total wealth. Dashboard shows diff vs tracked.
 *    - 🎯 Savings Goal: set a target amount. Dashboard shows progress bar toward it using current tracked balance.
 *    - 🔎 Manual Check Amount: your physically counted amount. Dashboard compares vs app calculated.
 *    - 🔒 PIN Lock: set a 4-digit PIN. When enabled, app shows PIN entry screen on load before showing any content.
 *      Can change PIN or disable it. Stored in localStorage.
 *    - 👤 Profile: fully functional. 🔔 Notifications: on/off toggle + in-app reminder banner.
 *    - 💾 Backup: export transactions as CSV, export/restore a full JSON backup. ℹ️ About: UI shown, not yet functional
 *
 * 5. PIN SCREEN
 *    - Full screen overlay with gradient background
 *    - 4 dot indicators fill as digits typed
 *    - Number keypad 1-9, 0, backspace
 *    - Verify mode: checks against saved PIN, shows error on mismatch
 *    - Set mode: two-step (enter then confirm). If mismatch, restart from enter step.
 *
 * 6. LOCAL STORAGE
 *    - All state persisted via useLS hook (read on mount, write on every change)
 *    - Keys: fm_transactions, fm_loans, fm_accounts, fm_opening, fm_declared, fm_goal, fm_manual, fm_pin, fm_pin_enabled
 *    - Seed data used only if localStorage is empty for that key
 *
 * CALCULATION RULES:
 *    - Account balance = account.opening + sum(income where account=this) - sum(expense where account=this)
 *                        - sum(transfer where account=this [outgoing]) + sum(transfer where toAccount=this [incoming])
 *    - Total tracked = sum of all account balances + globalOpeningBalance
 *    - Transfers do NOT affect totalIncome or totalExpense counters (they are neutral)
 *    - Savings goal progress % = (totalTracked / goalAmount) * 100, capped at 100 for bar display
 *    - Manual check diff: manualCheck - totalTracked. Positive = you have LESS than expected. Negative = you have MORE.
 *    - Declared diff: declaredAmount - totalTracked. Positive = untracked. Negative = overspent vs declared.
 *
 * COLOR SCHEME (premium ocean/teal redesign — see THEME object below):
 *    - Primary deep teal, mint accent, gold accent for highlights
 *    - Income: mint green, Expense: coral red, Transfer: soft violet
 *    - Background: deep charcoal-teal app shell with glass cards
 */

import React, { useState, useEffect } from "react";

// ─── THEME ──────────────────────────────────────────────────────────────────
// Central design tokens. Only visual values — no business logic lives here.

// Theme definitions for Light, Dark, and System modes
const THEMES = {
  light: {
    colors: {
      bg:           "#F5F7FA",
      bgSoft:       "#F2F4F8",
      teal900:      "#0F2540",
      teal800:      "#1a3a5c",
      teal700:      "#1E3A5F",
      teal600:      "#234A75",
      teal500:      "#2D6A9F",
      mint:         "#1DB954",
      mintSoft:     "#E5F4FF",
      gold:         "#F5B942",
      goldSoft:     "#FFF3DD",
      income:       "#1DB954",
      incomeSoft:   "#E8FBF0",
      expense:      "#E53E3E",
      expenseSoft:  "#FFF0F0",
      transfer:     "#7B5EA7",
      transferSoft: "#F3EEFF",
      ink:          "#1A1A2E",
      inkSoft:      "#8A93A0",
      line:         "#E8EDF3",
      card:         "#FFFFFF",
      glass:        "rgba(45,106,159,0.08)",
      glassBorder:  "rgba(45,106,159,0.12)",
      glassStrong:  "rgba(45,106,159,0.1)",
    },
    gradient: {
      header:  "linear-gradient(135deg,#2D6A9F 0%,#1a3a5c 100%)",
      primary: "linear-gradient(135deg,#2D6A9F 0%,#1a3a5c 100%)",
      gold:    "linear-gradient(135deg,#F5B942 0%,#E0A53A 100%)",
      income:  "linear-gradient(135deg,#1DB954,#15A047)",
      expense: "linear-gradient(135deg,#E53E3E,#C73333)",
      transfer:"linear-gradient(135deg,#7B5EA7,#6B4F95)",
      nav:     "linear-gradient(180deg,rgba(255,255,255,0.95),rgba(255,255,255,0.99))",
    },
  },
  dark: {
    colors: {
      bg:           "#0A1929",
      bgSoft:       "#0F2540",
      teal900:      "#0A1929",
      teal800:      "#132F4C",
      teal700:      "#E8EDF3", // Switched to bright color for dark theme
      teal600:      "#66B2FF",
      teal500:      "#3399FF",
      mint:         "#7EFFC5",
      mintSoft:     "#1a4d3e",
      gold:         "#F5B942",
      goldSoft:     "#3d2f1a",
      income:       "#1DB954",
      incomeSoft:   "#0d3d1f",
      expense:      "#FCA5A5",
      expenseSoft:  "#4d1a1a",
      transfer:     "#9F8AE8",
      transferSoft: "#2d1f4d",
      ink:          "#FFFFFF",
      inkSoft:      "#B2BAC2",
      line:         "#1E4976",
      card:         "#132F4C",
      glass:        "rgba(255,255,255,0.08)",
      glassBorder:  "rgba(255,255,255,0.12)",
      glassStrong:  "rgba(255,255,255,0.12)",
    },
    gradient: {
      header:  "linear-gradient(135deg,#1a3a5c 0%,#2d6a9f 100%)",
      primary: "linear-gradient(135deg,#2D6A9F 0%,#1a3a5c 100%)",
      gold:    "linear-gradient(135deg,#F5B942 0%,#E0A53A 100%)",
      income:  "linear-gradient(135deg,#1DB954,#15A047)",
      expense: "linear-gradient(135deg,#E53E3E,#C73333)",
      transfer:"linear-gradient(135deg,#7B5EA7,#6B4F95)",
      nav:     "linear-gradient(180deg,rgba(15,37,64,0.92),rgba(15,37,64,0.99))",
    },
  },
};

// Get system theme preference
const getSystemTheme = () => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

const THEME = {
  // colors and gradient are set dynamically at render time via T = currentTheme.colors
  // These are placeholder defaults (dark theme) — overwritten in App before any render
  colors: THEMES.dark.colors,
  gradient: THEMES.dark.gradient,
  shadow: {
    soft:    "0 2px 10px rgba(26,58,92,0.08)",
    card:    "0 2px 12px rgba(26,58,92,0.07)",
    raised:  "0 10px 30px rgba(26,58,92,0.18)",
    button:  "0 6px 16px rgba(45,106,159,0.35)",
    nav:     "0 -4px 20px rgba(26,58,92,0.10)",
    glow:    "0 0 0 1px rgba(255,255,255,0.18) inset",
  },
  radius: { sm:10, md:14, lg:18, xl:22, xxl:28, pill:999 },
  font: {
    body: "'Inter', system-ui, sans-serif",
    money:"'Inter', system-ui, sans-serif",
  },
};
let T = THEME.colors, G = THEME.gradient, SH = THEME.shadow, R = THEME.radius;


// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const fmtDateLong = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" });
};
const fmtTime = (ms) => ms ? new Date(ms).toLocaleTimeString("en-IN", { hour:"numeric", minute:"2-digit", hour12:true }) : null;
const todayStr = () => new Date().toISOString().slice(0, 10);
const yesterdayStr = () => new Date(Date.now() - 86400000).toISOString().slice(0, 10);
const monthYearStr = () => new Date().toLocaleDateString("en-US",{month:"long",year:"numeric"}).toUpperCase();
const sortByDateDesc = (list) => [...list].sort((a,b)=> (b.date||"").localeCompare(a.date||"") || b.id-a.id);

function avatarColor(name) {
  const palette = ["#4F7CAC","#E07B54","#5BA858","#9B59B6","#E74C3C","#1ABC9C","#E67E22"];
  return palette[(name || "A").charCodeAt(0) % palette.length];
}

function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function csvEscape(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
}

function transactionsToCSV(transactions) {
  const header = ["Date","Time","Type","Category","Account","To Account","Method","Amount","Note"];
  const rows = sortByDateDesc(transactions).map(t=>[
    t.date, fmtTime(t.createdAt)||"", t.type, t.category, t.account, t.toAccount||"", t.method||"", t.amount, t.note||""
  ]);
  return [header, ...rows].map(r=>r.map(csvEscape).join(",")).join("\n");
}

// Mini SVG bar chart (no deps)
function MiniBarChart({ data, color, height=48 }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d=>d.value), 1);
  const w = 100 / data.length;
  return (
    <svg viewBox={`0 0 100 ${height}`} style={{width:"100%",height}} preserveAspectRatio="none">
      {data.map((d,i)=>{
        const barH = Math.max(2, (d.value/max)*height*0.85);
        return (
          <g key={i}>
            <rect x={i*w+w*0.15} y={height-barH} width={w*0.7} height={barH}
              fill={d.highlight ? color : color+"55"} rx="2"/>
          </g>
        );
      })}
    </svg>
  );
}

// Mini SVG donut chart
function DonutChart({ slices, size=80 }) {
  const total = slices.reduce((s,x)=>s+x.value,0);
  if (total===0) return <div style={{width:size,height:size,borderRadius:"50%",background:"#eee",flexShrink:0}}/>;
  let angle = -90;
  const cx=size/2, cy=size/2, r=size*0.35, stroke=size*0.13;
  const arcs = slices.map(sl=>{
    const pct = sl.value/total;
    const a1 = angle, a2 = angle + pct*360;
    angle = a2;
    const toRad=d=>d*Math.PI/180;
    const x1=cx+r*Math.cos(toRad(a1)),y1=cy+r*Math.sin(toRad(a1));
    const x2=cx+r*Math.cos(toRad(a2)),y2=cy+r*Math.sin(toRad(a2));
    const large=pct>0.5?1:0;
    return { d:`M${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2}`, color:sl.color, value:sl.value, label:sl.label };
  });
  return (
    <svg width={size} height={size} style={{flexShrink:0}}>
      {arcs.map((arc,i)=>(
        <path key={i} d={arc.d} fill="none" stroke={arc.color} strokeWidth={stroke} strokeLinecap="butt"/>
      ))}
    </svg>
  );
}

// Get last N months labels + tx aggregates
function getLast6Months(transactions) {
  const months = [];
  const now = new Date();
  for (let i=5; i>=0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const label = d.toLocaleDateString("en-IN",{month:"short"});
    const inc = transactions.filter(t=>t.type==="income" && (t.date||"").startsWith(key)).reduce((s,t)=>s+t.amount,0);
    const exp = transactions.filter(t=>t.type==="expense" && (t.date||"").startsWith(key)).reduce((s,t)=>s+t.amount,0);
    months.push({ key, label, income:inc, expense:exp, isCurrentMonth: i===0 });
  }
  return months;
}

// ─── RECURRING TRANSACTIONS ENGINE ──────────────────────────────────────────
function applyRecurring(recurring, transactions, setTransactions) {
  // Called on app load. Checks each recurring rule and auto-adds if due.
  const today = todayStr();
  const newTxs = [];
  recurring.forEach(r => {
    if (!r.active) return;
    let lastDate = r.lastAdded || r.startDate;
    let next = getNextDue(lastDate, r.frequency);
    while (next <= today) {
      const alreadyExists = transactions.some(t =>
        t.recurringId === r.id && t.date === next
      );
      if (!alreadyExists) {
        newTxs.push({
          id: Date.now() + Math.random(),
          createdAt: Date.now(),
          recurringId: r.id,
          type: r.type,
          category: r.category,
          icon: r.icon || "🔁",
          amount: r.amount,
          note: r.note || `Auto: ${r.category}`,
          date: next,
          account: r.account,
          toAccount: r.toAccount || "",
          method: r.method || "",
          photo: null,
        });
      }
      lastDate = next;
      next = getNextDue(lastDate, r.frequency);
    }
  });
  if (newTxs.length > 0) {
    setTransactions(prev => [...newTxs, ...prev]);
  }
}

function getNextDue(fromDate, frequency) {
  const d = new Date(fromDate + "T00:00:00");
  if (frequency === "daily")   d.setDate(d.getDate() + 1);
  if (frequency === "weekly")  d.setDate(d.getDate() + 7);
  if (frequency === "monthly") d.setMonth(d.getMonth() + 1);
  if (frequency === "yearly")  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

const FREQUENCIES = ["daily", "weekly", "monthly", "yearly"];
const makeEmptyRecurring = () => ({
  type: "expense", category: "", icon: "🔁", amount: "",
  note: "", account: "", method: "", frequency: "monthly",
  startDate: todayStr(), active: true,
});


function useLS(key, defaultVal) {
  const [val, setVal] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : defaultVal;
    } catch { return defaultVal; }
  });
  const set = (v) => {
    const next = typeof v === "function" ? v(val) : v;
    setVal(next);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
  };
  return [val, set];
}

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const SEED_ACCOUNTS = [];

const SEED_TX = [];

const SEED_LOANS = [];

const SEED_UPI = [];

const SEED_PROFILE = { name:"", avatar:null, occupation:"Salaried", monthlyIncome:"", language:"English", dateFormat:"DD/MM/YYYY", theme:"system" };

const SEED_CATEGORIES = {
  income:  [{l:"Salary",icon:"💼"},{l:"Freelance",icon:"💻"},{l:"Business",icon:"🏪"},{l:"Gift",icon:"🎁"},{l:"Other",icon:"💰"}],
  expense: [{l:"Food",icon:"🍛"},{l:"Travel",icon:"🚌"},{l:"Bills",icon:"📄"},{l:"Shopping",icon:"🛍️"},{l:"Health",icon:"💊"},{l:"Other",icon:"📦"}],
};

const OCCUPATIONS = ["Salaried","Business","Freelance","Student","Other"];
const LANGUAGES = ["English","Bengali"];
const DATE_FORMATS = ["DD/MM/YYYY","MM/DD/YYYY","YYYY-MM-DD"];

const SEED_WORK_NAMES = ["PAN Card", "Aadhar Card", "Passport"];
const SEED_WORK_RECORDS = [];

// TX_CATS is now dynamically loaded from localStorage in the App component
const INCOME_METHODS  = ["Cash","Online / UPI","Bank Transfer","Cheque"];
const EXPENSE_METHODS = ["Cash","UPI / Online","Card","Bank Transfer"];
const ACCOUNT_TYPES   = [{type:"Cash",icon:"💵"},{type:"Bank",icon:"🏦"},{type:"Wallet",icon:"📱"},{type:"Other",icon:"💰"}];

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function Sheet({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(10,26,24,0.55)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(2px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.card,borderRadius:`${R.xxl}px ${R.xxl}px 0 0`,padding:"20px 18px 48px",width:"100%",maxWidth:420,maxHeight:"92vh",overflowY:"auto",boxSizing:"border-box",boxShadow:SH.raised,fontFamily:THEME.font.body}}>
        <div style={{width:42,height:5,borderRadius:3,background:T.line,margin:"0 auto 18px"}}/>
        {children}
      </div>
    </div>
  );
}

function FInput({value,onChange,placeholder,type="text",style={}}) {
  return (
    <input value={value} onChange={onChange} placeholder={placeholder} type={type}
      onFocus={e=>{e.target.style.borderColor=T.teal500;e.target.style.boxShadow=`0 0 0 3px ${T.mintSoft}`;}}
      onBlur={e=>{e.target.style.borderColor=T.line;e.target.style.boxShadow="none";}}
      style={{width:"100%",padding:"13px 15px",borderRadius:R.md,border:`1.5px solid ${T.line}`,
        background:T.bgSoft,fontSize:14,boxSizing:"border-box",outline:"none",
        fontFamily:THEME.font.body,color:T.ink,transition:"border-color .15s, box-shadow .15s",...style}}/>
  );
}

function FBtn({children,onClick,bg,outline,color=T.teal700,style={}}) {
  return (
    <button onClick={onClick}
      onMouseDown={e=>e.currentTarget.style.transform="scale(0.97)"}
      onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}
      onTouchStart={e=>e.currentTarget.style.transform="scale(0.97)"}
      onTouchEnd={e=>e.currentTarget.style.transform="scale(1)"}
      style={{
      padding:"13px 16px",borderRadius:R.md,cursor:"pointer",fontWeight:700,fontSize:14,
      border: outline ? `1.5px solid ${color}` : "none",
      background: outline ? "transparent" : (bg || G.primary),
      color: outline ? color : "white",
      boxShadow: outline ? "none" : SH.button,
      fontFamily:THEME.font.body, transition:"transform .1s ease",...style
    }}>{children}</button>
  );
}

function ToggleSwitch({ on, onChange }) {
  return (
    <button onClick={(e)=>{e.stopPropagation();onChange(!on);}} style={{
      width:46,height:27,borderRadius:R.pill,border:"none",cursor:"pointer",flexShrink:0,
      background:on?G.primary:T.line,position:"relative",transition:"background .2s",padding:0}}>
      <div style={{position:"absolute",top:3,left:on?22:3,width:21,height:21,borderRadius:"50%",
        background:"white",boxShadow:"0 2px 4px rgba(0,0,0,0.25)",transition:"left .2s"}}/>
    </button>
  );
}

function TransactionDetailSheet({ tx, onClose, onDelete, onEdit, onPhotoChange, transactions, accounts }) {
  if (!tx) return null;
  const [viewPhoto, setViewPhoto] = useState(null);
  const color  = tx.type==="income" ? T.income : tx.type==="transfer" ? "#7B5EA7" : T.expense;
  const bg     = tx.type==="income" ? T.incomeSoft : tx.type==="transfer" ? T.transferSoft : T.expenseSoft;
  const prefix = tx.type==="income" ? "+" : tx.type==="transfer" ? "⇄" : "−";
  const time   = fmtTime(tx.createdAt);

  // Balance before and after this transaction on the account
  const balanceBefore = (() => {
    if (!transactions || !accounts || tx.type === "transfer") return null;
    const acc = accounts.find(a => a.name === tx.account);
    if (!acc) return null;
    // all txns on this account that came before this one
    const prior = transactions.filter(t =>
      t.id !== tx.id &&
      (t.account === tx.account || t.toAccount === tx.account) &&
      (t.createdAt || 0) < (tx.createdAt || 1)
    );
    const income  = prior.filter(t => t.type==="income"   && t.account===tx.account).reduce((s,t)=>s+t.amount,0);
    const expense = prior.filter(t => t.type==="expense"  && t.account===tx.account).reduce((s,t)=>s+t.amount,0);
    const tOut    = prior.filter(t => t.type==="transfer" && t.account===tx.account).reduce((s,t)=>s+t.amount,0);
    const tIn     = prior.filter(t => t.type==="transfer" && t.toAccount===tx.account).reduce((s,t)=>s+t.amount,0);
    return acc.opening + income - expense - tOut + tIn;
  })();
  const balanceAfter = balanceBefore !== null
    ? (tx.type==="income" ? balanceBefore + tx.amount : balanceBefore - tx.amount)
    : null;

  return (
    <>
    <Sheet open={!!tx} onClose={onClose}>
      <div style={{textAlign:"center",marginBottom:16}}>
        <div style={{width:56,height:56,borderRadius:R.lg,background:bg,margin:"0 auto 10px",
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{tx.icon}</div>
        <div style={{fontSize:16,fontWeight:700,color:T.ink}}>
          {tx.type==="transfer" ? `${tx.account} → ${tx.toAccount}` : tx.category}
        </div>
        <div style={{fontSize:28,fontWeight:700,color,marginTop:6,fontFamily:THEME.font.money}}>
          {prefix}{fmt(tx.amount)}
        </div>
      </div>

      {/* Balance Before → After */}
      {balanceBefore !== null && (
        <div style={{background:bg,borderRadius:R.lg,padding:"12px 14px",marginBottom:14,
          display:"flex",alignItems:"center",gap:6}}>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:10,color:T.inkSoft,fontWeight:700,marginBottom:3}}>BEFORE</div>
            <div style={{fontSize:15,fontWeight:800,color:T.ink,fontFamily:THEME.font.money}}>{fmt(balanceBefore)}</div>
          </div>
          <div style={{fontSize:20,color,fontWeight:700,flexShrink:0}}>→</div>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:10,color,fontWeight:700,marginBottom:3}}>AFTER</div>
            <div style={{fontSize:15,fontWeight:800,color,fontFamily:THEME.font.money}}>{fmt(balanceAfter)}</div>
          </div>
          <div style={{width:1,background:color+"33",alignSelf:"stretch",margin:"0 4px"}}/>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:10,color:T.inkSoft,fontWeight:700,marginBottom:3}}>ACCOUNT</div>
            <div style={{fontSize:11,fontWeight:700,color:T.ink}}>{tx.account}</div>
          </div>
        </div>
      )}

      {/* Photo */}
      <div style={{background:T.bgSoft,borderRadius:R.lg,padding:"12px 14px",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{fontSize:18}}>📸</div>
          <div style={{fontSize:13,fontWeight:700,color:T.inkSoft}}>PHOTO</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={() => tx.photo && setViewPhoto(tx.photo)} disabled={!tx.photo} style={{padding:"8px 12px",borderRadius:R.sm,border:`1.5px solid ${tx.photo ? T.teal500 : T.line}`,background:tx.photo?T.mintSoft:T.bgSoft,color:tx.photo?T.teal700:T.inkSoft,fontSize:12,fontWeight:700,cursor:tx.photo?"pointer":"not-allowed",display:"flex",alignItems:"center",gap:5}}>👁️ View Photo</button>
          <label style={{padding:"8px 12px",borderRadius:R.sm,border:`1.5px solid ${T.line}`,background:T.card,color:T.teal500,fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
            📷 Add Photo
            <input type="file" accept="image/*" onChange={(e)=>{const f=e.target.files?.[0];if(!f)return;compressImage(f,c=>{onPhotoChange?.(tx.id,c);e.target.value="";});}} style={{display:"none"}}/>
          </label>
        </div>
      </div>

      {/* Detail rows */}
      <div style={{background:T.bgSoft,borderRadius:R.lg,padding:"4px 14px"}}>
        {[
          {label:"Date",  value:fmtDateLong(tx.date)},
          {label:"Time",  value:time||"Not recorded"},
          ...(tx.type!=="transfer" ? [
            {label:"Account", value:tx.account},
            {label:"Method",  value:tx.method||"—"},
          ] : [
            {label:"From", value:tx.account},
            {label:"To",   value:tx.toAccount},
          ]),
          {label:"Note", value:tx.note||"—"},
        ].map((row,i,arr)=>(
          <div key={row.label} style={{display:"flex",justifyContent:"space-between",gap:12,
            padding:"12px 0",borderBottom:i<arr.length-1?`1px solid ${T.line}`:"none"}}>
            <div style={{fontSize:13,color:T.inkSoft,flexShrink:0}}>{row.label}</div>
            <div style={{fontSize:13,fontWeight:600,color:T.ink,textAlign:"right"}}>{row.value}</div>
          </div>
        ))}
      </div>

      <div style={{display:"flex",gap:10,marginTop:16}}>
        {onEdit && <FBtn onClick={()=>{onEdit(tx);onClose();}} style={{flex:1,padding:"14px"}}>✏️ Edit</FBtn>}
        {onDelete && <FBtn onClick={()=>{onClose();setTimeout(()=>onDelete(tx.id),150);}} bg={G.expense} style={{flex:onEdit?1:2,padding:"14px"}}>🗑 Delete</FBtn>}
      </div>
    </Sheet>

    {viewPhoto && (
      <div onClick={()=>setViewPhoto(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <img src={viewPhoto} alt="Photo" style={{maxWidth:"100%",maxHeight:"80%",borderRadius:R.lg}}/>
        <button onClick={()=>setViewPhoto(null)} style={{position:"absolute",top:30,right:20,background:"white",border:"none",borderRadius:"50%",width:40,height:40,fontSize:20,fontWeight:700,cursor:"pointer"}}>✕</button>
      </div>
    )}
    </>
  );
}
function SearchBar({value, onChange, placeholder}) {
  return (
    <div style={{position:"relative",margin:"0 16px 12px"}}>
      <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:15,color:T.inkSoft}}>🔍</span>
      <input value={value} onChange={onChange} placeholder={placeholder}
        style={{width:"100%",padding:"13px 38px",borderRadius:R.pill,border:`1px solid ${T.glassBorder}`,
          fontSize:13,background:"rgba(255,255,255,0.94)",boxSizing:"border-box",outline:"none",
          boxShadow:"0 4px 16px rgba(0,0,0,0.18)",fontFamily:THEME.font.body,color:T.ink}}/>
      {value && (
        <span onClick={()=>onChange({target:{value:""}})}
          style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",cursor:"pointer",color:T.inkSoft,fontSize:14}}>✕</span>
      )}
    </div>
  );
}

function TypeToggle({options, value, onChange, colors={}}) {
  return (
    <div style={{display:"flex",background:T.bgSoft,borderRadius:R.md,padding:4,gap:4,marginBottom:14,border:`1px solid ${T.line}`}}>
      {options.map(([v,lbl])=>(
        <button key={v} onClick={()=>onChange(v)} style={{
          flex:1,padding:"11px 4px",border:"none",borderRadius:R.sm,cursor:"pointer",
          fontWeight:700,fontSize:12,transition:"all .2s",fontFamily:THEME.font.body,
          background: value===v ? (colors[v] || G.primary) : "transparent",
          color: value===v ? "white" : T.inkSoft,
          boxShadow: value===v ? SH.soft : "none",
        }}>{lbl}</button>
      ))}
    </div>
  );
}

function Label({children}) {
  return <div style={{fontSize:11,color:T.inkSoft,fontWeight:700,letterSpacing:.6,marginBottom:7,fontFamily:THEME.font.body,textTransform:"uppercase"}}>{children}</div>;
}

function ChipRow({items, selected, onSelect, activeColor=T.teal700, activeBg=T.mintSoft}) {
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:12}}>
      {items.map(item=>{
        const key = typeof item === "string" ? item : item.l||item.type||item;
        const label = typeof item === "string" ? item : (item.l||item.type);
        const prefix = typeof item === "object" && item.icon ? item.icon+" " : "";
        const isActive = selected === key;
        return (
          <button key={key} onClick={()=>onSelect(key)} style={{
            padding:"8px 14px",borderRadius:R.pill,border:"1.5px solid",cursor:"pointer",fontFamily:THEME.font.body,
            borderColor: isActive ? activeColor : T.line,
            background: isActive ? activeBg : T.card,
            fontSize:12,fontWeight:700,
            boxShadow: isActive ? SH.soft : "none",
            color: isActive ? activeColor : T.inkSoft,
            transition:"all .15s"
          }}>{prefix}{label}</button>
        );
      })}
    </div>
  );
}

// ─── PIN SCREEN ───────────────────────────────────────────────────────────────
function PinScreen({ mode, savedPin, onSuccess, onCancel }) {
  const [digits, setDigits] = useState("");
  const [step, setStep]     = useState("enter"); // "enter" | "confirm"
  const [first, setFirst]   = useState("");
  const [err, setErr]       = useState("");

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

  const del = () => { setDigits(d=>d.slice(0,-1)); setErr(""); };

  const title = mode==="verify" ? "Enter PIN"
    : step==="enter" ? "Set New PIN" : "Confirm PIN";
  const sub = mode==="verify" ? "Enter your 4-digit PIN to continue"
    : step==="enter" ? "Choose a 4-digit PIN" : "Re-enter your PIN to confirm";

  return (
    <div style={{position:"fixed",inset:0,background:G.header,zIndex:999,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"white",fontFamily:THEME.font.body}}>
      <div style={{width:64,height:64,borderRadius:20,background:T.glass,border:`1px solid ${T.glassBorder}`,
        display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,marginBottom:18}}>🔒</div>
      <div style={{fontSize:19,fontWeight:700,marginBottom:6,fontFamily:THEME.font.money}}>{title}</div>
      <div style={{fontSize:13,opacity:.65,marginBottom:32,textAlign:"center",padding:"0 40px"}}>{sub}</div>
      <div style={{display:"flex",gap:14,marginBottom:4}}>
        {[0,1,2,3].map(i=>(
          <div key={i} style={{width:14,height:14,borderRadius:"50%",
            background:i<digits.length?T.gold:"rgba(255,255,255,0.25)",
            boxShadow:i<digits.length?`0 0 10px ${T.gold}`:"none",
            transition:"background .15s, box-shadow .15s"}}/>
        ))}
      </div>
      <div style={{height:24,display:"flex",alignItems:"center",marginBottom:8}}>
        {err && <div style={{fontSize:12,color:T.expense}}>{err}</div>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,72px)",gap:16}}>
        {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k,i)=>(
          k==="" ? <div key={i}/> :
          <button key={i} onClick={()=>k==="⌫"?del():tap(String(k))} style={{
            width:72,height:72,borderRadius:"50%",border:`1px solid ${T.glassBorder}`,cursor:"pointer",fontFamily:THEME.font.body,
            background:k==="⌫"?"rgba(255,255,255,0.08)":T.glass,
            color:"white",fontSize:k==="⌫"?20:24,fontWeight:700,
            backdropFilter:"blur(6px)"
          }}>{k}</button>
        ))}
      </div>
      {onCancel && (
        <button onClick={onCancel} style={{marginTop:28,background:"none",border:"none",
          color:"rgba(255,255,255,0.55)",fontSize:14,cursor:"pointer",fontFamily:THEME.font.body}}>Cancel</button>
      )}
    </div>
  );
}

// ─── BALANCE CALCULATOR (shared logic) ───────────────────────────────────────
function calcAccountBalances(accounts, transactions) {
  return accounts.map(acc => {
    const income   = transactions.filter(t=>t.type==="income"  && t.account===acc.name).reduce((s,t)=>s+t.amount,0);
    const expense  = transactions.filter(t=>t.type==="expense" && t.account===acc.name).reduce((s,t)=>s+t.amount,0);
    const tOut     = transactions.filter(t=>t.type==="transfer"&& t.account===acc.name).reduce((s,t)=>s+t.amount,0);
    const tIn      = transactions.filter(t=>t.type==="transfer"&& t.toAccount===acc.name).reduce((s,t)=>s+t.amount,0);
    return { ...acc, balance: acc.opening + income - expense - tOut + tIn };
  });
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ transactions, setTransactions, setTrash, loans, accounts, categories, openingBalance, declaredAmount, manualCheck, notifyEnabled, onOpenSettings }) {
  const [selectedTx, setSelectedTx] = useState(null);
  const [editTxId, setEditTxId] = useState(null);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [editForm, setEditForm] = useState(makeEmptyTx);

  const [delTxId, setDelTxId] = useState(null);
  const deleteTx = (id) => { setDelTxId(id); };
  const confirmDeleteTx = (id) => {
    const tx = transactions.find(t => t.id === id);
    if (tx) {
      setTrash(prev => ({ ...prev, transactions: [...prev.transactions, tx] }));
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
    setDelTxId(null);
  };

  const openEdit = (tx) => {
    setEditTxId(tx.id);
    setEditForm({ ...tx, amount: String(tx.amount) });
    setShowEditSheet(true);
  };

  const updateTxPhoto = (id, photo) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, photo } : t));
    setSelectedTx(prev => prev?.id === id ? { ...prev, photo } : prev);
  };

  const saveEdit = () => {
    if (!editForm.amount || parseFloat(editForm.amount) <= 0) return;
    const catList = editForm.type === "income" ? categories.income : categories.expense;
    const cat = catList.find(c => c.l === editForm.category);
    setTransactions(prev => prev.map(t => t.id === editTxId ? { ...editForm, id: editTxId, icon: cat?.icon || t.icon, amount: parseFloat(editForm.amount), createdAt: t.createdAt, photo: editForm.photo ?? t.photo } : t));
    setShowEditSheet(false);
    setEditTxId(null);
  };


  // Totals — transfers excluded from income/expense counters.
  // Only count transactions whose account still exists, so these totals
  // stay consistent with Total Available (which only sums existing accounts).
  const validAccountNames = new Set(accounts.map(a=>a.name));
  const totalIncome  = transactions.filter(t=>t.type==="income"  && validAccountNames.has(t.account)).reduce((s,t)=>s+t.amount,0);
  const totalExpense = transactions.filter(t=>t.type==="expense" && validAccountNames.has(t.account)).reduce((s,t)=>s+t.amount,0);

  // Per-account live balances
  const accountBalances = calcAccountBalances(accounts, transactions);

  // Total tracked = all account balances + global opening balance
  const totalTracked = accountBalances.reduce((s,a)=>s+a.balance,0) + openingBalance;

  // Declared diff: positive = untracked money, negative = you've tracked more than declared
  const declaredDiff = declaredAmount - totalTracked;

  // Manual check diff: positive = your physical count > app = you have MORE, negative = you have LESS
  const manualDiff = manualCheck - totalTracked;

  const recent = sortByDateDesc(transactions).slice(0,4);
  const loggedToday = transactions.some(t=>t.date===todayStr());
  const showReminder = notifyEnabled && !loggedToday;

  const txColor = (t) => t.type==="income" ? T.income : t.type==="transfer" ? "#9F8AE8" : T.expense;
  const txBg    = (t) => t.type==="income" ? T.incomeSoft : t.type==="transfer" ? T.transferSoft : T.expenseSoft;
  const txPrefix= (t) => t.type==="income" ? "+" : t.type==="transfer" ? "⇄" : "−";

  return (
    <div>
      {/* Header */}
      <div style={{background:G.header,padding:"24px 16px 60px",color:"white",borderRadius:`0 0 ${R.xxl}px ${R.xxl}px`,boxShadow:SH.raised,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-60,right:-40,width:180,height:180,borderRadius:"50%",background:"radial-gradient(circle,rgba(232,199,126,0.18),transparent 70%)"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22,position:"relative"}}>
          <div>
            <div style={{fontSize:11,opacity:.6,letterSpacing:1.5,fontWeight:600}}>{monthYearStr()}</div>
            <div style={{fontSize:20,fontWeight:700,fontFamily:THEME.font.money,marginTop:2}}>My Finance</div>
          </div>
          <button onClick={onOpenSettings} style={{width:40,height:40,borderRadius:14,background:T.glass,border:`1px solid ${T.glassBorder}`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,cursor:"pointer",padding:0}}>⚙️</button>
        </div>

        {/* Big balance card — glassmorphism */}
        <div style={{background:T.glassStrong,borderRadius:R.xl,padding:"16px 18px",border:`1px solid ${T.glassBorder}`,
          backdropFilter:"blur(14px)",position:"relative",boxShadow:SH.glow}}>
          <div style={{fontSize:12,opacity:.65,marginBottom:5,fontWeight:600,letterSpacing:.3}}>Total Available</div>
          <div style={{fontSize:32,fontWeight:600,letterSpacing:-0.5,color:totalTracked>=0?T.mint:"#FCA5A5",fontFamily:THEME.font.money}}>
            {fmt(totalTracked)}
          </div>
          {openingBalance>0&&<div style={{fontSize:11,opacity:.5,marginTop:3}}>Includes {fmt(openingBalance)} opening balance</div>}
          <div style={{display:"flex",marginTop:16}}>
            <div style={{flex:1,borderRight:`1px solid ${T.glassBorder}`,paddingRight:14}}>
              <div style={{fontSize:11,opacity:.6,marginBottom:3,fontWeight:600}}>↑ INCOME</div>
              <div style={{fontSize:15,fontWeight:700,color:T.mint}}>{fmt(totalIncome)}</div>
            </div>
            <div style={{flex:1,paddingLeft:14}}>
              <div style={{fontSize:11,opacity:.6,marginBottom:3,fontWeight:600}}>↓ EXPENSE</div>
              <div style={{fontSize:15,fontWeight:700,color:"#FCA5A5"}}>{fmt(totalExpense)}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{padding:"0 12px",marginTop:12}}>

        {showReminder && (
          <div style={{background:T.goldSoft,borderRadius:R.lg,padding:"12px 14px",
            marginBottom:14,boxShadow:SH.card,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:20}}>🔔</span>
            <div style={{fontSize:12,color:"#946A1F",fontWeight:600,flex:1}}>
              You haven't logged anything today — tap + to add a transaction.
            </div>
          </div>
        )}

        {/* Accounts */}
        {accountBalances.length>0&&(
          <div style={{background:T.card,borderRadius:R.lg,padding:"13px",marginBottom:14,boxShadow:SH.card}}>
            <div style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:13,letterSpacing:.2}}>🏦 My Accounts</div>
            {accountBalances.map(acc=>(
              <div key={acc.id} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                <div style={{width:40,height:40,borderRadius:R.sm,background:T.bgSoft,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{acc.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:600,color:T.ink}}>{acc.name}</div>
                  <div style={{fontSize:11,color:T.inkSoft}}>{acc.type}</div>
                </div>
                <div style={{fontSize:15,fontWeight:800,color:acc.balance>=0?T.ink:T.expense,fontFamily:THEME.font.money}}>{fmt(acc.balance)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Wealth Overview (declared vs tracked) */}
        {declaredAmount>0&&(()=>{
          const isOver     = declaredDiff < 0;
          const isBalanced = declaredDiff === 0;
          const resColor   = isBalanced?T.income:isOver?T.gold:T.expense;
          return (
            <div style={{background:T.card,borderRadius:R.lg,padding:"13px",marginBottom:14,boxShadow:SH.card}}>
              <div style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:13}}>💼 Wealth Overview</div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <div style={{fontSize:13,color:T.inkSoft}}>Declared Total</div>
                <div style={{fontSize:14,fontWeight:700,color:T.ink}}>{fmt(declaredAmount)}</div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                <div style={{fontSize:13,color:T.inkSoft}}>Currently Tracked</div>
                <div style={{fontSize:14,fontWeight:700,color:T.teal500}}>{fmt(totalTracked)}</div>
              </div>
              <div style={{height:1,background:T.line,marginBottom:10}}/>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <div style={{fontSize:13,fontWeight:600,color:resColor}}>
                  {isBalanced?"✓ Balanced":isOver?"▲ More tracked than declared":"▼ Untracked amount"}
                </div>
                <div style={{fontSize:15,fontWeight:800,color:resColor,fontFamily:THEME.font.money}}>
                  {isBalanced?"Balanced":`${fmt(Math.abs(declaredDiff))} ${isOver?"over":"missing"}`}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Manual Check */}
        {manualCheck>0&&(()=>{
          const isMore    = manualDiff > 0;
          const isLess    = manualDiff < 0;
          const isExact   = manualDiff === 0;
          const topColor  = isExact?T.income:isMore?T.gold:T.expense;
          return (
            <div style={{background:T.card,borderRadius:R.lg,padding:"13px",marginBottom:14,
              boxShadow:SH.card,borderTop:`3px solid ${topColor}`}}>
              <div style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:13}}>🔎 Manual Check</div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <div style={{fontSize:13,color:T.inkSoft}}>App Calculated</div>
                <div style={{fontSize:14,fontWeight:700,color:T.ink}}>{fmt(totalTracked)}</div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                <div style={{fontSize:13,color:T.inkSoft}}>Your Count</div>
                <div style={{fontSize:14,fontWeight:700,color:T.teal500}}>{fmt(manualCheck)}</div>
              </div>
              <div style={{height:1,background:T.line,marginBottom:10}}/>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <div style={{fontSize:13,fontWeight:700,color:topColor}}>
                  {isExact?"✓ Perfect Match":isMore?"▲ You counted more":"▼ You counted less"}
                </div>
                <div style={{fontSize:15,fontWeight:800,color:topColor,fontFamily:THEME.font.money}}>
                  {isExact?"Balanced":`${fmt(Math.abs(manualDiff))} ${isMore?"extra":"short"}`}
                </div>
              </div>
              {!isExact&&(
                <div style={{marginTop:8,padding:"9px 11px",borderRadius:R.sm,fontSize:12,
                  background:isMore?T.goldSoft:T.expenseSoft,color:isMore?"#946A1F":T.expense}}>
                  {isMore
                    ?"You physically have more than the app calculated. You may have missed recording some income."
                    :"You physically have less than the app calculated. You may have missed recording some expense."}
                </div>
              )}
            </div>
          );
        })()}

        {/* ── Monthly Cash Flow Chart ── */}
        {(()=>{
          const months = getLast6Months(transactions);
          const hasData = months.some(m=>m.income>0||m.expense>0);
          if (!hasData) return null;
          const maxVal = Math.max(...months.map(m=>Math.max(m.income,m.expense)),1);
          return (
            <div style={{background:T.card,borderRadius:R.lg,padding:"14px",marginBottom:14,boxShadow:SH.card}}>
              <div style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:12}}>📈 6-Month Cash Flow</div>
              <div style={{display:"flex",alignItems:"flex-end",gap:6,height:80,marginBottom:8}}>
                {months.map((m,i)=>{
                  const incH = Math.max(3,(m.income/maxVal)*72);
                  const expH = Math.max(3,(m.expense/maxVal)*72);
                  return (
                    <div key={m.key} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                      <div style={{display:"flex",gap:2,alignItems:"flex-end",height:74}}>
                        <div style={{width:8,height:incH,background:m.isCurrentMonth?T.income:T.income+"77",borderRadius:"3px 3px 0 0"}}/>
                        <div style={{width:8,height:expH,background:m.isCurrentMonth?T.expense:T.expense+"77",borderRadius:"3px 3px 0 0"}}/>
                      </div>
                      <div style={{fontSize:9,color:m.isCurrentMonth?T.ink:T.inkSoft,fontWeight:m.isCurrentMonth?700:400}}>{m.label}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{display:"flex",gap:16,justifyContent:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:T.inkSoft}}>
                  <div style={{width:10,height:10,borderRadius:2,background:T.income}}/> Income
                </div>
                <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:T.inkSoft}}>
                  <div style={{width:10,height:10,borderRadius:2,background:T.expense}}/> Expense
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── Spending by Category ── */}
        {(()=>{
          const curMonth = todayStr().slice(0,7);
          const expThisMonth = transactions.filter(t=>t.type==="expense"&&(t.date||"").startsWith(curMonth));
          if (expThisMonth.length===0) return null;
          const catMap = {};
          expThisMonth.forEach(t=>{ catMap[t.category]=(catMap[t.category]||0)+t.amount; });
          const sorted = Object.entries(catMap).sort((a,b)=>b[1]-a[1]).slice(0,5);
          const total = sorted.reduce((s,[,v])=>s+v,0);
          const PALETTE=["#E53E3E","#3399FF","#F5B942","#1DB954","#9F8AE8","#E67E22"];
          const slices = sorted.map(([k,v],i)=>({label:k,value:v,color:PALETTE[i%PALETTE.length]}));
          return (
            <div style={{background:T.card,borderRadius:R.lg,padding:"14px",marginBottom:14,boxShadow:SH.card}}>
              <div style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:12}}>🍩 This Month's Spending</div>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{position:"relative"}}>
                  <DonutChart slices={slices} size={80}/>
                  <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
                    <div style={{fontSize:9,color:T.inkSoft,fontWeight:600}}>TOTAL</div>
                    <div style={{fontSize:11,fontWeight:800,color:T.ink}}>{fmt(total)}</div>
                  </div>
                </div>
                <div style={{flex:1}}>
                  {slices.map((sl,i)=>(
                    <div key={sl.label} style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:sl.color,flexShrink:0}}/>
                      <div style={{fontSize:12,color:T.ink,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sl.label}</div>
                      <div style={{fontSize:12,fontWeight:700,color:T.ink,fontFamily:THEME.font.money}}>{Math.round(sl.value/total*100)}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── Loan Snapshot ── */}
        {(()=>{
          const pendingGave = loans.filter(l=>l.type==="gave"&&l.status==="pending");
          const pendingTook = loans.filter(l=>l.type==="took"&&l.status==="pending");
          if (pendingGave.length===0&&pendingTook.length===0) return null;
          const totalGave = pendingGave.reduce((s,l)=>s+l.amount,0);
          const totalTook = pendingTook.reduce((s,l)=>s+l.amount,0);
          return (
            <div style={{background:T.card,borderRadius:R.lg,padding:"14px",marginBottom:14,boxShadow:SH.card}}>
              <div style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:12}}>🤝 Loan Snapshot</div>
              <div style={{display:"flex",gap:10}}>
                {pendingGave.length>0&&(
                  <div style={{flex:1,background:T.incomeSoft,borderRadius:R.md,padding:"12px"}}>
                    <div style={{fontSize:10,fontWeight:700,color:"#1E8E5A",marginBottom:4}}>🟢 THEY OWE ME</div>
                    <div style={{fontSize:16,fontWeight:800,color:"#1E8E5A",fontFamily:THEME.font.money}}>{fmt(totalGave)}</div>
                    <div style={{fontSize:11,color:"#1E8E5A",marginTop:2}}>{pendingGave.length} pending</div>
                  </div>
                )}
                {pendingTook.length>0&&(
                  <div style={{flex:1,background:T.expenseSoft,borderRadius:R.md,padding:"12px"}}>
                    <div style={{fontSize:10,fontWeight:700,color:T.expense,marginBottom:4}}>🔴 I OWE THEM</div>
                    <div style={{fontSize:16,fontWeight:800,color:T.expense,fontFamily:THEME.font.money}}>{fmt(totalTook)}</div>
                    <div style={{fontSize:11,color:T.expense,marginTop:2}}>{pendingTook.length} pending</div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Recent Transactions */}
        <div style={{background:T.card,borderRadius:R.lg,padding:"13px",boxShadow:SH.card}}>
          <div style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:13}}>Recent Transactions</div>
          {recent.length===0&&<div style={{textAlign:"center",color:"#C8D6D2",padding:"20px 0",fontSize:13}}>No transactions yet</div>}
          {recent.map(t=>(
            <div key={t.id} onClick={()=>setSelectedTx(t)} style={{display:"flex",alignItems:"center",gap:12,marginBottom:12,cursor:"pointer"}}>
              <div style={{width:40,height:40,borderRadius:R.sm,background:txBg(t),
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{t.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:600,color:T.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {t.type==="transfer"?`${t.account} → ${t.toAccount}`:t.category}
                </div>
                <div style={{fontSize:11,color:T.inkSoft,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {t.type==="transfer"
                    ? "Transfer"
                    : t.account + (t.note ? ` · ${t.note}` : "")}
                  {fmtTime(t.createdAt) ? ` · ${fmtTime(t.createdAt)}` : ""}
                </div>
              </div>
              <div style={{fontSize:15,fontWeight:700,color:txColor(t),flexShrink:0,fontFamily:THEME.font.money}}>
                {txPrefix(t)}{fmt(t.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <TransactionDetailSheet tx={selectedTx} onClose={()=>setSelectedTx(null)} onDelete={deleteTx} onEdit={openEdit} onPhotoChange={updateTxPhoto} transactions={transactions} accounts={accounts}/>
    
      {/* Edit Sheet for Dashboard */}
      <Sheet open={showEditSheet} onClose={()=>{setShowEditSheet(false); setEditTxId(null);}}>
        <div style={{fontSize:17,fontWeight:800,color:T.ink,marginBottom:14,fontFamily:THEME.font.money}}>Edit Transaction</div>
        <TypeToggle
          options={[["expense","↓ Expense"],["income","↑ Income"],["transfer","⇄ Transfer"]]}
          value={editForm.type} onChange={v=>setEditForm({...editForm,type:v})}
          colors={{expense:G.expense,income:G.income,transfer:G.transfer}}/>

        <Label>AMOUNT</Label>
        <FInput value={editForm.amount} onChange={e=>setEditForm({...editForm,amount:e.target.value})}
          placeholder="₹ 0" type="number" style={{fontSize:19,fontWeight:700,marginBottom:12,fontFamily:THEME.font.money}}/>

        {editForm.type!=="transfer" ? (
          <>
            <Label>CATEGORY</Label>
            <ChipRow items={(editForm.type==="income"?categories.income:categories.expense).map(c=>c.l)}
              selected={editForm.category} onSelect={v=>setEditForm({...editForm,category:v})}/>
            <Label>ACCOUNT</Label>
            <ChipRow items={accounts.map(a=>a.name)} selected={editForm.account} onSelect={v=>setEditForm({...editForm,account:v})}/>
            <Label>HOW</Label>
            <ChipRow items={editForm.type==="income"?INCOME_METHODS:EXPENSE_METHODS} selected={editForm.method} onSelect={v=>setEditForm({...editForm,method:v})}/>
          </>
        ) : (
          <>
            <Label>FROM ACCOUNT</Label>
            <ChipRow items={accounts.map(a=>a.name)} selected={editForm.account} onSelect={v=>setEditForm({...editForm,account:v})}/>
            <Label>TO ACCOUNT</Label>
            <ChipRow items={accounts.map(a=>a.name)} selected={editForm.toAccount} onSelect={v=>setEditForm({...editForm,toAccount:v})}/>
          </>
        )}

        <Label>NOTE (OPTIONAL)</Label>
        <FInput value={editForm.note} onChange={e=>setEditForm({...editForm,note:e.target.value})}
          placeholder="Add a note…" style={{marginBottom:10}}/>
        <Label>DATE</Label>
        <FInput value={editForm.date} onChange={e=>setEditForm({...editForm,date:e.target.value})}
          type="date" style={{marginBottom:16}}/>
        <FBtn onClick={saveEdit} style={{width:"100%",padding:"15px"}}>Update Transaction</FBtn>
      </Sheet>

      {/* Delete Confirm Modal — Dashboard */}
      {delTxId && (
        <div style={{position:"fixed",inset:0,background:"rgba(10,26,24,0.55)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:24,backdropFilter:"blur(2px)"}}>
          <div style={{background:T.card,borderRadius:R.xl,padding:"28px 24px",width:"100%",maxWidth:320,textAlign:"center",boxShadow:SH.raised}}>
            <div style={{fontSize:36,marginBottom:10}}>🗑️</div>
            <div style={{fontSize:16,fontWeight:700,marginBottom:8,color:T.ink}}>Delete this transaction?</div>
            <div style={{fontSize:13,color:T.inkSoft,marginBottom:22}}>This will move it to Trash and can be restored later.</div>
            <div style={{display:"flex",gap:10}}>
              <FBtn onClick={()=>setDelTxId(null)} outline color={T.inkSoft} style={{flex:1}}>Cancel</FBtn>
              <FBtn onClick={()=>confirmDeleteTx(delTxId)} bg={G.expense} style={{flex:1}}>Delete</FBtn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
const makeEmptyTx = () => ({type:"expense",category:"",icon:"📦",amount:"",note:"",date:todayStr(),account:"",toAccount:"",method:"",photo:null});
const EMPTY_TX = makeEmptyTx(); // static fallback; always use makeEmptyTx() for new forms

function Transactions({ transactions, setTransactions, setTrash, accounts, categories, recurring, setRecurring }) {
  const [search, setSearch]       = useState("");
  const [showSheet, setShowSheet] = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(makeEmptyTx);
  const [selectedTx, setSelectedTx] = useState(null);
  const [viewPhoto, setViewPhoto] = useState(null);
  const [filterType, setFilterType] = useState("all");   // all | income | expense | transfer
  const [filterMonth, setFilterMonth] = useState("");     // "" = all, "YYYY-MM" = specific

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImage(file, (compressed) => {
      setForm(f => ({ ...f, photo: compressed }));
    });
  };

  const [delTxId, setDelTxId] = useState(null);
  const deleteTx = (id) => { setDelTxId(id); };
  const confirmDeleteTx = (id) => {
    const tx = transactions.find(t => t.id === id);
    if (tx) {
      setTrash(prev => ({ ...prev, transactions: [...prev.transactions, tx] }));
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
    setDelTxId(null);
  };

  const openEdit = (tx) => {
    setEditId(tx.id);
    setForm({ ...tx, amount: String(tx.amount) });
    setShowSheet(true);
  };

  const updateTxPhoto = (id, photo) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, photo } : t));
    setSelectedTx(prev => prev?.id === id ? { ...prev, photo } : prev);
  };

  const handleListPhoto = (id, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImage(file, compressed => updateTxPhoto(id, compressed));
    e.target.value = "";
  };

  const save = () => {
    if (!form.amount || parseFloat(form.amount)<=0) return;
    const now = Date.now();
    let entry;
    if (form.type==="transfer") {
      if (!form.account || !form.toAccount || form.account===form.toAccount) return;
      entry = {
        type:"transfer",category:"Transfer",icon:"⇄",
        amount:parseFloat(form.amount),note:form.note,date:form.date,
        account:form.account,toAccount:form.toAccount,method:"",
        photo: form.photo || null,
      };
    } else {
      if (!form.category || !form.account) return;
      const cat = [...(categories?.income||[]),...(categories?.expense||[])].find(c=>c.l===form.category);
      entry = {...form, icon:cat?.icon||"💰", amount:parseFloat(form.amount), toAccount:"", photo: form.photo || null};
    }

    if (editId) {
      setTransactions(prev => prev.map(t => t.id === editId ? { ...entry, id: editId, createdAt: t.createdAt, photo: entry.photo ?? t.photo } : t));
    } else {
      setTransactions(prev => [{ ...entry, id: now, createdAt: now }, ...prev]);
    }

    setShowSheet(false);
    setEditId(null);
    setForm(makeEmptyTx());
  };

  const handleSearch = (e) => {
    const v = e.target.value;
    setSearch(v);
    if (v.trim().toLowerCase() === "create") {
      setTimeout(()=>{ setSearch(""); setForm(makeEmptyTx()); setShowSheet(true); }, 200);
    }
  };

  const filtered = sortByDateDesc(transactions).filter(t => {
    if (filterType !== "all" && t.type !== filterType) return false;
    if (filterMonth && !(t.date || "").startsWith(filterMonth)) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!(t.category||"").toLowerCase().includes(q)
        && !(t.note||"").toLowerCase().includes(q)
        && !(t.account||"").toLowerCase().includes(q)
        && !(t.toAccount||"").toLowerCase().includes(q)) return false;
    }
    return true;
  });

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
      const val = d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0");
      const lbl = d.toLocaleDateString("en-IN",{month:"short",year:"numeric"});
      opts.push({ value: val, label: lbl });
    }
    return opts;
  })();



  const accountNames = accounts.map(a => a.name);
  const methods = form.type === "income" ? INCOME_METHODS : EXPENSE_METHODS;
  const today = todayStr();
  const todayInc = transactions.filter(t => t.type==="income" && t.date===today).reduce((s,t)=>s+t.amount,0);
  const todayExp = transactions.filter(t => t.type==="expense" && t.date===today).reduce((s,t)=>s+t.amount,0);
  const txColor  = t => t.type==="income"?T.income:t.type==="transfer"?"#9F8AE8":T.expense;
  const txBg     = t => t.type==="income"?T.incomeSoft:t.type==="transfer"?T.transferSoft:T.expenseSoft;
  const txPrefix = t => t.type==="income"?"+":t.type==="transfer"?"⇄":"−";

  return (
    <div>
      <div style={{background:G.header,padding:"22px 16px 18px",color:"white",borderRadius:`0 0 ${R.xl}px ${R.xl}px`,boxShadow:SH.card}}>
        <div style={{fontSize:11,opacity:.6,letterSpacing:1.5,fontWeight:600}}>{monthYearStr()}</div>
        <div style={{fontSize:20,fontWeight:700,marginBottom:12,fontFamily:THEME.font.money}}>Transactions</div>
        <SearchBar value={search} onChange={handleSearch} placeholder='Search or type "create"…'/>
      </div>

      <div style={{padding:"10px 12px"}}>
        {/* Today summary */}
        <div style={{display:"flex",gap:10,marginBottom:12}}>
          <div style={{flex:1,background:T.card,borderRadius:R.md,padding:"12px",boxShadow:SH.card,borderTop:`3px solid ${T.income}`}}>
            <div style={{fontSize:10,color:T.inkSoft,marginBottom:3,fontWeight:600}}>TODAY IN</div>
            <div style={{fontSize:15,fontWeight:800,color:T.income,fontFamily:THEME.font.money}}>{fmt(todayInc)}</div>
          </div>
          <div style={{flex:1,background:T.card,borderRadius:R.md,padding:"12px",boxShadow:SH.card,borderTop:`3px solid ${T.expense}`}}>
            <div style={{fontSize:10,color:T.inkSoft,marginBottom:3,fontWeight:600}}>TODAY OUT</div>
            <div style={{fontSize:15,fontWeight:800,color:T.expense,fontFamily:THEME.font.money}}>{fmt(todayExp)}</div>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{display:"flex",gap:6,marginBottom:10,overflowX:"auto",paddingBottom:2}}>
          {[["all","All"],["income","↑ In"],["expense","↓ Out"],["transfer","⇄"]].map(([v,lbl])=>(
            <button key={v} onClick={()=>setFilterType(v)} style={{
              flexShrink:0,padding:"7px 12px",borderRadius:R.pill,
              border:`1.5px solid ${filterType===v?T.teal500:T.line}`,
              background:filterType===v?T.mintSoft:T.card,
              color:filterType===v?T.teal700:T.inkSoft,
              fontSize:12,fontWeight:700,cursor:"pointer"
            }}>{lbl}</button>
          ))}
          <select value={filterMonth} onChange={e=>setFilterMonth(e.target.value)} style={{
            flexShrink:0,padding:"7px 10px",borderRadius:R.pill,
            border:`1.5px solid ${filterMonth?T.teal500:T.line}`,
            background:filterMonth?T.mintSoft:T.card,
            color:filterMonth?T.teal700:T.inkSoft,
            fontSize:12,fontWeight:700,cursor:"pointer",outline:"none"
          }}>
            {monthOptions.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {Object.keys(grouped).length===0&&(
          <div style={{textAlign:"center",padding:"40px 0",color:"#9FB3AD"}}>
            <div style={{fontSize:36,marginBottom:8}}>🔍</div>
            <div style={{fontSize:14,fontWeight:600,color:T.ink}}>{search||filterType!=="all"||filterMonth?"No results":"No transactions yet"}</div>
            <div style={{fontSize:12,marginTop:4}}>Tap + or type "create" to add one</div>
          </div>
        )}
        {Object.entries(grouped).map(([lbl,txns])=>(
          <div key={lbl} style={{marginBottom:16}}>
            <div style={{fontSize:11,color:T.inkSoft,fontWeight:700,letterSpacing:.6,marginBottom:8}}>{lbl.toUpperCase()}</div>
            <div style={{background:T.card,borderRadius:R.lg,padding:"4px 14px",boxShadow:SH.card}}>
              {txns.map((t,i)=>(
                <div key={t.id} onClick={()=>setSelectedTx(t)} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 0",
                  borderBottom:i<txns.length-1?`1px solid ${T.line}`:"none",cursor:"pointer"}}>
                  <div style={{width:42,height:42,borderRadius:R.sm,background:txBg(t),
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{t.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      <div style={{fontSize:14,fontWeight:600,color:T.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {t.type==="transfer"?`${t.account} → ${t.toAccount}`:t.category}
                      </div>
                      {t.recurringId&&<span style={{fontSize:9,background:T.mintSoft,color:T.teal700,borderRadius:R.pill,padding:"2px 6px",fontWeight:700,flexShrink:0}}>🔁</span>}
                    </div>
                    <div style={{fontSize:11,color:T.inkSoft}}>
                      {t.type==="transfer"?"Transfer":`${t.account}${t.method?" · "+t.method:""}`}
                      {fmtTime(t.createdAt)?` · ${fmtTime(t.createdAt)}`:""}
                    </div>
                    {t.note&&t.type!=="transfer"&&<div style={{fontSize:11,color:"#A8B8B3"}}>{t.note}</div>}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5,flexShrink:0}}>
                    <div style={{fontSize:15,fontWeight:700,color:txColor(t),fontFamily:THEME.font.money}}>
                      {txPrefix(t)}{fmt(t.amount)}
                    </div>
                    <div style={{display:"flex",gap:5}}>
                      {t.photo && <button onClick={e=>{e.stopPropagation();setViewPhoto(t.photo);}} aria-label="View transaction photo" style={{width:28,height:26,padding:0,border:`1px solid ${T.teal500}`,borderRadius:7,background:T.mintSoft,color:T.teal700,fontSize:13,cursor:"pointer"}}>👁️</button>}
                      <label onClick={e=>e.stopPropagation()} aria-label={t.photo?"Replace transaction photo":"Add transaction photo"} style={{width:28,height:26,padding:0,border:`1px solid ${T.line}`,borderRadius:7,background:T.bgSoft,color:T.teal500,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        📷
                        <input type="file" accept="image/*" onChange={e=>handleListPhoto(t.id,e)} style={{display:"none"}}/>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button onClick={()=>{setForm(makeEmptyTx());setShowSheet(true);}}
        onMouseDown={e=>e.currentTarget.style.transform="scale(0.93)"}
        onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}
        style={{
        position:"fixed",bottom:90,right:"max(16px, calc(50% - 210px + 16px))",
        width:58,height:58,borderRadius:R.pill,background:G.gold,
        color:T.teal900,fontSize:28,border:"none",cursor:"pointer",fontWeight:700,
        boxShadow:"0 8px 22px rgba(232,199,126,0.5)",display:"flex",alignItems:"center",justifyContent:"center",
        transition:"transform .12s ease"
      }}>+</button>

      <Sheet open={showSheet} onClose={()=>setShowSheet(false)}>
        <div style={{fontSize:17,fontWeight:800,color:T.ink,marginBottom:14,fontFamily:THEME.font.money}}>{editId?"Edit Transaction":"Add Transaction"}</div>
        <TypeToggle
          options={[["expense","↓ Expense"],["income","↑ Income"],["transfer","⇄ Transfer"]]}
          value={form.type} onChange={v=>setForm({...makeEmptyTx(),type:v})}
          colors={{expense:G.expense,income:G.income,transfer:G.transfer}}/>

        <Label>AMOUNT</Label>
        <FInput value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}
          placeholder="₹ 0" type="number" style={{fontSize:19,fontWeight:700,marginBottom:12,fontFamily:THEME.font.money}}/>

        {form.type==="transfer" ? (<>
          <Label>FROM ACCOUNT</Label>
          {accountNames.length===0
            ?<div style={{fontSize:12,color:"#946A1F",marginBottom:12,padding:"10px 12px",background:T.goldSoft,borderRadius:R.sm}}>
               ⚠️ No accounts. Add accounts in Settings first.
             </div>
            :<ChipRow items={accountNames} selected={form.account}
                onSelect={v=>setForm({...form,account:v,toAccount:form.toAccount===v?"":form.toAccount})}
                activeColor="#7C66D9" activeBg={T.transferSoft}/>
          }
          <div style={{textAlign:"center",fontSize:20,marginBottom:10,color:"#9F8AE8"}}>⬇</div>
          <Label>TO ACCOUNT</Label>
          <ChipRow items={accountNames.filter(a=>a!==form.account)} selected={form.toAccount}
            onSelect={v=>setForm({...form,toAccount:v})}
            activeColor="#7C66D9" activeBg={T.transferSoft}/>
        </>) : (<>
          <Label>CATEGORY</Label>
          <ChipRow items={categories?.[form.type]||[]} selected={form.category}
            onSelect={v=>{
              const cat=(categories?.[form.type]||[]).find(c=>c.l===v);
              setForm({...form,category:v,icon:cat?.icon||"💰"});
            }}/>
          <Label>{form.type==="income"?"RECEIVED IN":"PAID FROM"}</Label>
          {accountNames.length===0
            ?<div style={{fontSize:12,color:"#946A1F",marginBottom:12,padding:"10px 12px",background:T.goldSoft,borderRadius:R.sm}}>
               ⚠️ No accounts. Add accounts in Settings first.
             </div>
            :<ChipRow items={accountNames} selected={form.account} onSelect={v=>setForm({...form,account:v})}/>
          }
          <Label>HOW</Label>
          <ChipRow items={methods} selected={form.method} onSelect={v=>setForm({...form,method:v})}/>
        </>)}

        <Label>NOTE (OPTIONAL)</Label>
        <FInput value={form.note} onChange={e=>setForm({...form,note:e.target.value})}
          placeholder="Add a note…" style={{marginBottom:10}}/>
        
        <Label>PHOTO (OPTIONAL)</Label>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <label style={{ flex: 1, padding: "10px 8px", borderRadius: R.sm, border: `1.5px solid ${T.line}`, background: T.bgSoft, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, fontWeight: 700, color: T.teal500, cursor: "pointer" }}>
              📷 Camera
              <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{display:"none"}}/>
            </label>
            <label style={{ flex: 1, padding: "10px 8px", borderRadius: R.sm, border: `1.5px solid ${T.line}`, background: T.bgSoft, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, fontWeight: 700, color: T.teal500, cursor: "pointer" }}>
              🖼️ Gallery
              <input type="file" accept="image/*" onChange={handlePhoto} style={{display:"none"}}/>
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
        <FInput value={form.date} onChange={e=>setForm({...form,date:e.target.value})}
          type="date" style={{marginBottom:16}}/>
        <FBtn onClick={save} style={{width:"100%",padding:"15px"}}>Save Transaction</FBtn>
      </Sheet>

      <TransactionDetailSheet tx={selectedTx} onClose={()=>setSelectedTx(null)} onDelete={deleteTx} onEdit={openEdit} onPhotoChange={updateTxPhoto} transactions={transactions} accounts={accounts}/>

      {viewPhoto && (
        <div onClick={()=>setViewPhoto(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <img src={viewPhoto} alt="Transaction photo" style={{maxWidth:"100%",maxHeight:"85%",objectFit:"contain",borderRadius:R.lg,boxShadow:"0 0 30px rgba(0,0,0,0.5)"}}/>
          <button onClick={()=>setViewPhoto(null)} aria-label="Close photo" style={{position:"absolute",top:30,right:20,background:"white",border:"none",borderRadius:"50%",width:40,height:40,fontSize:20,fontWeight:700,cursor:"pointer"}}>✕</button>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {delTxId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,26,24,0.55)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(2px)" }}>
          <div style={{ background: T.card, borderRadius: R.xl, padding: "28px 24px", width: "100%", maxWidth: 320, textAlign: "center", boxShadow: SH.raised }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🗑️</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: T.ink }}>Delete this transaction?</div>
            <div style={{ fontSize: 13, color: T.inkSoft, marginBottom: 22 }}>Are you sure? This will move it to Trash and can be restored later.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <FBtn onClick={() => setDelTxId(null)} outline color={T.inkSoft} style={{ flex: 1 }}>Cancel</FBtn>
              <FBtn onClick={() => confirmDeleteTx(delTxId)} bg={G.expense} style={{ flex: 1 }}>Delete</FBtn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── LOANS ────────────────────────────────────────────────────────────────────
const makeEmptyLoan = () => ({ type:"took", name:"", amount:"", reason:"", date:todayStr(), dueDate:"", status:"pending", payments:[] });
const EMPTY_LOAN = makeEmptyLoan();

function Loans({ loans, setLoans, setTrash }) {
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState("all");
  const [showSheet, setShowSheet] = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(makeEmptyLoan);
  const [delId, setDelId]         = useState(null);
  const [payLoanId, setPayLoanId] = useState(null); // partial payment
  const [payAmount, setPayAmount] = useState("");

  const handleSearch = (e) => {
    const v = e.target.value;
    setSearch(v);
    if (v.trim().toLowerCase()==="create") {
      setTimeout(()=>{ setSearch(""); setForm(makeEmptyLoan()); setEditId(null); setShowSheet(true); },200);
    }
  };

  const totalTook = loans.filter(l=>l.type==="took"&&l.status==="pending").reduce((s,l)=>s+l.amount,0);
  const totalGave = loans.filter(l=>l.type==="gave"&&l.status==="pending").reduce((s,l)=>s+l.amount,0);
  const net       = totalGave - totalTook;

  const visible = loans
    .filter(l=>filter==="all"||l.type===filter)
    .filter(l=>{
      if (!search) return true;
      const q=search.toLowerCase();
      return (l.name||"").toLowerCase().includes(q)||(l.reason||"").toLowerCase().includes(q);
    });

  const openAdd  = ()  => { setForm(makeEmptyLoan()); setEditId(null); setShowSheet(true); };
  const openEdit = (l) => { setForm({...l,amount:String(l.amount)}); setEditId(l.id); setShowSheet(true); };

  const save = () => {
    if (!form.name||!form.amount||parseFloat(form.amount)<=0) return;
    const entry = {...form, amount:parseFloat(form.amount), payments: form.payments||[]};
    if (editId) setLoans(prev=>prev.map(l=>l.id===editId?{...entry,id:editId}:l));
    else        setLoans(prev=>[{...entry,id:Date.now()},...prev]);
    setShowSheet(false); setEditId(null);
  };

  const addPayment = (loanId) => {
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) return;
    setLoans(prev => prev.map(l => {
      if (l.id !== loanId) return l;
      const payments = [...(l.payments||[]), { id: Date.now(), amount: amt, date: todayStr() }];
      const paid = payments.reduce((s,p)=>s+p.amount, 0);
      const status = paid >= l.amount ? "returned" : "pending";
      return { ...l, payments, status };
    }));
    setPayAmount("");
    setPayLoanId(null);
  };


  const toggleStatus = (id) =>
    setLoans(prev=>prev.map(l=>l.id===id?{...l,status:l.status==="pending"?"returned":"pending"}:l));
  const remove = (id) => {
    const loan = loans.find(l => l.id === id);
    if (loan) {
      setTrash(prev => ({ ...prev, loans: [...prev.loans, loan] }));
      setLoans(prev => prev.filter(l => l.id !== id));
    }
    setDelId(null);
  };

  return (
    <div>
      <div style={{background:G.header,padding:"22px 16px 18px",color:"white",borderRadius:`0 0 ${R.xl}px ${R.xl}px`,boxShadow:SH.card}}>
        <div style={{fontSize:11,opacity:.6,letterSpacing:1.5,fontWeight:600}}>{monthYearStr()}</div>
        <div style={{fontSize:20,fontWeight:700,marginBottom:14,fontFamily:THEME.font.money}}>Loans</div>
        {/* Net position */}
        <div style={{background:T.glassStrong,borderRadius:R.lg,padding:"15px 18px",
          border:`1px solid ${T.glassBorder}`,marginBottom:14,backdropFilter:"blur(12px)"}}>
          <div style={{fontSize:11,opacity:.65,marginBottom:4,fontWeight:600}}>NET POSITION</div>
          <div style={{fontSize:28,fontWeight:700,letterSpacing:-0.5,color:net>=0?T.mint:"#FCA5A5",fontFamily:THEME.font.money}}>
            {net>=0?"+":""}{fmt(Math.abs(net))}
          </div>
          <div style={{display:"flex",gap:20,marginTop:10}}>
            <div>
              <div style={{fontSize:11,opacity:.6}}>🔴 I OWE</div>
              <div style={{fontSize:15,fontWeight:700,color:"#FCA5A5"}}>{fmt(totalTook)}</div>
            </div>
            <div>
              <div style={{fontSize:11,opacity:.6}}>🟢 THEY OWE</div>
              <div style={{fontSize:15,fontWeight:700,color:T.mint}}>{fmt(totalGave)}</div>
            </div>
          </div>
        </div>
        <SearchBar value={search} onChange={handleSearch} placeholder='Search or type "create"…'/>
      </div>

      <div style={{padding:"10px 12px"}}>
        {/* Filter */}
        <div style={{display:"flex",background:T.card,borderRadius:R.md,padding:4,marginBottom:14,
          boxShadow:SH.card,gap:4}}>
          {[["all","All"],["took","🔴 I Took"],["gave","🟢 I Gave"]].map(([v,lbl])=>(
            <button key={v} onClick={()=>setFilter(v)} style={{flex:1,padding:"11px 4px",border:"none",
              borderRadius:R.sm,cursor:"pointer",fontWeight:700,fontSize:12,fontFamily:THEME.font.body,
              background:filter===v?G.primary:"transparent",
              boxShadow:filter===v?SH.soft:"none",
              color:filter===v?"white":T.inkSoft}}>{lbl}</button>
          ))}
        </div>

        {visible.length===0&&(
          <div style={{textAlign:"center",padding:"40px 0",color:"#9FB3AD"}}>
            <div style={{fontSize:36,marginBottom:8}}>📭</div>
            <div style={{fontSize:14,fontWeight:600,color:T.ink}}>{search?"No results":"No loans here"}</div>
            <div style={{fontSize:12,marginTop:4}}>Tap + or type "create" to add one</div>
          </div>
        )}

        {visible.map(loan=>{
          const payments = loan.payments||[];
          const paidAmt  = payments.reduce((s,p)=>s+p.amount,0);
          const remaining= Math.max(0, loan.amount - paidAmt);
          const paidPct  = Math.min(100, loan.amount>0?(paidAmt/loan.amount)*100:0);
          const isOverdue= loan.dueDate && loan.dueDate < todayStr() && loan.status==="pending";
          return (
          <div key={loan.id} style={{background:T.card,borderRadius:R.lg,padding:"10px 12px",marginBottom:12,
            boxShadow:SH.card,
            borderLeft:`4px solid ${isOverdue?"#E53E3E":loan.type==="took"?T.expense:T.income}`,
            opacity:loan.status==="returned"?.65:1}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:46,height:46,borderRadius:"50%",flexShrink:0,
                background:avatarColor(loan.name),display:"flex",alignItems:"center",
                justifyContent:"center",color:"white",fontWeight:800,fontSize:18,
                boxShadow:"0 3px 8px rgba(0,0,0,0.18)"}}>
                {(loan.name||"?")[0].toUpperCase()}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                  <div style={{fontSize:15,fontWeight:700,color:T.ink}}>{loan.name}</div>
                  <span style={{fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:R.pill,
                    background:loan.status==="returned"?T.incomeSoft:isOverdue?T.expenseSoft:T.goldSoft,
                    color:loan.status==="returned"?"#1E8E5A":isOverdue?T.expense:"#946A1F"}}>
                    {loan.status==="returned"?"✓ Settled":isOverdue?"⚠️ Overdue":"Pending"}
                  </span>
                </div>
                <div style={{fontSize:12,color:T.inkSoft,marginTop:2}}>{loan.reason||"—"}</div>
                <div style={{fontSize:11,color:"#A8B8B3",marginTop:1}}>
                  {loan.date}{loan.dueDate?` · Due: ${loan.dueDate}`:""}
                </div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:17,fontWeight:800,color:loan.type==="took"?T.expense:T.income,fontFamily:THEME.font.money}}>
                  {loan.type==="took"?"−":"+"}{fmt(loan.amount)}
                </div>
                {paidAmt>0&&<div style={{fontSize:11,color:T.inkSoft,marginTop:1}}>Paid: {fmt(paidAmt)}</div>}
              </div>
            </div>

            {/* Partial payment progress bar */}
            {paidAmt>0&&loan.status!=="returned"&&(
              <div style={{margin:"10px 0 4px"}}>
                <div style={{height:5,borderRadius:R.pill,background:T.bgSoft,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${paidPct}%`,background:T.income,borderRadius:R.pill,transition:"width .3s"}}/>
                </div>
                <div style={{fontSize:10,color:T.inkSoft,marginTop:3}}>
                  {fmt(paidAmt)} paid · {fmt(remaining)} remaining
                </div>
              </div>
            )}

            <div style={{display:"flex",gap:8,marginTop:12,paddingTop:10,borderTop:`1px solid ${T.line}`,flexWrap:"wrap"}}>
              <button onClick={()=>toggleStatus(loan.id)} style={{flex:1,minWidth:80,padding:"9px 0",borderRadius:R.sm,
                border:"1.5px solid",cursor:"pointer",fontFamily:THEME.font.body,fontWeight:700,fontSize:11,
                borderColor:loan.status==="returned"?T.line:T.income,
                background:loan.status==="returned"?T.bgSoft:T.incomeSoft,
                color:loan.status==="returned"?T.inkSoft:"#1E8E5A"}}>
                {loan.status==="returned"?"↩ Pending":"✓ Settle"}
              </button>
              {loan.status!=="returned"&&(
                <button onClick={()=>{setPayLoanId(loan.id);setPayAmount("");}} style={{flex:1,minWidth:80,padding:"9px 0",borderRadius:R.sm,
                  border:`1.5px solid ${T.teal500}`,background:T.mintSoft,color:T.teal700,
                  fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:THEME.font.body}}>
                  💰 Pay Part
                </button>
              )}
              <button onClick={()=>openEdit(loan)} style={{padding:"9px 12px",borderRadius:R.sm,
                border:`1.5px solid ${T.line}`,background:"#F0F6FF",color:T.teal500,
                fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:THEME.font.body}}>✏️</button>
              <button onClick={()=>setDelId(loan.id)} style={{padding:"9px 12px",borderRadius:R.sm,
                border:"1.5px solid #FBD5D5",background:T.expenseSoft,color:T.expense,
                fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:THEME.font.body}}>🗑</button>
            </div>
          </div>
        );})}
      </div>

      {/* FAB */}
      <button onClick={openAdd}
        onMouseDown={e=>e.currentTarget.style.transform="scale(0.93)"}
        onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}
        style={{position:"fixed",bottom:90,right:"max(16px, calc(50% - 210px + 16px))",
        width:58,height:58,borderRadius:R.pill,background:G.gold,
        color:T.teal900,fontSize:28,border:"none",cursor:"pointer",fontWeight:700,
        boxShadow:"0 8px 22px rgba(232,199,126,0.5)",display:"flex",alignItems:"center",justifyContent:"center",
        transition:"transform .12s ease"}}>+</button>

      {/* Delete confirm modal */}
      {delId&&(
        <div style={{position:"fixed",inset:0,background:"rgba(10,26,24,0.55)",zIndex:400,
          display:"flex",alignItems:"center",justifyContent:"center",padding:24,backdropFilter:"blur(2px)"}}>
          <div style={{background:T.card,borderRadius:R.xl,padding:"28px 24px",width:"100%",maxWidth:320,textAlign:"center",boxShadow:SH.raised}}>
            <div style={{fontSize:36,marginBottom:10}}>🗑️</div>
            <div style={{fontSize:16,fontWeight:700,marginBottom:8,color:T.ink}}>Delete this loan?</div>
            <div style={{fontSize:13,color:T.inkSoft,marginBottom:22}}>This cannot be undone.</div>
            <div style={{display:"flex",gap:10}}>
              <FBtn onClick={()=>setDelId(null)} outline color={T.inkSoft} style={{flex:1}}>Cancel</FBtn>
              <FBtn onClick={()=>remove(delId)} bg={G.expense} style={{flex:1}}>Delete</FBtn>
            </div>
          </div>
        </div>
      )}

      {/* Partial payment modal */}
      {payLoanId && (()=>{
        const loan = loans.find(l=>l.id===payLoanId);
        if (!loan) return null;
        const paid = (loan.payments||[]).reduce((s,p)=>s+p.amount,0);
        const remaining = loan.amount - paid;
        return (
          <div style={{position:"fixed",inset:0,background:"rgba(10,26,24,0.55)",zIndex:400,
            display:"flex",alignItems:"center",justifyContent:"center",padding:24,backdropFilter:"blur(2px)"}}>
            <div style={{background:T.card,borderRadius:R.xl,padding:"24px",width:"100%",maxWidth:340,boxShadow:SH.raised}}>
              <div style={{fontSize:15,fontWeight:800,color:T.ink,marginBottom:4}}>💰 Record Payment</div>
              <div style={{fontSize:12,color:T.inkSoft,marginBottom:14}}>
                {loan.name} · Remaining: {fmt(Math.max(0,remaining))}
              </div>
              <FInput value={payAmount} onChange={e=>setPayAmount(e.target.value)}
                placeholder="₹ amount paid" type="number"
                style={{fontSize:18,fontWeight:700,marginBottom:14,fontFamily:THEME.font.money}}/>
              {/* Quick fill buttons */}
              <div style={{display:"flex",gap:6,marginBottom:14}}>
                {[remaining*0.25, remaining*0.5, remaining].map((v,i)=>(
                  <button key={i} onClick={()=>setPayAmount(String(Math.round(v)))} style={{
                    flex:1,padding:"8px 4px",borderRadius:R.sm,border:`1px solid ${T.line}`,
                    background:T.bgSoft,color:T.teal700,fontSize:11,fontWeight:700,cursor:"pointer"
                  }}>{["25%","50%","Full"][i]}</button>
                ))}
              </div>
              <div style={{display:"flex",gap:8}}>
                <FBtn onClick={()=>{setPayLoanId(null);setPayAmount("");}} outline color={T.inkSoft} style={{flex:1}}>Cancel</FBtn>
                <FBtn onClick={()=>addPayment(payLoanId)} style={{flex:1}}>Save</FBtn>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Add/Edit Sheet */}
      <Sheet open={showSheet} onClose={()=>setShowSheet(false)}>
        <div style={{fontSize:17,fontWeight:800,color:T.ink,marginBottom:14,fontFamily:THEME.font.money}}>{editId?"Edit Loan":"Add Loan"}</div>
        <TypeToggle options={[["took","🔴 I Took"],["gave","🟢 I Gave"]]} value={form.type}
          onChange={v=>{ if (!editId) setForm({...makeEmptyLoan(),type:v}); else setForm({...form,type:v}); }} colors={{took:G.expense,gave:G.income}}/>
        <Label>PERSON'S NAME</Label>
        <FInput value={form.name} onChange={e=>setForm({...form,name:e.target.value})}
          placeholder="e.g. Rahul Sharma" style={{marginBottom:10}}/>
        <Label>AMOUNT</Label>
        <FInput value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}
          placeholder="₹ 0" type="number" style={{fontSize:18,fontWeight:700,marginBottom:10,fontFamily:THEME.font.money}}/>
        <Label>REASON (OPTIONAL)</Label>
        <FInput value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})}
          placeholder="e.g. Medical, Travel…" style={{marginBottom:10}}/>
        <Label>DATE</Label>
        <FInput value={form.date} onChange={e=>setForm({...form,date:e.target.value})}
          type="date" style={{marginBottom:10}}/>
        <Label>DUE DATE (OPTIONAL)</Label>
        <FInput value={form.dueDate||""} onChange={e=>setForm({...form,dueDate:e.target.value})}
          type="date" style={{marginBottom:12}}/>
        <Label>STATUS</Label>
        <div style={{display:"flex",gap:8,marginBottom:18}}>
          {[["pending","⏳ Pending"],["returned","✓ Settled"]].map(([v,lbl])=>(
            <button key={v} onClick={()=>setForm({...form,status:v})} style={{flex:1,padding:"11px",
              border:"1.5px solid",borderRadius:R.sm,cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:THEME.font.body,
              borderColor:form.status===v?T.teal500:T.line,
              background:form.status===v?T.mintSoft:T.card,
              color:form.status===v?T.teal700:T.inkSoft}}>{lbl}</button>
          ))}
        </div>
        <FBtn onClick={save} style={{width:"100%",padding:"15px"}}>{editId?"Update Loan":"Save Loan"}</FBtn>
      </Sheet>
    </div>
  );
}


// ─── WORK COMPONENT ───────────────────────────────────────────────────────────
function genWorkCode(existingCodes) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const len = 4;
  let code;
  do {
    code = "";
    for (let i = 0; i < len; i++) code += chars[Math.floor(Math.random() * chars.length)];
  } while (existingCodes.has(code));
  return code;
}

const makeEmptyWork = () => ({ type: "work", name: "", customer: "", code: "", status: "unpaid", amount: "", method: "Cash", date: todayStr(), photo: null });
const EMPTY_WORK = makeEmptyWork(); // static fallback

// Spend totals are adjusted by the amount delta on edits. This prevents an edit
// from deducting the entire new amount a second time.
const applySpendAmountChange = (currentTotal, oldAmount, newAmount) =>
  currentTotal - (newAmount - oldAmount);

function Work({ workRecords, setWorkRecords, workNames }) {
  const [search, setSearch] = useState("");
  const [showSheet, setShowSheet] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(makeEmptyWork);
  const [delId, setDelId] = useState(null);
  const [viewPhoto, setViewPhoto] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const getWorkBalance = records => records.reduce((total, record) =>
    total + (record.type === "spend" ? -(Number(record.amount) || 0) : (Number(record.amount) || 0)), 0
  );
  const [workBalance, setWorkBalance] = useState(() => getWorkBalance(workRecords));

  // Keep the displayed total correct if records are restored from backup or
  // otherwise changed outside this component.
  useEffect(() => {
    setWorkBalance(getWorkBalance(workRecords));
  }, [workRecords]);

  const handleSearch = (e) => {
    const v = e.target.value;
    setSearch(v);
    if (v.trim().toLowerCase() === "create") {
      setTimeout(() => {
        const existingCodes = new Set(workRecords.filter(w => w.code).map(w => w.code));
        const newCode = genWorkCode(existingCodes);
        setSearch("");
        setForm({ ...makeEmptyWork(), code: newCode });
        setEditId(null);
        setShowSheet(true);
      }, 200);
    }
  };

  const openAdd = () => {
    const existingCodes = new Set(workRecords.filter(w => w.code).map(w => w.code));
    const newCode = genWorkCode(existingCodes);
    setForm({ ...makeEmptyWork(), code: newCode });
    setEditId(null);
    setShowSheet(true);
  };
  const openEdit = (w) => { setForm({ ...w, amount: String(w.amount || "") }); setEditId(w.id); setShowSheet(true); };

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImage(file, (compressed) => {
      setForm(f => ({ ...f, photo: compressed }));
    });
  };

  const save = () => {
    if (form.type === "work") {
      if (!form.name) {
        alert("Work Name is required.");
        return;
      }
      if (!form.amount || parseFloat(form.amount) <= 0) {
        alert("Work Amount is required.");
        return;
      }
      if (form.status === "paid" && !form.method) {
        alert("Payment Method is required for Paid status.");
        return;
      }
    } else {
      // spend type
      if (!form.amount || parseFloat(form.amount) <= 0) {
        alert("Spend Amount is required.");
        return;
      }
    }
    const parsedAmount = parseFloat(form.amount) || 0;
    const entry = { ...form, amount: parsedAmount, code: form.code || "" };
    if (editId) {
      const oldRecord = workRecords.find(record => record.id === editId);
      const oldAmount = Number(oldRecord?.amount) || 0;
      if (entry.type === "spend") {
        // Update the balance by only the change from the old spend to the new spend.
        setWorkBalance(currentTotal => applySpendAmountChange(currentTotal, oldAmount, parsedAmount));
      } else {
        setWorkBalance(currentTotal => currentTotal + (parsedAmount - oldAmount));
      }
      setWorkRecords(prev => prev.map(w => w.id === editId ? { ...entry, id: editId } : w));
    } else {
      if (entry.type === "spend") {
        // First-time spend: deduct the full amount because there is no old amount.
        setWorkBalance(currentTotal => applySpendAmountChange(currentTotal, 0, parsedAmount));
      } else {
        setWorkBalance(currentTotal => currentTotal + parsedAmount);
      }
      setWorkRecords(prev => [{ ...entry, id: Date.now() }, ...prev]);
    }
    setShowSheet(false); setEditId(null);
  };

  const remove = (id) => {
    const record = workRecords.find(item => item.id === id);
    if (record) {
      const amount = Number(record.amount) || 0;
      setWorkBalance(currentTotal => record.type === "spend" ? currentTotal + amount : currentTotal - amount);
    }
    setWorkRecords(prev => prev.filter(w => w.id !== id));
    setDelId(null);
  };

  // Stats
  const today = todayStr();
  const todayEarning = workRecords.filter(w => w.type === "work" && w.status === "paid" && w.date === today).reduce((s, w) => s + w.amount, 0);
  const totalWork = workRecords.filter(w => w.type === "work").length;
  const paidCount = workRecords.filter(w => w.type === "work" && w.status === "paid").length;
  const unpaidCount = workRecords.filter(w => w.type === "work" && w.status === "unpaid").length;
  const unpaidAmount = workRecords.filter(w => w.type === "work" && w.status === "unpaid").reduce((s, w) => s + w.amount, 0);

  const visible = workRecords.filter(w => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (w.name || "").toLowerCase().includes(q) || (w.customer || "").toLowerCase().includes(q);
  });

  // Analysis
  const analysis = workNames.map(name => ({
    name,
    count: workRecords.filter(w => w.type === "work" && w.name === name).length
  })).filter(item => item.count > 0).sort((a, b) => b.count - a.count);

  return (
    <div>
      <div style={{ background: G.header, padding: "22px 16px 18px", color: "white", borderRadius: `0 0 ${R.xl}px ${R.xl}px`, boxShadow: SH.card }}>
        <div style={{ fontSize: 11, opacity: .6, letterSpacing: 1.5, fontWeight: 600 }}>{monthYearStr()}</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 14, fontFamily: THEME.font.money }}>Work Tracker</div>

        {/* Stats Card */}
        <div style={{ background: T.glassStrong, borderRadius: R.lg, padding: "15px 18px", border: `1px solid ${T.glassBorder}`, marginBottom: 14, backdropFilter: "blur(12px)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, opacity: .65, fontWeight: 600 }}>TODAY'S EARNING</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.gold, fontFamily: THEME.font.money }}>{fmt(todayEarning)}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, opacity: .65, fontWeight: 600 }}>TOTAL JOBS</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "white", fontFamily: THEME.font.money }}>{totalWork}</div>
            </div>
          </div>
          <div style={{ height: 1, background: T.glassBorder, marginBottom: 12 }} />
          <div style={{ display: "flex", gap: 24 }}>
            <div>
              <div style={{ fontSize: 10, opacity: .6, marginBottom: 2 }}>🟢 PAID</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.mint }}>{paidCount} work</div>
            </div>
            <div>
              <div style={{ fontSize: 10, opacity: .6, marginBottom: 2 }}>🔴 UNPAID</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#FCA5A5" }}>{fmt(unpaidAmount)} <span style={{fontSize:11, opacity:.8, fontWeight:500}}>({unpaidCount} work)</span></div>
            </div>
            <div>
              <div style={{ fontSize: 10, opacity: .6, marginBottom: 2 }}>💰 WORK BALANCE</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.gold }}>{fmt(workBalance)}</div>
            </div>
          </div>
        </div>

        <SearchBar value={search} onChange={handleSearch} placeholder='Search jobs or type "create"…' />
      </div>

      <div style={{ padding: "10px 12px" }}>
        {/* Analysis Section */}
        <div style={{ background: T.card, borderRadius: R.lg, padding: "14px", marginBottom: 14, boxShadow: SH.card }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 12 }}>📊 Work Analysis</div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {analysis.length === 0 ? (
              <div style={{ fontSize: 12, color: T.inkSoft, padding: "10px 0" }}>No jobs analyzed yet.</div>
            ) : (
              analysis.map(item => (
                <div key={item.name} style={{ flexShrink: 0, padding: "10px 14px", borderRadius: R.md, background: T.bgSoft, border: `1px solid ${T.line}`, textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{item.count}</div>
                  <div style={{ fontSize: 10, color: T.inkSoft, fontWeight: 600, marginTop: 2 }}>{item.name}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* History List */}
        <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 10, paddingLeft: 4 }}>History</div>
        {visible.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#9FB3AD" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>💼</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{search ? "No results" : "No work records"}</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Tap + to add your first job</div>
          </div>
        )}

        {visible.map(record => {
          const isExpanded = expandedId === record.id;
          return (
            <div key={record.id} onClick={() => setExpandedId(isExpanded ? null : record.id)} style={{ 
              background: T.card, borderRadius: R.lg, padding: "12px", marginBottom: 12, boxShadow: SH.card, 
              borderLeft: `4px solid ${record.status === "paid" ? T.income : record.status === "unpaid" ? T.expense : T.gold}`,
              cursor: "pointer", transition: "all 0.2s ease"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: R.md, background: T.bgSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                  {record.type === "work" ? "💼" : "💸"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{record.customer || record.name || (record.type === "spend" ? "Spend" : "Work Entry")}</div>
                    <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: R.pill, background: T.bgSoft, color: T.inkSoft, textTransform: "uppercase" }}>
                      #{record.code}
                    </span>
                    {record.type === "work" && (
                      <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: R.pill, background: record.status === "paid" ? T.incomeSoft : record.status === "unpaid" ? T.expenseSoft : T.goldSoft, color: record.status === "paid" ? "#1E8E5A" : record.status === "unpaid" ? T.expense : "#946A1F", textTransform: "uppercase" }}>
                        {record.status}
                      </span>
                    )}
                    {record.type === "spend" && (
                      <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: R.pill, background: T.expenseSoft, color: T.expense, textTransform: "uppercase" }}>
                        spend
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 2 }}>{record.name}</div>
                  <div style={{ fontSize: 11, color: "#A8B8B3", marginTop: 1 }}>{record.date} {record.status === "paid" && `· ${record.method}`}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: record.type === "spend" ? T.expense : T.ink, fontFamily: THEME.font.money }}>{record.type === "spend" ? "−" : ""}{fmt(record.amount)}</div>
                </div>
              </div>

              {isExpanded && (
                <div onClick={e => e.stopPropagation()} style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.line}`, animation: "fadeIn 0.2s ease" }}>
                  {/* Row 1: small photo thumbnail + Delete */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    {record.photo ? (
                      <button onClick={() => setViewPhoto(record.photo)} aria-label="View work photo" style={{ width: 52, height: 52, padding: 0, border: `1.5px solid ${T.teal500}`, borderRadius: R.sm, background: T.bgSoft, cursor: "pointer", overflow: "hidden", flexShrink: 0 }}>
                        <img src={record.photo} alt="Work thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </button>
                    ) : (
                      <div style={{ width: 52, height: 52, borderRadius: R.sm, border: `1.5px dashed ${T.line}`, background: T.bgSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>📷</div>
                    )}
                    <button onClick={() => setDelId(record.id)} style={{ flex: 1, padding: "10px", borderRadius: R.sm, border: "1.5px solid #FBD5D5", background: T.expenseSoft, color: T.expense, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>🗑 Delete</button>
                  </div>

                  {/* Row 2: View Photo + Add Photo */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => record.photo && setViewPhoto(record.photo)} disabled={!record.photo} style={{ flex: 1, padding: "10px", borderRadius: R.sm, border: `1.5px solid ${record.photo ? T.teal500 : T.line}`, background: record.photo ? T.mintSoft : T.bgSoft, color: record.photo ? T.teal700 : T.inkSoft, fontSize: 12, fontWeight: 700, cursor: record.photo ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>👁️ View Photo</button>
                    <label style={{ flex: 1, padding: "10px", borderRadius: R.sm, border: `1.5px solid ${T.line}`, background: T.card, color: T.teal500, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      📷 Add Photo
                      <input type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        compressImage(file, (compressed) => {
                          setWorkRecords(prev => prev.map(w => w.id === record.id ? { ...w, photo: compressed } : w));
                        });
                        e.target.value = "";
                      }} style={{ display: "none" }} />
                    </label>
                  </div>

                  {/* Edit is available only after the card is expanded. */}
                  <button onClick={() => openEdit(record)} style={{ width: "100%", marginTop: 10, padding: "10px", borderRadius: R.sm, border: `1.5px solid ${T.line}`, background: "#F0F6FF", color: T.teal500, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>✏️ Edit Entry</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FAB */}
      <button onClick={openAdd} style={{ position: "fixed", bottom: 90, right: "max(16px, calc(50% - 210px + 16px))", width: 58, height: 58, borderRadius: R.pill, background: G.gold, color: T.teal900, fontSize: 28, border: "none", cursor: "pointer", fontWeight: 700, boxShadow: "0 8px 22px rgba(232,199,126,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>

      {/* Photo Viewer */}
      {viewPhoto && (
        <div onClick={() => setViewPhoto(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <img src={viewPhoto} alt="Work Photo" style={{ maxWidth: "100%", maxHeight: "80%", borderRadius: R.lg, boxShadow: "0 0 30px rgba(0,0,0,0.5)" }} />
          <button onClick={() => setViewPhoto(null)} style={{ position: "absolute", top: 30, right: 20, background: "white", border: "none", borderRadius: "50%", width: 40, height: 40, fontSize: 20, fontWeight: 700, cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* Delete confirm */}
      {delId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,26,24,0.55)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(2px)" }}>
          <div style={{ background: T.card, borderRadius: R.xl, padding: "28px 24px", width: "100%", maxWidth: 320, textAlign: "center", boxShadow: SH.raised }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🗑️</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: T.ink }}>Are you sure you want to delete this work entry? This cannot be undone.</div>
            <div style={{ fontSize: 13, color: T.inkSoft, marginBottom: 22 }}>This action cannot be undone.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <FBtn onClick={() => setDelId(null)} outline color={T.inkSoft} style={{ flex: 1 }}>Cancel</FBtn>
              <FBtn onClick={() => remove(delId)} bg={G.expense} style={{ flex: 1 }}>Delete</FBtn>
            </div>
          </div>
        </div>
      )}

      {/* Entry Form Sheet */}
      <Sheet open={showSheet} onClose={() => setShowSheet(false)}>
        <div style={{ fontSize: 17, fontWeight: 800, color: T.ink, marginBottom: 14, fontFamily: THEME.font.money }}>{editId ? "Edit Record" : "New Work Record"}</div>

        {editId ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "10px 14px", borderRadius: R.sm, background: form.type === "spend" ? T.expenseSoft : T.mintSoft, border: `1.5px solid ${form.type === "spend" ? T.expense : T.teal500}` }}>
            <span style={{ fontSize: 16 }}>{form.type === "spend" ? "💸" : "💼"}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: form.type === "spend" ? T.expense : T.teal700 }}>{form.type === "spend" ? "Spend Entry" : "Work Entry"}</span>
            <span style={{ fontSize: 11, color: T.inkSoft, marginLeft: 4 }}>(type locked on edit)</span>
          </div>
        ) : (
          <TypeToggle options={[["work", "💼 Work"], ["spend", "💸 Spend"]]} value={form.type} onChange={v => setForm({ ...form, type: v })} colors={{ work: G.primary, spend: G.expense }} />
        )}

        {form.type === "work" && (
          <>
            <Label>WORK NAME</Label>
            {workNames.length === 0 ? (
              <div style={{ fontSize: 12, color: "#946A1F", marginBottom: 12, padding: "10px 12px", background: T.goldSoft, borderRadius: R.sm }}>⚠️ No work names. Add them in Settings.</div>
            ) : (
              <ChipRow items={workNames} selected={form.name} onSelect={v => setForm({ ...form, name: v })} />
            )}
          </>
        )}

        <Label>{form.type === "spend" ? "DESCRIPTION (OPTIONAL)" : "CUSTOMER NAME (OPTIONAL)"}</Label>
        <FInput value={form.customer} onChange={e => setForm({ ...form, customer: e.target.value })} placeholder={form.type === "spend" ? "e.g. Tools, Fuel, Supplies…" : "Enter customer name (optional)"} style={{ marginBottom: 10 }} />

        {form.type === "work" && (
          <>
            <Label>PAYMENT STATUS</Label>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {["undecided", "unpaid", "paid"].map(s => (
                <button key={s} onClick={() => setForm({ ...form, status: s })} style={{ flex: 1, padding: "10px", border: "1.5px solid", borderRadius: R.sm, cursor: "pointer", fontWeight: 700, fontSize: 11, fontFamily: THEME.font.body, borderColor: form.status === s ? T.teal500 : T.line, background: form.status === s ? T.mintSoft : T.card, color: form.status === s ? T.teal700 : T.inkSoft, textTransform: "capitalize" }}>{s}</button>
              ))}
            </div>
            {form.status === "paid" && (
              <>
                <Label>PAYMENT METHOD</Label>
                <ChipRow items={["Online", "Cash"]} selected={form.method} onSelect={v => setForm({ ...form, method: v })} />
              </>
            )}
          </>
        )}

        <Label>{form.type === "spend" ? "SPEND AMOUNT" : "WORK AMOUNT"}</Label>
        <FInput value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="₹ 0" type="number" style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, fontFamily: THEME.font.money }} />

        <Label>PHOTO (OPTIONAL)</Label>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <label style={{ flex: 1, padding: "10px 8px", borderRadius: R.sm, border: `1.5px solid ${T.line}`, background: T.bgSoft, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, fontWeight: 700, color: T.teal500, cursor: "pointer" }}>
              📷 Camera
              <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{display:"none"}}/>
            </label>
            <label style={{ flex: 1, padding: "10px 8px", borderRadius: R.sm, border: `1.5px solid ${T.line}`, background: T.bgSoft, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, fontWeight: 700, color: T.teal500, cursor: "pointer" }}>
              🖼️ Gallery
              <input type="file" accept="image/*" onChange={handlePhoto} style={{display:"none"}}/>
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
        <FInput value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} type="date" style={{ marginBottom: 16 }} />

        <FBtn onClick={save} style={{ width: "100%", padding: "15px" }}>{editId ? "Update Record" : "Confirm Entry"}</FBtn>
      </Sheet>
    </div>
  );
}

// ─── UPI MANAGER (used inside Settings sheet) ─────────────────────────────────
const EMPTY_UPI = { label:"", upiId:"", qr:null };

// Compress image to max 400x400 and quality 0.7 before storing as base64
function compressImage(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      // Increase MAX size for better QR quality
      const MAX = 800;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      
      // Use better image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);
      
      // Use PNG for lossless quality, better for QR codes
      // This ensures the QR stays sharp and readable
      callback(canvas.toDataURL("image/png"));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ─── CATEGORY MANAGER COMPONENT ───────────────────────────────────────────────
function CategoryManager({ categories, setCategories, setTrash, T, R, SH }) {
  const [editingType, setEditingType] = useState(null); // 'income' or 'expense'
  const [editingIdx, setEditingIdx] = useState(null);
  const [editForm, setEditForm] = useState({l:"", icon:""});
  const [addForm, setAddForm] = useState({l:"", icon:""});

  const startEdit = (type, idx) => {
    setEditingType(type);
    setEditingIdx(idx);
    setEditForm({...categories[type][idx]});
  };

  const saveEdit = () => {
    if (!editForm.l.trim() || !editForm.icon.trim()) return;
    const updated = [...categories[editingType]];
    updated[editingIdx] = editForm;
    setCategories({...categories, [editingType]: updated});
    setEditingType(null);
    setEditingIdx(null);
    setEditForm({l:"", icon:""});
  };

  const cancelEdit = () => {
    setEditingType(null);
    setEditingIdx(null);
    setEditForm({l:"", icon:""});
  };

  const deleteCategory = (type, idx) => {
    const cat = categories[type][idx];
    setTrash(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [type]: [...prev.categories[type], cat]
      }
    }));
    setCategories({...categories, [type]: categories[type].filter((_, i) => i !== idx)});
  };

  const addCategory = (type) => {
    if (!addForm.l.trim() || !addForm.icon.trim()) return;
    // Prevent duplicates
    if (categories[type].some(c => c.l.toLowerCase() === addForm.l.trim().toLowerCase())) {
      alert("This category already exists!");
      return;
    }
    setCategories({...categories, [type]: [...categories[type], addForm]});
    setAddForm({l:"", icon:""});
  };

  const renderCategoryList = (type, title, icon) => (
    <div style={{marginBottom: 20}}>
      <div style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:12}}>{icon} {title}</div>
      {categories[type].map((cat, i) => (
        <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,padding:"10px 12px",borderRadius:12,background:T.card,boxShadow:SH.soft}}>
          {editingType === type && editingIdx === i ? (
            <>
              <input type="text" value={editForm.icon} onChange={e => setEditForm({...editForm, icon: e.target.value})} placeholder="Icon" style={{width:30,padding:"4px",borderRadius:6,border:`1px solid ${T.line}`,textAlign:"center"}}/>
              <input type="text" value={editForm.l} onChange={e => setEditForm({...editForm, l: e.target.value})} placeholder="Name" style={{flex:1,padding:"6px 8px",borderRadius:6,border:`1px solid ${T.line}`,fontSize:13}}/>
              <button onClick={saveEdit} style={{padding:"5px 8px",borderRadius:6,border:"none",background:T.income,color:"white",fontSize:11,fontWeight:600,cursor:"pointer"}}>✓</button>
              <button onClick={cancelEdit} style={{padding:"5px 8px",borderRadius:6,border:`1px solid ${T.line}`,background:T.card,color:T.ink,fontSize:11,fontWeight:600,cursor:"pointer"}}>✕</button>
            </>
          ) : (
            <>
              <span style={{fontSize:18}}>{cat.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:T.ink}}>{cat.l}</div>
              </div>
              <button onClick={() => startEdit(type, i)} style={{padding:"5px 8px",borderRadius:6,border:`1px solid ${T.line}`,background:T.bgSoft,color:T.teal500,fontSize:11,fontWeight:600,cursor:"pointer"}}>✏️</button>
              <button onClick={() => deleteCategory(type, i)} style={{padding:"5px 8px",borderRadius:6,border:"1.5px solid #FBD5D5",background:T.expenseSoft,color:T.expense,fontSize:11,fontWeight:600,cursor:"pointer"}}>🗑</button>
            </>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{background:T.bgSoft,borderRadius:R.lg,padding:"12px",marginBottom:12}}>
      {renderCategoryList('income', 'Income Categories', '📂')}
      {renderCategoryList('expense', 'Expense Categories', '💰')}
      
      <div style={{background:T.card,borderRadius:12,padding:"14px",marginTop:10,boxShadow:SH.soft}}>
        <div style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:12}}>Add New Category</div>
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <input type="text" value={addForm.icon} onChange={e => setAddForm({...addForm, icon: e.target.value})} placeholder="Icon (e.g. 🍔)" style={{width:45,padding:"8px",borderRadius:8,border:`1px solid ${T.line}`,textAlign:"center",fontSize:16}}/>
          <input type="text" value={addForm.l} onChange={e => setAddForm({...addForm, l: e.target.value})} placeholder="Category Name" style={{flex:1,padding:"8px 12px",borderRadius:8,border:`1px solid ${T.line}`,fontSize:13}}/>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={() => addCategory('income')} style={{flex:1,padding:"10px",borderRadius:8,border:"none",background:T.incomeSoft,color:T.income,fontSize:11,fontWeight:700,cursor:"pointer"}}>+ Add to Income</button>
          <button onClick={() => addCategory('expense')} style={{flex:1,padding:"10px",borderRadius:8,border:"none",background:T.expenseSoft,color:T.expense,fontSize:11,fontWeight:700,cursor:"pointer"}}>+ Add to Expense</button>
        </div>
      </div>
      <div style={{fontSize:11,color:T.inkSoft,marginTop:15}}>💡 Tip: You can delete categories, but "Other" is recommended to keep.</div>
    </div>
  );
}

// ─── TRASH MANAGER COMPONENT ──────────────────────────────────────────────────
function TrashManager({ trash, setTrash, setTransactions, setLoans, setCategories, T, R, SH }) {
  const [activeTab, setActiveTab] = useState("transactions");

  const restoreTransaction = (tx) => {
    setTransactions(prev => [...prev, tx]);
    setTrash(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== tx.id) }));
  };

  const deleteTransactionPermanently = (id) => {
    setTrash(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
  };

  const restoreLoan = (loan) => {
    setLoans(prev => [...prev, loan]);
    setTrash(prev => ({ ...prev, loans: prev.loans.filter(l => l.id !== loan.id) }));
  };

  const deleteLoanPermanently = (id) => {
    setTrash(prev => ({ ...prev, loans: prev.loans.filter(l => l.id !== id) }));
  };

  const restoreCategory = (type, cat) => {
    setCategories(prev => ({ ...prev, [type]: [...prev[type], cat] }));
    setTrash(prev => ({
      ...prev,
      categories: { ...prev.categories, [type]: prev.categories[type].filter(c => c.l !== cat.l) }
    }));
  };

  const deleteCategoryPermanently = (type, label) => {
    setTrash(prev => ({
      ...prev,
      categories: { ...prev.categories, [type]: prev.categories[type].filter(c => c.l !== label) }
    }));
  };

  const emptyTrash = () => {
    setTrash({ transactions: [], loans: [], categories: { income: [], expense: [] } });
  };

  const hasItems = trash.transactions.length > 0 || trash.loans.length > 0 || trash.categories.income.length > 0 || trash.categories.expense.length > 0;

  return (
    <div style={{background:T.bgSoft,borderRadius:R.lg,padding:"12px",marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:15}}>
        <div style={{fontSize:14,fontWeight:700,color:T.ink}}>Recently Deleted</div>
        {hasItems && <button onClick={emptyTrash} style={{fontSize:11,color:T.expense,background:"none",border:"none",fontWeight:700,cursor:"pointer"}}>Empty Trash</button>}
      </div>

      <div style={{display:"flex",gap:8,marginBottom:15,overflowX:"auto",paddingBottom:5}}>
        {["transactions", "loans", "categories"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding:"6px 12px",borderRadius:R.sm,border:"none",fontSize:11,fontWeight:700,
            background:activeTab===tab?T.teal500:T.card,color:activeTab===tab?"white":T.inkSoft,
            cursor:"pointer",textTransform:"capitalize"
          }}>{tab}</button>
        ))}
      </div>

      <div style={{maxHeight:300,overflowY:"auto"}}>
        {activeTab === "transactions" && (
          trash.transactions.length === 0 ? <div style={{fontSize:12,color:T.inkSoft,textAlign:"center",padding:"20px"}}>No deleted transactions</div> :
          trash.transactions.map(tx => (
            <div key={tx.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,padding:"10px 12px",borderRadius:12,background:T.card,boxShadow:SH.soft}}>
              <span style={{fontSize:18}}>{tx.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:T.ink}}>{tx.category}</div>
                <div style={{fontSize:10,color:T.inkSoft}}>{tx.date} · ₹{tx.amount}</div>
              </div>
              <button onClick={() => restoreTransaction(tx)} style={{padding:"5px 8px",borderRadius:6,border:"none",background:T.incomeSoft,color:T.income,fontSize:11,fontWeight:600,cursor:"pointer"}}>Restore</button>
              <button onClick={() => deleteTransactionPermanently(tx.id)} style={{padding:"5px 8px",borderRadius:6,border:"none",background:T.expenseSoft,color:T.expense,fontSize:11,fontWeight:600,cursor:"pointer"}}>🗑</button>
            </div>
          ))
        )}

        {activeTab === "loans" && (
          trash.loans.length === 0 ? <div style={{fontSize:12,color:T.inkSoft,textAlign:"center",padding:"20px"}}>No deleted loans</div> :
          trash.loans.map(l => (
            <div key={l.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,padding:"10px 12px",borderRadius:12,background:T.card,boxShadow:SH.soft}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:avatarColor(l.name),display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:12,fontWeight:700}}>{l.name[0]}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:T.ink}}>{l.name}</div>
                <div style={{fontSize:10,color:T.inkSoft}}>{l.type} · ₹{l.amount}</div>
              </div>
              <button onClick={() => restoreLoan(l)} style={{padding:"5px 8px",borderRadius:6,border:"none",background:T.incomeSoft,color:T.income,fontSize:11,fontWeight:600,cursor:"pointer"}}>Restore</button>
              <button onClick={() => deleteLoanPermanently(l.id)} style={{padding:"5px 8px",borderRadius:6,border:"none",background:T.expenseSoft,color:T.expense,fontSize:11,fontWeight:600,cursor:"pointer"}}>🗑</button>
            </div>
          ))
        )}

        {activeTab === "categories" && (
          (trash.categories.income.length === 0 && trash.categories.expense.length === 0) ? <div style={{fontSize:12,color:T.inkSoft,textAlign:"center",padding:"20px"}}>No deleted categories</div> :
          <>
            {trash.categories.income.map((cat, i) => (
              <div key={`in-${i}`} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,padding:"10px 12px",borderRadius:12,background:T.card,boxShadow:SH.soft}}>
                <span style={{fontSize:18}}>{cat.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:T.ink}}>{cat.l} (Income)</div>
                </div>
                <button onClick={() => restoreCategory('income', cat)} style={{padding:"5px 8px",borderRadius:6,border:"none",background:T.incomeSoft,color:T.income,fontSize:11,fontWeight:600,cursor:"pointer"}}>Restore</button>
                <button onClick={() => deleteCategoryPermanently('income', cat.l)} style={{padding:"5px 8px",borderRadius:6,border:"none",background:T.expenseSoft,color:T.expense,fontSize:11,fontWeight:600,cursor:"pointer"}}>🗑</button>
              </div>
            ))}
            {trash.categories.expense.map((cat, i) => (
              <div key={`ex-${i}`} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,padding:"10px 12px",borderRadius:12,background:T.card,boxShadow:SH.soft}}>
                <span style={{fontSize:18}}>{cat.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:T.ink}}>{cat.l} (Expense)</div>
                </div>
                <button onClick={() => restoreCategory('expense', cat)} style={{padding:"5px 8px",borderRadius:6,border:"none",background:T.incomeSoft,color:T.income,fontSize:11,fontWeight:600,cursor:"pointer"}}>Restore</button>
                <button onClick={() => deleteCategoryPermanently('expense', cat.l)} style={{padding:"5px 8px",borderRadius:6,border:"none",background:T.expenseSoft,color:T.expense,fontSize:11,fontWeight:600,cursor:"pointer"}}>🗑</button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function WorkNameManager({ workNames, setWorkNames }) {
  const [newName, setNewName] = useState("");
  const add = () => { if (newName.trim()) { setWorkNames([...workNames, newName.trim()]); setNewName(""); } };
  const remove = (name) => setWorkNames(workNames.filter(n => n !== name));
  return (
    <div style={{ background: T.bgSoft, borderRadius: R.lg, padding: "14px", marginBottom: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 12 }}>Manage Work Names</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        {workNames.map(n => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: T.card, borderRadius: R.sm, boxShadow: SH.soft }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{n}</span>
            <button onClick={() => remove(n)} style={{ border: "none", background: "none", color: T.expense, fontSize: 14, cursor: "pointer", padding: 0 }}>✕</button>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <FInput value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Passport" style={{ flex: 1 }} />
        <FBtn onClick={add} style={{ padding: "10px 16px" }}>Add</FBtn>
      </div>
    </div>
  );
}

function UpiManager({ upiList, setUpiList }) {
  const [form, setForm]     = useState(EMPTY_UPI);
  const [editId, setEditId] = useState(null);
  const [delId, setDelId]   = useState(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImage(file, (compressed) => {
      setForm(f=>({...f, qr: compressed}));
    });
  };

  const save = () => {
    if (!form.label.trim() || !form.upiId.trim()) return;
    if (editId) setUpiList(prev=>prev.map(u=>u.id===editId?{...form,id:editId}:u));
    else        setUpiList(prev=>[...prev,{...form,id:Date.now()}]);
    setForm(EMPTY_UPI); setEditId(null);
  };
  const startEdit = (u) => { setForm({label:u.label,upiId:u.upiId,qr:u.qr}); setEditId(u.id); };
  const cancelEdit = () => { setForm(EMPTY_UPI); setEditId(null); };
  const remove = (id) => { setUpiList(prev=>prev.filter(u=>u.id!==id)); setDelId(null); };

  return (
    <div>
      <div style={{fontSize:14,fontWeight:700,color:T.ink,marginBottom:12}}>My UPI IDs</div>
      {upiList.length===0 && <div style={{fontSize:13,color:"#9FB3AD",marginBottom:12}}>No UPI IDs added yet</div>}
      {upiList.map(u=>(
        <div key={u.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,padding:"10px 12px",borderRadius:12,background:T.bgSoft}}>
          {u.qr
            ? <img src={u.qr} alt="QR" style={{width:40,height:40,borderRadius:8,objectFit:"contain",flexShrink:0,background:T.card}}/>
            : <div style={{width:40,height:40,borderRadius:8,background:T.mintSoft,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>📱</div>
          }
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:14,fontWeight:600,color:T.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.label}</div>
            <div style={{fontSize:11,color:T.inkSoft,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.upiId}</div>
          </div>
          <button onClick={()=>startEdit(u)} style={{padding:"5px 10px",borderRadius:8,border:`1.5px solid ${T.line}`,background:"#F0F6FF",color:T.teal500,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>Edit</button>
          <button onClick={()=>setDelId(u.id)} style={{padding:"5px 10px",borderRadius:8,border:"1.5px solid #FBD5D5",background:T.expenseSoft,color:T.expense,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>🗑</button>
        </div>
      ))}

      {delId && (
        <div style={{padding:"14px",borderRadius:12,background:T.expenseSoft,border:"1.5px solid #FBD5D5",marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:700,color:T.expense,marginBottom:10}}>Delete this UPI ID?</div>
          <div style={{display:"flex",gap:8}}>
            <FBtn onClick={()=>setDelId(null)} outline color={T.inkSoft} style={{flex:1,padding:"10px"}}>Cancel</FBtn>
            <FBtn onClick={()=>remove(delId)} bg={G.expense} style={{flex:1,padding:"10px"}}>Delete</FBtn>
          </div>
        </div>
      )}

      <div style={{paddingTop:12,borderTop:`1px solid ${T.line}`}}>
        <div style={{fontSize:13,fontWeight:700,color:T.inkSoft,marginBottom:10}}>{editId?"Edit UPI ID":"Add New UPI ID"}</div>
        <FInput value={form.label} onChange={e=>setForm({...form,label:e.target.value})} placeholder="Label (e.g. Personal UPI)" style={{marginBottom:10}}/>
        <FInput value={form.upiId} onChange={e=>setForm({...form,upiId:e.target.value})} placeholder="UPI ID (e.g. name@bank)" style={{marginBottom:10}}/>

        <Label>QR CODE (OPTIONAL)</Label>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          {form.qr
            ? <img src={form.qr} alt="QR preview" style={{width:56,height:56,borderRadius:10,objectFit:"contain",border:`1.5px solid ${T.line}`}}/>
            : <div style={{width:56,height:56,borderRadius:10,background:T.bgSoft,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,border:`1.5px dashed ${T.line}`}}>🖼️</div>
          }
          <label style={{flex:1,padding:"10px 12px",borderRadius:R.sm,border:`1.5px solid ${T.line}`,background:T.card,
            fontSize:12,fontWeight:600,color:T.teal500,cursor:"pointer",textAlign:"center"}}>
            {form.qr ? "Change Image" : "Upload QR Image"}
            <input type="file" accept="image/*" onChange={handleFile} style={{display:"none"}}/>
          </label>
          {form.qr && <button onClick={()=>setForm({...form,qr:null})} style={{padding:"10px 12px",borderRadius:R.sm,border:"1.5px solid #FBD5D5",background:T.expenseSoft,color:T.expense,fontSize:12,fontWeight:600,cursor:"pointer"}}>✕</button>}
        </div>

        <div style={{display:"flex",gap:8}}>
          {editId&&<FBtn onClick={cancelEdit} outline color={T.inkSoft} style={{flex:1,padding:"12px"}}>Cancel</FBtn>}
          <FBtn onClick={save} style={{flex:1,padding:"12px"}}>{editId?"Update UPI ID":"Add UPI ID"}</FBtn>
        </div>
      </div>
    </div>
  );
}

// ─── RECURRING MANAGER ────────────────────────────────────────────────────────
function RecurringManager({ recurring, setRecurring, accounts, categories }) {
  const [showSheet, setShowSheet] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(makeEmptyRecurring);

  const openAdd  = () => { setForm(makeEmptyRecurring()); setEditId(null); setShowSheet(true); };
  const openEdit = (r) => { setForm({ ...r, amount: String(r.amount) }); setEditId(r.id); setShowSheet(true); };

  const save = () => {
    if (!form.category || !form.account || !form.amount || parseFloat(form.amount) <= 0) return;
    const catList = form.type === "income" ? categories.income : categories.expense;
    const cat = catList.find(c => c.l === form.category);
    const entry = { ...form, amount: parseFloat(form.amount), icon: cat?.icon || "🔁", lastAdded: null };
    if (editId) {
      setRecurring(prev => prev.map(r => r.id === editId ? { ...entry, id: editId } : r));
    } else {
      setRecurring(prev => [{ ...entry, id: Date.now() }, ...prev]);
    }
    setShowSheet(false); setEditId(null);
  };

  const toggle = (id) => setRecurring(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  const remove = (id) => setRecurring(prev => prev.filter(r => r.id !== id));

  return (
    <div style={{ padding: "8px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>🔁 Recurring Transactions</div>
        <button onClick={openAdd} style={{ padding: "7px 14px", borderRadius: R.pill, background: G.primary, color: "white", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Add</button>
      </div>
      {recurring.length === 0 && (
        <div style={{ textAlign: "center", color: T.inkSoft, padding: "20px 0", fontSize: 12 }}>No recurring transactions. Add salary, rent, subscriptions…</div>
      )}
      {recurring.map(r => (
        <div key={r.id} style={{ background: T.card, borderRadius: R.md, padding: "10px 12px", marginBottom: 8, boxShadow: SH.card, opacity: r.active ? 1 : 0.55 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: R.sm, background: r.type === "income" ? T.incomeSoft : T.expenseSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{r.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{r.category}</div>
              <div style={{ fontSize: 11, color: T.inkSoft }}>{r.frequency} · {r.account} · {fmt(r.amount)}</div>
            </div>
            <ToggleSwitch on={r.active} onChange={() => toggle(r.id)} />
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <button onClick={() => openEdit(r)} style={{ flex: 1, padding: "7px", borderRadius: R.sm, border: `1px solid ${T.line}`, background: T.bgSoft, color: T.teal500, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>✏️ Edit</button>
            <button onClick={() => remove(r.id)} style={{ flex: 1, padding: "7px", borderRadius: R.sm, border: "1px solid #FBD5D5", background: T.expenseSoft, color: T.expense, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>🗑 Delete</button>
          </div>
        </div>
      ))}

      <Sheet open={showSheet} onClose={() => setShowSheet(false)}>
        <div style={{ fontSize: 16, fontWeight: 800, color: T.ink, marginBottom: 14 }}>{editId ? "Edit Recurring" : "New Recurring"}</div>
        <TypeToggle options={[["expense", "↓ Expense"], ["income", "↑ Income"]]} value={form.type}
          onChange={v => setForm({ ...makeEmptyRecurring(), type: v })} colors={{ expense: G.expense, income: G.income }} />
        <Label>CATEGORY</Label>
        <ChipRow items={categories?.[form.type] || []} selected={form.category}
          onSelect={v => { const cat = (categories?.[form.type] || []).find(c => c.l === v); setForm({ ...form, category: v, icon: cat?.icon || "🔁" }); }} />
        <Label>AMOUNT</Label>
        <FInput value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="₹ 0" type="number" style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }} />
        <Label>ACCOUNT</Label>
        <ChipRow items={accounts.map(a => a.name)} selected={form.account} onSelect={v => setForm({ ...form, account: v })} />
        <Label>FREQUENCY</Label>
        <ChipRow items={FREQUENCIES} selected={form.frequency} onSelect={v => setForm({ ...form, frequency: v })} />
        <Label>START DATE</Label>
        <FInput value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} type="date" style={{ marginBottom: 10 }} />
        <Label>NOTE (OPTIONAL)</Label>
        <FInput value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="e.g. Monthly salary" style={{ marginBottom: 16 }} />
        <FBtn onClick={save} style={{ width: "100%", padding: "14px" }}>{editId ? "Update" : "Save Recurring"}</FBtn>
      </Sheet>
    </div>
  );
}

// ─── SETTINGS (bottom sheet, opened from Home gear icon) ──────────────────────
function SettingsSheet({
  open, onClose,
  monthlyHistory, setMonthlyHistory,
  transactions, setTransactions,
  loans, setLoans,
  accounts, setAccounts,
  openingBalance, setOpeningBalance,
  declaredAmount, setDeclaredAmount,
  goalAmount, setGoalAmount,
  manualCheck, setManualCheck,
  pin, setPin, pinEnabled, setPinEnabled,
  upiList, setUpiList,
  notifyEnabled, setNotifyEnabled,
  categories, setCategories,
  workNames, setWorkNames,
  workRecords, setWorkRecords,
  trash, setTrash,
  recurring, setRecurring,
  onOpenProfile,
  onOpenAccounts,
  profile, setProfile,
}) {
  const [section, setSection]       = useState(null);
  const [subSection, setSubSection] = useState(null);
  const [showPinSet, setShowPinSet] = useState(false);
  const [mcTemp, setMcTemp]         = useState("");
  const [daTemp, setDaTemp]         = useState("");
  const [goalTemp, setGoalTemp]     = useState("");
  const [obTemp, setObTemp]         = useState("");
  const [backupMsg, setBackupMsg]   = useState(null); // {type:'ok'|'err', text}
  // Profile editing state
  const [editingProfile, setEditingProfile] = useState(false);
  const [nameTemp, setNameTemp]             = useState(profile.name||"");

  const toggle = (key) => { setSection(prev => prev === key ? null : key); setSubSection(null); };

  // Monthly History state
  const [historyMonth, setHistoryMonth] = useState(null); // selected month key "YYYY-MM"
  const [historyTxFilter, setHistoryTxFilter] = useState("all"); // all|income|expense|transfer

  // Reset all open sections when sheet is closed
  useEffect(() => { if (!open) { setSection(null); setSubSection(null); setEditingProfile(false); setHistoryMonth(null); } }, [open]);

  // SubRow — used inside the Accounts section for nested items
  const SubRow = ({icon,title,sub,open:isOpen,onToggle}) => (
    <div onClick={onToggle} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 12px",
      cursor:"pointer",borderTop:`1px solid ${T.line}`}}>
      <div style={{width:32,height:32,borderRadius:9,background:isOpen?T.mintSoft:T.bgSoft,
        display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{icon}</div>
      <div style={{flex:1}}>
        <div style={{fontSize:13,fontWeight:700,color:T.ink}}>{title}</div>
        <div style={{fontSize:11,color:T.inkSoft}}>{sub}</div>
      </div>
      <div style={{color:isOpen?T.teal500:"#9FB3AD",fontSize:14,
        transform:isOpen?"rotate(90deg)":"none",transition:"transform .2s"}}>›</div>
    </div>
  );

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImage(file, (compressed) => {
      setProfile(p=>({...p, avatar: compressed}));
    });
  };

  const saveProfileName = () => {
    setProfile(p=>({...p, name: nameTemp}));
    setEditingProfile(false);
  };

  const exportCSV = () => {
    downloadFile(`transactions-${todayStr()}.csv`, transactionsToCSV(transactions), "text/csv");
  };

  const exportBackup = () => {
    const backup = {
      _app: "my-finance-app", _version: 2, exportedAt: new Date().toISOString(),
      transactions, loans, accounts, openingBalance, declaredAmount,
      goalAmount, manualCheck, upiList, profile, notifyEnabled,
      categories, workNames, workRecords, monthlyHistory,
      // PIN intentionally excluded from backup file for safety
    };
    downloadFile(`finance-backup-${todayStr()}.json`, JSON.stringify(backup, null, 2), "application/json");
  };

  const restoreBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data._app !== "my-finance-app") throw new Error("not a recognized backup file");
        if (Array.isArray(data.transactions)) setTransactions(data.transactions);
        if (Array.isArray(data.loans))        setLoans(data.loans);
        if (Array.isArray(data.accounts))     setAccounts(data.accounts);
        if (typeof data.openingBalance==="number") setOpeningBalance(data.openingBalance);
        if (typeof data.declaredAmount==="number") setDeclaredAmount(data.declaredAmount);
        if (typeof data.goalAmount==="number")     setGoalAmount(data.goalAmount);
        if (typeof data.manualCheck==="number")    setManualCheck(data.manualCheck);
        if (Array.isArray(data.upiList))      setUpiList(data.upiList);
        if (data.profile)                     setProfile(data.profile);
        if (typeof data.notifyEnabled==="boolean") setNotifyEnabled(data.notifyEnabled);
        if (data.categories)                  setCategories(data.categories);
        if (Array.isArray(data.workNames))    setWorkNames(data.workNames);
        if (Array.isArray(data.workRecords))  setWorkRecords(data.workRecords);
        if (data.monthlyHistory && typeof data.monthlyHistory==="object") setMonthlyHistory(data.monthlyHistory);
        setBackupMsg({type:"ok", text:"Backup restored successfully."});
      } catch (err) {
        setBackupMsg({type:"err", text:"Couldn't read that file — is it a backup exported from this app?"});
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const card = {background:T.bgSoft,borderRadius:R.lg,padding:"13px",marginBottom:10};
  const menuRow = (icon,title,sub,key,onPress) => (
    <div onClick={()=>onPress ? onPress() : key&&toggle(key)}
      style={{background:T.card,borderRadius:R.lg,padding:"10px 12px",marginBottom:10,
        boxShadow:SH.card,display:"flex",alignItems:"center",gap:12,cursor:(key||onPress)?"pointer":"default"}}>
      <div style={{width:40,height:40,borderRadius:12,background:T.bgSoft,flexShrink:0,
        display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{icon}</div>
      <div style={{flex:1}}>
        <div style={{fontSize:14,fontWeight:700,color:T.ink}}>{title}</div>
        <div style={{fontSize:11,color:T.inkSoft,marginTop:1}}>{sub}</div>
      </div>
      {(key||onPress)&&<div style={{color:"#9FB3AD",fontSize:16,
        transform:section===key?"rotate(90deg)":"none",transition:"transform .2s"}}>›</div>}
    </div>
  );

  const initials = (profile.name||"U").trim().split(/\s+/).map(w=>w[0]).slice(0,2).join("").toUpperCase();

  if (!open) return null;

  return (
    <Sheet open={open} onClose={onClose}>

      {/* ── PROFILE HEADER ── */}
      <div style={{display:"flex",alignItems:"center",gap:14,padding:"4px 0 18px",borderBottom:`1px solid ${T.line}`,marginBottom:16}}>
        {/* Avatar with change option */}
        <div style={{position:"relative",flexShrink:0}}>
          {profile.avatar
            ? <img src={profile.avatar} alt="Avatar" style={{width:62,height:62,borderRadius:"50%",objectFit:"cover",border:`2px solid ${T.mintSoft}`}}/>
            : <div style={{width:62,height:62,borderRadius:"50%",background:G.primary,display:"flex",
                alignItems:"center",justifyContent:"center",color:"white",fontSize:22,fontWeight:800}}>{initials}</div>
          }
          <label style={{position:"absolute",bottom:0,right:0,width:22,height:22,borderRadius:"50%",
            background:T.teal500,display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:11,cursor:"pointer",border:"2px solid white",color:"white"}}>
            📷
            <input type="file" accept="image/*" onChange={handleAvatarChange} style={{display:"none"}}/>
          </label>
        </div>

        {/* Name edit */}
        <div style={{flex:1,minWidth:0}}>
          {editingProfile ? (
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <input value={nameTemp} onChange={e=>setNameTemp(e.target.value)}
                placeholder="Your name"
                style={{flex:1,padding:"8px 10px",borderRadius:10,border:`1.5px solid ${T.teal500}`,
                  fontSize:14,fontWeight:600,outline:"none",fontFamily:"inherit"}}/>
              <button onClick={saveProfileName} style={{padding:"8px 12px",borderRadius:10,border:"none",
                background:G.primary,color:"white",fontSize:12,fontWeight:700,cursor:"pointer"}}>✓</button>
              <button onClick={()=>{setEditingProfile(false);setNameTemp(profile.name||"");}}
                style={{padding:"8px 10px",borderRadius:10,border:`1px solid ${T.line}`,
                background:"white",color:T.inkSoft,fontSize:12,fontWeight:700,cursor:"pointer"}}>✕</button>
            </div>
          ) : (
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:16,fontWeight:700,color:T.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {profile.name || "Tap to set your name"}
                </div>
                <div style={{fontSize:11,color:T.inkSoft,marginTop:2}}>Tap ✏️ to edit name · 📷 to change photo</div>
              </div>
              <button onClick={()=>{setNameTemp(profile.name||"");setEditingProfile(true);}}
                style={{padding:"6px 10px",borderRadius:8,border:`1px solid ${T.line}`,
                background:T.bgSoft,color:T.teal500,fontSize:12,fontWeight:600,cursor:"pointer",flexShrink:0}}>✏️</button>
            </div>
          )}
        </div>
      </div>

      <div style={{display:"flex",flexDirection:"column"}}>

        {/* ── ACCOUNTS + BALANCE OPTIONS → opens full screen ── */}
        {menuRow("🏦","Manage Accounts & Balances",
          `${accounts.length} account${accounts.length!==1?"s":""} · opening, declared, goal`,
          null, ()=>onOpenAccounts())}

        {/* ── RECURRING TRANSACTIONS ── */}
        {menuRow("🔁","Recurring Transactions",`Auto-add salary, rent, bills`, "recurring")}
        {section==="recurring" && (
          <div onClick={e=>e.stopPropagation()}>
            <RecurringManager recurring={recurring||[]} setRecurring={setRecurring} accounts={accounts} categories={categories}/>
          </div>
        )}

        {/* ── UPI MANAGEMENT ── */}
        {menuRow("📱","UPI IDs",`${upiList.length} saved`, "upi")}
        {section==="upi" && (
          <div onClick={e=>e.stopPropagation()} style={card}><UpiManager upiList={upiList} setUpiList={setUpiList}/></div>
        )}

        {/* ── MANUAL CHECK ── */}
        {menuRow("🔎","Manual Check", manualCheck>0?`Your count: ${fmt(manualCheck)}`:"Not set", "manual")}
        {section==="manual" && (
          <div onClick={e=>e.stopPropagation()} style={card}>
            <div style={{fontSize:14,fontWeight:700,color:T.ink,marginBottom:6}}>Manual Check Amount</div>
            <div style={{fontSize:12,color:T.inkSoft,marginBottom:12}}>Physically count your cash and enter it here. Dashboard compares it against the app's calculated total.</div>
            <FInput value={mcTemp} onChange={e=>setMcTemp(e.target.value)}
              placeholder={manualCheck>0?fmt(manualCheck):"₹ 0"} type="number" style={{fontSize:18,fontWeight:700,marginBottom:12}}/>
            <div style={{display:"flex",gap:8}}>
              {manualCheck>0&&<FBtn onClick={()=>{setManualCheck(0);setMcTemp("");toggle("manual");}} bg={G.expense} style={{flex:1,padding:"12px"}}>🗑 Remove</FBtn>}
              <FBtn onClick={()=>{setManualCheck(parseFloat(mcTemp)||0);setMcTemp("");toggle("manual");}} style={{flex:1,padding:"12px"}}>Save</FBtn>
            </div>
          </div>
        )}

        {/* ── PIN LOCK ── */}
        {menuRow("🔒","PIN Lock", pinEnabled?"Enabled · tap to change":"Disabled", "pin")}
        {section==="pin" && (
          <div onClick={e=>e.stopPropagation()} style={card}>
            <div style={{fontSize:14,fontWeight:700,color:T.ink,marginBottom:14}}>PIN Lock</div>
            {pinEnabled
              ? <div style={{display:"flex",gap:8}}>
                  <FBtn onClick={()=>setShowPinSet(true)} outline color={T.teal500} style={{flex:1,padding:"12px"}}>🔄 Change PIN</FBtn>
                  <FBtn onClick={()=>{setPinEnabled(false);setPin("");toggle("pin");}} bg={G.expense} style={{flex:1,padding:"12px"}}>🔓 Disable</FBtn>
                </div>
              : <FBtn onClick={()=>setShowPinSet(true)} style={{width:"100%",padding:"12px"}}>🔒 Set PIN</FBtn>
            }
          </div>
        )}

        {/* ── PROFILE (full screen) ── */}
        {menuRow("👤","Profile","Occupation, income, language", null, ()=>{onClose();onOpenProfile();})}

        {/* ── THEME SELECTION ── */}
        {menuRow("🎨","Theme",`${(profile.theme||'system').charAt(0).toUpperCase() + (profile.theme||'system').slice(1)} mode`, "theme")}
        {section==="theme" && (
          <div onClick={e=>e.stopPropagation()} style={card}>
            <div style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:12}}>Choose Theme</div>
            <div style={{display:"flex",gap:8}}>
              {['light', 'dark', 'system'].map(t => (
                <button key={t} onClick={() => setProfile({...profile, theme: t})} style={{
                  flex:1, padding:"12px 8px", borderRadius:R.md, border:"none",
                  background: (profile.theme||'system') === t ? T.teal500 : T.card,
                  color: (profile.theme||'system') === t ? "white" : T.ink,
                  fontSize:12, fontWeight:700, cursor:"pointer", boxShadow:SH.soft,
                  textTransform: "capitalize"
                }}>
                  {t === 'light' ? '☀️ Bright' : t === 'dark' ? '🌙 Dark' : '⚙️ System'}
                </button>
              ))}
            </div>
            <div style={{fontSize:11,color:T.inkSoft,marginTop:12,lineHeight:1.4}}>
              {profile.theme === 'system' ? "Follows your device's light/dark mode settings automatically." : `App will stay in ${profile.theme} mode regardless of device settings.`}
            </div>
          </div>
        )}

        {/* ── NOTIFICATIONS ── */}
        <div style={{background:T.card,borderRadius:R.lg,padding:"10px 12px",marginBottom:10,
          boxShadow:SH.card,display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:40,height:40,borderRadius:12,background:T.bgSoft,flexShrink:0,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🔔</div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:700,color:T.ink}}>Notifications</div>
            <div style={{fontSize:11,color:T.inkSoft,marginTop:1}}>
              {notifyEnabled ? "On · daily reminder if nothing's logged today" : "Off · daily reminders"}
            </div>
          </div>
          <ToggleSwitch on={notifyEnabled} onChange={setNotifyEnabled}/>
        </div>

        {/* ── NON-FUNCTIONAL ROWS ── */}
        {/* ── MONTHLY HISTORY ── */}
        {menuRow("📅","Monthly History","View past months — income, expense & all transactions","monthly_history")}
        {section==="monthly_history" && (
          <div style={{padding:"0 4px 10px"}}>
            {historyMonth ? (() => {
              // ── SINGLE MONTH VIEW ──
              const txns = (monthlyHistory[historyMonth] || []);
              const [yr, mo] = historyMonth.split("-");
              const label = new Date(parseInt(yr), parseInt(mo)-1).toLocaleString("default",{month:"long",year:"numeric"});
              const income   = txns.filter(t=>t.type==="income").reduce((s,t)=>s+(parseFloat(t.amount)||0),0);
              const expense  = txns.filter(t=>t.type==="expense").reduce((s,t)=>s+(parseFloat(t.amount)||0),0);
              const transfer = txns.filter(t=>t.type==="transfer").reduce((s,t)=>s+(parseFloat(t.amount)||0),0);
              const net      = income - expense;
              const filtered = txns.filter(t => historyTxFilter==="all" || t.type===historyTxFilter)
                .sort((a,b)=>(b.date||"").localeCompare(a.date||""));
              return (
                <div>
                  {/* Back + Title */}
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                    <button onClick={()=>setHistoryMonth(null)} style={{background:T.bgSoft,border:"none",borderRadius:R.sm,padding:"6px 12px",fontWeight:700,fontSize:13,cursor:"pointer",color:T.teal700}}>← Back</button>
                    <div style={{fontSize:15,fontWeight:800,color:T.ink}}>{label}</div>
                  </div>
                  {/* Summary Cards */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
                    {[
                      {label:"Total Income",  val:income,   color:T.income,   bg:T.incomeSoft,  prefix:"+"},
                      {label:"Total Expense", val:expense,  color:T.expense,  bg:T.expenseSoft, prefix:"−"},
                      {label:"Transfers",     val:transfer, color:"#9F8AE8",  bg:"#EDE9FE",     prefix:"⇄"},
                      {label:"Net Balance",   val:net,      color:net>=0?T.income:T.expense, bg:net>=0?T.incomeSoft:T.expenseSoft, prefix:net>=0?"+":"−"},
                    ].map(c=>(
                      <div key={c.label} style={{background:c.bg,borderRadius:R.lg,padding:"10px 12px"}}>
                        <div style={{fontSize:10,fontWeight:700,color:c.color,opacity:.8,marginBottom:3}}>{c.label.toUpperCase()}</div>
                        <div style={{fontSize:16,fontWeight:800,color:c.color,fontFamily:THEME.font.money}}>{c.prefix}{fmt(Math.abs(c.val))}</div>
                      </div>
                    ))}
                  </div>
                  {/* Filter Chips */}
                  <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
                    {["all","income","expense","transfer"].map(f=>(
                      <button key={f} onClick={()=>setHistoryTxFilter(f)}
                        style={{padding:"5px 12px",borderRadius:99,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,
                          background:historyTxFilter===f?T.teal500:T.bgSoft,
                          color:historyTxFilter===f?"white":T.inkSoft}}>
                        {f.charAt(0).toUpperCase()+f.slice(1)}
                      </button>
                    ))}
                    <span style={{marginLeft:"auto",fontSize:11,color:T.inkSoft,alignSelf:"center"}}>{filtered.length} txn{filtered.length!==1?"s":""}</span>
                  </div>
                  {/* Transaction List */}
                  {filtered.length===0 && (
                    <div style={{textAlign:"center",padding:"20px",color:T.inkSoft,fontSize:13}}>No transactions match this filter</div>
                  )}
                  {filtered.map(t=>{
                    const isIncome   = t.type==="income";
                    const isTransfer = t.type==="transfer";
                    const color  = isIncome ? T.income : isTransfer ? "#9F8AE8" : T.expense;
                    const bg     = isIncome ? T.incomeSoft : isTransfer ? "#EDE9FE" : T.expenseSoft;
                    const prefix = isIncome ? "+" : isTransfer ? "⇄ " : "−";
                    return (
                      <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${T.line}`}}>
                        <div style={{width:36,height:36,borderRadius:R.md,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{t.icon||"💰"}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:700,color:T.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                            {isTransfer ? `${t.account} → ${t.toAccount}` : t.category}
                          </div>
                          <div style={{fontSize:11,color:T.inkSoft}}>{fmtDateLong(t.date)}{t.note?` · ${t.note}`:""}</div>
                        </div>
                        <div style={{fontSize:14,fontWeight:800,color,fontFamily:THEME.font.money,flexShrink:0}}>{prefix}{fmt(t.amount)}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })() : (() => {
              // ── MONTH LIST VIEW ──
              const months = Object.keys(monthlyHistory).sort((a,b)=>b.localeCompare(a));
              if (months.length===0) return (
                <div style={{textAlign:"center",padding:"24px 0",color:T.inkSoft}}>
                  <div style={{fontSize:32,marginBottom:8}}>📭</div>
                  <div style={{fontSize:13,fontWeight:600}}>No history yet</div>
                  <div style={{fontSize:12,marginTop:4}}>Past months will appear here automatically</div>
                </div>
              );
              return months.map(key => {
                const txns   = monthlyHistory[key]||[];
                const income  = txns.filter(t=>t.type==="income").reduce((s,t)=>s+(parseFloat(t.amount)||0),0);
                const expense = txns.filter(t=>t.type==="expense").reduce((s,t)=>s+(parseFloat(t.amount)||0),0);
                const net     = income - expense;
                const [yr,mo] = key.split("-");
                const label   = new Date(parseInt(yr),parseInt(mo)-1).toLocaleString("default",{month:"long",year:"numeric"});
                return (
                  <div key={key} onClick={()=>{setHistoryMonth(key);setHistoryTxFilter("all");}}
                    style={{background:T.card,borderRadius:R.lg,padding:"12px 14px",marginBottom:8,cursor:"pointer",border:`1px solid ${T.line}`,display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:40,height:40,borderRadius:R.md,background:T.mintSoft,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>📅</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:800,color:T.ink,marginBottom:2}}>{label}</div>
                      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                        <span style={{fontSize:11,fontWeight:700,color:T.income}}>+{fmt(income)}</span>
                        <span style={{fontSize:11,fontWeight:700,color:T.expense}}>−{fmt(expense)}</span>
                        <span style={{fontSize:11,fontWeight:700,color:net>=0?T.income:T.expense}}>{net>=0?"▲":"▼"} {fmt(Math.abs(net))}</span>
                      </div>
                      <div style={{fontSize:11,color:T.inkSoft,marginTop:2}}>{txns.length} transaction{txns.length!==1?"s":""}</div>
                    </div>
                    <div style={{fontSize:18,color:T.inkSoft}}>›</div>
                  </div>
                );
              });
            })()}
          </div>
        )}

        {/* ── BACKUP ── */}
        {menuRow("💾","Backup","Export or restore your data", "backup")}
        {section==="backup" && (
          <div onClick={e=>e.stopPropagation()} style={card}>
            <div style={{fontSize:13,color:T.inkSoft,marginBottom:14,lineHeight:1.5}}>
              Exports save a file to your device's Downloads folder. Nothing is uploaded anywhere.
            </div>

            <div style={{fontSize:12,fontWeight:700,color:T.ink,marginBottom:8}}>Export</div>
            <div style={{display:"flex",gap:8,marginBottom:16}}>
              <FBtn onClick={exportCSV} outline color={T.teal500} style={{flex:1,padding:"11px"}}>📄 CSV (transactions)</FBtn>
              <FBtn onClick={exportBackup} style={{flex:1,padding:"11px"}}>💾 Full Backup (JSON)</FBtn>
            </div>

            <div style={{fontSize:12,fontWeight:700,color:T.ink,marginBottom:8}}>Restore</div>
            <label style={{display:"block",padding:"11px",borderRadius:R.sm,border:`1.5px dashed ${T.line}`,
              background:T.card,fontSize:13,fontWeight:600,color:T.teal500,cursor:"pointer",textAlign:"center"}}>
              📤 Choose Backup File to Restore
              <input type="file" accept="application/json" onChange={restoreBackup} style={{display:"none"}}/>
            </label>
            <div style={{fontSize:11,color:T.inkSoft,marginTop:6}}>
              Restoring a full backup replaces your current transactions, loans, accounts, and settings (PIN is not included).
            </div>

            {backupMsg && (
              <div style={{marginTop:10,padding:"9px 11px",borderRadius:R.sm,fontSize:12,
                background:backupMsg.type==="ok"?T.incomeSoft:T.expenseSoft,
                color:backupMsg.type==="ok"?"#1E8E5A":T.expense}}>
                {backupMsg.text}
              </div>
            )}
          </div>
        )}
        {/* Clear All Data */}
        {section==="cleardata" && (
          <div style={{background:T.bgSoft,borderRadius:R.lg,padding:"12px",marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:700,color:T.expense,marginBottom:10}}>⚠️ Clear All Data?</div>
            <div style={{fontSize:12,color:T.inkSoft,marginBottom:12}}>
              This will permanently delete all transactions, loans, accounts, and settings. This action cannot be undone.
            </div>
            <div style={{display:"flex",gap:8}}>
              <FBtn onClick={()=>setSection(null)} outline color={T.inkSoft} style={{flex:1,padding:"9px"}}>Cancel</FBtn>
              <FBtn onClick={()=>{setTransactions([]); setLoans([]); setAccounts([]); setOpeningBalance(0); setDeclaredAmount(0); setGoalAmount(0); setManualCheck(0); setUpiList([]); setProfile(SEED_PROFILE); setTrash({ transactions: [], loans: [], categories: { income: [], expense: [] } }); setCategories(SEED_CATEGORIES); setNotifyEnabled(false); setPin(""); setPinEnabled(false); setSection(null);}} bg={G.expense} style={{flex:1,padding:"9px"}}>Delete All</FBtn>
            </div>
          </div>
        )}
        {/* Manage Categories */}
        {menuRow("📂","Manage Categories","Add, edit, or delete categories","categories")}
        {section==="categories" && (
          <div onClick={e=>e.stopPropagation()}>
            <CategoryManager categories={categories} setCategories={setCategories} setTrash={setTrash} T={T} R={R} SH={SH}/>
          </div>
        )}

        {/* Manage Work Names */}
        {menuRow("💼","Manage Work Names","Add or remove job types","worknames")}
        {section==="worknames" && (
          <div onClick={e=>e.stopPropagation()}>
            <WorkNameManager workNames={workNames} setWorkNames={setWorkNames} />
          </div>
        )}

        {/* ── TRASH / RECENTLY DELETED ── */}
        {menuRow("🗑","Recently Deleted","Restore deleted items","trash")}
        {section==="trash" && (
          <div onClick={e=>e.stopPropagation()}>
            <TrashManager trash={trash} setTrash={setTrash} setTransactions={setTransactions} setLoans={setLoans} setCategories={setCategories} T={T} R={R} SH={SH}/>
          </div>
        )}
        {menuRow("🗑","Clear All Data","Reset app to fresh state","cleardata")}
        {menuRow("ℹ️","About","Version 2.4.0", null)}

      </div>

      {showPinSet && (
        <PinScreen mode="set"
          onSuccess={(newPin)=>{ setPin(newPin); setPinEnabled(true); setShowPinSet(false); setSection(null); }}
          onCancel={()=>setShowPinSet(false)}/>
      )}
    </Sheet>
  );
}

// ─── GOAL TAB ─────────────────────────────────────────────────────────────────
function Goal({ transactions, accounts, openingBalance, goalAmount }) {
  // Total tracked balance (same formula as Dashboard)
  const accountBalances = calcAccountBalances(accounts, transactions);
  const totalTracked    = accountBalances.reduce((s,a)=>s+a.balance,0) + openingBalance;

  const pct        = goalAmount>0 ? Math.min(100, Math.round((totalTracked/goalAmount)*100)) : 0;
  const needed     = Math.max(0, goalAmount - totalTracked);
  const isAchieved = goalAmount>0 && totalTracked >= goalAmount;

  const msg = pct>=100 ? "🎉 Goal achieved! Set a new one!"
    : pct>=67 ? "Almost there, don't stop now! 🔥"
    : pct>=34 ? "Halfway there, great progress! 🚀"
    : pct>0   ? "Keep saving, you're on your way! 💪"
    : "Set a goal from Settings to start!";

  const curMonth = todayStr().slice(0,7); // "YYYY-MM"
  const thisMonthTx = transactions.filter(t=>(t.date||"").slice(0,7)===curMonth);
  const monthlySaving = thisMonthTx.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0)
                      - thisMonthTx.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
  const monthsNeeded  = monthlySaving>0 && needed>0 ? Math.ceil(needed/monthlySaving) : null;

  return (
    <div>
      {/* Header */}
      <div style={{background:G.header,padding:"24px 16px 68px",color:"white",borderRadius:`0 0 ${R.xl}px ${R.xl}px`,boxShadow:SH.card,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-50,right:-30,width:160,height:160,borderRadius:"50%",background:"radial-gradient(circle,rgba(232,199,126,0.18),transparent 70%)"}}/>
        <div style={{fontSize:11,opacity:.6,letterSpacing:1.5,fontWeight:600,position:"relative"}}>SAVINGS</div>
        <div style={{fontSize:20,fontWeight:700,marginBottom:22,fontFamily:THEME.font.money,position:"relative"}}>My Goal</div>

        {goalAmount>0 ? (
          <div style={{background:T.glassStrong,borderRadius:R.xl,padding:"16px",border:`1px solid ${T.glassBorder}`,backdropFilter:"blur(14px)",position:"relative",boxShadow:SH.glow}}>
            <div style={{marginBottom:18,paddingBottom:18,borderBottom:`1px solid ${T.glassBorder}`}}>
              <div style={{fontSize:11,opacity:.6,letterSpacing:.6,marginBottom:6,fontWeight:600}}>🎯 MY GOAL</div>
              <div style={{fontSize:28,fontWeight:600,letterSpacing:-0.5,color:T.gold,fontFamily:THEME.font.money}}>{fmt(goalAmount)}</div>
            </div>
            <div style={{marginBottom:18,paddingBottom:18,borderBottom:`1px solid ${T.glassBorder}`}}>
              <div style={{fontSize:11,opacity:.6,letterSpacing:.6,marginBottom:6,fontWeight:600}}>💰 TOTAL BALANCE</div>
              <div style={{fontSize:28,fontWeight:600,letterSpacing:-0.5,color:"white",fontFamily:THEME.font.money}}>{fmt(totalTracked)}</div>
            </div>
            <div>
              <div style={{fontSize:11,opacity:.6,letterSpacing:.6,marginBottom:6,fontWeight:600}}>
                {isAchieved?"✅ STATUS":"📉 STILL NEEDED"}
              </div>
              <div style={{fontSize:28,fontWeight:600,letterSpacing:-0.5,color:isAchieved?T.mint:"#FCA5A5",fontFamily:THEME.font.money}}>
                {isAchieved?"Goal Achieved!":fmt(needed)}
              </div>
            </div>
          </div>
        ) : (
          <div style={{background:T.glassStrong,borderRadius:R.xl,padding:"16px",border:`1px solid ${T.glassBorder}`,textAlign:"center",backdropFilter:"blur(14px)",position:"relative"}}>
            <div style={{fontSize:36,marginBottom:10}}>🎯</div>
            <div style={{fontSize:15,fontWeight:700,marginBottom:6}}>No Goal Set</div>
            <div style={{fontSize:12,opacity:.6}}>Go to Settings → Savings Goal to set your target amount</div>
          </div>
        )}
      </div>

      <div style={{padding:"0 12px",marginTop:-34}}>

        {/* Progress bar card */}
        {goalAmount>0&&(
          <div style={{background:T.card,borderRadius:R.lg,padding:"14px",marginBottom:14,boxShadow:SH.card}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700,color:T.ink}}>📊 Progress</div>
              <div style={{fontSize:15,fontWeight:800,color:isAchieved?T.income:T.teal500,fontFamily:THEME.font.money}}>{pct}%</div>
            </div>
            <div style={{height:14,background:T.bgSoft,borderRadius:R.pill,overflow:"hidden",marginBottom:8}}>
              <div style={{height:"100%",width:`${pct}%`,borderRadius:R.pill,
                background:isAchieved?T.income:`linear-gradient(90deg,${T.teal500},${T.income})`,
                transition:"width .6s"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
              <div style={{fontSize:11,color:T.inkSoft}}>₹0</div>
              <div style={{fontSize:11,color:T.inkSoft}}>{fmt(goalAmount)}</div>
            </div>
            <div style={{padding:"11px 12px",borderRadius:R.sm,
              background:isAchieved?T.incomeSoft:T.bgSoft,
              fontSize:13,fontWeight:600,
              color:isAchieved?"#1E8E5A":T.inkSoft,textAlign:"center"}}>
              {msg}
            </div>
          </div>
        )}

        {/* Summary rows */}
        {goalAmount>0&&(
          <div style={{background:T.card,borderRadius:R.lg,padding:"16px",marginBottom:14,boxShadow:SH.card}}>
            {[
              {label:"🎯 Goal Amount",   value:fmt(goalAmount),                        color:T.teal700},
              {label:"💰 Total Balance", value:fmt(totalTracked),                      color:T.teal500},
              {label:"📉 Still Needed",  value:isAchieved?"₹0 — Achieved!":fmt(needed), color:isAchieved?T.income:T.expense},
            ].map((row,i,arr)=>(
              <div key={row.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                padding:"12px 0",borderBottom:i<arr.length-1?`1px solid ${T.line}`:"none"}}>
                <div style={{fontSize:13,color:T.inkSoft}}>{row.label}</div>
                <div style={{fontSize:15,fontWeight:800,color:row.color,fontFamily:THEME.font.money}}>{row.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Estimate */}
        {goalAmount>0&&!isAchieved&&(
          <div style={{background:T.card,borderRadius:R.lg,padding:"16px",marginBottom:14,boxShadow:SH.card}}>
            <div style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:12}}>⏱️ Estimate to Reach Goal</div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <div style={{fontSize:13,color:T.inkSoft}}>Monthly Surplus</div>
              <div style={{fontSize:14,fontWeight:700,color:monthlySaving>0?T.income:T.expense}}>
                {monthlySaving>0?fmt(monthlySaving):"No surplus"}
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <div style={{fontSize:13,color:T.inkSoft}}>Time Needed</div>
              <div style={{fontSize:14,fontWeight:700,color:T.teal500}}>
                {monthsNeeded ? (monthsNeeded===1?"~1 month":`~${monthsNeeded} months`) : "—"}
              </div>
            </div>
            {monthlySaving<=0&&(
              <div style={{marginTop:10,padding:"9px 12px",borderRadius:R.sm,background:T.goldSoft,
                fontSize:12,color:"#946A1F"}}>
                Reduce your expenses to create a monthly surplus toward your goal.
              </div>
            )}
          </div>
        )}

        {/* Achievement */}
        {isAchieved&&(
          <div style={{background:G.income,borderRadius:R.lg,
            padding:"16px",marginBottom:14,textAlign:"center",color:"white",boxShadow:"0 8px 24px rgba(52,211,153,0.35)"}}>
            <div style={{fontSize:44,marginBottom:8}}>🎉</div>
            <div style={{fontSize:18,fontWeight:800,marginBottom:6}}>Goal Achieved!</div>
            <div style={{fontSize:13,opacity:.85}}>
              You reached your target of {fmt(goalAmount)}. Go to Settings to set a new goal!
            </div>
          </div>
        )}

        {/* Hint if no goal — clean, no ugly instruction card */}
        {goalAmount===0&&(
          <div style={{textAlign:"center",padding:"40px 20px",color:"#BBB"}}>
            <div style={{fontSize:13}}>Go to <b style={{color:T.teal500}}>⚙️ Settings → 🎯 Savings Goal</b> to set your target</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PAY TAB (read-only UPI display) ──────────────────────────────────────────
function Pay({ upiList }) {
  const [expandedId, setExpandedId] = useState(null);
  const [copiedId, setCopiedId]     = useState(null);
  const [fullscreenQrId, setFullscreenQrId] = useState(null);
  const fullscreenQr = upiList.find(u => u.id === fullscreenQrId);

  const copyUpi = (id, upiId) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(upiId).catch(()=>{});
    } else {
      try {
        const ta = document.createElement("textarea");
        ta.value = upiId;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {}
    }
    setCopiedId(id);
    setTimeout(()=>setCopiedId(c=>c===id?null:c), 1500);
  };

  // Fullscreen QR view
  if (fullscreenQr) {
    return (
      <div style={{position:"fixed",inset:0,background:T.bg,zIndex:1000,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px"}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:14,fontWeight:700,color:T.ink,marginBottom:20}}>{fullscreenQr.label}</div>
          <img src={fullscreenQr.qr} alt={`${fullscreenQr.label} QR`} style={{width:"90vw",maxWidth:400,height:"auto",borderRadius:R.lg,border:`2px solid ${T.line}`,background:T.card}}/>
          <div style={{fontSize:12,color:T.inkSoft,marginTop:20,marginBottom:30}}>{fullscreenQr.upiId}</div>
          <button onClick={()=>setFullscreenQrId(null)} style={{padding:"14px 32px",borderRadius:R.md,border:"none",background:G.primary,color:"white",fontSize:14,fontWeight:700,cursor:"pointer"}}>Leave</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{background:G.header,padding:"22px 16px 18px",color:"white",borderRadius:`0 0 ${R.xl}px ${R.xl}px`,boxShadow:SH.card}}>
        <div style={{fontSize:11,opacity:.6,letterSpacing:1.5,fontWeight:600}}>QUICK PAY</div>
        <div style={{fontSize:20,fontWeight:700,fontFamily:THEME.font.money}}>Pay</div>
      </div>

      <div style={{padding:"10px 12px"}}>
        {upiList.length===0 && (
          <div style={{textAlign:"center",padding:"50px 0",color:"#9FB3AD"}}>
            <div style={{fontSize:40,marginBottom:10}}>📱</div>
            <div style={{fontSize:14,fontWeight:600,color:T.ink}}>No UPI IDs saved</div>
            <div style={{fontSize:12,marginTop:4}}>Add one from ⚙️ Settings → UPI IDs</div>
          </div>
        )}

        {upiList.map(u=>{
          const isOpen = expandedId===u.id;
          return (
            <div key={u.id} style={{background:T.card,borderRadius:R.lg,padding:"16px",marginBottom:14,boxShadow:SH.card}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:44,height:44,borderRadius:13,background:T.mintSoft,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>📱</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:15,fontWeight:700,color:T.ink}}>{u.label}</div>
                  <div style={{fontSize:12,color:T.inkSoft,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.upiId}</div>
                </div>
                <button onClick={()=>copyUpi(u.id,u.upiId)} style={{padding:"8px 14px",borderRadius:R.sm,
                  border:`1.5px solid ${copiedId===u.id?T.income:T.line}`,
                  background:copiedId===u.id?T.incomeSoft:"#F0F6FF",
                  color:copiedId===u.id?"#1E8E5A":T.teal500,
                  fontSize:12,fontWeight:700,cursor:"pointer",flexShrink:0,fontFamily:THEME.font.body}}>
                  {copiedId===u.id?"✓ Copied":"📋 Copy"}
                </button>
              </div>

              {u.qr && (
                <>
                  <div onClick={()=>setExpandedId(isOpen?null:u.id)} style={{marginTop:12,cursor:"pointer",textAlign:"center"}}>
                    <div style={{
                      overflow:"hidden",
                      maxHeight:isOpen?420:72,
                      transition:"max-height .3s ease",
                      display:"flex",justifyContent:"center"
                    }}>
                      <img src={u.qr} alt={`${u.label} QR`} style={{
                        width:isOpen?320:72, height:isOpen?320:72,
                        borderRadius:R.md, objectFit:"contain",
                        border:`1.5px solid ${T.line}`, display:"block",
                        background:T.bgSoft
                      }}/>
                    </div>
                    <div style={{fontSize:11,color:T.inkSoft,marginTop:6}}>{isOpen?"▲ Tap to collapse":"▼ Tap to expand QR"}</div>
                  </div>
                  {isOpen && (
                    <button onClick={()=>setFullscreenQrId(u.id)} style={{
                      width:"100%",marginTop:10,padding:"10px",borderRadius:R.md,
                      border:"none",background:G.primary,color:"white",
                      fontSize:13,fontWeight:700,cursor:"pointer"
                    }}>📱 Full Screen</button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── PROFILE SCREEN ────────────────────────────────────────────────────────────
function Profile({ profile, setProfile, transactions, accounts, onBack }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState(profile);

  const validAccountNames = new Set((accounts||[]).map(a=>a.name));
  const totalIncome  = transactions.filter(t=>t.type==="income"  && validAccountNames.has(t.account)).reduce((s,t)=>s+t.amount,0);
  const totalExpense = transactions.filter(t=>t.type==="expense" && validAccountNames.has(t.account)).reduce((s,t)=>s+t.amount,0);
  const totalSaved   = Math.max(0, totalIncome - totalExpense);
  const txCount      = transactions.length;

  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImage(file, (compressed) => setForm(f=>({...f, avatar: compressed})));
  };

  const initials = (form.name || "U").trim().split(/\s+/).map(w=>w[0]).slice(0,2).join("").toUpperCase();

  const save = () => { setProfile(form); setEditing(false); };
  const startEdit = () => { setForm(profile); setEditing(true); };
  const cancel = () => { setForm(profile); setEditing(false); };

  return (
    <div>
      <div style={{background:G.header,padding:"22px 16px 22px",color:"white",borderRadius:`0 0 ${R.xl}px ${R.xl}px`,boxShadow:SH.card,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={onBack} style={{background:T.glass,border:`1px solid ${T.glassBorder}`,borderRadius:12,width:36,height:36,color:"white",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>‹</button>
          <div>
            <div style={{fontSize:11,opacity:.6,letterSpacing:1.5,fontWeight:600}}>ACCOUNT</div>
            <div style={{fontSize:20,fontWeight:700,fontFamily:THEME.font.money}}>Profile</div>
          </div>
        </div>
        {editing
          ? <div style={{display:"flex",gap:8}}>
              <button onClick={cancel} style={{background:T.glass,border:`1px solid ${T.glassBorder}`,borderRadius:10,padding:"8px 14px",color:"white",fontSize:12,fontWeight:700,cursor:"pointer"}}>Cancel</button>
              <button onClick={save} style={{background:T.gold,border:"none",borderRadius:10,padding:"8px 14px",color:T.teal900,fontSize:12,fontWeight:700,cursor:"pointer"}}>Save</button>
            </div>
          : <button onClick={startEdit} style={{background:T.glass,border:`1px solid ${T.glassBorder}`,borderRadius:10,padding:"8px 14px",color:"white",fontSize:12,fontWeight:700,cursor:"pointer"}}>✏️ Edit</button>
        }
      </div>

      <div style={{padding:"0 12px",marginTop:-24}}>

        {/* Avatar card */}
        <div style={{background:T.card,borderRadius:R.lg,padding:"16px",marginBottom:14,boxShadow:SH.card,textAlign:"center"}}>
          <div style={{position:"relative",display:"inline-block"}}>
            {(editing?form.avatar:profile.avatar)
              ? <img src={editing?form.avatar:profile.avatar} alt="Avatar" style={{width:84,height:84,borderRadius:"50%",objectFit:"cover",border:`3px solid ${T.mintSoft}`}}/>
              : <div style={{width:84,height:84,borderRadius:"50%",background:G.primary,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:28,fontWeight:800,fontFamily:THEME.font.money}}>{initials}</div>
            }
            {editing && (
              <label style={{position:"absolute",bottom:0,right:0,width:28,height:28,borderRadius:"50%",background:T.gold,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,cursor:"pointer",border:"2px solid white"}}>
                📷
                <input type="file" accept="image/*" onChange={handleAvatar} style={{display:"none"}}/>
              </label>
            )}
          </div>
          {editing
            ? <FInput value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name" style={{marginTop:14,textAlign:"center",fontWeight:700}}/>
            : <div style={{fontSize:17,fontWeight:700,color:T.ink,marginTop:12}}>{profile.name || "Your Name"}</div>
          }
        </div>

        {/* Financial Summary */}
        <div style={{display:"flex",gap:10,marginBottom:14}}>
          <div style={{flex:1,background:T.card,borderRadius:R.md,padding:"14px",boxShadow:SH.card,borderTop:`3px solid ${T.income}`}}>
            <div style={{fontSize:10,color:T.inkSoft,marginBottom:4,fontWeight:600}}>TOTAL SAVED</div>
            <div style={{fontSize:15,fontWeight:800,color:T.income}}>{fmt(totalSaved)}</div>
          </div>
          <div style={{flex:1,background:T.card,borderRadius:R.md,padding:"14px",boxShadow:SH.card,borderTop:`3px solid ${T.expense}`}}>
            <div style={{fontSize:10,color:T.inkSoft,marginBottom:4,fontWeight:600}}>TOTAL SPENT</div>
            <div style={{fontSize:15,fontWeight:800,color:T.expense}}>{fmt(totalExpense)}</div>
          </div>
          <div style={{flex:1,background:T.card,borderRadius:R.md,padding:"14px",boxShadow:SH.card,borderTop:`3px solid ${T.teal500}`}}>
            <div style={{fontSize:10,color:T.inkSoft,marginBottom:4,fontWeight:600}}>TRANSACTIONS</div>
            <div style={{fontSize:15,fontWeight:800,color:T.teal500}}>{txCount}</div>
          </div>
        </div>

        {/* Details */}
        <div style={{background:T.card,borderRadius:R.lg,padding:"14px",marginBottom:14,boxShadow:SH.card}}>
          <div style={{fontSize:14,fontWeight:700,color:T.ink,marginBottom:14}}>Personal Details</div>

          <Label>OCCUPATION</Label>
          {editing
            ? <ChipRow items={OCCUPATIONS} selected={form.occupation} onSelect={v=>setForm({...form,occupation:v})}/>
            : <div style={{fontSize:14,color:T.ink,fontWeight:600,marginBottom:14}}>{profile.occupation}</div>
          }

          <Label>MONTHLY INCOME</Label>
          {editing
            ? <FInput value={form.monthlyIncome} onChange={e=>setForm({...form,monthlyIncome:e.target.value})} placeholder="₹ 0" type="number" style={{marginBottom:14}}/>
            : <div style={{fontSize:14,color:T.ink,fontWeight:600,marginBottom:14}}>{profile.monthlyIncome?fmt(profile.monthlyIncome):"Not set"}</div>
          }

          <Label>LANGUAGE</Label>
          {editing
            ? <ChipRow items={LANGUAGES} selected={form.language} onSelect={v=>setForm({...form,language:v})}/>
            : <div style={{fontSize:14,color:T.ink,fontWeight:600,marginBottom:14}}>{profile.language}</div>
          }

          <Label>DATE FORMAT</Label>
          {editing
            ? <ChipRow items={DATE_FORMATS} selected={form.dateFormat} onSelect={v=>setForm({...form,dateFormat:v})}/>
            : <div style={{fontSize:14,color:T.ink,fontWeight:600}}>{profile.dateFormat}</div>
          }

          <Label>THEME</Label>
          {editing
            ? <ChipRow items={['light','dark','system']} selected={form.theme||'system'} onSelect={v=>setForm({...form,theme:v})}/>
            : <div style={{fontSize:14,color:T.ink,fontWeight:600,textTransform:'capitalize'}}>{profile.theme||'system'}</div>
          }
        </div>
      </div>
    </div>
  );
}

// ─── ACCOUNTS SCREEN (full page, like Profile) ────────────────────────────────
function AccountsScreen({ accounts, setAccounts, transactions, setTransactions, openingBalance, setOpeningBalance, declaredAmount, setDeclaredAmount, goalAmount, setGoalAmount, onBack }) {
  const [section, setSection]   = useState(null);
  const [accForm, setAccForm]   = useState({name:"",type:"Cash",icon:"💵",opening:""});
  const [editAccId, setEditAccId] = useState(null);
  const [delAccId, setDelAccId] = useState(null);
  const [obTemp, setObTemp]     = useState("");
  const [daTemp, setDaTemp]     = useState("");
  const [goalTemp, setGoalTemp] = useState("");

  const toggle = (key) => setSection(s => s===key ? null : key);

  const saveAccount = () => {
    if (!accForm.name.trim()) return;
    const entry = {...accForm, opening: parseFloat(accForm.opening)||0};
    if (editAccId) {
      const oldAcc = accounts.find(a=>a.id===editAccId);
      setAccounts(prev=>prev.map(a=>a.id===editAccId?{...entry,id:editAccId}:a));
      // Transactions reference accounts by name, so a rename must cascade
      // or every past transaction silently falls off that account's balance.
      if (oldAcc && oldAcc.name !== entry.name) {
        setTransactions(prev=>prev.map(t=>(
          t.account===oldAcc.name || t.toAccount===oldAcc.name
            ? { ...t,
                account:   t.account===oldAcc.name   ? entry.name : t.account,
                toAccount: t.toAccount===oldAcc.name ? entry.name : t.toAccount }
            : t
        )));
      }
    } else {
      setAccounts(prev=>[...prev,{...entry,id:Date.now()}]);
    }
    setAccForm({name:"",type:"Cash",icon:"💵",opening:""}); setEditAccId(null);
  };
  const txCountFor   = (name) => transactions.filter(t=>t.account===name||t.toAccount===name).length;
  const deleteAcc    = (id) => { setAccounts(prev=>prev.filter(a=>a.id!==id)); setDelAccId(null); };
  const startEditAcc = (a)  => { setAccForm({...a,opening:String(a.opening)}); setEditAccId(a.id); setSection("myaccounts"); };

  const Row = ({icon,title,sub,id}) => (
    <div onClick={()=>toggle(id)} style={{background:T.card,borderRadius:R.lg,padding:"14px 16px",
      marginBottom:12,boxShadow:SH.card,display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
      <div style={{width:44,height:44,borderRadius:13,background:section===id?T.mintSoft:T.bgSoft,
        flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{icon}</div>
      <div style={{flex:1}}>
        <div style={{fontSize:15,fontWeight:700,color:T.ink}}>{title}</div>
        <div style={{fontSize:12,color:T.inkSoft,marginTop:1}}>{sub}</div>
      </div>
      <div style={{color:section===id?T.teal500:"#9FB3AD",fontSize:18,
        transform:section===id?"rotate(90deg)":"none",transition:"transform .2s"}}>›</div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{background:G.header,padding:"24px 16px 22px",color:"white",
        borderRadius:`0 0 ${R.xl}px ${R.xl}px`,boxShadow:SH.card,
        display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:T.glass,border:`1px solid ${T.glassBorder}`,
          borderRadius:12,width:36,height:36,color:"white",fontSize:20,cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",padding:0,flexShrink:0}}>‹</button>
        <div>
          <div style={{fontSize:11,opacity:.6,letterSpacing:1.5,fontWeight:600}}>SETTINGS</div>
          <div style={{fontSize:20,fontWeight:700}}>Accounts & Balances</div>
        </div>
      </div>

      <div style={{padding:"14px 12px"}}>

        {/* ── MY ACCOUNTS ── */}
        <Row icon="💳" title="My Accounts" sub={`${accounts.length} account${accounts.length!==1?"s":""} · add or edit`} id="myaccounts"/>
        {section==="myaccounts" && (
          <div style={{background:T.bgSoft,borderRadius:R.lg,padding:"12px",marginBottom:12}}>
            {accounts.length===0 && <div style={{fontSize:13,color:"#9FB3AD",marginBottom:10}}>No accounts yet. Add one below.</div>}
            {accounts.map(a=>(
              <div key={a.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,
                padding:"10px 12px",borderRadius:12,background:T.card,boxShadow:SH.soft}}>
                <span style={{fontSize:20}}>{a.icon}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:600,color:T.ink}}>{a.name}</div>
                  <div style={{fontSize:11,color:T.inkSoft}}>{a.type} · Opening {fmt(a.opening)}</div>
                </div>
                <button onClick={()=>startEditAcc(a)} style={{padding:"5px 10px",borderRadius:8,
                  border:`1.5px solid ${T.line}`,background:"#F0F6FF",color:T.teal500,
                  fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Edit</button>
                <button onClick={()=>setDelAccId(a.id)} style={{padding:"5px 10px",borderRadius:8,
                  border:"1.5px solid #FBD5D5",background:T.expenseSoft,color:T.expense,
                  fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>🗑</button>
              </div>
            ))}
            {delAccId && (()=>{
              const linkedCount = txCountFor(accounts.find(a=>a.id===delAccId)?.name);
              return (
                <div style={{padding:"12px",borderRadius:12,background:T.expenseSoft,
                  border:"1.5px solid #FBD5D5",marginBottom:10}}>
                  <div style={{fontSize:13,fontWeight:700,color:T.expense,marginBottom:8}}>Delete this account?</div>
                  {linkedCount>0 && (
                    <div style={{fontSize:12,color:"#946A1F",marginBottom:8}}>
                      ⚠️ {linkedCount} transaction{linkedCount!==1?"s":""} reference this account. They'll stay in your history but will no longer count toward Income/Expense totals or any account balance.
                    </div>
                  )}
                  <div style={{display:"flex",gap:8}}>
                    <FBtn onClick={()=>setDelAccId(null)} outline color={T.inkSoft} style={{flex:1,padding:"9px"}}>Cancel</FBtn>
                    <FBtn onClick={()=>deleteAcc(delAccId)} bg={G.expense} style={{flex:1,padding:"9px"}}>Delete</FBtn>
                  </div>
                </div>
              );
            })()}
            <div style={{paddingTop:12,borderTop:`1px solid ${T.line}`,marginTop:4}}>
              <div style={{fontSize:12,fontWeight:700,color:T.inkSoft,marginBottom:8,letterSpacing:.4}}>
                {editAccId?"✏️ EDIT ACCOUNT":"➕ ADD NEW ACCOUNT"}
              </div>
              <FInput value={accForm.name} onChange={e=>setAccForm({...accForm,name:e.target.value})}
                placeholder="Account name (e.g. SBI Bank)" style={{marginBottom:8}}/>
              <ChipRow items={ACCOUNT_TYPES} selected={accForm.type}
                onSelect={v=>{const at=ACCOUNT_TYPES.find(a=>a.type===v);setAccForm({...accForm,type:v,icon:at?.icon||"💰"});}}/>
              <FInput value={accForm.opening} onChange={e=>setAccForm({...accForm,opening:e.target.value})}
                placeholder="₹ Opening balance (no transaction recorded)" type="number" style={{marginBottom:10}}/>
              <div style={{display:"flex",gap:8}}>
                {editAccId&&<FBtn onClick={()=>{setAccForm({name:"",type:"Cash",icon:"💵",opening:""});setEditAccId(null);}}
                  outline color={T.inkSoft} style={{flex:1,padding:"11px"}}>Cancel</FBtn>}
                <FBtn onClick={saveAccount} style={{flex:1,padding:"11px"}}>
                  {editAccId?"Update Account":"Add Account"}
                </FBtn>
              </div>
            </div>
          </div>
        )}

        {/* ── OPENING BALANCE ── */}
        <Row icon="💵" title="Opening Balance" sub={openingBalance>0?`Set to ${fmt(openingBalance)}`:"Not set · extra starting amount"} id="opening"/>
        {section==="opening" && (
          <div style={{background:T.bgSoft,borderRadius:R.lg,padding:"14px",marginBottom:12}}>
            <div style={{fontSize:13,color:T.inkSoft,marginBottom:12,lineHeight:1.5}}>
              A global extra starting amount added to your total balance — on top of individual account balances. Use this for cash at home or savings not linked to any account.
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <FInput value={obTemp} onChange={e=>setObTemp(e.target.value)}
                placeholder={openingBalance>0?fmt(openingBalance):"₹ 0"} type="number"
                style={{flex:1,fontSize:18,fontWeight:700}}/>
              {openingBalance>0&&<FBtn onClick={()=>{setOpeningBalance(0);setObTemp("");}}
                bg={G.expense} style={{padding:"12px 14px",flexShrink:0}}>🗑</FBtn>}
              <FBtn onClick={()=>{setOpeningBalance(parseFloat(obTemp)||0);setObTemp("");}}
                style={{padding:"12px 18px",flexShrink:0}}>Save</FBtn>
            </div>
          </div>
        )}

        {/* ── DECLARED TOTAL ── */}
        <Row icon="💼" title="Declared Total" sub={declaredAmount>0?`Declared: ${fmt(declaredAmount)}`:"Not set · your known total wealth"} id="declared"/>
        {section==="declared" && (
          <div style={{background:T.bgSoft,borderRadius:R.lg,padding:"14px",marginBottom:12}}>
            <div style={{fontSize:13,color:T.inkSoft,marginBottom:12,lineHeight:1.5}}>
              Your total known wealth — savings, fixed deposits, cash at home, etc. Dashboard shows the difference between this and what the app has calculated, so you can see if anything is unaccounted.
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <FInput value={daTemp} onChange={e=>setDaTemp(e.target.value)}
                placeholder={declaredAmount>0?fmt(declaredAmount):"₹ 0"} type="number"
                style={{flex:1,fontSize:18,fontWeight:700}}/>
              {declaredAmount>0&&<FBtn onClick={()=>{setDeclaredAmount(0);setDaTemp("");}}
                bg={G.expense} style={{padding:"12px 14px",flexShrink:0}}>🗑</FBtn>}
              <FBtn onClick={()=>{setDeclaredAmount(parseFloat(daTemp)||0);setDaTemp("");}}
                style={{padding:"12px 18px",flexShrink:0}}>Save</FBtn>
            </div>
          </div>
        )}

        {/* ── SAVINGS GOAL ── */}
        <Row icon="🎯" title="Savings Goal" sub={goalAmount>0?`Target: ${fmt(goalAmount)}`:"Not set · set your savings target"} id="goal"/>
        {section==="goal" && (
          <div style={{background:T.bgSoft,borderRadius:R.lg,padding:"14px",marginBottom:12}}>
            <div style={{fontSize:13,color:T.inkSoft,marginBottom:12,lineHeight:1.5}}>
              Set a target amount you want to save. The Goal tab shows a live progress bar, how much is still needed, and an estimated time to reach it.
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <FInput value={goalTemp} onChange={e=>setGoalTemp(e.target.value)}
                placeholder={goalAmount>0?fmt(goalAmount):"₹ 0"} type="number"
                style={{flex:1,fontSize:18,fontWeight:700}}/>
              {goalAmount>0&&<FBtn onClick={()=>{setGoalAmount(0);setGoalTemp("");}}
                bg={G.expense} style={{padding:"12px 14px",flexShrink:0}}>🗑</FBtn>}
              <FBtn onClick={()=>{setGoalAmount(parseFloat(goalTemp)||0);setGoalTemp("");}}
                style={{padding:"12px 18px",flexShrink:0}}>Save</FBtn>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,          setTab]          = useState("dashboard");
  const [transactions, setTransactions] = useLS("fm_transactions",  SEED_TX);
  const [loans,        setLoans]        = useLS("fm_loans",          SEED_LOANS);
  const [accounts,     setAccounts]     = useLS("fm_accounts",       SEED_ACCOUNTS);
  const [openingBalance, setOpeningBalance] = useLS("fm_opening",    0);
  const [declaredAmount, setDeclaredAmount] = useLS("fm_declared",   0);
  const [goalAmount,   setGoalAmount]   = useLS("fm_goal",           0);
  const [manualCheck,  setManualCheck]  = useLS("fm_manual",         0);
  const [pin,          setPin]          = useLS("fm_pin",            "");
  const [pinEnabled,   setPinEnabled]   = useLS("fm_pin_enabled",    false);
  const [upiList,      setUpiList]      = useLS("fm_upi",            SEED_UPI);
  const [profile,      setProfile]      = useLS("fm_profile",        SEED_PROFILE);
  const [notifyEnabled,setNotifyEnabled]= useLS("fm_notify",         false);
  const [categories,   setCategories]   = useLS("fm_categories",     SEED_CATEGORIES);
  const [trash,        setTrash]        = useLS("fm_trash",          { transactions: [], loans: [], categories: { income: [], expense: [] } });
  const [workNames,    setWorkNames]    = useLS("fm_work_names",     SEED_WORK_NAMES);
  const [workRecords,    setWorkRecords]    = useLS("fm_work_records", SEED_WORK_RECORDS);
  const [recurring,      setRecurring]      = useLS("fm_recurring",    []);
  const [monthlyHistory, setMonthlyHistory] = useLS("fm_monthly_history", {});
  const [unlocked,     setUnlocked]     = useState(!pinEnabled);

  // Apply recurring transactions on load
  useEffect(() => {
    if (recurring && recurring.length > 0) {
      applyRecurring(recurring, transactions, setTransactions);
    }
  }, []); // eslint-disable-line
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showProfile,  setShowProfile]  = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);

  // Determine active theme based on profile setting
  const activeTheme = profile.theme === 'system' ? getSystemTheme() : (profile.theme || 'dark');
  const currentTheme = THEMES[activeTheme] || THEMES.dark;
  T = currentTheme.colors;
  G = currentTheme.gradient;

  useEffect(()=>{ if (!pinEnabled) setUnlocked(true); },[pinEnabled]);

  // Auto-archive: when a new month starts, move past months to history
  useEffect(() => {
    const currentMonth = todayStr().slice(0, 7); // "YYYY-MM"
    const pastTxns = transactions.filter(t => (t.date || "").slice(0, 7) < currentMonth);
    if (pastTxns.length === 0) return;

    setMonthlyHistory(prev => {
      const updated = { ...prev };
      pastTxns.forEach(t => {
        const monthKey = (t.date || "").slice(0, 7);
        if (!updated[monthKey]) updated[monthKey] = [];
        if (!updated[monthKey].find(x => x.id === t.id)) {
          updated[monthKey] = [...updated[monthKey], t];
        }
      });
      return updated;
    });
    setTransactions(prev => prev.filter(t => (t.date || "").slice(0, 7) >= currentMonth));
  }, []);

  // Listen to system theme changes if system theme is selected
  useEffect(() => {
    if (profile.theme === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        // Force re-render by updating a dummy state
        setProfile(p => ({...p}));
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [profile.theme]);

  if (pinEnabled && !unlocked) {
    return <PinScreen mode="verify" savedPin={pin} onSuccess={()=>setUnlocked(true)}/>;
  }

  // Profile is a full-screen overlay
  if (showProfile) {
    return (
      <div style={{fontFamily:THEME.font.body,background:T.bgSoft,minHeight:"100vh",maxWidth:420,margin:"0 auto",overflowX:"hidden"}}>
        <Profile profile={profile} setProfile={setProfile} transactions={transactions} accounts={accounts} onBack={()=>setShowProfile(false)}/>
      </div>
    );
  }

  // Accounts screen is a full-screen overlay
  if (showAccounts) {
    return (
      <div style={{fontFamily:THEME.font.body,background:T.bgSoft,minHeight:"100vh",maxWidth:420,margin:"0 auto",overflowX:"hidden"}}>
        <AccountsScreen
          accounts={accounts} setAccounts={setAccounts}
          transactions={transactions} setTransactions={setTransactions}
          openingBalance={openingBalance} setOpeningBalance={setOpeningBalance}
          declaredAmount={declaredAmount} setDeclaredAmount={setDeclaredAmount}
          goalAmount={goalAmount} setGoalAmount={setGoalAmount}
          onBack={()=>setShowAccounts(false)}/>
      </div>
    );
  }

  const navItems = [
    {id:"dashboard",    icon:"🏠", label:"Home"},
    {id:"transactions", icon:"💳", label:"Txns"},
    {id:"loans",        icon:"🤝", label:"Loans"},
    {id:"goal",         icon:"🎯", label:"Goal"},
    {id:"pay",          icon:"💸", label:"Pay"},
    {id:"work",         icon:"💼", label:"Work"},
  ];

  return (
    <div style={{fontFamily:THEME.font.body,background:T.bgSoft,
      minHeight:"100vh",maxWidth:420,margin:"0 auto",paddingBottom:72,overflowX:"hidden"}}>

      {tab==="dashboard"    && <Dashboard
        transactions={transactions} setTransactions={setTransactions} setTrash={setTrash} loans={loans} accounts={accounts} categories={categories}
        openingBalance={openingBalance} declaredAmount={declaredAmount}
        manualCheck={manualCheck} notifyEnabled={notifyEnabled} onOpenSettings={()=>setSettingsOpen(true)}/>}

      {tab==="transactions" && <Transactions
        transactions={transactions} setTransactions={setTransactions} setTrash={setTrash}
        accounts={accounts} categories={categories}
        recurring={recurring} setRecurring={setRecurring}/>}

      {tab==="loans"        && <Loans loans={loans} setLoans={setLoans} setTrash={setTrash}/>}

      {tab==="goal"         && <Goal
        transactions={transactions} accounts={accounts}
        openingBalance={openingBalance}
        goalAmount={goalAmount}/>}

      {tab==="pay"          && <Pay upiList={upiList}/>}

      {tab==="work"         && <Work workRecords={workRecords} setWorkRecords={setWorkRecords} workNames={workNames} />}

      {/* Settings — bottom sheet, opened via gear icon on Home */}
      <SettingsSheet
        open={settingsOpen} onClose={()=>setSettingsOpen(false)}
        monthlyHistory={monthlyHistory} setMonthlyHistory={setMonthlyHistory}
        transactions={transactions} setTransactions={setTransactions}
        loans={loans} setLoans={setLoans}
        accounts={accounts} setAccounts={setAccounts}
        openingBalance={openingBalance} setOpeningBalance={setOpeningBalance}
        declaredAmount={declaredAmount} setDeclaredAmount={setDeclaredAmount}
        goalAmount={goalAmount} setGoalAmount={setGoalAmount}
        manualCheck={manualCheck} setManualCheck={setManualCheck}
        pin={pin} setPin={setPin} pinEnabled={pinEnabled} setPinEnabled={setPinEnabled}
        upiList={upiList} setUpiList={setUpiList}
        notifyEnabled={notifyEnabled} setNotifyEnabled={setNotifyEnabled}
        categories={categories} setCategories={setCategories}
        workNames={workNames} setWorkNames={setWorkNames}
        workRecords={workRecords} setWorkRecords={setWorkRecords}
        recurring={recurring} setRecurring={setRecurring}
        trash={trash} setTrash={setTrash}
        onOpenProfile={()=>setShowProfile(true)}
        onOpenAccounts={()=>{setSettingsOpen(false);setShowAccounts(true);}}
        profile={profile} setProfile={setProfile}/>

      {/* Bottom Nav — glass blur, rounded top corners */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:420,
        background:G.nav,backdropFilter:"blur(16px)",display:"flex",
        borderRadius:`${R.xl}px ${R.xl}px 0 0`,padding:"8px 4px 10px",
        boxShadow:SH.nav,border:`1px solid ${T.line}`,borderBottom:"none"}}>
        {navItems.map(item=>(
          <button key={item.id} onClick={()=>setTab(item.id)} style={{flex:1,background:"none",border:"none",
            cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,
            position:"relative",fontFamily:THEME.font.body,padding:"6px 0"}}>
            <span style={{fontSize:21,filter:tab===item.id?"none":"grayscale(0.4) opacity(0.7)",transition:"filter .15s"}}>{item.icon}</span>
            <span style={{fontSize:10,fontWeight:700,color:tab===item.id?T.teal700:T.inkSoft}}>{item.label}</span>
            {tab===item.id&&<div style={{position:"absolute",top:-10,width:24,height:3,
              borderRadius:R.pill,background:G.gold}}/>}
          </button>
        ))}
      </div>
    </div>
  );
}
