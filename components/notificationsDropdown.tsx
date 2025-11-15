"use client";

import { useState, useEffect, useCallback } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { LuUserRoundCheck } from "react-icons/lu";
import { HiOutlineComputerDesktop } from "react-icons/hi2";
import { FaRegBell } from "react-icons/fa";
import { TbTicket } from "react-icons/tb";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  read: boolean;
  actions: { label: string; variant: "default" | "outline"; href?: string }[];
}

export default function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const read = filter === "unread" ? "false" : "";
      const query = new URLSearchParams({
        page: "1",
        limit: "10",
        ...(read && { read }),
      }).toString();

      const response = await fetch(`/api/notifications?${query}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      console.log("Dropdown - Notifications API response status:", response.status);

      if (!response.ok) {
        if (response.status === 401) {
          setError("Please log in to view notifications");
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch notifications");
      }

      const responseData = await response.json();
      console.log("Dropdown - Full API response:", responseData);
      
      // ✅ USE THE EXACT SAME MAPPING LOGIC AS YOUR NOTIFICATIONS PAGE
      const apiNotifications = responseData.notifications?.data || responseData.notifications || [];
      console.log("Dropdown - Extracted notifications:", apiNotifications);
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedNotifications: Notification[] = apiNotifications.map((n: any) => ({
        id: n.id,
        type: n.type,
        message: n.message,
        timestamp: n.createdAt || new Date().toISOString(), // ✅ Same as page
        read: n.read || false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        actions: n.actions?.map((a: any) => ({
          label: a.label,
          variant: "default" as const,
          href: a.route
        })) || [{ label: "View", variant: "default" as const }],
      }));

      console.log("Dropdown - Mapped notifications:", mappedNotifications);
      setNotifications(mappedNotifications);

    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err instanceof Error ? err.message : "An error occurred while fetching notifications");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch(`/api/notifications/mark-all-read`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      console.log("Mark all as read API response status:", response.status);

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Please log in to mark notifications as read", {
            position: "top-right",
            duration: 5000,
          });
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to mark all notifications as read");
      }

      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read", {
        position: "top-right",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred while marking notifications as read", {
        position: "top-right",
        duration: 5000,
      });
    }
  };

  const handleAction = async (notificationId: string, action: { label: string; variant: "default" | "outline"; href?: string }) => {
    try {
      console.log(`Action "${action.label}" clicked for notification ${notificationId}`);
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      console.log(`Mark as read API response status for ${notificationId}:`, response.status);

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Please log in to mark notification as read", {
            position: "top-right",
            duration: 5000,
          });
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to mark notification as read");
      }

      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );

      if (action.href) {
        router.push(action.href);
      }

      toast.success("Notification marked as read", {
        position: "top-right",
        duration: 3000,
      });
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error);
      toast.error(error instanceof Error ? error.message : "An error occurred while marking notification as read", {
        position: "top-right",
        duration: 5000,
      });
    }
  };

  const handleSeeAll = () => {
    setOpen(false);
    router.push("/dashboard/notifications");
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "system":
        return (
          <div className="rounded-xl bg-gradient-to-r from-[#0065FF] via-[#952BDA] to-[#FE02BF] p-2">
            <HiOutlineComputerDesktop className="h-4 w-4 text-white" />
          </div>
        );
      case "booking":
        return (
          <div className="bg-[#FFEAFB] rounded-xl p-2 border">
            <FaRegBell className="h-4 w-4 text-[#9747FF]" />
          </div>
        );
      case "user":
        return (
          <div className="bg-[#FFE7FB] rounded-xl p-2 border">
            <LuUserRoundCheck className="h-4 w-4 text-[#FE02BF]" />
          </div>
        );
      case "support":
        return (
          <div className="bg-[#FDF3D9] rounded-xl p-2 border">
            <TbTicket className="h-4 w-4 text-yellow-500" />
          </div>
        );
      case "security":
        return (
          <div className="rounded-xl bg-gradient-to-r from-[#0065FF] via-[#952BDA] to-[#FE02BF] p-2">
            <AlertTriangle className="h-4 w-4 text-white" />
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 rounded-xl p-2 border">
            <Bell className="h-4 w-4 text-gray-600" />
          </div>
        );
    }
  };

  const displayedNotifications = filter === "unread" 
    ? notifications.filter(n => !n.read)
    : notifications;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative">
          <Bell className="h-5 w-5" />
          {notifications.filter((n) => !n.read).length > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {notifications.filter((n) => !n.read).length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 p-4" align="end" sideOffset={5}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Notifications</h3>
          <Button
            variant="link"
            className="text-blue-600 text-sm p-0 h-auto"
            onClick={handleMarkAllAsRead}
            disabled={notifications.filter((n) => !n.read).length === 0}
          >
            Mark all as read
          </Button>
        </div>
        
        <div className="flex space-x-2 mb-4">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All ({notifications.length})
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
          >
            Unread ({notifications.filter((n) => !n.read).length})
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
            {error.includes("Please log in") && (
              <Button asChild variant="outline" className="w-full mt-2">
                <a href="/login">Log In</a>
              </Button>
            )}
          </div>
        )}

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Loading notifications...</p>
            </div>
          ) : displayedNotifications.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">No notifications available</p>
            </div>
          ) : (
            displayedNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border ${
                  notification.read ? "bg-gray-50" : "bg-white border-blue-200"
                }`}
              >
                <div className="flex-shrink-0">
                  {getIconForType(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 break-words">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.timestamp).toLocaleDateString()} at{" "}
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </p>
                  <div className="flex space-x-2 mt-2">
                    {notification.actions.map((action, idx) => (
                      <Button
                        key={idx}
                        variant={action.variant}
                        size="sm"
                        onClick={() => handleAction(notification.id, action)}
                        className="text-xs"
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
                {!notification.read && (
                  <div className="flex-shrink-0 mt-2">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <Button
          className="w-full mt-4"
          onClick={handleSeeAll}
        >
          See all notifications
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}