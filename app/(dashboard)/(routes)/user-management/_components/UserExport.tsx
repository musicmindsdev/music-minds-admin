"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface UserExportProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserExport({ isOpen, onClose }: UserExportProps) {
  const [statusFilter, setStatusFilter] = useState({
    Active: false,
    Suspended: false,
    Deactivated: false,
  });
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [startDate, setStartDate] = useState("2025-04-01");
  const [endDate, setEndDate] = useState("2025-04-19");
  const [format, setFormat] = useState("CSV");
  const [exportFields, setExportFields] = useState({
    "User ID": true,
    Name: true,
    Email: true,
    "User Role": true,
    Status: true,
    "Last Activity": true,
  });

  const handleExport = () => {
    // Placeholder for export functionality
    console.log({
      statusFilter,
      userRoleFilter,
      startDate,
      endDate,
      format,
      exportFields,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="backdrop-blur-xs" />
      <DialogContent className="sm:max-w-[571px] rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">Export Data</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Status Filter */}
          <div>
            <p className="text-xs font-light mb-2">Status</p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className={`flex items-center gap-1 rounded-md text-sm ${
                  statusFilter.Active ? "border border-gray-400 font-medium" : ""
                }`}
                onClick={() =>
                  setStatusFilter((prev) => ({
                    ...prev,
                    Active: !prev.Active,
                  }))
                }
              >
                Active
              </Button>
              <Button
                variant="outline"
                className={`flex items-center gap-1 rounded-md text-sm ${
                  statusFilter.Suspended ? "border border-gray-400 font-medium" : ""
                }`}
                onClick={() =>
                  setStatusFilter((prev) => ({
                    ...prev,
                    Suspended: !prev.Suspended,
                  }))
                }
              >
                 Suspended
              </Button>
              <Button
                variant="outline"
                className={`flex items-center gap-1 rounded-md text-sm ${
                  statusFilter.Deactivated ? "border border-gray-400 font-medium" : ""
                }`}
                onClick={() =>
                  setStatusFilter((prev) => ({
                    ...prev,
                    Deactivated: !prev.Deactivated,
                  }))
                }
              >
                Deactivated
              </Button>
            </div>
          </div>

          {/* User Role Filter */}
          <div>
            <p className="text-xs font-light mb-2">User Role</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={userRoleFilter === "all" ? "default" : "outline"}
                className={`rounded-md px-3 py-1 text-sm ${
                  userRoleFilter === "all" ? "text-white" : "text-gray-700"
                }`}
                onClick={() => setUserRoleFilter("all")}
              >
                All
              </Button>
              <Button
                variant={userRoleFilter === "Service Provider" ? "default" : "outline"}
                className={`rounded-md px-3 py-1 text-sm ${
                  userRoleFilter === "Service Provider" ? "text-white" : "text-gray-700"
                }`}
                onClick={() => setUserRoleFilter("Service Provider")}
              >
                Service Provider
              </Button>
              <Button
                variant={userRoleFilter === "Client" ? "default" : "outline"}
                className={`rounded-md px-3 py-1 text-sm ${
                  userRoleFilter === "Client" ? "text-white" : "text-gray-700"
                }`}
                onClick={() => setUserRoleFilter("Client")}
              >
                Client
              </Button>
            </div>
          </div>

          {/* Export Fields Selection */}
          <div>
            <p className="text-xs font-light mb-2">Fields</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(exportFields).map((field) => (
                <label key={field} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exportFields[field as keyof typeof exportFields]}
                    onChange={(e) =>
                      setExportFields((prev) => ({
                        ...prev,
                        [field]: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  {field}
                </label>
              ))}
            </div>
          </div>

          {/* Date Range Selection */}
          <div>
            <p className="text-xs font-light mb-2">Date Range</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border rounded-md p-2 text-sm bg-input"
                />
              </div>
              <div className="relative flex-1">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border rounded-md p-2 text-sm bg-input"
                />
              </div>
            </div>
          </div>

          {/* Format Selection and Export Button */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2 border p-1 rounded-md bg-input">
              {["CSV", "Excel"].map((fmt) => (
                <Button
                  key={fmt}
                  variant={format === fmt ? "default" : "ghost"}
                  className={`flex-1 rounded-md text-sm ${
                    format === fmt ? "text-white" : "text-gray-700"
                  }`}
                  onClick={() => setFormat(fmt)}
                >
                  {fmt}
                </Button>
              ))}
            </div>
            <Button
              onClick={handleExport}
              className="w-[280px] text-white rounded-md bg-blue-600 hover:bg-blue-700"
            >
              Export
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}