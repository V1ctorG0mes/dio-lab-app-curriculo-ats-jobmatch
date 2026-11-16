import { afterEach, describe, expect, it } from "vitest";
import { getTheme, setTheme, THEME_STORAGE_KEY, toggleTheme } from "./theme";

describe("Theme management (Dark Mode)", () => {
  afterEach(() => {
    window.localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.classList.remove("dark");
  });

  it("persists dark mode preference and toggles the .dark class on <html>", () => {
    setTheme("dark");
    expect(getTheme()).toBe("dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    const next = toggleTheme();
    expect(next).toBe("light");
    expect(getTheme()).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
