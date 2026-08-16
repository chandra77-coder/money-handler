import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, FBtn } from "./Shared";
import { THEMES, THEME_CONFIG } from "../constants/theme";
import { useFinance } from "../context/FinanceContext";
import { fmt, fmtDateLong, fmtTime, compressImage } from "../utils/formatters";
import { toAmount } from "../utils/dataHelpers";

export function TransactionDetailSheet({ tx, onClose, onDelete, onEdit }) {
  const { theme, transactions, accounts, updateTransaction } = useFinance();
  const [viewPhoto, setViewPhoto] = useState(null);
  
  if (!tx) return null;

  const currentTheme = THEMES[theme] || THEMES.light;
  const T = currentTheme.colors;
  const R = THEME_CONFIG.radius;
  
  const color  = tx.type==="income" ? T.income : tx.type==="transfer" ? "#7B5EA7" : T.expense;
  const bg     = tx.type==="income" ? T.incomeSoft : tx.type==="transfer" ? T.transferSoft : T.expenseSoft;
  const prefix = tx.type==="income" ? "+" : tx.type==="transfer" ? "⇄" : "−";
  const time   = fmtTime(tx.createdAt);

  const balanceBefore = (() => {
    if (!transactions || !accounts || tx.type === "transfer") return null;
    const acc = accounts.find(a => a.name === tx.account);
    if (!acc) return null;
    const prior = transactions.filter(t =>
      t.id !== tx.id &&
      (t.account === tx.account || t.toAccount === tx.account) &&
      (t.createdAt || 0) < (tx.createdAt || 1)
    );
    const income  = prior.filter(t => t.type==="income"   && t.account===tx.account).reduce((s,t)=>s+toAmount(t.amount),0);
    const expense = prior.filter(t => t.type==="expense"  && t.account===tx.account).reduce((s,t)=>s+toAmount(t.amount),0);
    const tOut    = prior.filter(t => t.type==="transfer" && t.account===tx.account).reduce((s,t)=>s+toAmount(t.amount),0);
    const tIn     = prior.filter(t => t.type==="transfer" && t.toAccount===tx.account).reduce((s,t)=>s+toAmount(t.amount),0);
    return toAmount(acc.opening) + income - expense - tOut + tIn;
  })();
  
  const balanceAfter = balanceBefore !== null
    ? (tx.type==="income" ? balanceBefore + toAmount(tx.amount) : balanceBefore - toAmount(tx.amount))
    : null;

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImage(file, c => {
      updateTransaction(tx.id, { ...tx, photo: c });
      e.target.value = "";
    });
  };

  return (
    <>
    <Sheet open={!!tx} onClose={onClose}>
      <div style={{textAlign:"center",marginBottom:16}}>
        <div style={{width:56,height:56,borderRadius:R.lg,background:bg,margin:"0 auto 10px",
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{tx.icon}</div>
        <div style={{fontSize:16,fontWeight:700,color:T.ink}}>
          {tx.type==="transfer" ? `${tx.account} → ${tx.toAccount}` : tx.category}
        </div>
        <div style={{fontSize:28,fontWeight:700,color,marginTop:6,fontFamily:THEME_CONFIG.font.money}}>
          {prefix}{fmt(tx.amount)}
        </div>
      </div>

      {balanceBefore !== null && (
        <div style={{background:bg,borderRadius:R.lg,padding:"12px 14px",marginBottom:14,
          display:"flex",alignItems:"center",gap:6}}>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:10,color:T.inkSoft,fontWeight:700,marginBottom:3}}>BEFORE</div>
            <div style={{fontSize:15,fontWeight:800,color:T.ink,fontFamily:THEME_CONFIG.font.money}}>{fmt(balanceBefore)}</div>
          </div>
          <div style={{fontSize:20,color,fontWeight:700,flexShrink:0}}>→</div>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:10,color,fontWeight:700,marginBottom:3}}>AFTER</div>
            <div style={{fontSize:15,fontWeight:800,color,fontFamily:THEME_CONFIG.font.money}}>{fmt(balanceAfter)}</div>
          </div>
          <div style={{width:1,background:color+"33",alignSelf:"stretch",margin:"0 4px"}}/>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:10,color:T.inkSoft,fontWeight:700,marginBottom:3}}>ACCOUNT</div>
            <div style={{fontSize:11,fontWeight:700,color:T.ink}}>{tx.account}</div>
          </div>
        </div>
      )}

      <div style={{background:T.bgSoft,borderRadius:R.lg,padding:"12px 14px",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{fontSize:18}}>📸</div>
          <div style={{fontSize:13,fontWeight:700,color:T.inkSoft}}>PHOTO</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={() => tx.photo && setViewPhoto(tx.photo)} disabled={!tx.photo} style={{padding:"8px 12px",borderRadius:R.sm,border:`1.5px solid ${tx.photo ? T.teal500 : T.line}`,background:tx.photo?T.mintSoft:T.bgSoft,color:tx.photo?T.teal700:T.inkSoft,fontSize:12,fontWeight:700,cursor:tx.photo?"pointer":"not-allowed",display:"flex",alignItems:"center",gap:5}}>👁️ View Photo</button>
          <label style={{padding:"8px 12px",borderRadius:R.sm,border:`1.5px solid ${T.line}`,background:T.card,color:T.teal500,fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
            📷 Add Photo
            <input type="file" accept="image/*" onChange={handlePhotoChange} style={{display:"none"}}/>
          </label>
        </div>
      </div>

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
        {onDelete && <FBtn onClick={()=>{onClose();setTimeout(()=>onDelete(tx.id),150);}} bg={currentTheme.gradient.expense} style={{flex:onEdit?1:2,padding:"14px"}}>🗑 Delete</FBtn>}
      </div>
    </Sheet>

    <AnimatePresence>
      {viewPhoto && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} onClick={()=>setViewPhoto(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <motion.img initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 26 }} src={viewPhoto} alt="Photo" style={{maxWidth:"100%",maxHeight:"80%",borderRadius:R.lg}}/>
          <button onClick={()=>setViewPhoto(null)} style={{position:"absolute",top:30,right:20,background:"white",border:"none",borderRadius:"50%",width:40,height:40,fontSize:20,fontWeight:700,cursor:"pointer"}}>✕</button>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
