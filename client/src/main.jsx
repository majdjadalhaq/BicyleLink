import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import AppWrapper from "./AppWrapper";

// Handle stale chunk errors after redeployment (Vite 7).
// When the server redeoys, old hashed chunk filenames are deleted.
// Users with a cached tab will get a silent white screen when React
// tries to lazy-import a chunk that no longer exists.
// This handler catches that event and reloads the page once to fetch
// the latest index.html and new chunk filenames.
window.addEventListener("vite:preloadError", () => {
  const reloadKey = "vite_preload_reload_attempted";
  try {
    if (!sessionStorage.getItem(reloadKey)) {
      // First failure: reload to get the latest deployment
      sessionStorage.setItem(reloadKey, "1");
      window.location.reload();
    } else {
      // Already reloaded and still failing — clear the flag and stop.
      // The React ErrorBoundary will surface the error to the user.
      sessionStorage.removeItem(reloadKey);
    }
  } catch {
    // sessionStorage unavailable (e.g. private browsing with strict settings)
    // Reload unconditionally — acceptable tradeoff vs permanent white screen.
    window.location.reload();
  }
});

createRoot(document.getElementById("root")).render(
  <AppWrapper>
    <App />
  </AppWrapper>,
);
