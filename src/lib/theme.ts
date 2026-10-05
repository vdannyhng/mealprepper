/**
 * Light/dark theme without a library. The init script runs in <head> before first paint
 * (no flash), applies the stored choice or the system setting and follows system changes
 * while the user has not chosen explicitly.
 */
export const THEME_STORAGE_KEY = "theme";

export type Theme = "light" | "dark";

export const themeInitScript = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var m=window.matchMedia("(prefers-color-scheme: dark)");function a(){var s=null;try{s=localStorage.getItem(k)}catch(e){}var d=s?s==="dark":m.matches;var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light"}a();m.addEventListener("change",a);window.addEventListener("storage",function(e){if(e.key===k)a()})}catch(e){}})();`;

export function currentTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage unavailable (private mode): the choice lasts for this page view.
  }
}

/** Notifies when the <html> class changes (toggle, system change, other tab). */
export function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
