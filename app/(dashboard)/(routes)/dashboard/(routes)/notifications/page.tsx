"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { notificationsData } from "@/lib/mockData";
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

interface Notification {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  read: boolean;
  actions: { label: string; variant: "default" | "outline" }[];
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(notificationsData);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState({
    status: { All: true, Unread: false, Read: false },
    type: "All" as const, // Single select for type
    dateRangeFrom: "2025-04-09", // Default from date based on design
    dateRangeTo: "", // Empty to date
  });
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const notificationsPerPage = 5;

  // Helper function to parse date string "DD/MM/YYYY" to Date object
  const parseDate = (dateString: string): Date => {
    if (!dateString) return new Date(0);
    const [day, month, year] = dateString.split("/");
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  const filteredNotifications = notifications.filter((n) => {
    const queryMatch =
      searchQuery === "" || n.message.toLowerCase().includes(searchQuery.toLowerCase());

    const statusMatch =
      filter.status.All ||
      (filter.status.Unread && !n.read) ||
      (filter.status.Read && n.read);

    const typeMatch = filter.type === "All" || n.type === filter.type;

    let dateMatch = true;
    if (filter.dateRangeFrom || filter.dateRangeTo) {
      const notificationDate = parseDate(n.timestamp.split(" - ")[0]); // Assuming timestamp is "DD/MM/YYYY - HH:MM"
      const fromDate = filter.dateRangeFrom ? new Date(filter.dateRangeFrom) : null;
      const toDate = filter.dateRangeTo ? new Date(filter.dateRangeTo) : null;
      if (fromDate) {
        fromDate.setHours(0, 0, 0, 0);
        if (notificationDate < fromDate) dateMatch = false;
      }
      if (toDate) {
        toDate.setHours(23, 59, 59, 999);
        if (notificationDate > toDate) dateMatch = false;
      }
    }

    return queryMatch && statusMatch && typeMatch && dateMatch;
  });

  const totalPages = Math.ceil(filteredNotifications.length / notificationsPerPage);
  const startIndex = (currentPage - 1) * notificationsPerPage;
  const paginatedNotifications = filteredNotifications.slice(
    startIndex,
    startIndex + notificationsPerPage
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotifications(paginatedNotifications.map((n) => n.id));
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

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    setSelectedNotifications([]);
  };

  const handleMarkAsUnread = () => {
    setNotifications(
      notifications.map((n) =>
        selectedNotifications.includes(n.id) ? { ...n, read: false } : n
      )
    );
    setSelectedNotifications([]);
  };

  const handleDelete = () => {
    setNotifications(notifications.filter((n) => !selectedNotifications.includes(n.id)));
    setSelectedNotifications([]);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    setSelectedNotifications([]);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filter.status, filter.type, filter.dateRangeFrom, filter.dateRangeTo, searchQuery]);

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
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-medium">Notifications</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            Mark All As Read
            <GoCheckCircle />
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
                className="pl-8 p-2 border rounded-lg w-full  text-gray-700"
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
                  {/* Filter Title */}
                  <p className="text-sm font-medium">Filter by</p>
                  {/* Status Section */}
                  <div>
                    <p className="text-sm font-medium mb-2">Status</p>
                    <div className="flex flex-wrap gap-2">
                      {["All", "Unread", "Read"].map((status) => (
                        <Button
                          key={status}
                          variant={filter.status[status as keyof typeof filter.status] ? "default" : "outline"}
                          className={`flex items-center gap-1 rounded-md text-sm `}
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
                  {/* Notification Type Section */}
                  <div>
                    <p className="text-sm font-medium mb-2">Notification Type</p>
                    <Select
                      value={filter.type}
                      onValueChange={(value) =>
                        setFilter((prev) => ({ ...prev, type: value as typeof filter.type }))
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
                  {/* Date Range Section */}
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
                  checked={selectedNotifications.length === paginatedNotifications.length}
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
                {paginatedNotifications.map((notification) => (
                  <TableRow
                    key={notification.id}
                    
                  >
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
                        <p className="text-xs text-gray-500">{notification.timestamp}</p>
                        <div className="flex space-x-2 mt-2">
                          {notification.actions.map((action, idx) => (
                            <Button
                              key={idx}
                              variant={action.variant}
                              size="sm"
                              onClick={() => console.log(`Action ${action.label} for ${notification.id}`)}
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
                ))}
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
                <span>{`${startIndex + 1} - ${Math.min(startIndex + notificationsPerPage, filteredNotifications.length)} of ${filteredNotifications.length}`}</span>
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