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

export function AppSidebar({ ...props }) {
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
    { title: "Dashboard", url: "/dashboard", icon: DashboardIcon },
    { title: "Personal Details", url: "/member/profile", icon: UserCheck },
    {
      title: "Quantum Health Analysis",
      url: "#",
      icon: Stethoscope,
      items: [
        { title: "Client Registration", url: "/patients", icon: Users },
        { title: "Report History", url: "/clients", icon: ClipboardList },
      ],
    },
  ];

  // Restricted mode: only the profile page remains reachable (logout is in the footer).
  const restrictedNav = [
    { title: "Personal Details", url: "/member/profile", icon: UserCheck },
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
              Account Inactive
            </span>
          </div>
          <p className="mt-1.5 text-xs text-foreground/80 leading-relaxed">
            Your account has been deactivated by the administrator. Please contact support for assistance.
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
              Profile Rejected
            </span>
          </div>
          <p className="mt-1.5 text-xs text-foreground/80 leading-relaxed">
            Your profile was rejected. Please review the reason and update your details.
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
              Profile Incomplete
            </span>
          </div>
          <p className="mt-1.5 text-xs text-foreground/80 leading-relaxed">
            Please complete your profile before accessing the portal.
          </p>
        </div>
      );
    }

    return (
      <div className="mx-3 my-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <ShieldAlert className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wide">
            Account Under Review
          </span>
        </div>
        <p className="mt-1.5 text-xs text-foreground/80 leading-relaxed">
          Your profile has been submitted and is under review. You will get access once approved.
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
