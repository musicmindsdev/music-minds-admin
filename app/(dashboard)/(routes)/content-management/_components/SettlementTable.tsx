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
import { Filter, Search, Calendar, EllipsisVertical, CheckCircle, XCircle } from "lucide-react";
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
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// Types
interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: string;
}

interface SettlementMetadata {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

type SettlementStatus = 
  | 'PENDING' 
  | 'APPROVED' 
  | 'PROCESSING' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'CANCELLED' 
  | 'REJECTED';

interface Settlement {
  id: string;
  walletId: string;
  userId: string;
  amount: number;
  serviceFee: number;
  netAmount: number;
  currency: string;
  status: SettlementStatus;
  requestedAt: string;
  processedAt: string | null;
  completedAt: string | null;
  payoutMethodId: string | null;
  notes: string;
  metadata: SettlementMetadata;
  adminNotes: string;
  processedById: string;
  createdAt: string;
  updatedAt: string;
  stripeTransferId: string;
  stripePayoutId: string | null;
  user: User;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payoutMethod: any | null;
  processedBy: User;
}

interface SettlementAPIResponse {
  id: string;
  walletId: string;
  userId: string;
  amount: number;
  serviceFee: number;
  netAmount: number;
  currency: string;
  status: SettlementStatus;
  requestedAt: string;
  processedAt: string | null;
  completedAt: string | null;
  payoutMethodId: string | null;
  notes: string;
  metadata: SettlementMetadata;
  adminNotes: string;
  processedById: string;
  createdAt: string;
  updatedAt: string;
  stripeTransferId: string;
  stripePayoutId: string | null;
  user: User;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payoutMethod: any | null;
  processedBy: User;
}

interface SettlementsTableProps {
  showCheckboxes?: boolean;
  showPagination?: boolean;
  onActionComplete?: () => void;
}

export default function SettlementsTable({
  showCheckboxes = false,
  showPagination = true,
  onActionComplete,
}: SettlementsTableProps) {
  const [statusFilter, setStatusFilter] = useState<Record<SettlementStatus, boolean>>({
    PENDING: false,
    APPROVED: false,
    PROCESSING: false,
    COMPLETED: false,
    FAILED: false,
    CANCELLED: false,
    REJECTED: false,
  });
  const [dateRangeFrom, setDateRangeFrom] = useState("");
  const [dateRangeTo, setDateRangeTo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSettlements, setSelectedSettlements] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [settlementsData, setSettlementsData] = useState<Settlement[]>([]);
  const [totalSettlements, setTotalSettlements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const settlementsPerPage = 10;

  const fetchSettlements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const status = Object.keys(statusFilter)
        .filter((key) => statusFilter[key as SettlementStatus])
        .join(",");
      
      const query = new URLSearchParams({
        page: currentPage.toString(),
        limit: settlementsPerPage.toString(),
        ...(status && { status }),
        ...(searchQuery && { searchQuery }),
        ...(dateRangeFrom && { fromDate: dateRangeFrom }),
        ...(dateRangeTo && { toDate: dateRangeTo }),
      }).toString();

      const response = await fetch(`/api/settlements?${query}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to fetch settlements (Status: ${response.status})`
        );
      }

      const { data, meta } = await response.json();
      
      setSettlementsData(
        Array.isArray(data)
          ? data.map((settlement: SettlementAPIResponse) => ({
              id: settlement.id,
              walletId: settlement.walletId,
              userId: settlement.userId,
              amount: settlement.amount,
              serviceFee: settlement.serviceFee,
              netAmount: settlement.netAmount,
              currency: settlement.currency,
              status: settlement.status,
              requestedAt: settlement.requestedAt,
              processedAt: settlement.processedAt,
              completedAt: settlement.completedAt,
              payoutMethodId: settlement.payoutMethodId,
              notes: settlement.notes,
              metadata: settlement.metadata,
              adminNotes: settlement.adminNotes,
              processedById: settlement.processedById,
              createdAt: settlement.createdAt,
              updatedAt: settlement.updatedAt,
              stripeTransferId: settlement.stripeTransferId,
              stripePayoutId: settlement.stripePayoutId,
              user: settlement.user,
              payoutMethod: settlement.payoutMethod,
              processedBy: settlement.processedBy,
            }))
          : []
      );
      setTotalSettlements(meta?.total || data?.length || 0);
      setTotalPages(meta?.last_page || Math.ceil((meta?.total || data?.length || 0) / settlementsPerPage));
    } catch (err) {
      console.error("Error fetching settlements:", err);
      setError(
        err instanceof Error
          ? `${err.message}${err.message.includes("Status: 500") ? " - This may be due to a server issue. Please try again later or contact support." : ""}`
          : "An error occurred while fetching settlements"
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchQuery, dateRangeFrom, dateRangeTo, settlementsPerPage]);

  useEffect(() => {
    fetchSettlements();
  }, [fetchSettlements]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSettlements(settlementsData.map((settlement) => settlement.id));
    } else {
      setSelectedSettlements([]);
    }
  };

  const handleSelectSettlement = (settlementId: string, checked: boolean) => {
    if (checked) {
      setSelectedSettlements((prev) => [...prev, settlementId]);
    } else {
      setSelectedSettlements((prev) => prev.filter((id) => id !== settlementId));
    }
  };

  const handleProcessSettlement = async (settlementId: string, status: SettlementStatus) => {
    try {
      const response = await fetch(`/api/settlements/${settlementId}/process`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          adminNotes: `${status} by admin`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to process settlement");
      }

      toast.success(`Settlement ${status.toLowerCase()} successfully`);
      fetchSettlements();
      onActionComplete?.();
    } catch (err) {
      console.error("Failed to process settlement:", err);
      toast.error(err instanceof Error ? err.message : "An error occurred while processing settlement");
    }
  };

  const handleBulkApprove = async () => {
    try {
      for (const settlementId of selectedSettlements) {
        await handleProcessSettlement(settlementId, "APPROVED");
      }
      setSelectedSettlements([]);
    } catch (error) {
      console.error("Failed to bulk approve settlements:", error);
    }
  };

  const handleBulkReject = async () => {
    try {
      for (const settlementId of selectedSettlements) {
        await handleProcessSettlement(settlementId, "REJECTED");
      }
      setSelectedSettlements([]);
    } catch (error) {
      console.error("Failed to bulk reject settlements:", error);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-600",
    APPROVED: "bg-blue-100 text-blue-600",
    PROCESSING: "bg-purple-100 text-purple-600",
    COMPLETED: "bg-green-100 text-green-600",
    FAILED: "bg-red-100 text-red-600",
    CANCELLED: "bg-gray-100 text-gray-600",
    REJECTED: "bg-red-100 text-red-600",
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
        <Button variant="outline" className="mt-4" onClick={fetchSettlements}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="relative mt-4 flex items-center pb-2">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search for user by Name, Email or Settlement ID"
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
              <p className="text-sm font-medium">Settlement Status</p>
              <div className="flex space-x-2 flex-wrap">
                {["PENDING", "APPROVED", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED", "REJECTED"].map((status) => (
                  <Button
                    key={status}
                    variant="ghost"
                    className={`flex items-center gap-1 rounded-full text-sm ${
                      statusFilter[status as SettlementStatus] ? "border border-gray-400 font-medium" : ""
                    }`}
                    onClick={() =>
                      setStatusFilter((prev) => ({
                        ...prev,
                        [status]: !prev[status as SettlementStatus],
                      }))
                    }
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        status === "COMPLETED"
                          ? "bg-green-500"
                          : status === "PENDING" || status === "APPROVED" || status === "PROCESSING"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    />
                    {status}
                  </Button>
                ))}
              </div>
            </div>
            <DropdownMenuSeparator />
            <div className="space-y-2">
              <p className="text-sm font-medium">Requested Date</p>
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

      {selectedSettlements.length > 0 && (
        <div className="flex justify-end space-x-2 mt-2 p-4">
          <Button
            variant="outline"
            size="sm"
            className="text-green-600"
            onClick={handleBulkApprove}
          >
            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600"
            onClick={handleBulkReject}
          >
            <XCircle className="h-4 w-4 mr-2 text-red-600" />
            Reject
          </Button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            {showCheckboxes && (
              <TableHead>
                <Checkbox
                  checked={selectedSettlements.length === settlementsData.length && settlementsData.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
            )}
            <TableHead>Settlement ID</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Net Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Requested Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {settlementsData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showCheckboxes ? 8 : 7} className="text-center">
                No settlements available
              </TableCell>
            </TableRow>
          ) : (
            settlementsData.map((settlement) => (
              <TableRow key={settlement.id}>
                {showCheckboxes && (
                  <TableCell>
                    <Checkbox
                      checked={selectedSettlements.includes(settlement.id)}
                      onCheckedChange={(checked) => handleSelectSettlement(settlement.id, checked as boolean)}
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium">{settlement.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src={settlement.user?.avatar} alt={settlement.user?.username} />
                      <AvatarFallback>{settlement.user?.username?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{settlement.user?.username}</p>
                      <p className="text-sm text-gray-500">{settlement.user?.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">
                      {settlement.currency} {settlement.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Fee: {settlement.currency} {settlement.serviceFee.toFixed(2)}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-green-600">
                  {settlement.currency} {settlement.netAmount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusColors[settlement.status]}`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        settlement.status === "COMPLETED"
                          ? "bg-green-500"
                          : settlement.status === "PENDING" || settlement.status === "APPROVED" || settlement.status === "PROCESSING"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    />
                    {settlement.status}
                  </span>
                </TableCell>
                <TableCell>{new Date(settlement.requestedAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost"><EllipsisVertical /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {settlement.status === "PENDING" && (
                        <>
                          <DropdownMenuItem onClick={() => handleProcessSettlement(settlement.id, "APPROVED")}>
                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleProcessSettlement(settlement.id, "REJECTED")} className="text-red-600">
                            <XCircle className="h-4 w-4 mr-2 text-red-600" />
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}
                      {settlement.status === "APPROVED" && (
                        <DropdownMenuItem onClick={() => handleProcessSettlement(settlement.id, "PROCESSING")}>
                          <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
                          Mark as Processing
                        </DropdownMenuItem>
                      )}
                      {settlement.status === "PROCESSING" && (
                        <DropdownMenuItem onClick={() => handleProcessSettlement(settlement.id, "COMPLETED")}>
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          Mark as Completed
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
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
              Showing {Math.min((currentPage - 1) * settlementsPerPage + 1, totalSettlements)} -{" "}
              {Math.min(currentPage * settlementsPerPage, totalSettlements)} of {totalSettlements}
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
    </>
  );
}