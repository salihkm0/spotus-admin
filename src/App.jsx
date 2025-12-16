import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import { authService } from "./services/authService";

// Layout
import Layout from "./components/Layout/Layout";

// Pages
import Dashboard from "./pages/Dashboard";
import DeviceList from "./pages/Devices/DeviceList";
import DeviceDetails from "./pages/Devices/DeviceDetails";
import DeviceHealth from "./pages/Devices/DeviceHealth";
import VideoList from "./pages/Videos/VideoList";
import BrandList from "./pages/Brands/BrandList";
import Settings from "./pages/Settings";
import Users from "./pages/Users/Users"; // NEW: User Management Page

// Auth Pages
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword"; // NEW
import ResetPassword from "./pages/Auth/ResetPassword"; // NEW

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Check admin access if route requires it
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
  const { login, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("auth-storage");
        if (token) {
          const parsedToken = JSON.parse(token);
          if (parsedToken.state?.token) {
            // Verify token is still valid
            try {
              const response = await authService.getProfile();
              if (response.success) {
                login(parsedToken.state.user, parsedToken.state.token);
              }
            } catch (error) {
              console.error("Token validation failed:", error);
              // Clear invalid token
              localStorage.removeItem("auth-storage");
            }
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // Clear invalid token
        localStorage.removeItem("auth-storage");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [login]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#10B981",
                secondary: "#fff",
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: "#EF4444",
                secondary: "#fff",
              },
            },
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="devices" element={<DeviceList />} />
            <Route path="devices/:id" element={<DeviceDetails />} />
            <Route path="devices/health" element={<DeviceHealth />} />
            <Route path="videos" element={<VideoList />} />
            <Route path="brands" element={<BrandList />} />
            <Route path="settings" element={<Settings />} />
            
            {/* Admin Only Routes */}
            <Route 
              path="users" 
              element={
                <ProtectedRoute adminOnly>
                  <Users />
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;