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
import { Search, Filter, Calendar, Eye, EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { CiExport } from "react-icons/ci";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ExportModal from "@/components/ExportModal";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type AuditLogEntry = {
  id: string;
  action: string;
  userId: string | null;
  role: string | null;
  time: string;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  metadata: unknown | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    image?: string;
  } | null;
};

interface AuditLogsTableProps {
  showCheckboxes?: boolean;
  showPagination?: boolean;
  showExportButton?: boolean;
  onExport?: (data: {
    dateRangeFrom: string;
    dateRangeTo: string;
    format: string;
    fields: Record<string, boolean>;
  }) => void;
  headerText?: string;
}

export default function AuditLogsTable({
  showCheckboxes = true,
  showPagination = true,
  showExportButton = true,
  onExport,
  headerText = "Audit Logs",
}: AuditLogsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionTypeFilter, setActionTypeFilter] = useState({
    "Admin Login": false,
    "Password Reset": false,
    "Article Published": false,
    "Responded to support": false,
    Suspended: false,
    Activated: false,
  });
  const [dateRangeFrom, setDateRangeFrom] = useState("");
  const [dateRangeTo, setDateRangeTo] = useState("");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const logsPerPage = 7;

  const formatTimestamp = (isoTimestamp: string): string => {
    const date = new Date(isoTimestamp);
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(
      date.getFullYear() - 2000
    )} • ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`;
  };

  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const selectedActions = Object.keys(actionTypeFilter)
        .filter((key) => actionTypeFilter[key as keyof typeof actionTypeFilter])
        .join(",");
      const query = new URLSearchParams({
        ...(selectedActions && { action: selectedActions }),
        ...(searchQuery && { search: searchQuery }),
        ...(dateRangeFrom && { startTime: new Date(dateRangeFrom).toISOString() }),
        ...(dateRangeTo && { endTime: new Date(dateRangeTo).toISOString() }),
        page: currentPage.toString(),
        limit: logsPerPage.toString(),
      }).toString();

      console.log("Fetching audit logs with query:", query);

      const response = await fetch(`/api/audit-logs?${query}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      console.log("Audit logs API response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Failed to parse backend error response",
        }));
        const errorMessage = errorData.error || `Failed to fetch audit logs (Status: ${response.status})`;
        console.error("Audit logs error response:", errorData);
        setError(errorMessage);
        if (response.status === 401) {
          setError("Please log in to view audit logs");
        }
        toast.error(errorMessage, { position: "top-right", duration: 5000 });
        return;
      }

      const data = await response.json();
      console.log("Audit logs response data:", data);

      setLogs(
        (data.data || []).map((log: AuditLogEntry) => ({
          ...log,
          time: formatTimestamp(log.time),
        }))
      );
      setTotalLogs(data.meta?.total || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch audit logs";
      console.error("Fetch audit logs error:", err);
      setError(errorMessage);
      toast.error(errorMessage, { position: "top-right", duration: 5000 });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, actionTypeFilter, dateRangeFrom, dateRangeTo, currentPage]);

  const handleViewDetails = async (log: AuditLogEntry) => {
    try {
      setIsDetailsModalOpen(true);
      setSelectedLog(null);

      const response = await fetch(`/api/audit-logs/${log.id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      console.log("Audit log details API response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Failed to parse backend error response",
        }));
        const errorMessage = errorData.error || `Failed to fetch audit log details (Status: ${response.status})`;
        console.error("Audit log details error response:", errorData);
        toast.error(errorMessage, { position: "top-right", duration: 5000 });
        return;
      }

      const data = await response.json();
      console.log("Audit log details response data:", data);
      setSelectedLog({
        ...data.data,
        time: formatTimestamp(data.data.time),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch audit log details";
      console.error("Fetch audit log details error:", err);
      toast.error(errorMessage, { position: "top-right", duration: 5000 });
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLogs(logs.map((log) => log.id));
    } else {
      setSelectedLogs([]);
    }
  };

  const handleSelectLog = (logId: string, checked: boolean) => {
    if (checked) {
      setSelectedLogs((prev) => [...prev, logId]);
    } else {
      setSelectedLogs((prev) => prev.filter((id) => id !== logId));
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  useEffect(() => {
    setSelectedLogs([]);
  }, [currentPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= Math.ceil(totalLogs / logsPerPage)) {
      setCurrentPage(page);
    }
  };

  const handleExport = (data: {
    dateRangeFrom: string;
    dateRangeTo: string;
    format: string;
    fields: Record<string, boolean>;
  }) => {
    onExport?.(data);
    console.log("Exporting audit logs data:", data);
  };

  // Generate pagination buttons (only 1, 2, 3)
  const totalPages = Math.ceil(totalLogs / logsPerPage);
  const pageButtons: (number | string)[] = Array.from(
    { length: Math.min(totalPages, 3) },
    (_, i) => i + 1
  );
  if (totalPages > 3) {
    pageButtons.push("...");
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="font-light text-sm">{headerText}</p>
        <div className="flex space-x-2">
          {showExportButton && (
            <Button
              className="flex items-center space-x-2 rounded-lg"
              onClick={() => setIsExportModalOpen(true)}
            >
              <CiExport className="mr-2" />
              <span>Export Data</span>
            </Button>
          )}
        </div>
      </div>
      <div className="relative mb-4 flex items-center">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search for log by ID, User Name, Email, or Action"
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
              <p className="text-sm font-medium">Action Type</p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(actionTypeFilter).map((action) => (
                  <Button
                    key={action}
                    variant="ghost"
                    className={`flex items-center gap-1 rounded-full text-sm ${
                      actionTypeFilter[action as keyof typeof actionTypeFilter]
                        ? "border border-gray-400 font-medium"
                        : ""
                    }`}
                    onClick={() =>
                      setActionTypeFilter((prev) => ({
                        ...prev,
                        [action]: !prev[action as keyof typeof actionTypeFilter],
                      }))
                    }
                  >
                    <span className="h-2 w-2 rounded-full" />
                    {action}
                  </Button>
                ))}
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
      {error ? (
        <div className="flex flex-col items-center py-4">
          <p className="text-red-500 text-sm">{error}</p>
          {error.includes("log in") ? (
            <Button asChild variant="outline" size="sm" className="mt-2">
              <a href="/login">Log In</a>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={fetchAuditLogs}
            >
              Retry
            </Button>
          )}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {showCheckboxes && (
                <TableHead>
                  <Checkbox
                    checked={selectedLogs.length === logs.length && logs.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              <TableHead>Log ID</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: logsPerPage }).map((_, index) => (
                  <TableRow key={index}>
                    {showCheckboxes && (
                      <TableCell>
                        <Skeleton className="h-4 w-4" />
                      </TableCell>
                    )}
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-8" />
                    </TableCell>
                  </TableRow>
                ))
              : logs.map((log) => (
                  <TableRow key={log.id}>
                    {showCheckboxes && (
                      <TableCell>
                        <Checkbox
                          checked={selectedLogs.includes(log.id)}
                          onCheckedChange={(checked) => handleSelectLog(log.id, checked as boolean)}
                        />
                      </TableCell>
                    )}
                    <TableCell>{log.id}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {log.user ? (
                          <>
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={log.user.image || undefined} alt={log.user.name} />
                              <AvatarFallback>{log.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{log.user.name}</span>
                          </>
                        ) : (
                          <span>Unknown User</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{log.user?.role || log.role || "N/A"}</TableCell>
                    <TableCell>{log.time}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <EllipsisVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(log)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      )}
      {showPagination && !error && (
        <div className="flex justify-between items-center mt-4">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-gray-300 hover:bg-gray-100"
            >
              <IoIosArrowBack />
            </Button>
            {pageButtons.map((page, index) => (
              <Button
                key={index}
                variant={page === currentPage ? "default" : page === "..." ? "ghost" : "outline"}
                size="sm"
                onClick={() => typeof page === "number" && goToPage(page)}
                className={`border-gray-300 hover:bg-gray-100 ${page === "..." ? "cursor-default" : ""}`}
                disabled={page === "..."}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-gray-300 hover:bg-gray-100"
            >
              <IoIosArrowForward />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-sm">
              Showing {(currentPage - 1) * logsPerPage + 1} -{" "}
              {Math.min(currentPage * logsPerPage, totalLogs)} of {totalLogs}
            </p>
            <div className="flex items-center space-x-2">
              <p className="text-sm">Go to page:</p>
              <Input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => goToPage(Number(e.target.value))}
                className="w-16 p-1 border border-gray-300 rounded"
              />
              <Button
                className="rounded px-2 py-1"
                size="sm"
                onClick={() => goToPage(currentPage)}
              >
                Go
              </Button>
            </div>
          </div>
        </div>
      )}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Audit Logs"
        statusFilters={[]}
        roleFilters={[]}
        fieldOptions={[
          { label: "Log ID", value: "Log ID" },
          { label: "Action", value: "Action" },
          { label: "User", value: "User" },
          { label: "Role", value: "Role" },
          { label: "Timestamp", value: "Timestamp" },
        ]}
        onExport={handleExport}
      />
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              {selectedLog ? (
                <div className="space-y-2">
                  <p><strong>Log ID:</strong> {selectedLog.id}</p>
                  <p><strong>Action:</strong> {selectedLog.action}</p>
                  <p><strong>User:</strong> {selectedLog.user ? `${selectedLog.user.name} (${selectedLog.user.email})` : "Unknown User"}</p>
                  <p><strong>Role:</strong> {selectedLog.user?.role || selectedLog.role || "N/A"}</p>
                  <p><strong>Timestamp:</strong> {selectedLog.time}</p>
                  <p><strong>IP Address:</strong> {selectedLog.ipAddress}</p>
                  <p><strong>User Agent:</strong> {selectedLog.userAgent}</p>
                  <p><strong>Details:</strong> {JSON.stringify(selectedLog.details, null, 2)}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-72" />
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-4 w-80" />
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}