import React from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie, Legend
} from "recharts";
import { THEMES } from "../constants/theme";

export function CashFlowChart({ data, theme }) {
  const T = (THEMES[theme] || THEMES.light).colors;
  
  return (
    <div style={{ height: 200, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs><linearGradient id="flow-income" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.income} /><stop offset="100%" stopColor={T.teal500} /></linearGradient><linearGradient id="flow-expense" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.expense} /><stop offset="100%" stopColor={T.transfer} /></linearGradient></defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={T.line} />
          <XAxis 
            dataKey="label" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: T.inkSoft }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: T.inkSoft }} 
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: 12,
              border: `1px solid ${T.glassBorder}`,
              background: T.card,
              color: T.ink,
              boxShadow: T.cyberGlow || "0 4px 12px rgba(0,0,0,0.1)",
              fontSize: 12
            }} 
          />
          <Bar dataKey="income" fill={theme === "future" || theme === "system" ? "url(#flow-income)" : T.income} radius={[4, 4, 0, 0]} barSize={8} />
          <Bar dataKey="expense" fill={theme === "future" || theme === "system" ? "url(#flow-expense)" : T.expense} radius={[4, 4, 0, 0]} barSize={8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SpendingPieChart({ data, theme }) {
  const T = (THEMES[theme] || THEMES.light).colors;
  
  return (
    <div style={{ height: 200, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs><filter id="pie-glow"><feGaussianBlur stdDeviation="2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${T.glassBorder}`, background: T.card, color: T.ink, boxShadow: T.cyberGlow || "0 4px 12px rgba(0,0,0,0.1)", fontSize: 12 }} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: T.inkSoft }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
