import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";
import BicycleLoading from "./ui/BicycleLoading";

const PublicOnlyRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <BicycleLoading message="Loading..." />;
  }

  if (user) {
    // If user is logged in, redirect to home
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicOnlyRoute;
