import { useState, useEffect } from "react";

export function useLS(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {
      console.error("LS Read Error", key, e);
    }
    return initialValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("LS Write Error", key, e);
    }
  }, [key, value]);

  return [value, setValue];
}
