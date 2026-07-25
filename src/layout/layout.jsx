import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Bell, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-context";
import { useEffect, useState } from "react";
import { useApiMutation } from "@/hooks/useApiMutation";
import MenuItem from "@mui/material/MenuItem";
import Link from "@mui/material/Link";
import ClickAwayListener from "@mui/material/ClickAwayListener";

export default function Layout(props) {
  const { theme, toggleTheme } = useTheme();
  const [notificationUserWise, setNotificationUserWise] = useState();
  const [notificationList, setNotificationList] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // useEffect(() => {
  //   getNotificationUserMutation.mutate();
  // }, []);

  // const getNotificationUserMutation = useApiMutation(getNotificationUserWise, {
  //   onSuccess: (data) => {
  //     setNotificationUserWise(data.data);
  //     setNotificationList(data.data); // <-- Set notificationList from API
  //   },
  //   onError: (err) => {
  //   },
  // });

  const handleMarkAllAsRead = async () => {
    const unreadIds = notificationList
      .filter((n) => !n.isRead)
      .map((n) => n._id);
    if (unreadIds.length === 0) return;
    try {
      // await updateNotification(unreadIds); // Send array of IDs
      setNotificationList((prev) =>
        prev.map((notifi) => ({ ...notifi, isRead: true })),
      );
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleUpdateNotification = async (notificationId) => {
    try {
      // await updateNotification(notificationId);
    } catch (error) {
      // Optionally handle error
      console.error("Failed to update notification:", error);
    }
  };

  // Update your notification redirect handler:
  const HandleNotificationRedirect = async (notifi) => {
    // Call the API to mark as read
    await handleUpdateNotification(notifi._id);

    // Update local state
    setNotificationList((prev) =>
      prev.map((item) =>
        item._id === notifi._id ? { ...item, isRead: true } : item,
      ),
    );
    // Your redirect logic here (if any)
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="px-4 bg-sidebar border-b flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
          </div>

          <div className="relative ml-auto">
            <Button
              size="icon"
              variant={theme === "dark" ? "default" : "secondary"}
              onClick={() => setNotificationOpen((prev) => !prev)}
              className="relative"
            >
              <Bell />
              {/* Show dot if there are unread notifications */}
              {notificationList.some((n) => !n.isRead) && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 z-10"></span>
              )}
            </Button>
            {/* Notification Dropdown */}
            {notificationOpen && (
              <ClickAwayListener onClickAway={() => setNotificationOpen(false)}>
                <div
                  className="absolute right-0 left-auto mt-2 min-w-sm shadow-lg rounded z-50 overflow-y-auto max-h-96 bg-white text-black dark:bg-black dark:text-white flex flex-col"
                  style={{ maxWidth: "400px", minHeight: "200px" }}
                >
                  <div className="flex-1 overflow-y-auto">
                    {notificationList.length === 0 ? (
                      <div className="p-4 text-center">No notifications</div>
                    ) : (
                      <>
                        {notificationList.map((notifi, i) => (
                          <MenuItem
                            key={notifi._id}
                            onClick={() => HandleNotificationRedirect(notifi)}
                            className="transition-all px-3 py-2 flex items-center gap-3 relative"
                            style={{ cursor: "pointer" }}
                            sx={
                              !notifi.isRead
                                ? {
                                    backgroundColor:
                                      theme === "dark" ? "#3730a3" : "#eef2ff", // indigo-900/dark, indigo-50/light
                                    "&:hover": {
                                      backgroundColor:
                                        theme === "dark"
                                          ? "#312e81"
                                          : "#e0e7ff", // darker on hover
                                    },
                                  }
                                : {}
                            }
                          >
                            {/* Remove the unread dot here */}
                            <div className="notification_box flex items-center gap-3 w-full">
                              <img
                                src={"/favicon.svg" || "/default-avatar.png"}
                                alt=""
                                className="flex-none w-8 h-8 rounded-full border border-gray-200"
                              />
                              <div className="notification_msg whitespace-break-spaces w-full">
                                <div className="font-semibold text-sm mb-0.5">
                                  {notifi.notificationType}
                                </div>
                                <div className="text-xs mb-1">
                                  {notifi.notificationText}
                                </div>
                                <div className="text-xs">
                                  {new Date(notifi.createdAt).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </MenuItem>
                        ))}
                      </>
                    )}
                  </div>
                  {notificationList.filter((x) => !x.isRead).length > 0 && (
                    <div className="sticky bottom-0 bg-white dark:bg-black/90 p-2 text-right border-t border-gray-200 dark:border-neutral-700 z-10">
                      <Link
                        component="button"
                        onClick={handleMarkAllAsRead}
                        className="dark:text-white font-semibold"
                        underline="hover"
                      >
                        Mark all as read
                      </Link>
                    </div>
                  )}
                </div>
              </ClickAwayListener>
            )}
          </div>

          <Button
            variant={theme === "dark" ? "default" : "secondary"}
            size="icon"
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>
        </header>
        <div className="p-4 bg-[#FAF6FF] dark:bg-[#1A1A1A] h-full">
          {props.children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
