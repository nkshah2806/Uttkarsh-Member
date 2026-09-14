import * as React from "react";
import {
  Activity,
  FileText,
  HeartPulse,
  User2Icon,
  UserCheck,
  Users,
  Stethoscope,
  ClipboardList,
  ShieldAlert,
  AlertTriangle,
  Info,
} from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { DashboardIcon } from "@radix-ui/react-icons";
import { Config } from "@/lib/Config";
import { useTranslation } from "react-i18next";

export function AppSidebar({ ...props }) {
  const { t } = useTranslation();
  const [userDetails, setUserDetails] = React.useState(() => {
    const data = localStorage.getItem("UserDetails");
    return data ? JSON.parse(data) : null;
  });

  // Approval status is synced so the sidebar reacts instantly whenever the
  // member completes/saves their profile without a full page reload.
  const [profileStatus, setProfileStatus] = React.useState(() => ({
    completed: localStorage.getItem("isProfileCompleted") === "true",
    approvalStatus: localStorage.getItem("memberApprovalStatus") || "pending",
    isActive: localStorage.getItem("memberIsActive") !== "false",
  }));

  React.useEffect(() => {
    const sync = () => {
      const data = JSON.parse(localStorage.getItem("UserDetails"));
      setUserDetails((prev) =>
        JSON.stringify(prev) !== JSON.stringify(data) ? data : prev,
      );
      setProfileStatus({
        completed: localStorage.getItem("isProfileCompleted") === "true",
        approvalStatus: localStorage.getItem("memberApprovalStatus") || "pending",
        isActive: localStorage.getItem("memberIsActive") !== "false",
      });
    };
    const interval = setInterval(sync, 1000);
    window.addEventListener("profileCompleted", sync);
    window.addEventListener("storage", sync);
    return () => {
      clearInterval(interval);
      window.removeEventListener("profileCompleted", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const initials = userDetails
    ? `${userDetails?.name[0] ?? ""}`.toUpperCase()
    : "";

  const { completed, approvalStatus, isActive } = profileStatus;
  const isApproved = completed && approvalStatus === "approved" && isActive;

  // Full navigation available only after the profile is complete AND approved.
  const fullNav = [
    { title: t("demo.sidebar.dashboard"), url: "/dashboard", icon: DashboardIcon },
    { title: t("demo.sidebar.personalDetails"), url: "/member/profile", icon: UserCheck },
    {
      title: t("demo.sidebar.quantumHealthAnalysis"),
      url: "#",
      icon: Stethoscope,
      items: [
        { title: t("demo.sidebar.clientRegistration"), url: "/patients", icon: Users },
        { title: t("demo.sidebar.reportHistory"), url: "/clients", icon: ClipboardList },
      ],
    },
  ];

  // Restricted mode: only the profile page remains reachable (logout is in the footer).
  const restrictedNav = [
    { title: t("demo.sidebar.personalDetails"), url: "/member/profile", icon: UserCheck },
  ];

  const data = {
    user: {
      name: userDetails?.name,
      lastname: userDetails?.lastname,
      email: userDetails?.email,
      avatar: `${Config.API_URL}${userDetails?.image}`,
      initials: initials,
    },
    navMain: isApproved ? fullNav : restrictedNav,
  };

  const renderRestrictionNotice = () => {
    if (isApproved) return null;

    if (!isActive) {
      return (
        <div className="mx-3 my-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wide">
              {t("demo.sidebar.accountInactive")}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-foreground/80 leading-relaxed">
            {t("demo.sidebar.accountInactiveDesc")}
          </p>
        </div>
      );
    }

    if (approvalStatus === "rejected") {
      return (
        <div className="mx-3 my-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wide">
              {t("demo.sidebar.profileRejected")}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-foreground/80 leading-relaxed">
            {t("demo.sidebar.profileRejectedDesc")}
          </p>
        </div>
      );
    }

    if (!completed) {
      return (
        <div className="mx-3 my-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Info className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wide">
              {t("demo.sidebar.profileIncomplete")}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-foreground/80 leading-relaxed">
            {t("demo.sidebar.profileIncompleteDesc")}
          </p>
        </div>
      );
    }

    return (
      <div className="mx-3 my-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <ShieldAlert className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wide">
            {t("demo.sidebar.accountUnderReview")}
          </span>
        </div>
        <p className="mt-1.5 text-xs text-foreground/80 leading-relaxed">
          {t("demo.sidebar.accountUnderReviewDesc")}
        </p>
      </div>
    );
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {renderRestrictionNotice()}
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
