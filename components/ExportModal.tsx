"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  tabs?: { value: string; label: string }[];
  defaultTab?: string;
  statusFilters?: { label: string; value: string }[];
  priorityFilters?: { label: string; value: string }[];
  messageTypeFilters?: { label: string; value: string }[];
  recipientTypeFilters?: { label: string; value: string }[];
  roleFilters?: { label: string; value: string }[];
  fieldOptions: { label: string; value: string }[];
  adminRoleOptions?: { label: string; value: string }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  dataType: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFetchAllData?: (dateRangeFrom: string, dateRangeTo: string) => Promise<any[]>;
}

export default function ExportModal({
  isOpen,
  onClose,
  title,
  tabs = [{ value: "members", label: "Members" }],
  defaultTab = "members",
  statusFilters = [],
  priorityFilters = [],
  messageTypeFilters = [],
  recipientTypeFilters = [],
  roleFilters = [],
  fieldOptions,
  adminRoleOptions = [],
  data,
  dataType,
  onFetchAllData,
}: ExportModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [statusFilter, setStatusFilter] = useState<Record<string, boolean>>(
    statusFilters.reduce((acc, { value }) => ({ ...acc, [value]: value === "All" }), {})
  );
  const [priorityFilter, setPriorityFilter] = useState<Record<string, boolean>>(
    priorityFilters.reduce((acc, { value }) => ({ ...acc, [value]: false }), {})
  );
  const [messageTypeFilter, setMessageTypeFilter] = useState<Record<string, boolean>>(
    messageTypeFilters.reduce((acc, { value }) => ({ ...acc, [value]: value === "All" }), {})
  );
  const [recipientTypeFilter, setRecipientTypeFilter] = useState<Record<string, boolean>>(
    recipientTypeFilters.reduce((acc, { value }) => ({ ...acc, [value]: value === "All" }), {})
  );
  const [roleFilter, setRoleFilter] = useState("all");
  const [adminRole, setAdminRole] = useState("");
  const [dateRangeFrom, setDateRangeFrom] = useState("");
  const [dateRangeTo, setDateRangeTo] = useState("");
  const [format, setFormat] = useState("excel");
  const [fields, setFields] = useState<Record<string, boolean>>(
    fieldOptions.reduce((acc, { value }) => ({ ...acc, [value]: true }), {})
  );
  const [exporting, setExporting] = useState(false);

  const handleStatusFilterChange = (value: string) => {
    if (value === "All") {
      setStatusFilter(
        statusFilters.reduce((acc, { value }) => ({ ...acc, [value]: value === "All" }), {})
      );
    } else {
      setStatusFilter((prev) => {
        const newState = { ...prev, [value]: !prev[value] };
        if (prev.All) {
          newState.All = false;
        }
        const otherOptions = statusFilters.filter((f) => f.value !== "All");
        if (!otherOptions.some((f) => newState[f.value])) {
          newState.All = true;
        }
        return newState;
      });
    }
  };

  const handleMessageTypeFilterChange = (value: string) => {
    if (value === "All") {
      setMessageTypeFilter(
        messageTypeFilters.reduce((acc, { value }) => ({ ...acc, [value]: value === "All" }), {})
      );
    } else {
      setMessageTypeFilter((prev) => {
        const newState = { ...prev, [value]: !prev[value] };
        if (prev.All) {
          newState.All = false;
        }
        const otherOptions = messageTypeFilters.filter((f) => f.value !== "All");
        if (!otherOptions.some((f) => newState[f.value])) {
          newState.All = true;
        }
        return newState;
      });
    }
  };

  const handleRecipientTypeFilterChange = (value: string) => {
    if (value === "All") {
      setRecipientTypeFilter(
        recipientTypeFilters.reduce((acc, { value }) => ({ ...acc, [value]: value === "All" }), {})
      );
    } else {
      setRecipientTypeFilter((prev) => {
        const newState = { ...prev, [value]: !prev[value] };
        if (prev.All) {
          newState.All = false;
        }
        const otherOptions = recipientTypeFilters.filter((f) => f.value !== "All");
        if (!otherOptions.some((f) => newState[f.value])) {
          newState.All = true;
        }
        return newState;
      });
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
  
      // Use onFetchAllData if provided, otherwise use the current page data
      let exportData = data;
      if (onFetchAllData) {
        console.log("Fetching all data for export with date range:", { dateRangeFrom, dateRangeTo });
        exportData = await onFetchAllData(dateRangeFrom, dateRangeTo);
        console.log(`Fetched ${exportData.length} records for export`);
      }

      // Filter data based on selected filters
      let filteredData = [...exportData];
  
      // Apply status filter
      if (!statusFilter.All) {
        const activeStatuses = Object.keys(statusFilter).filter(key => statusFilter[key] && key !== "All");
        if (activeStatuses.length > 0) {
          filteredData = filteredData.filter(item => 
            activeStatuses.includes(item.status?.toUpperCase())
          );
        }
      }
  
      // Apply date range filter - ONLY if we didn't use onFetchAllData
      // If we used onFetchAllData, the date filtering is already done in the API call
      if (!onFetchAllData && (dateRangeFrom || dateRangeTo)) {
        filteredData = filteredData.filter(item => {
          const itemDate = new Date(item.createdAt || item.updatedAt || item.publishedDate);
          if (dateRangeFrom && itemDate < new Date(dateRangeFrom)) return false;
          if (dateRangeTo && itemDate > new Date(dateRangeTo)) return false;
          return true;
        });
      }
  
      // Apply role filter
      if (roleFilter !== "all") {
        filteredData = filteredData.filter(item => 
          item.role?.toLowerCase() === roleFilter.toLowerCase() ||
          item.profileType?.toLowerCase() === roleFilter.toLowerCase()
        );
      }
  
      // Get selected columns
      const selectedColumns = Object.keys(fields).filter(key => fields[key]);
      
      // Map column names to their display labels
      const columnHeaders: Record<string, string> = {};
      fieldOptions.forEach(({ label, value }) => {
        if (fields[value]) {
          columnHeaders[value] = label;
        }
      });
  
      // Build export payload
      const exportPayload = {
        data: filteredData,
        format: format.toLowerCase(),
        options: {
          filename: `${dataType}-export-${Date.now()}`,
          columns: selectedColumns,
          columnHeaders,
          orientation: "landscape",
          branding: {
            companyName: "Music Minds",
            primaryColor: "#5243fe",
            secondaryColor: "#ffffff",
            footerText: "Confidential Document",
            includeHeader: true,
            includeFooter: true,
          },
          templateName: "modern",
        },
        urlExpiresIn: 3600,
      };
  
      console.log("Sending export payload:", {
        dataCount: exportPayload.data.length,
        format: exportPayload.format,
        filename: exportPayload.options.filename,
      });
  
      // Call export API
      const response = await fetch("/api/exports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(exportPayload),
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Failed to export data");
      }
  
      const result = await response.json();
      console.log("Export result received:", result);
  
      // ✅ FIXED: Force download to system (not open in browser)
      if (result.url) {
        console.log("Downloading file silently from:", result.url);
      
        try {
          // Fetch the file from your Next.js API, not the external backend directly
          const proxyResponse = await fetch(`/api/download?fileUrl=${encodeURIComponent(result.url)}`, {
            method: "GET",
          });
      
          if (!proxyResponse.ok) {
            throw new Error(`Failed to proxy file: ${proxyResponse.status}`);
          }
      
          const blob = await proxyResponse.blob();
      
          // Create a temporary download link
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = result.filename || `${dataType}-export.${result.format || format}`;
          document.body.appendChild(link);
          link.click();
      
          // Cleanup
          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
          }, 100);
      
          toast.success("✅ File downloaded successfully!");
        } catch (error) {
          console.error("Silent download failed:", error);
          toast.error("Download failed. Please try again.");
        }
      }        
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="backdrop-blur-xs" />
      <DialogContent className="sm:max-w-[571px] rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {tabs.length > 1 && (
            <div className="flex space-x-2 mb-4">
              {tabs.map((tab) => (
                <Button
                  key={tab.value}
                  variant={activeTab === tab.value ? "default" : "outline"}
                  className={`rounded-md px-3 py-1 text-sm ${
                    activeTab === tab.value ? "text-white" : "text-gray-700"
                  }`}
                  onClick={() => setActiveTab(tab.value)}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          )}
          {activeTab === "pendingInvites" && <p>Content for Pending Invites export options.</p>}
          {activeTab === "members" && (
            <>
              {statusFilters.length > 0 && (
                <div>
                  <p className="text-xs font-light mb-2">Status</p>
                  <div className="flex space-x-2 flex-wrap">
                    {statusFilters.map(({ label, value }) => (
                      <Button
                        key={value}
                        variant={statusFilter[value] ? "default" : "outline"}
                        className={`flex items-center gap-1 rounded-md text-sm ${
                          statusFilter[value] ? "border border-gray-400 font-medium" : ""
                        }`}
                        onClick={() => handleStatusFilterChange(value)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              {messageTypeFilters.length > 0 && (
                <div>
                  <p className="text-xs font-light mb-2">Message Type</p>
                  <div className="flex space-x-2 flex-wrap">
                    {messageTypeFilters.map(({ label, value }) => (
                      <Button
                        key={value}
                        variant={messageTypeFilter[value] ? "default" : "outline"}
                        className={`flex items-center gap-1 rounded-md text-sm ${
                          messageTypeFilter[value] ? "border border-gray-400 font-medium" : ""
                        }`}
                        onClick={() => handleMessageTypeFilterChange(value)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              {recipientTypeFilters.length > 0 && (
                <div>
                  <p className="text-xs font-light mb-2">Recipient Type</p>
                  <div className="flex space-x-2 flex-wrap">
                    {recipientTypeFilters.map(({ label, value }) => (
                      <Button
                        key={value}
                        variant={recipientTypeFilter[value] ? "default" : "outline"}
                        className={`flex items-center gap-1 rounded-md text-sm ${
                          recipientTypeFilter[value] ? "border border-gray-400 font-medium" : ""
                        }`}
                        onClick={() => handleRecipientTypeFilterChange(value)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              {priorityFilters.length > 0 && (
                <div>
                  <p className="text-xs font-light mb-2">Priority</p>
                  <div className="flex space-x-2 flex-wrap">
                    {priorityFilters.map(({ label, value }) => (
                      <Button
                        key={value}
                        variant={priorityFilter[value] ? "default" : "outline"}
                        className={`flex items-center gap-1 rounded-md text-sm ${
                          priorityFilter[value] ? "border border-gray-400 font-medium" : ""
                        }`}
                        onClick={() =>
                          setPriorityFilter((prev) => ({
                            ...prev,
                            [value]: !prev[value],
                          }))
                        }
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              {roleFilters.length > 0 && (
                <div>
                  <p className="text-xs font-light mb-2">User Role</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={roleFilter === "all" ? "default" : "outline"}
                      className={`rounded-md px-3 py-1 text-sm ${
                        roleFilter === "all" ? "text-white" : "text-gray-700"
                      }`}
                      onClick={() => setRoleFilter("all")}
                    >
                      All
                    </Button>
                    {roleFilters.map(({ label, value }) => (
                      <Button
                        key={value}
                        variant={roleFilter === value ? "default" : "outline"}
                        className={`rounded-md px-3 py-1 text-sm ${
                          roleFilter === value ? "text-white" : "text-gray-700"
                        }`}
                        onClick={() => setRoleFilter(value)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              {adminRoleOptions.length > 0 && (
                <div>
                  <p className="text-xs font-light mb-2">Admin Role</p>
                  <select
                    value={adminRole}
                    onChange={(e) => setAdminRole(e.target.value)}
                    className="w-full p-2 border rounded-md text-sm bg-input"
                  >
                    <option value="">Select New Role</option>
                    {adminRoleOptions.map(({ label, value }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <p className="text-xs font-light mb-2">Fields</p>
                <div className="grid grid-cols-2 gap-2">
                  {fieldOptions.map(({ label, value }) => (
                    <label key={value} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={fields[value]}
                        onChange={(e) =>
                          setFields((prev) => ({ ...prev, [value]: e.target.checked }))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-light mb-2">Date Range</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="date"
                      value={dateRangeFrom}
                      onChange={(e) => setDateRangeFrom(e.target.value)}
                      className="w-full p-2 border rounded-md text-sm bg-input"
                    />
                  </div>
                  <div className="relative flex-1">
                    <Input
                      type="date"
                      value={dateRangeTo}
                      onChange={(e) => setDateRangeTo(e.target.value)}
                      className="w-full p-2 border rounded-md text-sm bg-input"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-2 border p-1 rounded-md bg-input">
                  {["CSV", "Excel", "Pdf"].map((fmt) => (
                    <Button
                      key={fmt}
                      variant={format === fmt.toLowerCase() ? "default" : "ghost"}
                      className={`flex-1 rounded-md text-sm ${
                        format === fmt.toLowerCase() ? "text-white" : "text-gray-700"
                      }`}
                      onClick={() => setFormat(fmt.toLowerCase())}
                    >
                      {fmt}
                    </Button>
                  ))}
                </div>
                <Button
                  onClick={handleExport}
                  disabled={exporting}
                  className="w-[280px] text-white rounded-md"
                >
                  {exporting ? "Exporting..." : "Export"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}