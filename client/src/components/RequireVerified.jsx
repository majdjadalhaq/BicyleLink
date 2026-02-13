import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const RequireVerified = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isVerified) {
    return (
      <div className="container mx-auto mt-10 p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
        <h2 className="text-2xl font-bold text-yellow-800 mb-4">
          Verification Required
        </h2>
        <p className="text-yellow-700 mb-6">
          You need to verify your email address to access this feature.
        </p>
        <button
          onClick={() => (window.location.href = "/verify-code")}
          className="bg-yellow-600 text-white px-6 py-2 rounded hover:bg-yellow-700 transition"
        >
          Go to Verification
        </button>
      </div>
    );
  }

  return <Outlet />;
};

export default RequireVerified;
