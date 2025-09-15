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
import { Checkbox } from "@/components/ui/checkbox";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { CiExport } from "react-icons/ci";
import { TbCashBanknote } from "react-icons/tb";
import { BiRotateLeft } from "react-icons/bi";
import Modal from "@/components/Modal";
import ExportModal from "@/components/ExportModal";
import { usePathname, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import TransactionDetailModal from "../../content-management/_components/TransactionDetailModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Define interfaces for API response data
interface ApiTransaction {
  id: string;
  bookingId?: string;
  clientName?: string;
  providerName?: string;
  serviceOffered?: string;
  totalAmount?: string | number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  image?: string;
}

export interface Transaction {
  id: string;
  bookingId: string;
  clientName: string;
  providerName: string;
  serviceOffered: string;
  totalAmount: string;
  status: "Completed" | "Pending" | "Failed";
  lastLogin: string;
  image: string;
}

// Helper function to map API transaction to component transaction
const mapApiTransactionToComponentTransaction = (apiTransaction: ApiTransaction): Transaction => {
  return {
    id: apiTransaction.id,
    bookingId: apiTransaction.bookingId || "N/A",
    clientName: apiTransaction.clientName || "Unknown Client",
    providerName: apiTransaction.providerName || "Unknown Provider",
    serviceOffered: apiTransaction.serviceOffered || "Unknown Service",
    totalAmount: apiTransaction.totalAmount
      ? `$${parseFloat(apiTransaction.totalAmount.toString()).toFixed(2)}`
      : "$0.00",
    status: (apiTransaction.status as "Completed" | "Pending" | "Failed") || "Pending",
    lastLogin: apiTransaction.updatedAt
      ? new Date(apiTransaction.updatedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "Unknown",
    image: apiTransaction.image || "/placeholder-avatar.jpg",
  };
};

interface TransactionTableProps {
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

export default function TransactionTable({
  showCheckboxes = false,
  showPagination = false,
  showExportButton = false,
  onExport,
  headerText = "TRANSACTIONS MANAGEMENT",
}: TransactionTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [statusFilter, setStatusFilter] = useState({
    Completed: false,
    Pending: false,
    Failed: false,
  });
  const [dateRangeFrom, setDateRangeFrom] = useState("");
  const [dateRangeTo, setDateRangeTo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [isProcessPayoutModalOpen, setIsProcessPayoutModalOpen] = useState(false);
  const [isRetryPaymentModalOpen, setIsRetryPaymentModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const transactionsPerPage = 10;

  // Fetch transactions from API
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: transactionsPerPage.toString(),
      });

      const activeStatusFilters = Object.entries(statusFilter)
        .filter(([, isActive]) => isActive)
        .map(([status]) => status);
      if (activeStatusFilters.length > 0) {
        params.append("status", activeStatusFilters.join(","));
      }

      if (dateRangeFrom) {
        params.append("fromDate", new Date(dateRangeFrom).toISOString());
      }
      if (dateRangeTo) {
        params.append("toDate", new Date(dateRangeTo).toISOString());
      }

      const response = await fetch(`/api/transactions?${params}`, {
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error(errorData.error || "Failed to fetch transactions");
      }

      const responseData = await response.json();
      const transactionsData = Array.isArray(responseData.transactions)
        ? responseData.transactions
        : [];
      const mappedTransactions = transactionsData.map(mapApiTransactionToComponentTransaction);
      setTransactions(mappedTransactions);
      setTotalTransactions(responseData.pagination?.total || transactionsData.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, dateRangeFrom, dateRangeTo, router]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Filter transactions client-side for searchQuery
  const filteredTransactions = transactions.filter((transaction) => {
    const query = searchQuery.toLowerCase();
    const searchMatch =
      searchQuery === "" ||
      transaction.id.toLowerCase().includes(query) ||
      transaction.clientName.toLowerCase().includes(query) ||
      transaction.bookingId.toLowerCase().includes(query) ||
      transaction.providerName.toLowerCase().includes(query) ||
      transaction.serviceOffered.toLowerCase().includes(query);

    const statusMatch =
      Object.values(statusFilter).every((val) => !val) ||
      statusFilter[transaction.status as keyof typeof statusFilter];

    let dateMatch = true;
    if (dateRangeFrom || dateRangeTo) {
      const transactionDate = new Date(transaction.lastLogin);
      const fromDate = dateRangeFrom ? new Date(dateRangeFrom) : null;
      const toDate = dateRangeTo ? new Date(dateRangeTo) : null;
      if (fromDate) {
        fromDate.setHours(0, 0, 0, 0);
        if (transactionDate < fromDate) dateMatch = false;
      }
      if (toDate) {
        toDate.setHours(23, 59, 59, 999);
        if (transactionDate > toDate) dateMatch = false;
      }
    }

    return searchMatch && statusMatch && dateMatch;
  });

  const totalPages = Math.ceil(totalTransactions / transactionsPerPage);
  const startIndex = (currentPage - 1) * transactionsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + transactionsPerPage
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTransactions(paginatedTransactions.map((transaction) => transaction.id));
    } else {
      setSelectedTransactions([]);
    }
  };

  const handleSelectTransaction = (transactionId: string, checked: boolean) => {
    if (checked) {
      setSelectedTransactions((prev) => [...prev, transactionId]);
    } else {
      setSelectedTransactions((prev) => prev.filter((id) => id !== transactionId));
    }
  };

  useEffect(() => {
    setSelectedTransactions([]);
  }, [currentPage]);

  const handleViewAll = () => {
    if (pathname !== "/transactions") {
      router.push("/transactions");
    }
  };

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailsModalOpen(true);
  };

  const handleProcessPayout = async () => {
    try {
      for (const transactionId of selectedTransactions) {
        const response = await fetch(`/api/transactions/${transactionId}/payout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to process payout");
        }
      }

      setSelectedTransactions([]);
      setIsProcessPayoutModalOpen(false);
      fetchTransactions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process payouts");
    }
  };

  const handleRetryPayment = async () => {
    try {
      for (const transactionId of selectedTransactions) {
        const response = await fetch(`/api/transactions/${transactionId}/retry`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to retry payment");
        }
      }

      setSelectedTransactions([]);
      setIsRetryPaymentModalOpen(false);
      fetchTransactions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to retry payments");
    }
  };

  const openProcessPayoutModal = () => {
    setIsProcessPayoutModalOpen(true);
  };

  const closeProcessPayoutModal = () => {
    setIsProcessPayoutModalOpen(false);
  };

  const openRetryPaymentModal = () => {
    setIsRetryPaymentModalOpen(true);
  };

  const closeRetryPaymentModal = () => {
    setIsRetryPaymentModalOpen(false);
  };

  const handleExport = (data: {
    statusFilter: Record<string, boolean>;
    dateRangeFrom: string;
    dateRangeTo: string;
    format: string;
    fields: Record<string, boolean>;
  }) => {
    onExport?.(data);
    console.log("Exporting transaction data:", data);
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <p className="font-light text-sm">{headerText}</p>
          <div className="flex space-x-2">
            {pathname !== "/transactions" && pathname !== "/content-management/transactions" && (
              <Button
                variant="link"
                className="text-blue-600 hover:text-blue-800"
                onClick={handleViewAll}
              >
                View all Transactions
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
          <div className="flex space-x-2">
            {pathname !== "/transactions" && pathname !== "/content-management/transactions" && (
              <Button
                variant="link"
                className="text-blue-600 hover:text-blue-800"
                onClick={handleViewAll}
              >
                View all Transactions
              </Button>
            )}
          </div>
        </div>
        <div className="text-center py-8 text-red-500">
          Error: {error}
          <Button onClick={fetchTransactions} className="ml-4" variant="outline">
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
          {pathname !== "/transactions" && pathname !== "/content-management/transactions" && (
            <Button
              variant="link"
              className="text-blue-600 hover:text-blue-800"
              onClick={handleViewAll}
            >
              View all Transactions
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

      {selectedTransactions.length > 0 && (
        <div className="flex justify-end space-x-2 mt-2 p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={openProcessPayoutModal}
            className="text-green-600"
          >
            <TbCashBanknote className="h-4 w-4 mr-2 text-green-600" />
            Process Payout
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={openRetryPaymentModal}
            className="text-yellow-600"
          >
            <BiRotateLeft className="h-4 w-4 mr-2 text-yellow-600" />
            Retry Payment
          </Button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            {showCheckboxes && (
              <TableHead>
                <Checkbox
                  checked={
                    selectedTransactions.length === paginatedTransactions.length &&
                    paginatedTransactions.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
            )}
            <TableHead>Transaction ID</TableHead>
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
          {paginatedTransactions.map((transaction) => (
            <TableRow key={transaction.id}>
              {showCheckboxes && (
                <TableCell>
                  <Checkbox
                    checked={selectedTransactions.includes(transaction.id)}
                    onCheckedChange={(checked) =>
                      handleSelectTransaction(transaction.id, checked as boolean)
                    }
                  />
                </TableCell>
              )}
              <TableCell>{transaction.id}</TableCell>
              <TableCell>{transaction.bookingId}</TableCell>
              <TableCell className="flex items-center gap-1">
                <Avatar>
                  <AvatarImage src={transaction.image} alt={transaction.clientName} />
                  <AvatarFallback>{transaction.clientName.charAt(0)}</AvatarFallback>
                </Avatar>
                {transaction.clientName}
              </TableCell>
              <TableCell>{transaction.providerName}</TableCell>
              <TableCell>{transaction.serviceOffered}</TableCell>
              <TableCell>{transaction.totalAmount}</TableCell>
              <TableCell>
                <span
                  className={`flex items-center justify-center gap-1 rounded-full px-2 py-1 text-xs ${
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
                    <Button variant="ghost">
                      <EllipsisVertical />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewDetails(transaction)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={openProcessPayoutModal}>
                      <TbCashBanknote className="h-4 w-4 mr-2" />
                      Process Payout
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={openRetryPaymentModal}>
                      <BiRotateLeft className="h-4 w-4 mr-2" />
                      Retry Payment
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {paginatedTransactions.length === 0 && (
            <TableRow>
              <TableCell colSpan={showCheckboxes ? 10 : 9} className="text-center text-sm text-gray-500">
                {searchQuery || Object.values(statusFilter).some((val) => val) || dateRangeFrom || dateRangeTo
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "No transaction data available yet."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {showPagination && (
        <div className="flex justify-between items-center mt-4">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <IoIosArrowForward />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-sm">
              Showing {startIndex + 1} - {Math.min(startIndex + transactionsPerPage, totalTransactions)} of {totalTransactions}
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
              <Button className="text-white" size="sm" onClick={() => setCurrentPage(currentPage)}>
                Go
              </Button>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={isProcessPayoutModalOpen}
        onClose={closeProcessPayoutModal}
        title="Process Payout"
        icon={<TbCashBanknote className="h-8 w-8 text-green-500" />}
        iconBgColor="#D6FCE0"
        message1="Processing Payout?"
        message="Are you sure you want to process the payout for the selected transactions?"
        cancelText="No, I don't"
        confirmText="Yes, process"
        confirmButtonColor="#00A424"
        onConfirm={handleProcessPayout}
      />

      <Modal
        isOpen={isRetryPaymentModalOpen}
        onClose={closeRetryPaymentModal}
        title="Retry Payment"
        icon={<BiRotateLeft className="h-8 w-8 text-yellow-500" />}
        iconBgColor="#FEF9C3"
        message1="Retrying Payment?"
        message="Are you sure you want to retry payment for the selected transactions?"
        cancelText="No, I don't"
        confirmText="Yes, retry"
        confirmButtonColor="#EAB308"
        onConfirm={handleRetryPayment}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Data"
        statusFilters={[
          { label: "Completed", value: "Completed" },
          { label: "Pending", value: "Pending" },
          { label: "Failed", value: "Failed" },
        ]}
        roleFilters={[]}
        fieldOptions={[
          { label: "Transaction ID", value: "Transaction ID" },
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
            <TransactionDetailModal
              isOpen={isDetailsModalOpen}
              onClose={() => setIsDetailsModalOpen(false)}
              transaction={selectedTransaction}
            />
          </div>
        </div>
      )}
    </>
  );
}