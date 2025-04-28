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
import { Filter, Search, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

// Mock data for Transactions
const transactionsData = [
  {
    id: "T001",
    user: "Daniel Aderi C.",
    bookingId: "B001",
    date: "19/04/25",
    status: "Completed",
    amount: "$500",
  },
  {
    id: "T002",
    user: "Michael Ajob E.",
    bookingId: "B002",
    date: "12/04/25",
    status: "Pending",
    amount: "$300",
  },
  {
    id: "T003",
    user: "James D. Shola",
    bookingId: "B003",
    date: "19/04/25",
    status: "Failed",
    amount: "$200",
  },
];

// Helper function to parse date string "dd/mm/yy" to Date object
const parseDate = (dateString) => {
  const [day, month, year] = dateString.split("/").map(Number);
  return new Date(2000 + year, month - 1, day);
};

export default function TransactionTable() {
  const [statusFilter, setStatusFilter] = useState({
    Completed: false,
    Pending: false,
    Failed: false,
  });
  const [dateRangeFrom, setDateRangeFrom] = useState("");
  const [dateRangeTo, setDateRangeTo] = useState("");

  // Filter the transactions based on the selected filters
  const filteredTransactions = transactionsData.filter((transaction) => {
    const statusMatch =
      Object.values(statusFilter).every((val) => !val) ||
      statusFilter[transaction.status];
    let dateMatch = true;
    if (dateRangeFrom || dateRangeTo) {
      const transactionDate = parseDate(transaction.date);
      const fromDate = dateRangeFrom ? parseDate(dateRangeFrom) : null;
      const toDate = dateRangeTo ? parseDate(dateRangeTo) : null;
      if (fromDate && transactionDate < fromDate) dateMatch = false;
      if (toDate && transactionDate > toDate) dateMatch = false;
    }
    return statusMatch && dateMatch;
  });

  return (
    <>
      <div className="flex justify-between items-center">
        <p>TRANSACTIONS MANAGEMENT</p>
        <Button variant="link" className="text-blue-600 hover:text-blue-800">
          View all Transactions
        </Button>
      </div>
      <div className="relative mt-4 flex items-center">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search for transaction by User, Booking ID, or ID"
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
            className="w-64 p-4 shadow-lg border border-gray-200 rounded-lg"
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
                    placeholder="dd/mm/yy"
                    value={dateRangeFrom}
                    onChange={(e) => setDateRangeFrom(e.target.value)}
                    className="pl-8"
                  />
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                <div className="relative flex-1">
                  <Input
                    placeholder="dd/mm/yy"
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
            <TableHead>User</TableHead>
            <TableHead>Booking ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTransactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.id}</TableCell>
              <TableCell>{transaction.user}</TableCell>
              <TableCell>{transaction.bookingId}</TableCell>
              <TableCell>{transaction.date}</TableCell>
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
              <TableCell>{transaction.amount}</TableCell>
              <TableCell>
                <Button variant="ghost">...</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}