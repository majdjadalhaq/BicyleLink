import { useState, useEffect } from "react";

/**
 * Dynamically loads country-state-city to keep its ~8MB payload
 * in a separate chunk, loaded only when Profile/ProfileSetup mounts.
 */
export function useCountryStateCity() {
  const [module, setModule] = useState(null);

  useEffect(() => {
    import("country-state-city").then((m) => setModule(m));
  }, []);

  return {
    Country: module?.Country ?? null,
    City: module?.City ?? null,
    isLoaded: !!module,
  };
}
