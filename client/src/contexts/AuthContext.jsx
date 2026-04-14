import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import { AuthContext } from "./AuthContextProvider";
import { apiClient } from "../services/apiClient";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasCheckedRef = useRef(false);

  // Check session on mount
  useEffect(() => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const checkSession = async () => {
      try {
        const data = await apiClient("/api/users/me");
        if (data.success) {
          setUser(data.user);
        }
      } catch (err) {
        // Silently clear user if session check fails
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  // Listen for global unauthorized events (e.g., session expiry)
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      // Optional: window.location.href = "/login"; 
      // But usually handled by ProtectedRoute
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient("/api/users/logout", { method: "POST" });
      setUser(null);
    } catch (error) {
      // Still clear local state even if server-side logout fails
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, logout }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
