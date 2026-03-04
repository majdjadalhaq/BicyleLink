import PropTypes from "prop-types";
import { useAuth } from "../../hooks/useAuth";

/**
 * A declarative component to guard UI elements based on authentication and role parameters.
 *
 * Usage:
 * <RoleGate requireRole="admin">
 *   <DeleteButton />
 * </RoleGate>
 */
const RoleGate = ({
  children,
  requireRole = null,
  requireAuth = true,
  requireVerified = false,
  fallback = null,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // Optionally return a tiny inline spinner or just null to prevent flash
    return null;
  }

  if (requireAuth && !user) {
    return fallback;
  }

  if (requireVerified && user && !user.isVerified) {
    return fallback;
  }

  if (requireRole && user?.role !== requireRole) {
    return fallback;
  }

  return children;
};

RoleGate.propTypes = {
  children: PropTypes.node.isRequired,
  requireRole: PropTypes.oneOf(["user", "admin", null]),
  requireAuth: PropTypes.bool,
  requireVerified: PropTypes.bool,
  fallback: PropTypes.node,
};

export default RoleGate;
