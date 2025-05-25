"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CiExport } from "react-icons/ci";
import { AiOutlineSend } from "react-icons/ai";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import ExportModal from "@/components/ExportModal";
import BroadcastMessagesTable from "../../_components/BroadcastMessagesTable";

export default function BroadcastMessagesPage() {
  const [activeTab, setActiveTab] = useState("Push Notification");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleExport = (data: {
    statusFilter: Record<string, boolean>;
    priorityFilter: Record<string, boolean>;
    messageTypeFilter: Record<string, boolean>;
    recipientTypeFilter: Record<string, boolean>;
    roleFilter: string;
    dateRangeFrom: string;
    dateRangeTo: string;
    format: string;
    fields: Record<string, boolean>;
    adminRole?: string;
  }) => {
    console.log("Exporting Broadcast Messages data:", data);
    // Add export logic here (e.g., generate CSV/JSON)
  };

  return (
    <div>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg text-gray-700">Broadcast Messages</h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="flex items-center space-x-2"
              onClick={() => console.log("Send Message clicked")}
            >
              <AiOutlineSend className="mr-2" />
              <span className="hidden md:inline">Send Message</span>
            </Button>
            <Button
              className="flex items-center space-x-2"
              onClick={() => setIsExportModalOpen(true)}
            >
              <CiExport className="mr-2" />
              <span className="hidden md:inline">Export Data</span>
            </Button>
          </div>
        </div>
        <div className="flex space-x-2 border border-b-0 mb-0 px-2 pt-2 rounded-t-lg bg-card">
          <Button
            variant={"ghost"}
            className={` px-4 rounded-none ${activeTab === "Push Notification" ? "border-b border-[#5243FE] text-[#5243FE]" : ""}`}
            onClick={() => setActiveTab("Push Notification")}
          >
            Push Notification
          </Button>
          <Button
            variant={"ghost"}
            className={` px-4 rounded-none ${activeTab === "Emergency Notification" ? "border-b border-[#5243FE] text-[#5243FE]" : ""}`}
            onClick={() => setActiveTab("Emergency Notification")}
          >
            Emergency Notification
          </Button>
        </div>
        <Card className="rounded-none mt-0">
          <CardContent>
            <BroadcastMessagesTable
              showCheckboxes={true}
              showPagination={true}
              activeTab={activeTab} // Pass activeTab to switch between tables
            />
          </CardContent>
        </Card>
      </div>
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Data"
        statusFilters={[
          { label: "All", value: "All" },
          { label: "Draft", value: "Draft" },
          { label: "Sent", value: "Sent" },
          { label: "Scheduled", value: "Scheduled" },
        ]}
        messageTypeFilters={[
          { label: "All", value: "All" },
          { label: "Push Notification", value: "Push Notification" },
          { label: "Emergency Notification", value: "Emergency Notification" },
        ]}
        recipientTypeFilters={[
          { label: "All", value: "All" },
          { label: "Clients", value: "Clients" },
          { label: "Service Providers", value: "Service Providers" },
        ]}
        priorityFilters={[]} // No priority filter for this table
        roleFilters={[]}
        fieldOptions={[
          { label: "Broadcast ID", value: "Broadcast ID" },
          { label: "Created By", value: "Created By" },
          { label: "Title", value: "Title" },
          { label: "Published Date", value: "Published Date" },
          { label: "Message", value: "Message" },
        ]}
        onExport={handleExport}
      />
    </div>
  );
}