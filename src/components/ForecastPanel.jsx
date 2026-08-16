import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useFinance } from "../context/FinanceContext";
import { THEMES, THEME_CONFIG } from "../constants/theme";
import { fmt } from "../utils/formatters";
import { buildForecast } from "../utils/forecast";

export function ForecastPanel() {
  const { transactions, recurring, totalTracked, theme } = useFinance();
  const currentTheme = THEMES[theme] || THEMES.light;
  const T = currentTheme.colors;
  const G = currentTheme.gradient;
  const R = THEME_CONFIG.radius;
  const forecast = useMemo(() => buildForecast({ transactions, recurring, currentBalance: totalTracked }), [transactions, recurring, totalTracked]);
  const width = 340;
  const height = 145;
  const padding = { x: 20, y: 18 };
  const values = forecast.points.map(point => point.value);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const range = Math.max(max - min, 1);
  const points = forecast.points.map((point, index) => {
    const x = padding.x + (index / (forecast.points.length - 1)) * (width - padding.x * 2);
    const y = height - padding.y - ((point.value - min) / range) * (height - padding.y * 2);
    return { ...point, x, y };
  });
  const pointString = points.map(point => `${point.x},${point.y}`).join(" ");
  const projected = forecast.points.at(-1)?.value || 0;
  const positive = forecast.monthlyNet >= 0;

  return (
    <div className="cyber-scanline" style={{ background: T.card, border: `1px solid ${T.glassBorder}`, borderRadius: R.xl, padding: 14, marginBottom: 14, boxShadow: T.cyberGlow || THEME_CONFIG.shadow.card }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div><div style={{ fontSize: 13, fontWeight: 800, color: T.ink }}>◈ Wealth trajectory</div><div style={{ fontSize: 10, color: T.inkSoft, marginTop: 3 }}>Six-month projection from your real activity</div></div>
        <div style={{ borderRadius: R.pill, padding: "5px 8px", background: positive ? T.incomeSoft : T.expenseSoft, color: positive ? T.income : T.expense, fontSize: 10, fontWeight: 800 }}>{forecast.confidence}</div>
      </div>
      <svg role="img" aria-label={`Projected balance in six months ${fmt(projected)}`} viewBox={`0 0 ${width} ${height}`} width="100%" height="145" style={{ display: "block", marginTop: 8, overflow: "visible" }}>
        <defs><linearGradient id="future-line" x1="0" x2="1"><stop offset="0%" stopColor={T.teal500} /><stop offset="100%" stopColor={T.transfer} /></linearGradient><filter id="future-glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
        <line x1={padding.x} x2={width - padding.x} y1={height - padding.y} y2={height - padding.y} stroke={T.line} strokeWidth="1" />
        <motion.polyline points={pointString} fill="none" stroke="url(#future-line)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#future-glow)" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.1, ease: "easeOut" }} />
        {points.map((point, index) => <g key={point.label}><circle cx={point.x} cy={point.y} r={index === 0 ? 5 : 3.5} fill={point.projected ? T.transfer : T.teal500} stroke={T.card} strokeWidth="2" /><text x={point.x} y={height - 2} textAnchor="middle" fill={T.inkSoft} fontSize="9">{point.label}</text></g>)}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, borderTop: `1px solid ${T.line}`, paddingTop: 10 }}>
        <div><div style={{ fontSize: 10, color: T.inkSoft }}>Avg. monthly change</div><div style={{ color: positive ? T.income : T.expense, fontSize: 14, fontWeight: 900 }}>{positive ? "+" : "−"}{fmt(Math.abs(forecast.monthlyNet))}</div></div>
        <div style={{ textAlign: "right" }}><div style={{ fontSize: 10, color: T.inkSoft }}>Projected balance</div><div style={{ color: T.ink, fontSize: 14, fontWeight: 900 }}>{fmt(projected)}</div></div>
      </div>
      <div style={{ fontSize: 10, color: T.inkSoft, marginTop: 8 }}>Estimate blends the last three months with active recurring rules. It is a planning signal, not a guarantee.</div>
    </div>
  );
}
