import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Layout from "@/layout/layout";
import { memberProfileService } from "@/services/memberProfileService";
import { Loader2 } from "lucide-react";

function PrivateRoute() {
  const location = useLocation();
  const isLoggedIn = localStorage.getItem("isAuthenticated") === "true";
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [isProfileCompleted, setIsProfileCompleted] = useState(() => {
    return localStorage.getItem("isProfileCompleted") === "true";
  });

  useEffect(() => {
    if (!isLoggedIn) {
      setCheckingProfile(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await memberProfileService.getProfile();
        if (res.success && res.data) {
          const completed = !!res.data.profile_completed;
          setIsProfileCompleted(completed);
          localStorage.setItem("isProfileCompleted", completed ? "true" : "false");
        }
      } catch (err) {
        console.warn("Could not verify member profile completion status:", err);
      } finally {
        setCheckingProfile(false);
      }
    };

    checkStatus();
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  if (checkingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">
          Authenticating & checking member profile completion...
        </p>
      </div>
    );
  }

  // Mandatory Profile Completion Redirect Guard:
  // If profile is incomplete AND current route is NOT '/member/profile', redirect immediately to '/member/profile'
  const isProfileRoute = location.pathname === "/member/profile";

  if (!isProfileCompleted && !isProfileRoute) {
    return <Navigate to="/member/profile" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default PrivateRoute;