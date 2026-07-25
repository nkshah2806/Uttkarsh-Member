import * as React from "react";
import { GalleryVerticalEnd } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import logo from "../assets/logo.png"

export function TeamSwitcher() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="bg-white dark:bg-black border h-auto overflow-hidden">
          <div className="flex aspect-square size-8 items-center justify-center">
            <img src={logo} className="img-fluid" alt="" />
            {/* <GalleryVerticalEnd className="size-5" /> */}
          </div>
          <div className="grid flex-1 text-left text-md leading-tight">
            <span className="truncate font-semibold">Uttkarsh</span>
            <span className="truncate text-xs">Corporation</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
