"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CiExport } from "react-icons/ci";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import SupportTicketTable from "./_components/SupportTable";
import ExportModal from "@/components/ExportModal";

export default function SupportTicketsPage() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleExport = (data: {
    statusFilter: Record<string, boolean>;
    dateRangeFrom: string;
    dateRangeTo: string;
    format: string;
    fields: Record<string, boolean>;
  }) => {
    console.log("Exporting Review data:", data);
    // Add export logic here (e.g., generate CSV/JSON)
  };

  return (
    <div className="p-6 space-y-6  ">
      <div className="flex justify-between items-center">
        <h2 className="text-lg text-gray-700">Support Tickets</h2>
        <Button
          className=" text-white flex items-center space-x-2"
          onClick={() => setIsExportModalOpen(true)}
        >
          <CiExport className="mr-2" />
          <span className="hidden md:inline">Export Data</span>
        </Button>
      </div>
      <Card className="rounded-none">
        <CardContent>
          <SupportTicketTable
            showCheckboxes={true}
            showPagination={true}
          />
        </CardContent>
      </Card>
       <ExportModal
              isOpen={isExportModalOpen}
              onClose={() => setIsExportModalOpen(false)}
              title="Export Data"
              statusFilters={[
                { label: "All", value: "All" },
                { label: "Published", value: "Published" },
                { label: "Drafts", value: "Drafts" },
                { label: "Archived", value: "Archived" },
              ]}
              roleFilters={[]}
              fieldOptions={[
                { label: "Announcement ID", value: "Announcement ID" },
                { label: "Published Date", value: "Published Date" },
                { label: "Title", value: "Title" },
                { label: "Created By", value: "Created By" },
                { label: "Status", value: "Status" },
              ]}
              onExport={handleExport}
            />
    </div>
  );
}