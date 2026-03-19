import { useState, useEffect } from "react";

/**
 * Dynamically loads country-state-city to keep its ~8MB payload
 * in a separate chunk, loaded only when Profile/ProfileSetup mounts.
 */
export function useCountryStateCity() {
  const [module, setModule] = useState(null);

  useEffect(() => {
    // We only need NL cities for this project to keep the bundle small.
    // If global support is needed, we should fetch from a dedicated API.
    import("../data/nl_cities.json").then((m) => {
      const cities = m.default || m;
      setModule({
        Country: {
          getAllCountries: () => [{ isoCode: "NL", name: "Netherlands" }],
        },
        City: {
          getCitiesOfCountry: (code) => (code === "NL" ? cities : []),
        },
      });
    });
  }, []);

  return {
    Country: module?.Country ?? null,
    City: module?.City ?? null,
    isLoaded: !!module,
  };
}
