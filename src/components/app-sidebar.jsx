import * as React from "react";
import { Activity, FileText, HeartPulse, User2Icon, UserCheck, Users, Stethoscope, ClipboardList } from "lucide-react";
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

  React.useEffect(() => {
    const interval = setInterval(() => {
      const data = JSON.parse(localStorage.getItem("UserDetails"));
      setUserDetails((prev) =>
        JSON.stringify(prev) !== JSON.stringify(data) ? data : prev,
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const initials = userDetails
    ? `${userDetails?.name[0] ?? ""}`.toUpperCase()
    : "";

  const data = {
    user: {
      name: userDetails?.name,
      lastname: userDetails?.lastname,
      email: userDetails?.email,
      avatar: `${Config.API_URL}${userDetails?.image}`,
      initials: initials,
    },
    navMain: [
      { title: "Dashboard", url: "/dashboard", icon: DashboardIcon },
      { title: "Personal Details", url: "/member/profile", icon: UserCheck },
      {
        title: "Quantum Health",
        url: "#",
        icon: Stethoscope,
        items: [
          { title: "Patient Registration", url: "/patients", icon: Users },
          { title: "Report History", url: "/clients", icon: ClipboardList },
        ],
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
