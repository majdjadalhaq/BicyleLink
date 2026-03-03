import { Outlet } from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary/ErrorBoundary";

/**
 * Layout wrapper for public routes (Home, ListingDetail, etc.).
 * Isolates errors so a failure in one public page doesn't crash the entire app.
 */
const PublicLayout = () => (
  <ErrorBoundary>
    <Outlet />
  </ErrorBoundary>
);

export default PublicLayout;
