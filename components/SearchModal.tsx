"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CiUser } from "react-icons/ci";
import { LuCalendarClock } from "react-icons/lu";
import { TbReceipt } from "react-icons/tb";
import { TbTicket } from "react-icons/tb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Trash2, X } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface User {
  id: string;
  name: string;
  email: string;
  profileType: string;
  status: string;
  verified: boolean;
  lastLogin: string;
  image: string;
}

interface Booking {
  id: string;
  user: string;
  event: string;
  date: string;
  status: "Confirmed" | "Pending" | "Cancelled";
  amount: string;
}

interface Transaction {
  id: string;
  user: string;
  bookingId: string;
  date: string;
  status: string;
  amount: string;
}

interface SearchModalProps {
  children: React.ReactNode;
  searchQuery: string;
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  bookings: Booking[];
  transactions: Transaction[];
  trigger: React.ReactNode;
}

export default function SearchModal({
  children,
  searchQuery,
  isOpen,
  onClose,
  users,
  bookings,
  transactions,
  trigger,
}: SearchModalProps) {
  console.log("SearchModal isOpen:", isOpen);
  console.log("SearchModal data:", { users, bookings, transactions });

  const [dataType, setDataType] = useState("Users");
  const [status, setStatus] = useState("Active");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [modalSearchQuery, setModalSearchQuery] = useState(searchQuery);

  useEffect(() => {
    if (isOpen) {
      setModalSearchQuery(searchQuery);
    }
  }, [isOpen, searchQuery]);

  const dataTypes = [
    { name: "Users", icon: <CiUser className="w-5 h-5" /> },
    { name: "Bookings", icon: <LuCalendarClock className="w-5 h-5" /> },
    { name: "Transactions", icon: <TbReceipt className="w-5 h-5" /> },
    { name: "Support Tickets", icon: <TbTicket className="w-5 h-5" /> },
  ];

  const filteredUserResults = users.filter(
    (result) =>
      result.name.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
      result.email.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
      result.profileType.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
      result.id.toLowerCase().includes(modalSearchQuery.toLowerCase())
  );

  const filteredBookingResults = bookings.filter(
    (result) =>
      result.id.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
      result.user.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
      result.event.toLowerCase().includes(modalSearchQuery.toLowerCase())
  );

  const filteredTransactionResults = transactions.filter(
    (result) =>
      result.id.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
      result.user.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
      result.bookingId.toLowerCase().includes(modalSearchQuery.toLowerCase())
  );

  const handleClearFilters = () => {
    setDataType("Users");
    setStatus("Active");
    setStartDate("");
    setEndDate("");
    setModalSearchQuery("");
  };

  return (
    <>
      <div>{trigger}</div>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[575px] rounded-lg p-0 bg-background">
          <VisuallyHidden>
            <DialogTitle>Search Modal</DialogTitle>
          </VisuallyHidden>
          <div className="p-2 bg-transparent border-gray-200/50 flex items-center justify-between">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search..."
                value={modalSearchQuery}
                onChange={(e) => setModalSearchQuery(e.target.value)}
                className="pl-10 bg-blue-50 border-none rounded-lg h-10 w-full focus:ring-2 focus:ring-blue-200"
              />
            </div>
              {/* <Button
                variant="ghost"
                size="icon"
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </Button> */}
          </div>

          <div className="p-4 space-y-4 bg-background">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <p className="text-sm font-light">Filter by</p>
                <div className="flex flex-wrap gap-2">
                  {dataTypes.map((type) => (
                    <Button
                      key={type.name}
                      variant={dataType === type.name ? "default" : "outline"}
                      className={`rounded-full px-3 py-1 text-xs flex items-center gap-2 ${
                        dataType === type.name ? "text-white" : "text-gray-700"
                      }`}
                      onClick={() => setDataType(type.name)}
                    >
                      {type.icon}
                      {type.name}
                    </Button>
                  ))}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                    <SelectItem value="Deactivated">Deactivated</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="From: dd/mm/yyyy"
                  className="w-full border rounded-md p-2 text-xs"
                />
              </div>
              <div className="flex-1">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="To: dd/mm/yyyy"
                  className="w-full border rounded-md p-2 text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              {dataType === "Users" && (
                <>
                  <p className="text-xs text-gray-500">
                    {filteredUserResults.length} {filteredUserResults.length === 1 ? "User" : "Users"}
                  </p>
                  {filteredUserResults.length > 0 ? (
                    filteredUserResults.map((result) => (
                      <div key={result.id} className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={result.image} alt={result.name} />
                          <AvatarFallback>{result.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{result.name}</p>
                          <p className="text-xs text-gray-500">{result.email}</p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            result.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : result.status === "Suspended"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {result.status}
                        </span>
                        <p className="text-xs text-gray-500">{result.profileType}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No results found.</p>
                  )}
                </>
              )}

              {dataType === "Bookings" && (
                <>
                  <p className="text-sm text-gray-500">
                    {filteredBookingResults.length} {filteredBookingResults.length === 1 ? "Booking" : "Bookings"}
                  </p>
                  {filteredBookingResults.length > 0 ? (
                    filteredBookingResults.map((result) => (
                      <div key={result.id} className="flex items-center gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{result.id}</p>
                          <p className="text-xs text-gray-500">{result.event}</p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            result.status === "Confirmed"
                              ? "bg-green-100 text-green-700"
                              : result.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {result.status}
                        </span>
                       局.cancelled("Cancelled") ? "bg-red-100 text-red-700" : "bg-red-100 text-red-700";
                        <p className="text-sm font-medium">{result.amount}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No results found.</p>
                  )}
                </>
              )}

              {dataType === "Transactions" && (
                <>
                  <p className="text-sm text-gray-500">
                    {filteredTransactionResults.length} {filteredTransactionResults.length === 1 ? "Transaction" : "Transactions"}
                  </p>
                  {filteredTransactionResults.length > 0 ? (
                    filteredTransactionResults.map((result) => (
                      <div key={result.id} className="flex items-center gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{result.id}</p>
                          <p className="text-xs text-gray-500">{result.user}</p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            result.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : result.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {result.status}
                        </span>
                        <p className="text-sm font-medium">{result.amount}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No results found.</p>
                  )}
                </>
              )}

              {dataType === "Support Tickets" && (
                <p className="text-sm text-gray-500">No results found.</p>
              )}
            </div>

            {(dataType === "Users" || dataType === "Bookings" || dataType === "Transactions") &&
              (filteredUserResults.length > 0 || filteredBookingResults.length > 0 || filteredTransactionResults.length > 0) && (
                <Button variant="link" className="w-full text-blue-600">
                  Show More
                </Button>
              )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}