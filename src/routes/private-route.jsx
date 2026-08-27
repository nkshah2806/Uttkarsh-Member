import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Layout from "@/layout/layout";
import { useLanguage } from "@/context/LanguageContext";
import { memberProfileService } from "@/services/memberProfileService";
import { Loader2 } from "lucide-react";

function PrivateRoute() {
  const location = useLocation();
  const { t } = useLanguage();
  const isLoggedIn = localStorage.getItem("isAuthenticated") === "true";
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [profileStatus, setProfileStatus] = useState(() => ({
    completed: localStorage.getItem("isProfileCompleted") === "true",
    approvalStatus: localStorage.getItem("memberApprovalStatus") || "pending",
    rejectionReason: localStorage.getItem("memberApprovalReason") || "",
  }));

  const checkStatus = async () => {
    try {
      const res = await memberProfileService.getProfile();
      if (res.success && res.data) {
        const completed = !!res.data.profile_completed;
        const approvalStatus = res.data.approval_status || "pending";
        const rejectionReason = res.data.rejection_reason || "";
        setProfileStatus({
          completed,
          approvalStatus,
          rejectionReason,
        });
        localStorage.setItem("isProfileCompleted", completed ? "true" : "false");
        localStorage.setItem("memberApprovalStatus", approvalStatus);
        localStorage.setItem("memberApprovalReason", rejectionReason);
      }
    } catch (err) {
      console.warn("Could not verify member profile status:", err);
    } finally {
      setCheckingProfile(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      setCheckingProfile(false);
      return;
    }

    checkStatus();

    // Listen for instant profile update events from MemberProfile page
    const handleProfileUpdated = () => {
      checkStatus();
    };

    window.addEventListener("profileCompleted", handleProfileUpdated);
    return () => {
      window.removeEventListener("profileCompleted", handleProfileUpdated);
    };
  }, [isLoggedIn, location.pathname]);

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  if (checkingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">
          {t("authenticatingProfile")}
        </p>
      </div>
    );
  }

  // Re-check both React state and localStorage so newly saved profiles pass instantly
  const completed =
    profileStatus.completed || localStorage.getItem("isProfileCompleted") === "true";
  const approvalStatus =
    profileStatus.approvalStatus || localStorage.getItem("memberApprovalStatus") || "pending";
  const isApproved = completed && approvalStatus === "approved";

  const isProfileRoute = location.pathname === "/member/profile";
  const isLoginRoute = location.pathname === "/";

  // If profile is not completed OR not yet approved, restrict to the profile page
  // (and login). This prevents URL/refresh/API access to the rest of the app.
  if (!isApproved && !isProfileRoute && !isLoginRoute) {
    return <Navigate to="/member/profile" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default PrivateRoute;
