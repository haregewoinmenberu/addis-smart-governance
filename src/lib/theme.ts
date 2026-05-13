export function initTheme() {
  if (typeof window === "undefined") return;
  const stored = localStorage.getItem("strp-theme");
  const dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", dark);
}

export function toggleTheme() {
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem("strp-theme", isDark ? "dark" : "light");
  return isDark;
}

export function isDark() {
  if (typeof window === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}
