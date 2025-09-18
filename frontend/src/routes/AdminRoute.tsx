// components/AdminRoute.tsx
import { Navigate } from "react-router-dom";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  // Remplacez cette logique par votre vérification de rôle réelle
  const isAuthenticated = !!localStorage.getItem("authToken");
  const isAdmin = localStorage.getItem("userRole") === "admin";
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return isAdmin ? <>{children}</> : <Navigate to="/" />;
};

export default AdminRoute;