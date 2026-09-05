import * as React from "react";
import { UserCheck } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import logo from "../assets/logo.png";

export function TeamSwitcher() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 h-auto overflow-hidden rounded-xl p-2.5 transition-all">
          <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-white dark:bg-emerald-900/60 shadow-xs border border-emerald-100 dark:border-emerald-800">
            <img src={logo} className="img-fluid max-h-7" alt="Uttkarsh Logo" />
          </div>
          <div className="flex flex-col flex-1 text-left leading-tight ml-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate font-bold text-sm tracking-tight text-emerald-950 dark:text-emerald-100">Utkarsh Corporation</span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[9px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white rounded dark:bg-emerald-500 shadow-2xs">
                <UserCheck className="size-2.5" />
                MEMBER
              </span>
            </div>
            <span className="truncate text-[11px] font-medium text-emerald-600/80 dark:text-emerald-300/80">Corporation Portal</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
