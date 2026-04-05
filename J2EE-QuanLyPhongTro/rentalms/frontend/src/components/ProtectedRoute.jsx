import { Navigate } from "react-router-dom";
import { getRole, isLoggedIn } from "../lib/auth";

export default function ProtectedRoute({ role, children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  const roles = Array.isArray(role) ? role : [role];
  if (roles.length > 0 && !roles.includes(getRole())) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
