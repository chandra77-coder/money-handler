import React from "react";
import { THEMES, THEME_CONFIG } from "../constants/theme";
import { useFinance } from "../context/FinanceContext";

const getTheme = (mode) => THEMES[mode] || THEMES.light;

export function Sheet({ open, onClose, children }) {
  const { theme } = useFinance();
  const T = getTheme(theme).colors;
  const R = THEME_CONFIG.radius;
  const SH = THEME_CONFIG.shadow;

  if (!open) return null;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(10,26,24,0.55)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(2px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.card,borderRadius:`${R.xxl}px ${R.xxl}px 0 0`,padding:"20px 18px 48px",width:"100%",maxWidth:420,maxHeight:"92vh",overflowY:"auto",boxSizing:"border-box",boxShadow:SH.raised,fontFamily:THEME_CONFIG.font.body}}>
        <div style={{width:42,height:5,borderRadius:3,background:T.line,margin:"0 auto 18px"}}/>
        {children}
      </div>
    </div>
  );
}

export function FInput({value,onChange,placeholder,type="text",style={}}) {
  const { theme } = useFinance();
  const T = getTheme(theme).colors;
  const R = THEME_CONFIG.radius;

  return (
    <input value={value} onChange={onChange} placeholder={placeholder} type={type}
      onFocus={e=>{e.target.style.borderColor=T.teal500;e.target.style.boxShadow=`0 0 0 3px ${T.mintSoft}`;}}
      onBlur={e=>{e.target.style.borderColor=T.line;e.target.style.boxShadow="none";}}
      style={{width:"100%",padding:"13px 15px",borderRadius:R.md,border:`1.5px solid ${T.line}`,
        background:T.bgSoft,fontSize:14,boxSizing:"border-box",outline:"none",
        fontFamily:THEME_CONFIG.font.body,color:T.ink,transition:"border-color .15s, box-shadow .15s",...style}}/>
  );
}

export function FBtn({children,onClick,bg,outline,color,style={}}) {
  const { theme } = useFinance();
  const currentTheme = getTheme(theme);
  const T = currentTheme.colors;
  const G = currentTheme.gradient;
  const R = THEME_CONFIG.radius;
  const SH = THEME_CONFIG.shadow;
  
  const btnColor = color || T.teal700;

  return (
    <button onClick={onClick}
      onMouseDown={e=>e.currentTarget.style.transform="scale(0.97)"}
      onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}
      onTouchStart={e=>e.currentTarget.style.transform="scale(0.97)"}
      onTouchEnd={e=>e.currentTarget.style.transform="scale(1)"}
      style={{
      padding:"13px 16px",borderRadius:R.md,cursor:"pointer",fontWeight:700,fontSize:14,
      border: outline ? `1.5px solid ${btnColor}` : "none",
      background: outline ? "transparent" : (bg || G.primary),
      color: outline ? btnColor : "white",
      boxShadow: outline ? "none" : SH.button,
      fontFamily:THEME_CONFIG.font.body, transition:"transform .1s ease",...style
    }}>{children}</button>
  );
}

export function ToggleSwitch({ on, onChange }) {
  const { theme } = useFinance();
  const currentTheme = getTheme(theme);
  const T = currentTheme.colors;
  const G = currentTheme.gradient;
  const R = THEME_CONFIG.radius;

  return (
    <button onClick={(e)=>{e.stopPropagation();onChange(!on);}} style={{
      width:46,height:27,borderRadius:R.pill,border:"none",cursor:"pointer",flexShrink:0,
      background:on?G.primary:T.line,position:"relative",transition:"background .2s",padding:0}}>
      <div style={{position:"absolute",top:3,left:on?22:3,width:21,height:21,borderRadius:"50%",
        background:"white",boxShadow:"0 2px 4px rgba(0,0,0,0.25)",transition:"left .2s"}}/>
    </button>
  );
}

export function SearchBar({value, onChange, placeholder}) {
  const { theme } = useFinance();
  const T = getTheme(theme).colors;
  const R = THEME_CONFIG.radius;

  return (
    <div style={{position:"relative",margin:"0 16px 12px"}}>
      <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:15,color:T.inkSoft}}>🔍</span>
      <input value={value} onChange={onChange} placeholder={placeholder}
        style={{width:"100%",padding:"13px 38px",borderRadius:R.pill,border:`1px solid ${T.glassBorder}`,
          fontSize:13,background:"rgba(255,255,255,0.94)",boxSizing:"border-box",outline:"none",
          boxShadow:"0 4px 16px rgba(0,0,0,0.18)",fontFamily:THEME_CONFIG.font.body,color:T.ink}}/>
      {value && (
        <span onClick={()=>onChange({target:{value:""}})}
          style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",cursor:"pointer",color:T.inkSoft,fontSize:14}}>✕</span>
      )}
    </div>
  );
}

export function TypeToggle({options, value, onChange, colors={}}) {
  const { theme } = useFinance();
  const currentTheme = getTheme(theme);
  const T = currentTheme.colors;
  const G = currentTheme.gradient;
  const R = THEME_CONFIG.radius;
  const SH = THEME_CONFIG.shadow;

  return (
    <div style={{display:"flex",background:T.bgSoft,borderRadius:R.md,padding:4,gap:4,marginBottom:14,border:`1px solid ${T.line}`}}>
      {options.map(([v,lbl])=>(
        <button key={v} onClick={()=>onChange(v)} style={{
          flex:1,padding:"11px 4px",border:"none",borderRadius:R.sm,cursor:"pointer",
          fontWeight:700,fontSize:12,transition:"all .2s",fontFamily:THEME_CONFIG.font.body,
          background: value===v ? (colors[v] || G.primary) : "transparent",
          color: value===v ? "white" : T.inkSoft,
          boxShadow: value===v ? SH.soft : "none",
        }}>{lbl}</button>
      ))}
    </div>
  );
}

export function Label({children}) {
  const { theme } = useFinance();
  const T = getTheme(theme).colors;
  return <div style={{fontSize:11,color:T.inkSoft,fontWeight:700,letterSpacing:.6,marginBottom:7,fontFamily:THEME_CONFIG.font.body,textTransform:"uppercase"}}>{children}</div>;
}

export function ChipRow({items, selected, onSelect, activeColor, activeBg}) {
  const { theme } = useFinance();
  const currentTheme = getTheme(theme);
  const T = currentTheme.colors;
  const R = THEME_CONFIG.radius;
  const SH = THEME_CONFIG.shadow;
  
  const aColor = activeColor || T.teal700;
  const aBg = activeBg || T.mintSoft;

  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:12}}>
      {items.map(item=>{
        const key = typeof item === "string" ? item : item.l||item.type||item;
        const label = typeof item === "string" ? item : (item.l||item.type);
        const prefix = typeof item === "object" && item.icon ? item.icon+" " : "";
        const isActive = selected === key;
        return (
          <button key={key} onClick={()=>onSelect(key)} style={{
            padding:"8px 14px",borderRadius:R.pill,border:"1.5px solid",cursor:"pointer",fontFamily:THEME_CONFIG.font.body,
            borderColor: isActive ? aColor : T.line,
            background: isActive ? aBg : T.card,
            fontSize:12,fontWeight:700,
            boxShadow: isActive ? SH.soft : "none",
            color: isActive ? aColor : T.inkSoft,
            transition:"all .15s"
          }}>{prefix}{label}</button>
        );
      })}
    </div>
  );
}
