import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";
import BicycleLoading from "./ui/BicycleLoading";

const AdminRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <BicycleLoading message="Loading admin..." />;
  }

  // Check if they are logged in AND have the admin role
  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
