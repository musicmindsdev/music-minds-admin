"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  tabs?: { value: string; label: string }[];
  defaultTab?: string;
  statusFilters?: { label: string; value: string }[];
  roleFilters?: { label: string; value: string }[];
  fieldOptions: { label: string; value: string }[];
  adminRoleOptions?: { label: string; value: string }[];
  onExport: (data: {
    statusFilter: Record<string, boolean>;
    roleFilter: string;
    dateRangeFrom: string;
    dateRangeTo: string;
    format: string;
    fields: Record<string, boolean>;
    adminRole?: string;
  }) => void;
}

export default function ExportModal({
  isOpen,
  onClose,
  title,
  tabs = [{ value: "members", label: "Members" }],
  defaultTab = "members",
  statusFilters = [],
  roleFilters = [],
  fieldOptions,
  adminRoleOptions = [],
  onExport,
}: ExportModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [statusFilter, setStatusFilter] = useState<Record<string, boolean>>(
    statusFilters.reduce((acc, { value }) => ({ ...acc, [value]: false }), {})
  );
  const [roleFilter, setRoleFilter] = useState("all");
  const [adminRole, setAdminRole] = useState("");
  const [dateRangeFrom, setDateRangeFrom] = useState("");
  const [dateRangeTo, setDateRangeTo] = useState("");
  const [format, setFormat] = useState("CSV");
  const [fields, setFields] = useState<Record<string, boolean>>(
    fieldOptions.reduce((acc, { value }) => ({ ...acc, [value]: true }), {})
  );

  const handleExport = () => {
    onExport({
      statusFilter,
      roleFilter,
      dateRangeFrom,
      dateRangeTo,
      format,
      fields,
      adminRole: adminRole || undefined,
    });
    onClose();
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
                  <div className="flex space-x-2">
                    {statusFilters.map(({ label, value }) => (
                      <Button
                        key={value}
                        variant={statusFilter[value] ? "default" : "outline"}
                        className={`flex items-center gap-1 rounded-md text-sm ${
                          statusFilter[value] ? "border border-gray-400 font-medium" : ""
                        }`}
                        onClick={() =>
                          setStatusFilter((prev) => ({
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
                  className="w-[280px] text-white rounded-md"
                >
                  Export
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}