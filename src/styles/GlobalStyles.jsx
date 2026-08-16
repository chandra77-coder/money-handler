import React from "react";
import { THEMES, THEME_CONFIG } from "../constants/theme";

export const GlobalStyles = ({ themeMode }) => {
  const currentTheme = THEMES[themeMode] || THEMES.light;
  const T = currentTheme.colors;
  
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      :root {
        --bg: ${T.bg};
        --bgSoft: ${T.bgSoft};
        --teal900: ${T.teal900};
        --teal800: ${T.teal800};
        --teal700: ${T.teal700};
        --teal600: ${T.teal600};
        --teal500: ${T.teal500};
        --mint: ${T.mint};
        --mintSoft: ${T.mintSoft};
        --gold: ${T.gold};
        --goldSoft: ${T.goldSoft};
        --income: ${T.income};
        --incomeSoft: ${T.incomeSoft};
        --expense: ${T.expense};
        --expenseSoft: ${T.expenseSoft};
        --transfer: ${T.transfer};
        --transferSoft: ${T.transferSoft};
        --ink: ${T.ink};
        --inkSoft: ${T.inkSoft};
        --line: ${T.line};
        --card: ${T.card};
      }
      
      body {
        margin: 0;
        padding: 0;
        background-color: var(--bg);
        color: var(--ink);
        font-family: ${THEME_CONFIG.font.body};
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        transition: background-color 0.3s ease, color 0.3s ease;
      }

      * {
        box-sizing: border-box;
        -webkit-tap-highlight-color: transparent;
      }

      html {
        scroll-behavior: smooth;
      }

      button, input, select, textarea {
        font-family: inherit;
      }

      button {
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
      }

      button:not(:disabled), label {
        transition: transform 160ms cubic-bezier(0.22, 1, 0.36, 1),
          box-shadow 160ms cubic-bezier(0.22, 1, 0.36, 1),
          background-color 160ms ease, border-color 160ms ease,
          color 160ms ease, opacity 160ms ease;
      }

      button:not(:disabled):hover {
        filter: brightness(1.02);
      }

      button:not(:disabled):active {
        transform: scale(0.97);
      }

      input, select, textarea {
        transition: border-color 160ms ease, box-shadow 160ms ease,
          background-color 160ms ease;
      }

      input:focus-visible, select:focus-visible, textarea:focus-visible,
      button:focus-visible {
        outline: 3px solid color-mix(in srgb, var(--teal500) 28%, transparent);
        outline-offset: 2px;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes softPulse {
        0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--teal500) 0%, transparent); }
        50% { box-shadow: 0 0 0 6px color-mix(in srgb, var(--teal500) 12%, transparent); }
      }

      .smooth-card {
        transform: translateZ(0);
        backface-visibility: hidden;
        transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
          box-shadow 220ms cubic-bezier(0.22, 1, 0.36, 1),
          border-color 220ms ease;
      }

      .smooth-card:hover {
        transform: translateY(-2px) translateZ(0);
      }

      .smooth-card:active {
        transform: translateY(0) scale(0.995) translateZ(0);
      }

      @media (prefers-reduced-motion: reduce) {
        html { scroll-behavior: auto; }
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      }

      .glass-card {
        background: ${T.glass};
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid ${T.glassBorder};
      }
      
      ::-webkit-scrollbar {
        width: 6px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      ::-webkit-scrollbar-thumb {
        background: ${T.line};
        border-radius: 10px;
      }
    `}} />
  );
};
