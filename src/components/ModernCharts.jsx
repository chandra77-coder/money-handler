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
              border: "none", 
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              fontSize: 12
            }} 
          />
          <Bar dataKey="income" fill={T.income} radius={[4, 4, 0, 0]} barSize={8} />
          <Bar dataKey="expense" fill={T.expense} radius={[4, 4, 0, 0]} barSize={8} />
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
          <Tooltip />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
