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

      button, input, select, textarea {
        font-family: inherit;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
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
