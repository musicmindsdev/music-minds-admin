"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, Filter, Search, Calendar } from "lucide-react";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { TbTicket } from "react-icons/tb";
import { LuUserRoundCheck } from "react-icons/lu";
import { HiOutlineComputerDesktop } from "react-icons/hi2";
import { FaRegBell } from "react-icons/fa";
import { GoCheckCircle } from "react-icons/go";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  read: boolean;
  actions: { label: string; variant: "default" | "outline"; href?: string }[];
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState({
    status: { All: true, Unread: false, Read: false },
    type: "All" as string,
    dateRangeFrom: "2025-04-09",
    dateRangeTo: "",
  });
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const notificationsPerPage = 5;
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

      const read = filter.status.Unread ? "false" : filter.status.Read ? "true" : "";
      const query = new URLSearchParams({
        page: currentPage.toString(),
        limit: notificationsPerPage.toString(),
        ...(read && { read }),
        ...(filter.type !== "All" && { type: filter.type }),
        ...(filter.dateRangeFrom && { fromDate: filter.dateRangeFrom }),
        ...(filter.dateRangeTo && { toDate: filter.dateRangeTo }),
        ...(searchQuery && { searchQuery }),
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

      const { notifications: apiNotifications, total, pages } = await response.json();
      const mappedNotifications: Notification[] = Array.isArray(apiNotifications)
        ?   // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      setTotalNotifications(total || mappedNotifications.length);
      setTotalPages(pages || Math.ceil(total / notificationsPerPage));
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
  }, [currentPage, filter.status, filter.type, filter.dateRangeFrom, filter.dateRangeTo, searchQuery]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotifications(notifications.map((n) => n.id));
    } else {
      setSelectedNotifications([]);
    }
  };

  const handleSelectNotification = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedNotifications((prev) => [...prev, id]);
    } else {
      setSelectedNotifications((prev) => prev.filter((item) => item !== id));
    }
  };

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
      setSelectedNotifications([]);
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

  const handleMarkAsUnread = async () => {
    try {
      const promises = selectedNotifications.map((id) =>
        fetch(`/api/notifications/${id}/read`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ read: false }), // Assuming API supports setting read status
        })
      );

      const responses = await Promise.all(promises);
      console.log("Mark as unread API responses:", responses.map((r) => r.status));

      const failed = responses.some((r) => !r.ok);
      if (failed) {
        const errorData = await Promise.all(responses.map((r) => r.json().catch(() => ({}))));
        console.error("Backend error responses:", errorData);
        if (responses.some((r) => r.status === 401)) {
          toast.error("Please log in to mark notifications as unread", {
            position: "top-right",
            duration: 5000,
          });
          return;
        }
        throw new Error(errorData[0]?.error || "Failed to mark notifications as unread");
      }

      setNotifications(
        notifications.map((n) =>
          selectedNotifications.includes(n.id) ? { ...n, read: false } : n
        )
      );
      setSelectedNotifications([]);
      toast.success("Selected notifications marked as unread", {
        position: "top-right",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error marking notifications as unread:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred while marking notifications as unread", {
        position: "top-right",
        duration: 5000,
      });
    }
  };

  const handleDelete = async () => {
    try {
      const promises = selectedNotifications.map((id) =>
        fetch(`/api/notifications/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        })
      );

      const responses = await Promise.all(promises);
      console.log("Delete notifications API responses:", responses.map((r) => r.status));

      const failed = responses.some((r) => !r.ok);
      if (failed) {
        const errorData = await Promise.all(responses.map((r) => r.json().catch(() => ({}))));
        console.error("Backend error responses:", errorData);
        if (responses.some((r) => r.status === 401)) {
          toast.error("Please log in to delete notifications", {
            position: "top-right",
            duration: 5000,
          });
          return;
        }
        throw new Error(errorData[0]?.error || "Failed to delete notifications");
      }

      setNotifications(notifications.filter((n) => !selectedNotifications.includes(n.id)));
      setSelectedNotifications([]);
      toast.success("Selected notifications deleted", {
        position: "top-right",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error deleting notifications:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred while deleting notifications", {
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

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
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
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
        {error.includes("Please log in") && (
          <Button asChild variant="outline" className="mt-4">
            <a href="/login">Log In</a>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-medium">Notifications</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            Mark All As Read
            <GoCheckCircle className="ml-2" />
          </Button>
          <Button variant="outline" onClick={() => handleSelectAll(true)}>
            Select All
          </Button>
        </div>
      </div>
      <Card>
        <CardContent>
          <div className="relative mt-4 flex items-center pb-2 space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <input
                placeholder="Search for notifications by keyword (e.g., 'support ticket', 'booking')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 p-2 border rounded-lg w-full text-gray-700"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-[#F5F7FA] text-gray-700">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                side="bottom"
                sideOffset={4}
                className="w-94 p-4 shadow-lg border border-gray-200 rounded-lg bg-white"
              >
                <div className="space-y-4">
                  <p className="text-sm font-medium">Filter by</p>
                  <div>
                    <p className="text-sm font-medium mb-2">Status</p>
                    <div className="flex flex-wrap gap-2">
                      {["All", "Unread", "Read"].map((status) => (
                        <Button
                          key={status}
                          variant={filter.status[status as keyof typeof filter.status] ? "default" : "outline"}
                          className="flex items-center gap-1 rounded-md text-sm"
                          onClick={() => {
                            setFilter((prev) => ({
                              ...prev,
                              status: {
                                All: status === "All",
                                Unread: status === "Unread",
                                Read: status === "Read",
                              },
                            }));
                          }}
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Notification Type</p>
                    <Select
                      value={filter.type}
                      onValueChange={(value) =>
                        setFilter((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger className="w-full bg-white border border-gray-200 rounded-md text-sm">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="booking">Booking</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Date Range</p>
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Input
                          type="date"
                          value={filter.dateRangeFrom}
                          onChange={(e) =>
                            setFilter((prev) => ({ ...prev, dateRangeFrom: e.target.value }))
                          }
                          className="pl-8 w-full bg-white border border-gray-200 rounded-md text-sm"
                        />
                        <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                      </div>
                      <div className="relative flex-1">
                        <Input
                          type="date"
                          value={filter.dateRangeTo}
                          onChange={(e) =>
                            setFilter((prev) => ({ ...prev, dateRangeTo: e.target.value }))
                          }
                          className="pl-8 w-full bg-white border border-gray-200 rounded-md text-sm"
                        />
                        <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {selectedNotifications.length > 0 && (
            <div className="flex justify-between items-center mb-4 space-x-2">
              <div className="flex gap-2">
                <Checkbox
                  checked={selectedNotifications.length === notifications.length}
                  onCheckedChange={handleSelectAll}
                />
                <span>Select All</span>
              </div>
              <div className="flex gap-2">
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  Delete
                </Button>
                <Button variant="outline" size="sm" onClick={handleMarkAsUnread}>
                  Mark As Unread
                </Button>
              </div>
            </div>
          )}
          <div className="space-y-4">
            <Table className="border-none">
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500">
                      Loading notifications...
                    </TableCell>
                  </TableRow>
                ) : notifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500">
                      No notifications available
                    </TableCell>
                  </TableRow>
                ) : (
                  notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell className="py-2">
                        <Checkbox
                          checked={selectedNotifications.includes(notification.id)}
                          onCheckedChange={(checked) =>
                            handleSelectNotification(notification.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell className="py-2">{getIconForType(notification.type)}</TableCell>
                      <TableCell className="py-2">
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
                      </TableCell>
                      <TableCell className="py-2">
                        {!notification.read && (
                          <div className="h-3 w-3 rounded-full mt-1 bg-blue-500"></div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <IoIosArrowBack />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <IoIosArrowForward />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <span>{`${Math.min((currentPage - 1) * notificationsPerPage + 1, totalNotifications)} - ${Math.min(currentPage * notificationsPerPage, totalNotifications)} of ${totalNotifications}`}</span>
                <Input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => goToPage(Number(e.target.value))}
                  className="w-16 border rounded-lg p-1"
                />
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => goToPage(currentPage)}
                  className="text-white"
                >
                  Go
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}