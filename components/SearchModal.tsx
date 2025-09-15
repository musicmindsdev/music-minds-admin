"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogOverlay } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CiUser } from "react-icons/ci";
import { LuCalendarClock } from "react-icons/lu";
import { TbReceipt } from "react-icons/tb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Trash2 } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useRouter } from "next/navigation";

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
  clientName: string;
  clientEmail: string;
  providerName: string;
  providerEmail: string;
  serviceOffered: string;
  scheduledDate: string;
  scheduledTime: string;
  location: string;
  totalAmount: string;
  status: string;
  lastLogin: string;
  paymentAmount: string;
  platformFee: string;
  transactionId: string;
}

interface Transaction {
  id: string;
  bookingId: string;
  clientName: string;
  providerName: string;
  serviceOffered: string;
  totalAmount: string;
  status: string;
  lastLogin: string;
  image: string;
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
  searchQuery,
  isOpen,
  onClose,
  users: initialUsers = [], 
  bookings: initialBookings = [], 
  transactions: initialTransactions = [],
  trigger,
}: SearchModalProps) {
  const router = useRouter();
  const [dataType, setDataType] = useState<string | null>(null);
  const [status, setStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [modalSearchQuery, setModalSearchQuery] = useState(searchQuery);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusOptions: { [key: string]: string[] } = {
    Users: ["Active", "Suspended", "Deactivated"],
    Bookings: ["Confirmed", "Pending", "Cancelled"],
    Transactions: ["Completed", "Pending", "Failed"],
  };

  const dataTypes = [
    { name: "Users", icon: <CiUser className="w-5 h-5" /> },
    { name: "Bookings", icon: <LuCalendarClock className="w-5 h-5" /> },
    { name: "Transactions", icon: <TbReceipt className="w-5 h-5" /> },
  ];

  // Fetch data from APIs
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch Users
        const usersResponse = await fetch(
          `/api/users?page=1&limit=10${status !== "all" && dataType === "Users" ? `&status=${status}` : ""}`
        );
        if (!usersResponse.ok) {
          const errorData = await usersResponse.json();
          throw new Error(errorData.error || "Failed to fetch users");
        }
        const usersData = await usersResponse.json();
        console.log("Users API response:", usersData); // Debug log
        setUsers(Array.isArray(usersData.users) ? usersData.users : []);

        // Fetch Bookings
        const bookingsResponse = await fetch(
          `/api/bookings?page=1&limit=10${status !== "all" && dataType === "Bookings" ? `&status=${status}` : ""}${
            startDate ? `&fromDate=${startDate}` : ""
          }${endDate ? `&toDate=${endDate}` : ""}`
        );
        if (!bookingsResponse.ok) {
          const errorData = await bookingsResponse.json();
          throw new Error(errorData.error || "Failed to fetch bookings");
        }
        const bookingsData = await bookingsResponse.json();
        console.log("Bookings API response:", bookingsData); // Debug log
        setBookings(Array.isArray(bookingsData.data) ? bookingsData.data : []);

        // Transactions (using initial mock data until endpoint provided)
        setTransactions(initialTransactions);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        setUsers([]);
        setBookings([]);
        setTransactions(initialTransactions);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, dataType, status, startDate, endDate, initialUsers, initialBookings, initialTransactions]);

  // Client-side filtering for search query, limited to first 5 results
  const filteredUserResults = users
    .filter(
      (result) =>
        (result.name.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
         result.email.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
         result.profileType.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
         result.id.toLowerCase().includes(modalSearchQuery.toLowerCase())) &&
        (status === "all" || result.status.toLowerCase() === status.toLowerCase())
    )
    .slice(0, 5); // Limit to first 5 users

  const filteredBookingResults = bookings
    .filter(
      (result) =>
        (result.id.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
         result.clientName.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
         result.serviceOffered.toLowerCase().includes(modalSearchQuery.toLowerCase())) &&
        (status === "all" || result.status.toLowerCase() === status.toLowerCase())
    )
    .slice(0, 5); // Limit to first 5 bookings

  const filteredTransactionResults = transactions
    .filter(
      (result) =>
        (result.id.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
         result.clientName.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
         result.bookingId.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
         result.providerName.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
         result.serviceOffered.toLowerCase().includes(modalSearchQuery.toLowerCase())) &&
        (status === "all" || result.status.toLowerCase() === status.toLowerCase())
    )
    .slice(0, 5); // Limit to first 5 transactions

  useEffect(() => {
    if (isOpen) {
      setDataType(null);
      setModalSearchQuery(searchQuery);
      setStatus("all");
      setStartDate("");
      setEndDate("");
    }
  }, [isOpen, searchQuery]);

  useEffect(() => {
    setStatus("all");
  }, [dataType]);

  const handleClearFilters = () => {
    setDataType(null);
    setStatus("all");
    setStartDate("");
    setEndDate("");
    setModalSearchQuery("");
  };

  const handleUsers = () => {
    router.push("/user-management");
    onClose();
  };

  const handleBookings = () => {
    router.push("/content-management");
    onClose();
  };

  const handleTransactions = () => {
    router.push("/content-management/transactions");
    onClose();
  };

  return (
    <>
      <div>{trigger}</div>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogOverlay className="backdrop-blur-xs" />
        <DialogContent className="sm:max-w-[575px] border-none rounded-lg p-0 bg-transparent">
          <VisuallyHidden>
            <DialogTitle>Search Modal</DialogTitle>
          </VisuallyHidden>
          <div className="p-1 flex items-center justify-between">
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
          </div>

          <div className="p-4 space-y-4 bg-background rounded-2xl">
            {loading && <p className="text-sm text-gray-500">Loading...</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
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
                    <SelectItem value="all">All</SelectItem>
                    {dataType && statusOptions[dataType] ? (
                      statusOptions[dataType].map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-data-type" disabled>
                        Select a data type to filter by status
                      </SelectItem>
                    )}
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

            <div className="space-y-6 max-h-[400px] overflow-y-auto">
              {dataType === null ? (
                <>
                  <div className="space-y-2">
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
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="text-sm font-medium">{result.name}</p>
                                <p className="text-xs text-gray-500">{result.email}</p>
                              </div>
                              <span
                                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                                  result.status === "Active"
                                    ? "bg-green-100 text-green-700"
                                    : result.status === "Suspended"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    result.status === "Active"
                                      ? "bg-green-500"
                                      : result.status === "Suspended"
                                      ? "bg-yellow-500"
                                      : "bg-gray-500"
                                  }`}
                                />
                                {result.status}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">{result.profileType}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No users found.</p>
                    )}
                    {filteredUserResults.length > 0 && (
                      <Button variant="link" className="w-full text-blue-600" onClick={handleUsers}>
                        Show More Users
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">
                      {filteredBookingResults.length} {filteredBookingResults.length === 1 ? "Booking" : "Bookings"}
                    </p>
                    {filteredBookingResults.length > 0 ? (
                      filteredBookingResults.map((result) => (
                        <div key={result.id} className="flex items-center justify-between gap-2">
                          <div className="flex gap-3">
                            <LuCalendarClock className="w-5 h-5 text-gray-500" />
                            <p className="text-sm font-light">{result.id}</p>
                            <span
                              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                                result.status === "CONFIRMED"
                                  ? "bg-green-100 text-green-700"
                                  : result.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : result.status === "CANCELLED"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-blue-100 text-blue-600"
                              }`}
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  result.status === "CONFIRMED"
                                    ? "bg-green-500"
                                    : result.status === "PENDING"
                                    ? "bg-yellow-500"
                                    : result.status === "CANCELLED" ? "bg-red-500" : "bg-blue-500"
                                  }`}
                              />
                              {result.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="text-sm font-light">{result.totalAmount}</p>
                            <span className="text-gray-500">•</span>
                            <p className="text-sm text-gray-500">{result.serviceOffered}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No bookings found.</p>
                    )}
                    {filteredBookingResults.length > 0 && (
                      <Button variant="link" className="w-full text-blue-600" onClick={handleBookings}>
                        Show More Bookings
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">
                      {filteredTransactionResults.length} {filteredTransactionResults.length === 1 ? "Transaction" : "Transactions"}
                    </p>
                    {filteredTransactionResults.length > 0 ? (
                      filteredTransactionResults.map((result) => (
                        <div key={result.id} className="flex items-center justify-between gap-2">
                          <div className="flex gap-2 items-center">
                            <TbReceipt className="w-5 h-5 text-gray-500" />
                            <p className="text-sm font-light text-blue">{result.id}</p>
                            <span
                              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                                result.status === "Completed"
                                  ? "bg-green-100 text-green-700"
                                  : result.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  result.status === "Completed"
                                    ? "bg-green-500"
                                    : result.status === "Pending"
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                  }`}
                              />
                              {result.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="text-sm font-light">{result.totalAmount}</p>
                            <p className="text-sm text-gray-500">{result.lastLogin}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No transactions found.</p>
                    )}
                    {filteredTransactionResults.length > 0 && (
                      <Button variant="link" className="w-full text-blue-600" onClick={handleTransactions}>
                        Show More Transactions
                      </Button>
                    )}
                  </div>
                </>
              ) : (
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
                              <div className="flex items-center gap-3">
                                <div>
                                  <p className="text-sm font-medium">{result.name}</p>
                                  <p className="text-xs text-gray-500">{result.email}</p>
                                </div>
                                <span
                                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                                    result.status === "Active"
                                      ? "bg-green-100 text-green-700"
                                      : result.status === "Suspended"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  <span
                                    className={`h-2 w-2 rounded-full ${
                                      result.status === "Active"
                                        ? "bg-green-500"
                                        : result.status === "Suspended"
                                        ? "bg-yellow-500"
                                        : "bg-gray-500"
                                    }`}
                                  />
                                  {result.status}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">{result.profileType}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No users found.</p>
                      )}
                      {filteredUserResults.length > 0 && (
                        <Button variant="link" className="w-full text-blue-600" onClick={handleUsers}>
                          Show More Users
                        </Button>
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
                          <div key={result.id} className="flex items-center justify-between gap-2">
                            <div className="flex gap-3">
                              <LuCalendarClock className="w-5 h-5 text-gray-500" />
                              <p className="text-sm font-light">{result.id}</p>
                              <span
                                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                                  result.status === "Confirmed"
                                    ? "bg-green-100 text-green-700"
                                    : result.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                 <span
                                  className={`h-2 w-2 rounded-full ${
                                    result.status === "Completed"
                                      ? "bg-green-500"
                                      : result.status === "Pending"
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                  }`}
                                />
                                {result.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="text-sm font-light">{result.totalAmount}</p>
                              <span className="text-gray-500">•</span>
                              <p className="text-sm text-gray-500">{result.serviceOffered}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No bookings found.</p>
                      )}
                      {filteredBookingResults.length > 0 && (
                        <Button variant="link" className="w-full text-blue-600" onClick={handleBookings}>
                          Show More Bookings
                        </Button>
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
                          <div key={result.id} className="flex items-center justify-between gap-2">
                            <div className="flex gap-2 items-center">
                              <TbReceipt className="w-5 h-5 text-gray-500" />
                              <p className="text-sm font-light text-blue">{result.id}</p>
                              <span
                                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                                  result.status === "Completed"
                                    ? "bg-green-100 text-green-700"
                                    : result.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    result.status === "Completed"
                                      ? "bg-green-500"
                                      : result.status === "Pending"
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                  }`}
                                />
                                {result.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="text-sm font-light">{result.totalAmount}</p>
                              <p className="text-sm text-gray-500">{result.lastLogin}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No transactions found.</p>
                      )}
                      {filteredTransactionResults.length > 0 && (
                        <Button variant="link" className="w-full text-blue-600" onClick={handleTransactions}>
                          Show More Transactions
                        </Button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}