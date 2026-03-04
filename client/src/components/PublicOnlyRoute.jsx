import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";

const PublicOnlyRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading-fallback">Loading...</div>;
  }

  if (user) {
    // If user is logged in, redirect to home
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicOnlyRoute;
