import { useState, useRef, useCallback } from "react";

/**
 * Our useFetch hook should be used for all communication with the server.
 *
 * route - This is the route you want to access on the server. It should NOT include the /api part, so should be /user or /user/{id}
 * onReceived - a function that will be called with the response of the server. Will only be called if everything went well!
 * onError - an optional function that will be called with the response of the server if something went wrong.
 *
 * Our hook will give you an object with the properties:
 *
 * isLoading - true if the fetch is still in progress
 * error - will contain an Error object if something went wrong
 * performFetch - this function will trigger the fetching. It is up to the user of the hook to determine when to do this!
 * cancelFetch - this function will cancel the fetch, call it when your component is unmounted
 */
const useFetch = (route, onReceived, onError) => {
  /**
   * We use the AbortController which is supported by all modern browsers to handle cancellations
   * For more info: https://developer.mozilla.org/en-US/docs/Web/API/AbortController
   * Stored in a ref so the same instance is shared between performFetch and cancelFetch.
   */
  const controllerRef = useRef(null);

  const cancelFetch = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  let actualRoute = route;
  if (route.startsWith("/api/")) {
    actualRoute = route.substring(4); // Remove "/api" prefix
    console.warn(
      `when using the useFetch hook, the route should not include the /api/ part. Automatically stripped for route: ${route}`,
    );
  } else if (route.includes("api/")) {
    throw Error(
      "when using the useFetch hook, the route should not include the /api/ part",
    );
  }

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Add any args given to the function to the fetch function
  const performFetch = useCallback(
    (options) => {
      setError(null);
      setIsLoading(true);

      // Create a fresh controller for each fetch
      controllerRef.current = new AbortController();
      const signal = controllerRef.current.signal;

      const baseOptions = {
        method: "GET",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
      };

      const fetchData = async () => {
        const url = `/api${actualRoute}`;
        const res = await fetch(url, { ...baseOptions, ...options, signal });

        let jsonResult;
        try {
          jsonResult = await res.json();
        } catch (e) {
          if (!res.ok) {
            throw new Error(`Fetch failed with status ${res.status}`);
          }
          throw e;
        }

        if (res.ok && jsonResult.success === true) {
          if (onReceived) onReceived(jsonResult);
        } else {
          if (onError) onError(jsonResult);
          setError(
            jsonResult.msg ||
              jsonResult.errors?.[0]?.message ||
              `Error: ${res.status} ${res.statusText}`,
          );
        }

        setIsLoading(false);
      };

      fetchData().catch((error) => {
        // Ignore AbortError — it's an intentional cancellation
        if (error.name !== "AbortError") {
          setError(error);
        }
        setIsLoading(false);
      });
    },
    [actualRoute, onReceived, onError],
  );

  return { isLoading, error, performFetch, cancelFetch };
};

export default useFetch;
