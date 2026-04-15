try {
  const stored = localStorage.getItem("theme");
  const theme = stored === "light" || stored === "dark" ? stored : "dark";
  document.body.classList.add("theme-" + theme);
  if (theme === "dark") document.body.classList.add("dark");
} catch {
  // Silent catch
}
