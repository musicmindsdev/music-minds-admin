"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, EllipsisVertical, Filter, Calendar, Clock, Send, Trash2 } from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TbEdit } from "react-icons/tb";
import Modal from "@/components/Modal";
import { FaTrash } from "react-icons/fa";
import Loading from "@/components/Loading";
import Pending from "@/public/pending.png";
import Image from "next/image";

// Define types directly in the component file
export interface Broadcast {
  id: string;
  title: string;
  message: string;
  type: 'PUSH_NOTIFICATION' | 'IN_APP_NOTIFICATION' | 'EMAIL' | 'SMS';
  recipientsType: 'ALL_USERS' | 'SPECIFIC_USERS' | 'FILTERED_USERS';
  specificUsers?: string[];
  userFilters?: {
    roles?: string[];
    countries?: string[];
    lastLoginDays?: number;
  };
  isEmergency: boolean;
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'CANCELLED' | 'FAILED';
  sendAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  sentAt?: string;
  totalRecipients?: number;
  successfulDeliveries?: number;
  failedDeliveries?: number;
}

interface BroadcastMessagesTableProps {
  showCheckboxes?: boolean;
  showPagination?: boolean;
  activeTab?: string;
  onEdit?: (message: Broadcast) => void;
  onExportData?: (broadcasts: Broadcast[]) => void;
  refreshKey?: number;
}

// Map API types to display names
const typeDisplayMap = {
  'PUSH_NOTIFICATION': 'Push Notification',
  'IN_APP_NOTIFICATION': 'In-App Notification',
  'EMAIL': 'Email',
  'SMS': 'SMS'
};

const statusDisplayMap = {
  'DRAFT': 'Draft',
  'SCHEDULED': 'Scheduled',
  'SENDING': 'Sending',
  'SENT': 'Sent',
  'CANCELLED': 'Cancelled',
  'FAILED': 'Failed'
};

const recipientsTypeDisplayMap = {
  'ALL_USERS': 'All Users',
  'SPECIFIC_USERS': 'Specific Users',
  'FILTERED_USERS': 'Filtered Users'
};

const priorityDisplayMap = {
  'LOW': 'Low',
  'NORMAL': 'Normal',
  'HIGH': 'High'
};

export default function BroadcastMessagesTable({
  showCheckboxes = false,
  showPagination = false,
  activeTab = "PUSH_NOTIFICATION",
  onEdit,
  onExportData,
  refreshKey = 0,
}: BroadcastMessagesTableProps) {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState({
    All: true,
    DRAFT: false,
    SCHEDULED: false,
    SENDING: false,
    SENT: false,
    CANCELLED: false,
    FAILED: false,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBroadcasts, setSelectedBroadcasts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBroadcasts, setTotalBroadcasts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRangeFrom, setDateRangeFrom] = useState("");
  const [dateRangeTo, setDateRangeTo] = useState("");
  const broadcastsPerPage = 10;

  const fetchBroadcasts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: broadcastsPerPage.toString(),
        ...(activeTab !== "ALL" && { type: activeTab }),
        ...(searchQuery && { search: searchQuery }),
        ...(dateRangeFrom && { startDate: new Date(dateRangeFrom).toISOString() }),
        ...(dateRangeTo && { endDate: new Date(dateRangeTo).toISOString() }),
      });

      // Add status filter (only if not "All")
      if (!statusFilter.All) {
        if (statusFilter.DRAFT) queryParams.append("status", "DRAFT");
        if (statusFilter.SCHEDULED) queryParams.append("status", "SCHEDULED");
        if (statusFilter.SENDING) queryParams.append("status", "SENDING");
        if (statusFilter.SENT) queryParams.append("status", "SENT");
        if (statusFilter.CANCELLED) queryParams.append("status", "CANCELLED");
        if (statusFilter.FAILED) queryParams.append("status", "FAILED");
      }

      const response = await fetch(`/api/broadcasts?${queryParams.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch broadcasts");
      }

      const responseData = await response.json();
      console.log("Broadcast API Response:", responseData); // Debug log

      // Handle different possible response structures
      let apiBroadcasts = [];
      let total = 0;
      let pages = 1;

      if (responseData.broadcasts && Array.isArray(responseData.broadcasts)) {
        apiBroadcasts = responseData.broadcasts;
        total = responseData.total || responseData.broadcasts.length;
        pages = responseData.pages || Math.ceil(total / broadcastsPerPage);
      } else if (Array.isArray(responseData)) {
        apiBroadcasts = responseData;
        total = responseData.length;
        pages = Math.ceil(total / broadcastsPerPage);
      } else if (responseData.data && Array.isArray(responseData.data)) {
        apiBroadcasts = responseData.data;
        total = responseData.total || responseData.data.length;
        pages = responseData.pages || Math.ceil(total / broadcastsPerPage);
      }

      setBroadcasts(apiBroadcasts || []);
      setTotalBroadcasts(total || 0);
      setTotalPages(pages || Math.ceil(total / broadcastsPerPage));
    } catch (err) {
      console.error("Error fetching broadcasts:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setBroadcasts([]); // Ensure broadcasts is always an array
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchQuery, dateRangeFrom, dateRangeTo, activeTab]);

  useEffect(() => {
    fetchBroadcasts();
  }, [fetchBroadcasts, refreshKey]);
  useEffect(() => {
    if (onExportData) {
      onExportData(broadcasts);
    }
  }, [broadcasts, onExportData]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBroadcasts(broadcasts.map((broadcast) => broadcast.id));
    } else {
      setSelectedBroadcasts([]);
    }
  };

  const handleSelectBroadcast = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedBroadcasts((prev) => [...prev, id]);
    } else {
      setSelectedBroadcasts((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleDelete = async () => {
    try {
      // Implement delete functionality when API is available
      console.log("Deleting broadcasts:", selectedBroadcasts);
      setSelectedBroadcasts([]);
      setIsDeleteModalOpen(false);
      fetchBroadcasts();
    } catch (error) {
      console.error("Error deleting broadcasts:", error);
      alert(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handleSendNow = async (id: string) => {
    try {
      // Implement send now functionality when API is available
      console.log("Sending broadcast now:", id);
      fetchBroadcasts();
    } catch (error) {
      console.error("Error sending broadcast:", error);
      alert(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handleSchedule = async (id: string) => {
    try {
      // Implement schedule functionality when API is available
      console.log("Scheduling broadcast:", id);
      fetchBroadcasts();
    } catch (error) {
      console.error("Error scheduling broadcast:", error);
      alert(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handleCancel = async (id: string) => {
    try {
      // Implement cancel functionality when API is available
      console.log("Cancelling broadcast:", id);
      fetchBroadcasts();
    } catch (error) {
      console.error("Error cancelling broadcast:", error);
      alert(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const openDeleteModal = () => {
    if (selectedBroadcasts.length === 0) return;
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleStatusFilterChange = (status: string) => {
    if (status === "All") {
      setStatusFilter({
        All: true,
        DRAFT: false,
        SCHEDULED: false,
        SENDING: false,
        SENT: false,
        CANCELLED: false,
        FAILED: false,
      });
    } else {
      setStatusFilter((prev) => ({
        All: false,
        DRAFT: status === "DRAFT" ? !prev.DRAFT : prev.DRAFT,
        SCHEDULED: status === "SCHEDULED" ? !prev.SCHEDULED : prev.SCHEDULED,
        SENDING: status === "SENDING" ? !prev.SENDING : prev.SENDING,
        SENT: status === "SENT" ? !prev.SENT : prev.SENT,
        CANCELLED: status === "CANCELLED" ? !prev.CANCELLED : prev.CANCELLED,
        FAILED: status === "FAILED" ? !prev.FAILED : prev.FAILED,
      }));
    }
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SENT": return "bg-green-100 text-green-700";
      case "SCHEDULED": return "bg-yellow-100 text-yellow-700";
      case "SENDING": return "bg-blue-100 text-blue-700";
      case "DRAFT": return "bg-gray-100 text-gray-700";
      case "CANCELLED": return "bg-red-100 text-red-700";
      case "FAILED": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case "SENT": return "bg-green-500";
      case "SCHEDULED": return "bg-yellow-500";
      case "SENDING": return "bg-blue-500";
      case "DRAFT": return "bg-gray-500";
      case "CANCELLED": return "bg-red-500";
      case "FAILED": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "bg-red-100 text-red-700";
      case "NORMAL": return "bg-blue-100 text-blue-700";
      case "LOW": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loading state - using your custom Loading component
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loading />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
        <Button variant="outline" className="mt-4" onClick={fetchBroadcasts}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="relative mt-4 flex items-center pb-2 space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <input
            placeholder="Search for broadcast by Title, Message, or ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 p-2 border rounded-lg w-full bg-background text-gray-700"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="ml-2">
              <Filter className="h-4 w-4 text-gray-500" />
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
                  {["All", "DRAFT", "SCHEDULED", "SENDING", "SENT", "CANCELLED", "FAILED"].map((status) => (
                    <Button
                      key={status}
                      variant="ghost"
                      className={`flex items-center gap-1 rounded-full text-sm ${statusFilter[status as keyof typeof statusFilter] ? "border border-gray-400 font-medium" : ""
                        }`}
                      onClick={() => handleStatusFilterChange(status)}
                    >
                      {status !== "All" && (
                        <span className={`h-2 w-2 rounded-full ${getStatusDotColor(status)}`} />
                      )}
                      {statusDisplayMap[status as keyof typeof statusDisplayMap] || status}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Date Range</p>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Input
                      type="date"
                      value={dateRangeFrom}
                      onChange={(e) => setDateRangeFrom(e.target.value)}
                      className="pl-8 w-full"
                    />
                    <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  </div>
                  <div className="relative flex-1">
                    <Input
                      type="date"
                      value={dateRangeTo}
                      onChange={(e) => setDateRangeTo(e.target.value)}
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

      {selectedBroadcasts.length > 0 && (
        <div className="mb-4 p-3 bg-gray-100 rounded-lg flex justify-between items-center">
          <span>{selectedBroadcasts.length} broadcast(s) selected</span>
          <Button variant="destructive" size="sm" onClick={openDeleteModal}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Empty state - using the same pattern as other tables */}
      {broadcasts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Image src={Pending} alt="No broadcasts found" className="mx-auto mb-2" />
          <p>No broadcasts found.</p>
          {searchQuery && (
            <p className="text-sm mt-2">Try adjusting your search</p>
          )}
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                {showCheckboxes && (
                  <TableHead>
                    <Checkbox
                      checked={selectedBroadcasts.length === broadcasts.length && broadcasts.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                )}
                <TableHead>Broadcast ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Schedule Date</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {broadcasts.map((broadcast) => (
                <TableRow key={broadcast.id}>
                  {showCheckboxes && (
                    <TableCell>
                      <Checkbox
                        checked={selectedBroadcasts.includes(broadcast.id)}
                        onCheckedChange={(checked) => handleSelectBroadcast(broadcast.id, checked as boolean)}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-mono text-sm">{broadcast.id.slice(0, 8)}...</TableCell>
                  <TableCell>{truncateText(broadcast.title, 20)}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                      {typeDisplayMap[broadcast.type]}
                    </span>
                  </TableCell>
                  <TableCell>{recipientsTypeDisplayMap[broadcast.recipientsType]}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(broadcast.priority)}`}>
                      {priorityDisplayMap[broadcast.priority]}
                    </span>
                    {broadcast.isEmergency && (
                      <span className="ml-1 px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
                        Emergency
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`flex items-center justify-center gap-1 rounded-full px-2 py-1 text-xs ${getStatusColor(broadcast.status)}`}>
                      <span className={`h-2 w-2 rounded-full ${getStatusDotColor(broadcast.status)}`} />
                      {statusDisplayMap[broadcast.status]}
                      {broadcast.sendAt && broadcast.status === "SCHEDULED" && (
                        <Clock className="h-3 w-3 ml-1" />
                      )}
                    </span>
                    {broadcast.sendAt && broadcast.status === "SCHEDULED" && (
                      <div className="text-xs text-gray-500 mt-1">
                        Scheduled for: {formatDate(broadcast.sendAt)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {broadcast.sendAt ? formatDate(broadcast.sendAt) : 'Immediate'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {broadcast.createdBy?.name?.charAt(0) || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      {truncateText(broadcast.createdBy?.name || 'Admin', 15)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <EllipsisVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit?.(broadcast)}>
                          <TbEdit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>

                        {broadcast.status === "DRAFT" && (
                          <>
                            <DropdownMenuItem onClick={() => handleSendNow(broadcast.id)}>
                              <Send className="h-4 w-4 mr-2" />
                              Send Now
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSchedule(broadcast.id)}>
                              <Calendar className="h-4 w-4 mr-2" />
                              Schedule
                            </DropdownMenuItem>
                          </>
                        )}

                        {broadcast.status === "SCHEDULED" && (
                          <DropdownMenuItem onClick={() => handleCancel(broadcast.id)}>
                            <Clock className="h-4 w-4 mr-2" />
                            Cancel Schedule
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem onClick={() => {
                          setSelectedBroadcasts([broadcast.id]);
                          openDeleteModal();
                        }} className="text-[#FF3B30]">
                          <Trash2 className="h-4 w-4 mr-2 text-[#FF3B30]" />
                          Delete
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
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
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
                <p className="text-sm">
                  Showing {Math.min((currentPage - 1) * broadcastsPerPage + 1, totalBroadcasts)} -{" "}
                  {Math.min(currentPage * broadcastsPerPage, totalBroadcasts)} of {totalBroadcasts}
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-sm">Go to page</p>
                  <Input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => goToPage(Number(e.target.value))}
                    className="w-16"
                  />
                  <Button className="text-white" size="sm" onClick={() => goToPage(currentPage)}>
                    Go
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        title="Deletion"
        icon={<FaTrash className="h-8 w-8 text-red-500" />}
        iconBgColor="#FEE2E2"
        message1="Deleting Broadcast?"
        message={`Are you sure you want to delete ${selectedBroadcasts.length} broadcast(s)? This action cannot be undone.`}
        cancelText="No, I don't"
        confirmText="Yes, delete"
        confirmButtonColor="#EF4444"
        onConfirm={handleDelete}
      />
    </>
  );
}