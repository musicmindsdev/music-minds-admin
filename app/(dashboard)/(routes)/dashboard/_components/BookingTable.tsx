"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Filter, Search, Calendar, EllipsisVertical, Eye, Ban } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { bookingsData } from "@/lib/mockData";
import { HiOutlineBriefcase } from "react-icons/hi";

// Helper function to parse date string "MMM DD, YYYY • HH:MM AM/PM" to Date object
const parseDate = (dateString: string) => {
  const [datePart, timePart] = dateString.split(" • ");
  const [month, day, year] = datePart.split(" ");
  const [time, period] = timePart.split(" ");
  const [hours, minutes] = time.split(":").map(Number);
  let adjustedHours = hours;
  if (period === "PM" && hours !== 12) adjustedHours += 12;
  if (period === "AM" && hours === 12) adjustedHours = 0;
  const monthIndex = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ].indexOf(month);
  return new Date(parseInt(year), monthIndex, parseInt(day), adjustedHours, minutes);
};

export default function BookingTable() {
  const [statusFilter, setStatusFilter] = useState({
    Confirmed: false,
    Pending: false,
    Cancelled: false,
  });
  const [dateRangeFrom, setDateRangeFrom] = useState("");
  const [dateRangeTo, setDateRangeTo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter the bookings based on the selected filters and search query
  const filteredBookings = bookingsData.filter((booking) => {
    // Status filter
    const statusMatch =
      Object.values(statusFilter).every((val) => !val) ||
      statusFilter[booking.status as keyof typeof statusFilter];

    // Date range filter (based on lastLogin)
    let dateMatch = true;
    if (dateRangeFrom || dateRangeTo) {
      const bookingDate = parseDate(booking.lastLogin);
      const fromDate = dateRangeFrom ? new Date(dateRangeFrom) : null;
      const toDate = dateRangeTo ? new Date(dateRangeTo) : null;
      if (fromDate && bookingDate < fromDate) dateMatch = false;
      if (toDate && bookingDate > toDate) dateMatch = false;
    }

    // Search query filter
    const searchMatch =
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.serviceOffered.toLowerCase().includes(searchQuery.toLowerCase());

    return statusMatch && dateMatch && searchMatch;
  });

  return (
    <>
      <div className="flex justify-between items-center">
        <p className="font-light text-sm">BOOKINGS MANAGEMENT</p>
        <Button variant="link" className="text-blue-600 hover:text-blue-800">
          View all Bookings
        </Button>
      </div>
      <div className="relative mt-4 flex items-center">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search for booking by ID, Client, Provider, or Service"
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
            {/* Status Filter */}
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
            {/* Date Range Filter */}
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
      <Table>
        <TableHeader>
          <TableRow>
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
          {filteredBookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell>{booking.id}</TableCell>
              <TableCell>{booking.clientName}</TableCell>
              <TableCell>{booking.providerName}</TableCell>
              <TableCell>{booking.serviceOffered}</TableCell>
              <TableCell>{booking.totalAmount}</TableCell>
              <TableCell>
                <span
                  className={`flex items-center justify-center gap-1 rounded-full ${
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
                  <DropdownMenuItem >
                    <Eye className="w-4 h-4 mr-2"/>
                  View Details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator/>
                  <DropdownMenuItem>
                  <HiOutlineBriefcase className="w-4 h-4 mr-2"/>
                  Approve Booking
                  </DropdownMenuItem>
                  <DropdownMenuSeparator/>
                  <DropdownMenuItem>
                    <Ban className="w-4 h-4 mr-2 text-red-600"/>
                    Cancel Booking
                  </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}