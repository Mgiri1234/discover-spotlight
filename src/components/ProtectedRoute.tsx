
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-brand-600">Loading...</div>
      </div>
    );
  }
  
  // If user is not authenticated, redirect to login page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // If user is authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
