import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../hooks/useAuth";
import { apiClient } from "../../../services/apiClient";

/**
 * Custom hook to detect grid columns for staggered animations.
 */
const useGridCols = (gridRef) => {
  const [cols, setCols] = useState(3);
  useEffect(() => {
    if (!gridRef.current) return;
    const measure = () => {
      const el = gridRef.current;
      if (!el) return;
      const style = window.getComputedStyle(el);
      const colsStr = style.getPropertyValue("grid-template-columns");
      if (colsStr && colsStr !== "none") {
        setCols(colsStr.trim().split(/\s+/).length);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(gridRef.current);
    return () => ro.disconnect();
  }, [gridRef]);
  return cols;
};

/**
 * Logic-only hook for ProfileView.
 * Handles data fetching, URL synchronization, and grid detection.
 */
export const useProfileView = () => {
  const { username, id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const gridRef = useRef(null);
  const gridCols = useGridCols(gridRef);

  const profileIdentifier = username || id || currentUser?.name || currentUser?._id;

  // Use TanStack Query for best-in-class data fetching
  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ["profile", profileIdentifier],
    queryFn: async () => {
      if (!profileIdentifier) return null;
      const response = await apiClient.get(`/users/${profileIdentifier}/profile`);
      return response;
    },
    enabled: !!profileIdentifier,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // URL Synchronization: Redirect to /profile/[canonical-name] if using ID or old name
  useEffect(() => {
    if (profileData?.user?.name) {
      const urlParam = username || id;
      if (urlParam && urlParam !== profileData.user.name) {
        navigate(`/profile/${encodeURIComponent(profileData.user.name)}`, {
          replace: true,
        });
      }
    }
  }, [profileData, username, id, navigate]);

  const isOwnProfile =
    currentUser &&
    profileData?.user &&
    (currentUser._id === profileData.user._id || currentUser.id === profileData.user._id);

  return {
    profileData,
    isLoading,
    error,
    isOwnProfile,
    gridRef,
    gridCols,
    currentUser,
  };
};
