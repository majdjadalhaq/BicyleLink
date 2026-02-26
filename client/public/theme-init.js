try {
  const theme = localStorage.getItem("theme") || "dark";
  document.body.classList.add("theme-" + theme);
  if (theme === "dark") document.body.classList.add("dark");
} catch {
  // Silent catch
}
