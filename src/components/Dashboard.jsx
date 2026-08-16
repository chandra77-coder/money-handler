import React, { useState, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { useFinance } from "../context/FinanceContext";
import { THEMES, THEME_CONFIG } from "../constants/theme";
import { fmt, todayStr, fmtTime } from "../utils/formatters";
import { sortByDateDesc, monthYearStr, getLast6Months } from "../utils/dataHelpers";
import { DonutChart } from "./Charts";
const CashFlowChart = lazy(() => import("./ModernCharts").then(module => ({ default: module.CashFlowChart })));
const SpendingPieChart = lazy(() => import("./ModernCharts").then(module => ({ default: module.SpendingPieChart })));
import { TransactionDetailSheet } from "./TransactionDetailSheet";
import { Sheet, TypeToggle, Label, FInput, ChipRow, FBtn } from "./Shared";
import { INCOME_METHODS, EXPENSE_METHODS } from "../constants/seedData";

const makeEmptyTx = () => ({type:"expense",category:"",icon:"📦",amount:"",note:"",date:todayStr(),account:"",toAccount:"",method:"",photo:null});

export function Dashboard() {
  const { 
    transactions, setTransactions, deleteTransaction, updateTransaction,
    loans, accounts, openingBalance, declaredAmount, manualCheck, 
    profile, totals, accountBalances, totalTracked, setActiveTab 
  } = useFinance();

  const [selectedTx, setSelectedTx] = useState(null);
  const [editTxId, setEditTxId] = useState(null);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [editForm, setEditForm] = useState(makeEmptyTx);
  const [delTxId, setDelTxId] = useState(null);

  const theme = profile.theme || "system";
  const currentTheme = THEMES[theme] || THEMES.light;
  const T = currentTheme.colors;
  const G = currentTheme.gradient;
  const R = THEME_CONFIG.radius;
  const SH = THEME_CONFIG.shadow;

  const categories = {
    income:  [{l:"Salary",icon:"💼"},{l:"Freelance",icon:"💻"},{l:"Business",icon:"🏪"},{l:"Gift",icon:"🎁"},{l:"Other",icon:"💰"}],
    expense: [{l:"Food",icon:"🍛"},{l:"Travel",icon:"🚌"},{l:"Bills",icon:"📄"},{l:"Shopping",icon:"🛍️"},{l:"Health",icon:"💊"},{l:"Other",icon:"📦"}],
  };

  const openEdit = (tx) => {
    setEditTxId(tx.id);
    setEditForm({ ...tx, amount: String(tx.amount) });
    setShowEditSheet(true);
  };

  const saveEdit = () => {
    if (!editForm.amount || parseFloat(editForm.amount) <= 0) return;
    const catList = editForm.type === "income" ? categories.income : categories.expense;
    const cat = catList.find(c => c.l === editForm.category);
    updateTransaction(editTxId, { 
      ...editForm, 
      icon: cat?.icon || editForm.icon, 
      amount: parseFloat(editForm.amount) 
    });
    setShowEditSheet(false);
    setEditTxId(null);
  };

  const declaredDiff = declaredAmount - totalTracked;
  const manualDiff = manualCheck - totalTracked;
  const recent = sortByDateDesc(transactions).slice(0, 4);
  const loggedToday = transactions.some(t => t.date === todayStr());
  const showReminder = profile.notifyEnabled && !loggedToday;

  const txColor = (t) => t.type === "income" ? T.income : t.type === "transfer" ? "#9F8AE8" : T.expense;
  const txBg = (t) => t.type === "income" ? T.incomeSoft : t.type === "transfer" ? T.transferSoft : T.expenseSoft;
  const txPrefix = (t) => t.type === "income" ? "+" : t.type === "transfer" ? "⇄" : "−";

  return (
    <div>
      <div style={{background:G.header,padding:"24px 16px 60px",color:"white",borderRadius:`0 0 ${R.xxl}px ${R.xxl}px`,boxShadow:SH.raised,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-60,right:-40,width:180,height:180,borderRadius:"50%",background:"radial-gradient(circle,rgba(232,199,126,0.18),transparent 70%)"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22,position:"relative"}}>
          <div>
            <div style={{fontSize:11,opacity:.6,letterSpacing:1.5,fontWeight:600}}>{monthYearStr()}</div>
            <div style={{fontSize:20,fontWeight:700,fontFamily:THEME_CONFIG.font.money,marginTop:2}}>My Finance</div>
          </div>
          <button onClick={() => setActiveTab("settings")} style={{width:40,height:40,borderRadius:14,background:T.glass,border:`1px solid ${T.glassBorder}`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,cursor:"pointer",padding:0}}>⚙️</button>
        </div>

        <div style={{background:T.glassStrong,borderRadius:R.xl,padding:"16px 18px",border:`1px solid ${T.glassBorder}`,
          backdropFilter:"blur(14px)",position:"relative",boxShadow:SH.glow}}>
          <div style={{fontSize:12,opacity:.65,marginBottom:5,fontWeight:600,letterSpacing:.3}}>Total Available</div>
          <div style={{fontSize:32,fontWeight:600,letterSpacing:-0.5,color:totalTracked>=0?T.mint:"#FCA5A5",fontFamily:THEME_CONFIG.font.money}}>
            {fmt(totalTracked)}
          </div>
          {openingBalance>0&&<div style={{fontSize:11,opacity:.5,marginTop:3}}>Includes {fmt(openingBalance)} opening balance</div>}
          <div style={{display:"flex",marginTop:16}}>
            <div style={{flex:1,borderRight:`1px solid ${T.glassBorder}`,paddingRight:14}}>
              <div style={{fontSize:11,opacity:.6,marginBottom:3,fontWeight:600}}>↑ INCOME</div>
              <div style={{fontSize:15,fontWeight:700,color:T.mint}}>{fmt(totals.income)}</div>
            </div>
            <div style={{flex:1,paddingLeft:14}}>
              <div style={{fontSize:11,opacity:.6,marginBottom:3,fontWeight:600}}>↓ EXPENSE</div>
              <div style={{fontSize:15,fontWeight:700,color:"#FCA5A5"}}>{fmt(totals.expense)}</div>
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
                <div style={{fontSize:15,fontWeight:800,color:acc.balance>=0?T.ink:T.expense,fontFamily:THEME_CONFIG.font.money}}>{fmt(acc.balance)}</div>
              </div>
            ))}
          </div>
        )}

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
                <div style={{fontSize:15,fontWeight:800,color:resColor,fontFamily:THEME_CONFIG.font.money}}>
                  {isBalanced?"Balanced":`${fmt(Math.abs(declaredDiff))} ${isOver?"over":"missing"}`}
                </div>
              </div>
            </div>
          );
        })()}

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
                <div style={{fontSize:15,fontWeight:800,color:topColor,fontFamily:THEME_CONFIG.font.money}}>
                  {isExact?"Balanced":`${fmt(Math.abs(manualDiff))} ${isMore?"extra":"short"}`}
                </div>
              </div>
            </div>
          );
        })()}

        {getLast6Months(transactions).some(m => m.income > 0 || m.expense > 0) && (
          <div style={{ background: T.card, borderRadius: R.lg, padding: "14px", marginBottom: 14, boxShadow: SH.card }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 12 }}>📈 6-Month Cash Flow</div>
            <Suspense fallback={<div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: T.inkSoft, fontSize: 12 }}>Loading analytics…</div>}>
              <CashFlowChart data={getLast6Months(transactions)} theme={theme} />
            </Suspense>
          </div>
        )}

        {(() => {
          const curMonth = todayStr().slice(0, 7);
          const expThisMonth = transactions.filter(t => t.type === "expense" && (t.date || "").startsWith(curMonth));
          if (expThisMonth.length === 0) return null;
          const catMap = {};
          expThisMonth.forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });
          const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
          const PALETTE = ["#E53E3E", "#3399FF", "#F5B942", "#1DB954", "#9F8AE8", "#E67E22"];
          const slices = sorted.map(([k, v], i) => ({ name: k, value: v, color: PALETTE[i % PALETTE.length] }));
          return (
            <div style={{ background: T.card, borderRadius: R.lg, padding: "14px", marginBottom: 14, boxShadow: SH.card }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 12 }}>🍩 This Month's Spending</div>
              <Suspense fallback={<div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: T.inkSoft, fontSize: 12 }}>Loading analytics…</div>}>
                <SpendingPieChart data={slices} theme={theme} />
              </Suspense>
            </div>
          );
        })()}

        <div style={{background:T.card,borderRadius:R.lg,padding:"13px",boxShadow:SH.card,marginBottom:100}}>
          <div style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:13}}>Recent Transactions</div>
          {recent.length===0&&<div style={{textAlign:"center",color:"#C8D6D2",padding:"20px 0",fontSize:13}}>No transactions yet</div>}
          {recent.map(t=>(
            <motion.div key={t.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: recent.indexOf(t) * 0.045, duration: 0.28, ease: [0.22, 1, 0.36, 1] }} whileTap={{ scale: 0.985 }} onClick={()=>setSelectedTx(t)} className="smooth-card" style={{display:"flex",alignItems:"center",gap:12,marginBottom:12,cursor:"pointer"}}>
              <div style={{width:40,height:40,borderRadius:R.sm,background:txBg(t),
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{t.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:600,color:T.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {t.type==="transfer"?`${t.account} → ${t.toAccount}`:t.category}
                </div>
                <div style={{fontSize:11,color:T.inkSoft,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {t.type==="transfer" ? "Transfer" : t.account + (t.note ? ` · ${t.note}` : "")}
                  {fmtTime(t.createdAt) ? ` · ${fmtTime(t.createdAt)}` : ""}
                </div>
              </div>
              <div style={{fontSize:15,fontWeight:700,color:txColor(t),flexShrink:0,fontFamily:THEME_CONFIG.font.money}}>
                {txPrefix(t)}{fmt(t.amount)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <TransactionDetailSheet tx={selectedTx} onClose={()=>setSelectedTx(null)} onDelete={deleteTransaction} onEdit={openEdit} />

      <Sheet open={showEditSheet} onClose={()=>{setShowEditSheet(false); setEditTxId(null);}}>
        <div style={{fontSize:17,fontWeight:800,color:T.ink,marginBottom:14,fontFamily:THEME_CONFIG.font.money}}>Edit Transaction</div>
        <TypeToggle
          options={[["expense","↓ Expense"],["income","↑ Income"],["transfer","⇄ Transfer"]]}
          value={editForm.type} onChange={v=>setEditForm({...editForm,type:v})}
          colors={{expense:G.expense,income:G.income,transfer:G.transfer}}/>

        <Label>AMOUNT</Label>
        <FInput value={editForm.amount} onChange={e=>setEditForm({...editForm,amount:e.target.value})}
          placeholder="₹ 0" type="number" style={{fontSize:19,fontWeight:700,marginBottom:12,fontFamily:THEME_CONFIG.font.money}}/>

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

      {delTxId && (
        <div style={{position:"fixed",inset:0,background:"rgba(10,26,24,0.55)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:24,backdropFilter:"blur(2px)"}}>
          <div style={{background:T.card,borderRadius:R.xl,padding:"28px 24px",width:"100%",maxWidth:320,textAlign:"center",boxShadow:SH.raised}}>
            <div style={{fontSize:36,marginBottom:10}}>🗑️</div>
            <div style={{fontSize:16,fontWeight:700,marginBottom:8,color:T.ink}}>Delete this transaction?</div>
            <div style={{fontSize:13,color:T.inkSoft,marginBottom:22}}>This will move it to Trash and can be restored later.</div>
            <div style={{display:"flex",gap:10}}>
              <FBtn onClick={()=>setDelTxId(null)} outline color={T.inkSoft} style={{flex:1}}>Cancel</FBtn>
              <FBtn onClick={()=>{deleteTransaction(delTxId); setDelTxId(null);}} bg={G.expense} style={{flex:1}}>Delete</FBtn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
