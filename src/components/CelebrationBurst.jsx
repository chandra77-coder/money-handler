import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { THEMES, THEME_CONFIG } from "../constants/theme";
import { useFinance } from "../context/FinanceContext";

const PARTICLES = [
  { x: -42, y: -24, r: -28, c: "teal500" }, { x: -25, y: -48, r: 12, c: "gold" }, { x: 0, y: -58, r: 0, c: "mint" },
  { x: 25, y: -48, r: -12, c: "transfer" }, { x: 42, y: -24, r: 28, c: "expense" }, { x: 44, y: 10, r: 45, c: "teal500" },
  { x: -44, y: 10, r: -45, c: "gold" },
];

export function CelebrationBurst({ show }) {
  const { theme } = useFinance();
  const T = (THEMES[theme] || THEMES.light).colors;
  const R = THEME_CONFIG.radius;
  return <AnimatePresence>{show && <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3 }}>
    {PARTICLES.map((particle, index) => <motion.span key={index} initial={{ x: 0, y: 0, opacity: 0, scale: .2, rotate: 0 }} animate={{ x: particle.x, y: particle.y, opacity: [0, 1, 0], scale: [0.2, 1, 0.6], rotate: particle.r }} exit={{ opacity: 0 }} transition={{ duration: .7, delay: index * .025, ease: "easeOut" }} style={{ position: "absolute", width: index % 2 ? 6 : 8, height: index % 2 ? 10 : 8, borderRadius: index % 2 ? 2 : R.pill, background: T[particle.c] || T.teal500, boxShadow: `0 0 9px ${T[particle.c] || T.teal500}` }} />)}
  </div>}</AnimatePresence>;
}
