"use client";

import { useState, useEffect } from "react";
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
import { adminTeamData } from "../../user-management/_components/AdminTable";

// Helper function to parse date string "DD/MM/YY • HH:MM AM/PM" to Date object
const parseDate = (dateString: string): Date => {
  const [datePart, timePart] = dateString.split(" • ");
  const [day, month, year] = datePart.split("/").map(Number);
  const [time, period] = timePart.split(" ");
  const [hours, minutes] = time.split(":").map(Number);
  let adjustedHours = hours;
  if (period === "PM" && hours !== 12) adjustedHours += 12;
  if (period === "AM" && hours === 12) adjustedHours = 0;
  return new Date(2000 + year, month - 1, day, adjustedHours, minutes);
};

type AuditLogEntry = {
    id: string;
    action: string;
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role: string;
    };
    role: string;
    timestamp: string;
  };
  
  

// Helper function to map admin actions to audit logs with dynamic timestamps
const getAuditLogFromAdminAction = (
    admin: (typeof adminTeamData)[number],
    index: number
  ): AuditLogEntry => {
    const actions = [
      "Password Reset",
      "Article Published",
      "Responded to support",
      "Suspended",
      "Activated",
    ];
  
    const baseDate = new Date("2025-06-03T01:20:00");
    baseDate.setHours(baseDate.getHours() - index);
  
    const formattedDate = `${String(baseDate.getDate()).padStart(2, "0")}/${String(baseDate.getMonth() + 1).padStart(2, "0")}/${String(
      baseDate.getFullYear() - 2000
    )} • ${baseDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`;
  
    return {
      id: `Usr03..dS8_${admin.id}`,
      action: actions[Math.floor(Math.random() * actions.length)],
      user: admin,
      role: admin.role,
      timestamp: formattedDate,
    };
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
    "Password Reset": false,
    "Article Published": false,
    "Responded to support": false,
    "Suspended": false,
    "Activated": false,
  });
  const [dateRangeFrom, setDateRangeFrom] = useState("");
  const [dateRangeTo, setDateRangeTo] = useState("");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 7; // Matches the design's visible rows

  // Generate audit logs from admin team data with dynamic timestamps
  const generatedLogs = adminTeamData.map((admin, index) => getAuditLogFromAdminAction(admin, index));

  const filteredLogs = generatedLogs.filter((log) => {
    const query = searchQuery.toLowerCase();
    const searchMatch =
      searchQuery === "" ||
      log.id.toLowerCase().includes(query) ||
      log.user.name.toLowerCase().includes(query) ||
      log.user.email.toLowerCase().includes(query) ||
      log.action.toLowerCase().includes(query);

    const actionTypeMatch =
      Object.values(actionTypeFilter).every((val) => !val) ||
      actionTypeFilter[log.action as keyof typeof actionTypeFilter];

    let dateMatch = true;
    if (dateRangeFrom || dateRangeTo) {
      const logDate = parseDate(log.timestamp);
      const fromDate = dateRangeFrom ? new Date(dateRangeFrom) : null;
      const toDate = dateRangeTo ? new Date(dateRangeTo) : null;
      if (fromDate) {
        fromDate.setHours(0, 0, 0, 0);
        if (logDate < fromDate) dateMatch = false;
      }
      if (toDate) {
        toDate.setHours(23, 59, 59, 999);
        if (logDate > toDate) dateMatch = false;
      }
    }

    return searchMatch && actionTypeMatch && dateMatch;
  });

  const totalLogs = filteredLogs.length;
  const totalPages = Math.ceil(totalLogs / logsPerPage);
  const startIndex = (currentPage - 1) * logsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + logsPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLogs(paginatedLogs.map((log) => log.id));
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
    setSelectedLogs([]);
  }, [currentPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
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

  const handleViewDetails = (log: AuditLogEntry) => {
    console.log("Viewing details for audit log:", log);
    // Add modal or navigation logic for viewing details if needed
  };
  

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="font-light text-sm">{headerText}</p>
        <div className="flex space-x-2">
          {showExportButton && (
            <Button
              className=" flex items-center space-x-2 rounded-lg"
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
          placeholder="Search for review by ID, Provider Name, or Text"
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
      <Table>
        <TableHeader>
          <TableRow>
            {showCheckboxes && (
              <TableHead>
                <Checkbox
                  checked={selectedLogs.length === paginatedLogs.length && paginatedLogs.length > 0}
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
          {paginatedLogs.map((log) => (
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
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={log.user.image} alt={log.user.name} />
                    <AvatarFallback>{log.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{log.user.name}</span>
                </div>
              </TableCell>
              <TableCell>{log.role}</TableCell>
              <TableCell>{log.timestamp}</TableCell>
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
      {showPagination && (
        <div className="flex justify-between items-center mt-4">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-gray-300  hover:bg-gray-100"
            >
              <IoIosArrowBack />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => goToPage(page)}
                className={`border-gray-300  hover:bg-gray-100 ${
                  currentPage === page ? "" : ""
                }`}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-gray-300  hover:bg-gray-100"
            >
              <IoIosArrowForward />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-sm ">
              Showing {startIndex + 1} - {Math.min(startIndex + logsPerPage, totalLogs)} of {totalLogs}
            </p>
            <div className="flex items-center space-x-2">
              <p className="text-sm ">Go to page:</p>
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
    </>
  );
}