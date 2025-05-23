import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import authService from "../services/authService";

const AdminProtected = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    // Fetch user profile to check admin status
    const checkAdminStatus = async () => {
      try {
        const response = await authService.getProfile();
        if (response.success && response.data && response.data.isAdmin) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  // Show loading state while checking
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Redirect if not admin
  return isAdmin ? <Outlet /> : <Navigate to="/sign-in" />;
};

export default AdminProtected;
