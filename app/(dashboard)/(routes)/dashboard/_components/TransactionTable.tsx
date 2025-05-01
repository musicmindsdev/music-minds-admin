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
import { Filter, Search, Calendar, EllipsisVertical, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { transactionsData } from "@/lib/mockData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TbCashBanknote } from "react-icons/tb";
import { BiRotateLeft } from "react-icons/bi";

// Helper function to parse date string "dd/mm/yy • hh:mm AM/PM" to Date object
const parseDate = (dateString: string) => {
  const [datePart, timePart] = dateString.split(" • ");
  const [day, month, year] = datePart.split("/").map(Number);
  const [time, period] = timePart.split(" ");
  const [hours, minutes] = time.split(":").map(Number);
  let adjustedHours = hours;
  if (period.startsWith("PM") && hours !== 12) adjustedHours += 12;
  if (period.startsWith("AM") && hours === 12) adjustedHours = 0;
  return new Date(2000 + year, month - 1, day, adjustedHours, minutes);
};

export default function TransactionTable() {
  const [statusFilter, setStatusFilter] = useState({
    Completed: false,
    Pending: false,
    Failed: false,
  });
  const [dateRangeFrom, setDateRangeFrom] = useState("");
  const [dateRangeTo, setDateRangeTo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter the transactions based on the selected filters and search query
  const filteredTransactions = transactionsData.filter((transaction) => {
    // Status filter
    const statusMatch =
      Object.values(statusFilter).every((val) => !val) ||
      statusFilter[transaction.status as keyof typeof statusFilter];

    // Date range filter (based on lastLogin)
    let dateMatch = true;
    if (dateRangeFrom || dateRangeTo) {
      const transactionDate = parseDate(transaction.lastLogin);
      const fromDate = dateRangeFrom ? new Date(dateRangeFrom) : null;
      const toDate = dateRangeTo ? new Date(dateRangeTo) : null;
      if (fromDate && transactionDate < fromDate) dateMatch = false;
      if (toDate && transactionDate > toDate) dateMatch = false;
    }

    // Search query filter
    const searchMatch =
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.serviceOffered.toLowerCase().includes(searchQuery.toLowerCase());

    return statusMatch && dateMatch && searchMatch;
  });

  return (
    <>
      <div className="flex justify-between items-center">
        <p className="font-light text-sm">TRANSACTIONS MANAGEMENT</p>
        <Button variant="link" className="text-blue-600 hover:text-blue-800">
          View all Transactions
        </Button>
      </div>
      <div className="relative mt-4 flex items-center">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search for transaction by Client, Booking ID, Provider, or Service"
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
                    statusFilter.Completed ? "border border-gray-400 font-medium" : ""
                  }`}
                  onClick={() =>
                    setStatusFilter((prev) => ({
                      ...prev,
                      Completed: !prev.Completed,
                    }))
                  }
                >
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Completed
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
                    statusFilter.Failed ? "border border-gray-400 font-medium" : ""
                  }`}
                  onClick={() =>
                    setStatusFilter((prev) => ({
                      ...prev,
                      Failed: !prev.Failed,
                    }))
                  }
                >
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Failed
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
            <TableHead>Transaction ID</TableHead>
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
          {filteredTransactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.id}</TableCell>
              <TableCell>{transaction.bookingId}</TableCell>
              <TableCell className="flex items-center gap-1"><Avatar>
                      <AvatarImage src={transaction.image} alt={transaction.clientName} />
                      <AvatarFallback>{transaction.clientName.charAt(0)}</AvatarFallback>
                    </Avatar>{transaction.clientName}</TableCell>
              <TableCell>{transaction.providerName}</TableCell>
              <TableCell>{transaction.serviceOffered}</TableCell>
              <TableCell>{transaction.totalAmount}</TableCell>
              <TableCell>
                <span
                  className={`flex items-center justify-center gap-1 rounded-full ${
                    transaction.status === "Completed"
                      ? "bg-green-100 text-green-600"
                      : transaction.status === "Pending"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      transaction.status === "Completed"
                        ? "bg-green-500"
                        : transaction.status === "Pending"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  />
                  {transaction.status}
                </span>
              </TableCell>
              <TableCell>{transaction.lastLogin}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                <Button variant="ghost"><EllipsisVertical /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem><Eye className="h-4 w-4 mr-2"/>
                  View Details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                  <TbCashBanknote className="h-4 w-4 mr-2"/>
                  Process Payout
                  </DropdownMenuItem>
                  <DropdownMenuSeparator/>
                  <DropdownMenuItem>
                  <BiRotateLeft className="h-4 w-4 mr-2"/>
                  Retry Payment
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