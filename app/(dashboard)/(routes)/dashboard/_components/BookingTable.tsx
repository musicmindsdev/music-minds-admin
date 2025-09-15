"use client";

import { useState, useEffect, ReactNode, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Filter, Search, Calendar, EllipsisVertical, Eye, Ban, CheckCircle } from "lucide-react";
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
import { CiExport } from "react-icons/ci";
import Modal from "@/components/Modal";
import { FaCheck, FaBan } from "react-icons/fa6";
import ExportModal from "@/components/ExportModal";
import { usePathname, useRouter } from "next/navigation";
import BookingDetailsModal from "../../content-management/_components/BookingDetailsModal";
import { Skeleton } from "@/components/ui/skeleton";

// Define interfaces for API response data
interface ApiClient {
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface ApiProvider {
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface ApiService {
  id?: string;
  name?: string;
}

interface ApiBooking {
  id: string;
  client?: ApiClient;
  provider?: ApiProvider;
  service?: ApiService;
  totalAmount?: string | number;
  status?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  location?: string;
  paymentAmount?: string | number;
  platformFee?: string | number;
  transactionId?: string;
  createdAt?: string;
  updatedAt?: string;
  title?: string; 
  price?: string | number;
}

// Define the Booking interface based on API response
export interface Booking {
  id: string;
  scheduledDate: ReactNode;
  scheduledTime: ReactNode;
  location: ReactNode;
  paymentAmount: ReactNode;
  platformFee: ReactNode;
  transactionId: ReactNode;
  clientName: string;
  clientEmail: string;
  providerName: string;
  providerEmail: string;
  serviceOffered: string;
  totalAmount: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
}

// Helper function to convert API booking to component booking
const mapApiBookingToComponentBooking = (apiBooking: ApiBooking): Booking => {
  return {
    id: apiBooking.id,
    clientName: apiBooking.client?.name || `${apiBooking.client?.firstName || ''} ${apiBooking.client?.lastName || ''}`.trim() || "Unknown Client",
    clientEmail: apiBooking.client?.email || "No email",
    providerName: apiBooking.provider?.name || `${apiBooking.provider?.firstName || ''} ${apiBooking.provider?.lastName || ''}`.trim() || "Unknown Provider",
    providerEmail: apiBooking.provider?.email || "No email",
    serviceOffered: apiBooking.title || apiBooking.service?.name || "Unknown Service",
    totalAmount: apiBooking.price ? `$${parseFloat(apiBooking.price.toString()).toFixed(2)}` : (apiBooking.totalAmount ? `$${parseFloat(apiBooking.totalAmount.toString()).toFixed(2)}` : "$0.00"),
    status: (apiBooking.status as "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED") || "PENDING",
    scheduledDate: apiBooking.scheduledDate ? new Date(apiBooking.scheduledDate).toLocaleDateString() : "Not scheduled",
    scheduledTime: apiBooking.scheduledTime || "Not scheduled",
    location: apiBooking.location || "Not specified",
    paymentAmount: apiBooking.paymentAmount ? `$${parseFloat(apiBooking.paymentAmount.toString()).toFixed(2)}` : "$0.00",
    platformFee: apiBooking.platformFee ? `$${parseFloat(apiBooking.platformFee.toString()).toFixed(2)}` : "$0.00",
    transactionId: apiBooking.transactionId || "N/A",
    lastLogin: apiBooking.updatedAt ? new Date(apiBooking.updatedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) : "Unknown",
    createdAt: apiBooking.createdAt || new Date().toISOString(),
    updatedAt: apiBooking.updatedAt || new Date().toISOString()
  };
};

interface BookingTableProps {
  bookings?: Booking[];
  showCheckboxes?: boolean;
  showPagination?: boolean;
  showExportButton?: boolean;
  onExport?: (data: {
    statusFilter: Record<string, boolean>;
    dateRangeFrom: string;
    dateRangeTo: string;
    format: string;
    fields: Record<string, boolean>;
  }) => void;
  headerText?: string;
}

export default function BookingTable({
  showCheckboxes = false,
  showPagination = false,
  showExportButton = false,
  onExport,
  headerText = "BOOKINGS MANAGEMENT",
}: BookingTableProps) {
  const [statusFilter, setStatusFilter] = useState({
    CONFIRMED: false,
    PENDING: false,
    CANCELLED: false,
    COMPLETED: false,
  });
  const [dateRangeFrom, setDateRangeFrom] = useState("");
  const [dateRangeTo, setDateRangeTo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalBookings, setTotalBookings] = useState(0);

  const bookingsPerPage = 10;
  const pathname = usePathname();
  const router = useRouter();

  // Fetch bookings from API
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: bookingsPerPage.toString(),
      });
  
      // Add status filter if any is selected
      const activeStatusFilters = Object.entries(statusFilter)
        .filter(([, isActive]) => isActive)
        .map(([status]) => status);
      
      if (activeStatusFilters.length > 0) {
        params.append('status', activeStatusFilters.join(','));
      }
  
      // Add date filters if provided
      if (dateRangeFrom) {
        params.append('fromDate', new Date(dateRangeFrom).toISOString());
      }
      if (dateRangeTo) {
        params.append('toDate', new Date(dateRangeTo).toISOString());
      }
  
      const response = await fetch(`/api/bookings?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch bookings');
      }
      
      const responseData = await response.json();
      
      // Handle the new response structure
      let bookingsData: ApiBooking[] = [];
      let totalCount = 0;
      
      if (responseData.data) {
        if (Array.isArray(responseData.data)) {
          bookingsData = responseData.data;
          totalCount = responseData.meta?.total || responseData.data.length;
        }
      } else if (Array.isArray(responseData)) {
        bookingsData = responseData;
        totalCount = responseData.length;
      }
      
      // Map API bookings to component bookings
      const mappedBookings = bookingsData.map(mapApiBookingToComponentBooking);
      setBookings(mappedBookings);
      setTotalBookings(totalCount);
      
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, dateRangeFrom, dateRangeTo, bookingsPerPage]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);
  const filteredBookings = bookings.filter((booking: Booking) => {
    const query = searchQuery.toLowerCase();
    const searchMatch =
      searchQuery === "" ||
      booking.id.toLowerCase().includes(query) ||
      booking.clientName.toLowerCase().includes(query) ||
      booking.providerName.toLowerCase().includes(query) ||
      booking.serviceOffered.toLowerCase().includes(query);

    const statusMatch =
      Object.values(statusFilter).every((val) => !val) ||
      statusFilter[booking.status as keyof typeof statusFilter];

    let dateMatch = true;
    if (dateRangeFrom || dateRangeTo) {
      const bookingDate = new Date(booking.updatedAt);
      const fromDate = dateRangeFrom ? new Date(dateRangeFrom) : null;
      const toDate = dateRangeTo ? new Date(dateRangeTo) : null;
      if (fromDate) {
        fromDate.setHours(0, 0, 0, 0);
        if (bookingDate < fromDate) dateMatch = false;
      }
      if (toDate) {
        toDate.setHours(23, 59, 59, 999);
        if (bookingDate > toDate) dateMatch = false;
      }
    }

    return searchMatch && statusMatch && dateMatch;
  });

  const totalPages = Math.ceil(totalBookings / bookingsPerPage);
  const startIndex = (currentPage - 1) * bookingsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + bookingsPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBookings(paginatedBookings.map((booking) => booking.id));
    } else {
      setSelectedBookings([]);
    }
  };

  const handleSelectBooking = (bookingId: string, checked: boolean) => {
    if (checked) {
      setSelectedBookings((prev) => [...prev, bookingId]);
    } else {
      setSelectedBookings((prev) => prev.filter((id) => id !== bookingId));
    }
  };

  useEffect(() => {
    setSelectedBookings([]);
  }, [currentPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleViewAll = () => {
    if (pathname !== "/content-management") {
      router.push("/content-management");
    }
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };

  const handleApprove = async () => {
    try {
      for (const bookingId of selectedBookings) {
        const response = await fetch(`/api/bookings/${bookingId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'CONFIRMED'
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to approve booking');
        }
      }
      
      console.log("Approved bookings:", selectedBookings);
      setSelectedBookings([]);
      setIsApproveModalOpen(false);
      fetchBookings(); // Refresh the bookings list
    } catch (err) {
      console.error('Error approving bookings:', err);
      setError(err instanceof Error ? err.message : 'Failed to approve bookings');
    }
  };
  
  const openApproveModal = () => {
    setIsApproveModalOpen(true);
  };

  const closeApproveModal = () => {
    setIsApproveModalOpen(false);
  };

  const handleCancel = async () => {
    try {
      for (const bookingId of selectedBookings) {
        const response = await fetch(`/api/bookings/${bookingId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'CANCELLED'
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to cancel booking');
        }
      }
      
      console.log("Cancelled bookings:", selectedBookings);
      setSelectedBookings([]);
      setIsCancelModalOpen(false);
      fetchBookings(); // Refresh the bookings list
    } catch (err) {
      console.error('Error cancelling bookings:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel bookings');
    }
  };

  const openCancelModal = () => {
    setIsCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
  };

  const handleExport = (data: {
    statusFilter: Record<string, boolean>;
    dateRangeFrom: string;
    dateRangeTo: string;
    format: string;
    fields: Record<string, boolean>;
  }) => {
    onExport?.(data);
    console.log("Exporting booking data:", data);
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <p className="font-light text-sm">{headerText}</p>
          <div className="flex space-x-2">
            {pathname !== "/content-management" && pathname !== "/user-management" && (
              <Button variant="link" className="text-blue-600 hover:text-blue-800" onClick={handleViewAll}>
                View all Bookings
              </Button>
            )}
            {showExportButton && (
              <Button className="text-white flex items-center space-x-2" onClick={() => setIsExportModalOpen(true)}>
                <CiExport className="mr-2" />
                <span className="hidden md:inline">Export Data</span>
              </Button>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <p className="font-light text-sm">{headerText}</p>
        </div>
        <div className="text-center py-8 text-red-500">
          Error: {error}
          <Button 
            onClick={fetchBookings} 
            className="ml-4"
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <p className="font-light text-sm">{headerText}</p>
        <div className="flex space-x-2">
          {pathname !== "/content-management" && pathname !== "/user-management" && (
            <Button variant="link" className="text-blue-600 hover:text-blue-800" onClick={handleViewAll}>
              View all Bookings
            </Button>
          )}
          {showExportButton && (
            <Button
              className="text-white flex items-center space-x-2"
              onClick={() => setIsExportModalOpen(true)}
            >
              <CiExport className="mr-2" />
              <span className="hidden md:inline">Export Data</span>
            </Button>
          )}
        </div>
      </div>
      <div className="relative mt-4 flex items-center pb-2">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search for booking by ID, client, provider, or service"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 p-2 border rounded-lg w-full bg-background"
        />
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
            <div className="space-y-2">
              <p className="text-sm font-medium">Status</p>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  className={`flex items-center gap-1 rounded-full text-sm ${
                    statusFilter.CONFIRMED ? "border border-gray-400 font-medium" : ""
                  }`}
                  onClick={() =>
                    setStatusFilter((prev) => ({
                      ...prev,
                      CONFIRMED: !prev.CONFIRMED,
                    }))
                  }
                >
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Confirmed
                </Button>
                <Button
                  variant="ghost"
                  className={`flex items-center gap-1 rounded-full text-sm ${
                    statusFilter.PENDING ? "border border-gray-400 font-medium" : ""
                  }`}
                  onClick={() =>
                    setStatusFilter((prev) => ({
                      ...prev,
                      PENDING: !prev.PENDING,
                    }))
                  }
                >
                  <span className="h-2 w-2 rounded-full bg-yellow-500" />
                  Pending
                </Button>
                <Button
                  variant="ghost"
                  className={`flex items-center gap-1 rounded-full text-sm ${
                    statusFilter.CANCELLED ? "border border-gray-400 font-medium" : ""
                  }`}
                  onClick={() =>
                    setStatusFilter((prev) => ({
                      ...prev,
                      CANCELLED: !prev.CANCELLED,
                    }))
                  }
                >
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Cancelled
                </Button>
                <Button
                  variant="ghost"
                  className={`flex items-center gap-1 rounded-full text-sm ${
                    statusFilter.COMPLETED ? "border border-gray-400 font-medium" : ""
                  }`}
                  onClick={() =>
                    setStatusFilter((prev) => ({
                      ...prev,
                      COMPLETED: !prev.COMPLETED,
                    }))
                  }
                >
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Completed
                </Button>
              </div>
            </div>
            <DropdownMenuSeparator />
            <div className="space-y-2">
              <p className="text-sm font-medium">Date Range</p>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Input
                    type="date"
                    value={dateRangeFrom}
                    onChange={(e) => setDateRangeFrom(e.target.value)}
                    className="pl-8"
                  />
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                <div className="relative flex-1">
                  <Input
                    type="date"
                    value={dateRangeTo}
                    onChange={(e) => setDateRangeTo(e.target.value)}
                    className="pl-8"
                  />
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 mt-4">
          <div className="flex flex-col items-center justify-center">
            <p className="text-gray-500 mb-4">
              {searchQuery || Object.values(statusFilter).some(val => val) || dateRangeFrom || dateRangeTo
                ? "Try adjusting your search or filters to find what you're looking for."
                : "No booking data available yet."}
            </p>
            {(searchQuery || Object.values(statusFilter).some(val => val) || dateRangeFrom || dateRangeTo) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter({ CONFIRMED: false, PENDING: false, CANCELLED: false, COMPLETED: false });
                  setDateRangeFrom("");
                  setDateRangeTo("");
                }}
              >
                Clear all filters
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          {selectedBookings.length > 0 && (
            <div className="flex justify-end space-x-2 mt-2 p-4">
              <Button variant="outline" size="sm" onClick={openApproveModal} className="text-green-600">
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                Approve
              </Button>
              <Button variant="outline" size="sm" onClick={openCancelModal} className="text-red-600">
                <Ban className="h-4 w-4 mr-2 text-red-600" />
                Cancel
              </Button>
            </div>
          )}
          
          <Table>
            <TableHeader>
              <TableRow>
                {showCheckboxes && (
                  <TableHead>
                    <Checkbox
                      checked={selectedBookings.length === paginatedBookings.length && paginatedBookings.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                )}
                <TableHead>Booking ID</TableHead>
                <TableHead>Client Name</TableHead>
                <TableHead>Provider Name</TableHead>
                <TableHead>Service Offered</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedBookings.map((booking: Booking) => (
                <TableRow key={booking.id}>
                  {showCheckboxes && (
                    <TableCell>
                      <Checkbox
                        checked={selectedBookings.includes(booking.id)}
                        onCheckedChange={(checked) => handleSelectBooking(booking.id, checked as boolean)}
                      />
                    </TableCell>
                  )}
                  <TableCell>{booking.id}</TableCell>
                  <TableCell>{booking.clientName}</TableCell>
                  <TableCell>{booking.providerName}</TableCell>
                  <TableCell>{booking.serviceOffered}</TableCell>
                  <TableCell>{booking.totalAmount}</TableCell>
                  <TableCell>
                    <span
                      className={`flex items-center justify-center gap-1 rounded-full px-2 py-1 text-xs ${
                        booking.status === "CONFIRMED" 
                          ? "bg-green-100 text-green-600"
                          : booking.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-600"
                          : booking.status === "CANCELLED"
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          booking.status === "CONFIRMED"
                            ? "bg-green-500"
                            : booking.status === "PENDING"
                            ? "bg-yellow-500"
                            : booking.status === "CANCELLED"
                            ? "bg-red-500"
                            : "bg-blue-500"
                        }`}
                      />
                      {booking.status}
                    </span>
                  </TableCell>
                  <TableCell>{booking.lastLogin}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost"><EllipsisVertical /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(booking)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={openApproveModal}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve Booking
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={openCancelModal} className="text-red-600">
                          <Ban className="h-4 w-4 mr-2 text-red-600" />
                          Cancel Booking
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
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
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
                  Showing {startIndex + 1} - {Math.min(startIndex + bookingsPerPage, totalBookings)} of {totalBookings}
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-sm">Go to page</p>
                  <Input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const page = Number(e.target.value);
                      if (page >= 1 && page <= totalPages) {
                        setCurrentPage(page);
                      }
                    }}
                    className="w-16"
                  />
                  <Button
                    className="text-white"
                    size="sm"
                    onClick={() => goToPage(currentPage)}
                  >
                    Go
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      <Modal
        isOpen={isApproveModalOpen}
        onClose={closeApproveModal}
        title="Approve Booking"
        icon={<FaCheck className="h-8 w-8 text-green-500" />}
        iconBgColor="#D6FCE0"
        message1="Approving Booking?"
        message="Are you sure you want to approve this booking?"
        cancelText="No, I don't"
        confirmText="Yes, approve"
        confirmButtonColor="#00A424"
        onConfirm={handleApprove}
      />
      
      <Modal
        isOpen={isCancelModalOpen}
        onClose={closeCancelModal}
        title="Cancel Booking"
        icon={<FaBan className="h-8 w-8 text-red-500" />}
        iconBgColor="#FEE2E2"
        message1="Cancelling Booking?"
        message="Are you sure you want to cancel this booking?"
        cancelText="No, I don't"
        confirmText="Yes, cancel"
        confirmButtonColor="#EF4444"
        onConfirm={handleCancel}
      />
      
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Data"
        statusFilters={[
          { label: "Confirmed", value: "Confirmed" },
          { label: "Pending", value: "Pending" },
          { label: "Cancelled", value: "Cancelled" },
          { label: "Completed", value: "Completed" },
        ]}
        roleFilters={[]}
        fieldOptions={[
          { label: "Booking ID", value: "Booking ID" },
          { label: "Client Name", value: "Client Name" },
          { label: "Provider Name", value: "Provider Name" },
          { label: "Service Offered", value: "Service Offered" },
          { label: "Total Amount", value: "Total Amount" },
          { label: "Status", value: "Status" },
          { label: "Last Updated", value: "Last Updated" },
        ]}
        onExport={handleExport}
      />
      
      {isDetailsModalOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50"
          onClick={() => setIsDetailsModalOpen(false)}
        >
          <div
            className="fixed right-0 top-0 h-full w-[35%] bg-card shadow-lg transform transition-transform duration-300 ease-in-out"
            style={{ transform: isDetailsModalOpen ? "translateX(0)" : "translateX(100%)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <BookingDetailsModal
              isOpen={isDetailsModalOpen}
              onClose={() => setIsDetailsModalOpen(false)}
              booking={selectedBooking}
            />
          </div>
        </div>
      )}
    </>
  );
}