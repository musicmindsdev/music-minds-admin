"use client";

import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { notificationsData } from "@/lib/mockData";
import {  AlertTriangle, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { LuUserRoundCheck } from "react-icons/lu";
import { HiOutlineComputerDesktop } from "react-icons/hi2";
import { FaRegBell} from "react-icons/fa";
import { TbTicket } from "react-icons/tb";

interface Notification {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  read: boolean;
  actions: { label: string; variant: "default" | "outline" }[];
}

export default function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>(notificationsData);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [open, setOpen] = useState(false); 
  const router = useRouter();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications =
    filter === "all" ? notifications : notifications.filter((n) => !n.read);

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleAction = (notificationId: string, actionLabel: string) => {
    console.log(`Action "${actionLabel}" clicked for notification ${notificationId}`);
    setNotifications(
      notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
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

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount}
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
            disabled={unreadCount === 0}
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
            Unread {unreadCount}
          </Button>
        </div>
        <div className="space-y-4 max-h-64 overflow-y-auto">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start space-x-3 p-2 rounded-lg ${
                notification.read ? "bg-gray-50" : "bg-white"
              }`}
            >
              <div>{getIconForType(notification.type)}</div>
              <div className="flex-1">
                <p className="text-sm">{notification.message}</p>
                <p className="text-xs text-gray-500">{notification.timestamp}</p>
                <div className="flex space-x-2 mt-2">
                  {notification.actions.map((action, idx) => (
                    <Button
                      key={idx}
                      variant={action.variant}
                      size="sm"
                      onClick={() => handleAction(notification.id, action.label)}
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
          ))}
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