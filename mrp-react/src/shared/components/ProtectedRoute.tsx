import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./Auth.tsx";
import { JSX } from "react";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, checking } = useAuth();
  const loc = useLocation();

  if (checking) {
    return <div>Loading...</div>; // or spinner
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }
  return children;
}
