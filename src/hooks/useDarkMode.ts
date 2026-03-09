"use client";

import { useEffect, useState } from "react";

export function useDarkMode() {
  // isDark + mounted을 단일 setState로 처리해 불필요한 이중 렌더링 방지
  const [{ isDark, mounted }, setState] = useState({ isDark: false, mounted: false });

  // 마운트 시 저장된 설정 또는 시스템 설정을 읽어 적용
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = stored === "dark" || (!stored && prefersDark);
    document.documentElement.classList.toggle("dark", dark);
    setState({ isDark: dark, mounted: true });
  }, []);

  const toggle = () => {
    setState(({ isDark: prev }) => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      document.documentElement.classList.toggle("dark", next);
      return { isDark: next, mounted: true };
    });
  };

  return { isDark, toggle, mounted };
}
