import React from "react";

export function DonutChart({ slices, size = 80 }) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  if (total === 0) return <div style={{ width: size, height: size, borderRadius: "50%", background: "#eee", flexShrink: 0 }} />;
  let angle = -90;
  const cx = size / 2, cy = size / 2, r = size * 0.35, stroke = size * 0.13;
  const arcs = slices.map(sl => {
    const pct = sl.value / total;
    const a1 = angle, a2 = angle + pct * 360;
    angle = a2;
    const toRad = d => d * Math.PI / 180;
    const x1 = cx + r * Math.cos(toRad(a1)), y1 = cy + r * Math.sin(toRad(a1));
    const x2 = cx + r * Math.cos(toRad(a2)), y2 = cy + r * Math.sin(toRad(a2));
    const large = pct > 0.5 ? 1 : 0;
    return { d: `M${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2}`, color: sl.color, value: sl.value, label: sl.label };
  });
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      {arcs.map((arc, i) => (
        <path key={i} d={arc.d} fill="none" stroke={arc.color} strokeWidth={stroke} strokeLinecap="butt" />
      ))}
    </svg>
  );
}
