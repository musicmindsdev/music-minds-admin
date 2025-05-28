"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, EllipsisVertical, Filter, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { broadcastMessageData } from "@/lib/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {  Send, Trash2 } from "lucide-react"; // Added icons
import { TbEdit } from "react-icons/tb";

// Helper function to parse date string "DD/MM/YY - H:MM A.M./P.M." to Date object
const parseDate = (dateString: string): Date => {
  if (dateString === "N/A") return new Date(0); // Invalid date for filtering
  const [datePart, timePart] = dateString.split(" - ");
  const [day, month, year] = datePart.split("/");
  const match = timePart.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) throw new Error("Invalid time format");
  const [, hour, minute, period] = match;
  let hours = parseInt(hour) % 12 + (period.toLowerCase().includes("p") ? 12 : 0);
  if (parseInt(hour) === 12 && period.toLowerCase().includes("a")) hours = 0;
  return new Date(parseInt(`20${year}`), parseInt(month) - 1, parseInt(day), hours, parseInt(minute));
};

interface BroadcastMessagesTableProps {
  showCheckboxes?: boolean;
  showPagination?: boolean;
  headerText?: string;
  activeTab?: string; // New prop to determine which table to show
}

export default function BroadcastMessagesTable({
  showCheckboxes = false,
  showPagination = false,
  activeTab = "Push Notification", // Default to "Push Notification"
}: BroadcastMessagesTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState({
    status: { All: true, Draft: false, Sent: false, Scheduled: false },
    messageType: activeTab, // Sync messageType filter with activeTab
    dateRangeFrom: "",
    dateRangeTo: "",
  });
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [messages, setMessages] = useState(broadcastMessageData); // Local state for mock updates
  const messagesPerPage = 7;

  // Filter messages based on activeTab and other criteria
  const filteredMessages = messages.filter((message) => {
    const queryMatch =
      searchQuery === "" ||
      message.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.createdBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.recipientType.toLowerCase().includes(searchQuery.toLowerCase());

    const statusMatch =
      filter.status.All ||
      (filter.status.Draft && message.status === "Draft") ||
      (filter.status.Sent && message.status === "Sent") ||
      (filter.status.Scheduled && message.status === "Scheduled");

    const messageTypeMatch =
      filter.messageType === "All" ||
      message.messageType === filter.messageType;

    let dateMatch = true;
    if (filter.dateRangeFrom || filter.dateRangeTo) {
      const messageDate = parseDate(message.publishedDate);
      const fromDate = filter.dateRangeFrom ? new Date(filter.dateRangeFrom) : null;
      const toDate = filter.dateRangeTo ? new Date(filter.dateRangeTo) : null;
      if (fromDate) {
        fromDate.setHours(0, 0, 0, 0); // Start of the day
        if (messageDate < fromDate) dateMatch = false;
      }
      if (toDate) {
        toDate.setHours(23, 59, 59, 999); // End of the day
        if (messageDate > toDate) dateMatch = false;
      }
    }

    return queryMatch && statusMatch && messageTypeMatch && dateMatch;
  });

  const totalMessages = filteredMessages.length;
  const totalPages = Math.ceil(totalMessages / messagesPerPage);
  const startIndex = (currentPage - 1) * messagesPerPage;
  const paginatedMessages = filteredMessages.slice(startIndex, startIndex + messagesPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMessages(paginatedMessages.map((message) => message.id));
    } else {
      setSelectedMessages([]);
    }
  };

  const handleSelectMessage = (messageId: string, checked: boolean) => {
    if (checked) {
      setSelectedMessages((prev) => [...prev, messageId]);
    } else {
      setSelectedMessages((prev) => prev.filter((id) => id !== messageId));
    }
  };

  useEffect(() => {
    setSelectedMessages([]);
    setCurrentPage(1); // Reset to first page when filters change
    setFilter((prev) => ({
      ...prev,
      messageType: activeTab, // Update messageType when activeTab changes
    }));
  }, [activeTab, filter.status, filter.dateRangeFrom, filter.dateRangeTo, searchQuery]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Sent": return "bg-green-100 text-green-700";
      case "Scheduled": return "bg-yellow-100 text-yellow-700";
      case "Draft": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const handleStatusFilterChange = (status: string) => {
    if (status === "All") {
      setFilter((prev) => ({
        ...prev,
        status: { All: true, Draft: false, Sent: false, Scheduled: false },
      }));
    } else {
      setFilter((prev) => ({
        ...prev,
        status: {
          All: false,
          Draft: status === "Draft" ? !prev.status.Draft : prev.status.Draft,
          Sent: status === "Sent" ? !prev.status.Sent : prev.status.Sent,
          Scheduled: status === "Scheduled" ? !prev.status.Scheduled : prev.status.Scheduled,
        },
      }));
    }
  };

  // Action Handlers (to be replaced with API calls)
  const handleEdit = (messageId: string) => {
    const message = messages.find((msg) => msg.id === messageId);
    console.log("Edit Message:", message);
    // Future: Open SendMessageModal with message details pre-filled
  };

  const handleSendNow = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, status: "Sent", publishedDate: new Date().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", hour12: true }).replace(",", " - ") }
          : msg
      )
    );
    console.log("Send Now:", messageId);
    // Future: Make API call to send the message
  };

  const handleSchedule = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, status: "Scheduled", publishedDate: "N/A" } // Mock update; real date would come from backend
          : msg
      )
    );
    console.log("Schedule Message:", messageId);
    // Future: Open modal to set schedule date and make API call
  };

  const handleDelete = (messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    console.log("Delete Message:", messageId);
    // Future: Make API call to delete the message
  };

  return (
    <>
      <div className="relative mt-4 flex items-center pb-2 space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <input
            placeholder="Search for user by Name, Email or ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 p-2 border rounded-lg w-full text-gray-700"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-white text-gray-700">
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="bottom"
            sideOffset={4}
            className="w-94 p-4 shadow-lg border border-gray-200 rounded-lg"
          >
            <DropdownMenuLabel>Filter by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Status</p>
                <div className="flex flex-wrap gap-2">
                  {["All", "Draft", "Sent", "Scheduled"].map((status) => (
                    <Button
                      key={status}
                      variant={filter.status[status as keyof typeof filter.status] ? "default" : "outline"}
                      className={`flex items-center gap-1 rounded-md text-sm ${
                        filter.status[status as keyof typeof filter.status] ? "border border-gray-400 font-medium" : ""
                      }`}
                      onClick={() => handleStatusFilterChange(status)}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Message Type</p>
                <Select
                  value={filter.messageType}
                  onValueChange={(value) => setFilter((prev) => ({ ...prev, messageType: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Message Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Push Notification">Push Notification</SelectItem>
                    <SelectItem value="Emergency Notification">Emergency Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Date Range</p>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Input
                      type="date"
                      value={filter.dateRangeFrom}
                      onChange={(e) => setFilter((prev) => ({ ...prev, dateRangeFrom: e.target.value }))}
                      className="pl-8 w-full"
                    />
                    <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  </div>
                  <div className="relative flex-1">
                    <Input
                      type="date"
                      value={filter.dateRangeTo}
                      onChange={(e) => setFilter((prev) => ({ ...prev, dateRangeTo: e.target.value }))}
                      className="pl-8 w-full"
                    />
                    <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  </div>
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {showCheckboxes && (
              <TableHead>
                <Checkbox
                  checked={selectedMessages.length === paginatedMessages.length && paginatedMessages.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
            )}
            <TableHead>Broadcast ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Recipient Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Published Date</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedMessages.map((message) => (
            <TableRow key={message.id}>
              {showCheckboxes && (
                <TableCell>
                  <Checkbox
                    checked={selectedMessages.includes(message.id)}
                    onCheckedChange={(checked) => handleSelectMessage(message.id, checked as boolean)}
                  />
                </TableCell>
              )}
              <TableCell>{message.id}</TableCell>
              <TableCell>{message.title}</TableCell>
              <TableCell>{truncateText(message.message, 20)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src="/placeholder-avatar.jpg" alt={message.createdBy} />
                    <AvatarFallback>{message.createdBy.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {truncateText(message.createdBy, 15)}
                </div>
              </TableCell>
              <TableCell>{message.recipientType}</TableCell>
              <TableCell>
                <span className={`flex items-center justify-center gap-1 rounded-full px-2 py-1 ${getStatusColor(message.status)}`}>
                <span
                    className={`h-2 w-2 rounded-full ${
                      message.status === "Sent"
                        ? "bg-green-500"
                        : message.status === "Scheduled"
                        ? "bg-[#E2A300]"
                        : "bg-gray-500"
                    }`}
                  />
                  {message.status}
                </span>
              </TableCell>
              <TableCell>{message.publishedDate}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost"><EllipsisVertical /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(message.id)}>
                      <TbEdit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    {(message.status === "Draft" || message.status === "Scheduled") && (
                      <DropdownMenuItem onClick={() => handleSendNow(message.id)}>
                        <Send className="mr-2 h-4 w-4" /> Send Now
                      </DropdownMenuItem>
                    )}
                    {message.status === "Draft" && (
                      <DropdownMenuItem onClick={() => handleSchedule(message.id)}>
                        <Calendar className="mr-2 h-4 w-4" /> Schedule
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleDelete(message.id)} className="text-[#FF3B30]">
                      <Trash2 className="h-4 w-4 mr-2 text-[#FF3B30]" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {showPagination && (
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
            <p className="text-sm text-gray-700">
              Showing {startIndex + 1} - {Math.min(startIndex + messagesPerPage, totalMessages)} of {totalMessages}
            </p>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-700">Go to page:</p>
              <Input
                type="number"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => goToPage(Number(e.target.value))}
                className="w-16 p-1 border rounded-lg"
              />
              <Button size="sm" onClick={() => goToPage(currentPage)}>
                Go
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}