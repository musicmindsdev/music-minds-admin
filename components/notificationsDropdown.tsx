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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const getUserId = () => {
    const cookieHeader = document.cookie;
    if (!cookieHeader) return null;
    const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split("=");
      acc[name] = value;
      return acc;
    }, {} as Record<string, string>);
    const token = cookies.accessToken;
    if (!token) return null;
    try {
      const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
      return payload.id || null;
    } catch {
      return null;
    }
  };

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const query = new URLSearchParams({
        page: "1",
        limit: "10",
        read: filter === "unread" ? "false" : "",
      }).toString();

      const response = await fetch(`/api/notifications?${query}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      console.log("Notifications API response status:", response.status);

      if (!response.ok) {
        if (response.status === 401) {
          setError("Please log in to view notifications");
          toast.error("Please log in to view notifications", {
            position: "top-right",
            duration: 5000,
          });
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch notifications");
      }

      const { notifications: apiNotifications } = await response.json();
      const mappedNotifications: Notification[] = Array.isArray(apiNotifications)
        ?  // eslint-disable-next-line @typescript-eslint/no-explicit-any
        apiNotifications.map((n: any) => ({
            id: n.id,
            type: n.type,
            message: n.message,
            timestamp: n.timestamp || new Date().toISOString(),
            read: n.read || false,
            actions: n.actions || [{ label: "View", variant: "default" }],
          }))
        : [];

      setNotifications(mappedNotifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err instanceof Error ? err.message : "An error occurred while fetching notifications");
      toast.error(err instanceof Error ? err.message : "An error occurred while fetching notifications", {
        position: "top-right",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllAsRead = async () => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error("Authentication required: No user ID found in token");
      }

      const response = await fetch(`/api/notifications/mark-all-read?userId=${userId}`, {
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
          <Button className="rounded-xl bg-gradient-to-r from-[#0065FF] via-[#952BDA] to-[#FE02BF]">
            <HiOutlineComputerDesktop className="h-6 w-6 text-white" />
          </Button>
        );
      case "booking":
        return (
          <Button variant="outline" className="bg-[#FFEAFB] rounded-xl">
            <FaRegBell className="h-6 w-6 text-[#9747FF]" />
          </Button>
        );
      case "user":
        return (
          <Button variant="outline" className="bg-[#FFE7FB] rounded-xl">
            <LuUserRoundCheck className="h-6 w-6 text-[#FE02BF]" />
          </Button>
        );
      case "support":
        return (
          <Button variant="outline" className="bg-[#FDF3D9] rounded-xl">
            <TbTicket className="h-6 w-6 text-yellow-500" />
          </Button>
        );
      case "security":
        return (
          <Button className="rounded-xl bg-gradient-to-r from-[#0065FF] via-[#952BDA] to-[#FE02BF]">
            <AlertTriangle className="h-6 w-6 text-white" />
          </Button>
        );
      default:
        return null;
    }
  };

  if (error) {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative">
            <Bell className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-96 p-4" align="end">
          <p className="text-red-500 text-center">{error}</p>
          {error.includes("Please log in") && (
            <Button asChild variant="outline" className="w-full mt-4">
              <a href="/login">Log In</a>
            </Button>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative">
          <Bell className="h-5 w-5" />
          {notifications.filter((n) => !n.read).length > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {notifications.filter((n) => !n.read).length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 p-4" align="end">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Notifications</h3>
          <Button
            variant="link"
            className="text-blue-600 text-sm"
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
            All {notifications.length}
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
          >
            Unread {notifications.filter((n) => !n.read).length}
          </Button>
        </div>
        <div className="space-y-4 max-h-64 overflow-y-auto">
          {loading ? (
            <p className="text-center text-gray-500">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <p className="text-center text-gray-500">No notifications available</p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start space-x-3 p-2 rounded-lg ${
                  notification.read ? "bg-gray-50" : "bg-white"
                }`}
              >
                <div>{getIconForType(notification.type)}</div>
                <div className="flex-1">
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-gray-500">{new Date(notification.timestamp).toLocaleString()}</p>
                  <div className="flex space-x-2 mt-2">
                    {notification.actions.map((action, idx) => (
                      <Button
                        key={idx}
                        variant={action.variant}
                        size="sm"
                        onClick={() => handleAction(notification.id, action)}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
                {!notification.read && (
                  <div className="h-3 w-3 bg-blue-500 rounded-full mt-1"></div>
                )}
              </div>
            ))
          )}
        </div>
        <Button
          className="w-full mt-4 text-white"
          onClick={handleSeeAll}
        >
          See all notifications
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}