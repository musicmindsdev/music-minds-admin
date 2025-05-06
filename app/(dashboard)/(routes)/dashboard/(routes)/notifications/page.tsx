"use client";

import { useState} from "react";
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
import {  AlertTriangle } from "lucide-react";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { TbTicket } from "react-icons/tb";
import { LuUserRoundCheck } from "react-icons/lu";
import { HiOutlineComputerDesktop } from "react-icons/hi2";
import { FaRegBell, FaFilter } from "react-icons/fa";

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
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const notificationsPerPage = 5;

  const filteredNotifications = notifications.filter((n) =>
    n.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Button variant="default" onClick={handleMarkAllAsRead}>
            Mark All As Read
          </Button>
          <Button variant="outline" onClick={() => handleSelectAll(true)}>
            Select All
          </Button>
        </div>
      </div>
      <div className="mb-4 relative">
        <Input
          placeholder="Search for notifications by keyword (e.g., 'support ticket', 'booking')"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2 border rounded-lg bg-gray-50"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
          onClick={() => console.log("Filter clicked")}
        >
          <FaFilter className="h-5 w-5 text-gray-500" />
        </Button>
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
                className={`border-t border-gray-200 ${
                  notification.read ? "bg-gray-50" : "bg-white"
                } hover:bg-gray-100`}
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
                    <div className="h-3 w-3  rounded-full mt-1"></div>
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
              className=" text-white"
            >
              Go
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}