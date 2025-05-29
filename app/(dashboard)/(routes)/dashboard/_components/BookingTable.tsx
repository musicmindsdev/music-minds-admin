"use client";

import { useState, useEffect, ReactNode } from "react";
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
import { bookingsData } from "@/lib/mockData";
import { usePathname, useRouter } from "next/navigation";
import BookingDetailsModal from "../../content-management/_components/BookingDetailsModal";

// Define the Booking interface
export interface Booking {
  scheduledDate: ReactNode;
  scheduledTime: ReactNode;
  location: ReactNode;
  paymentAmount: ReactNode;
  platformFee: ReactNode;
  transactionId: ReactNode;
  id: string;
  clientName: string;
  clientEmail: string;
  providerName: string;
  providerEmail: string;
  serviceOffered: string;
  totalAmount: string;
  status: string;
  lastLogin: string;
}

// Helper function to parse date string "MMM DD, YYYY • HH:MM AM/PM" to Date object
const parseDate = (dateString: string): Date => {
  const [datePart, timePart] = dateString.split(" • ");
  const [month, day, year] = datePart.split(" ");
  const [time, period] = timePart.split(" ");
  const [hours, minutes] = time.split(":").map(Number);
  let adjustedHours = hours;
  if (period === "PM" && hours !== 12) adjustedHours += 12;
  if (period === "AM" && hours === 12) adjustedHours = 0;
  const monthIndex = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ].indexOf(month);
  return new Date(parseInt(year), monthIndex, parseInt(day), adjustedHours, minutes);
};

interface BookingTableProps {
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
    Confirmed: false,
    Pending: false,
    Cancelled: false,
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
  const bookingsPerPage = 10;

  const pathname = usePathname();
  const router = useRouter();

  const filteredBookings = bookingsData.filter((booking: Booking) => {
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
      const bookingDate = parseDate(booking.lastLogin);
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

  const totalBookings = filteredBookings.length;
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

  const handleApprove = () => {
    console.log("Approving bookings:", selectedBookings);
    setSelectedBookings([]);
    setIsApproveModalOpen(false);
  };

  const openApproveModal = () => {
    setIsApproveModalOpen(true);
  };

  const closeApproveModal = () => {
    setIsApproveModalOpen(false);
  };

  const handleCancel = () => {
    console.log("Cancelling bookings:", selectedBookings);
    setSelectedBookings([]);
    setIsCancelModalOpen(false);
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

  return (
    <>
      <div className="flex justify-between items-center">
        <p className="font-light text-sm">{headerText}</p>
        <div className="flex space-x-2">
          {pathname !== "/content-management" && (
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
          placeholder="Search for user by Name, Email or ID"
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
                    statusFilter.Confirmed ? "border border-gray-400 font-medium" : ""
                  }`}
                  onClick={() =>
                    setStatusFilter((prev) => ({
                      ...prev,
                      Confirmed: !prev.Confirmed,
                    }))
                  }
                >
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Confirmed
                </Button>
                <Button
                  variant="ghost"
                  className={`flex items-center gap-1 rounded-full text-sm ${
                    statusFilter.Pending ? "border border-gray-400 font-medium" : ""
                  }`}
                  onClick={() =>
                    setStatusFilter((prev) => ({
                      ...prev,
                      Pending: !prev.Pending,
                    }))
                  }
                >
                  <span className="h-2 w-2 rounded-full bg-yellow-500" />
                  Pending
                </Button>
                <Button
                  variant="ghost"
                  className={`flex items-center gap-1 rounded-full text-sm ${
                    statusFilter.Cancelled ? "border border-gray-400 font-medium" : ""
                  }`}
                  onClick={() =>
                    setStatusFilter((prev) => ({
                      ...prev,
                      Cancelled: !prev.Cancelled,
                    }))
                  }
                >
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Cancelled
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
            <TableHead>Last Login</TableHead>
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
                    booking.status === "Confirmed"
                      ? "bg-green-100 text-green-600"
                      : booking.status === "Pending"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      booking.status === "Confirmed"
                        ? "bg-green-500"
                        : booking.status === "Pending"
                        ? "bg-yellow-500"
                        : "bg-red-500"
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
      <Modal
        isOpen={isApproveModalOpen}
        onClose={closeApproveModal}
        title="Approve Booking"
        icon={<FaCheck className="h-8 w-8 text-green-500" />}
        iconBgColor="#D6FCE0"
        message1="Approving Booking?"
        message="Are you sure you want to approve this booking?"
        cancelText="No, I don’t"
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
        cancelText="No, I don’t"
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
        ]}
        roleFilters={[]}
        fieldOptions={[
          { label: "Booking ID", value: "Booking ID" },
          { label: "Client Name", value: "Client Name" },
          { label: "Provider Name", value: "Provider Name" },
          { label: "Service Offered", value: "Service Offered" },
          { label: "Total Amount", value: "Total Amount" },
          { label: "Status", value: "Status" },
          { label: "Last Login", value: "Last Login" },
        ]}
        onExport={handleExport}
      />
      {isDetailsModalOpen && (
        <div
          className="fixed inset-0 backdrop-blur-xs z-50"
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