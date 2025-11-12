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
  const [support,] = useState([]);


  return (
    <div className="p-6 space-y-6 ">
      <div className="flex justify-between items-center">
        <h2 className="text-lg text-gray-700">Support Tickets</h2>
        <Button
          className=" flex items-center space-x-2"
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
        data={support}
        dataType="support"
        statusFilters={[
          { label: "All", value: "All" },
          { label: "Open", value: "Open" },
          { label: "In progress", value: "In progress" },
          { label: "Resolved", value: "Resolved" },
        ]}
        priorityFilters={[
          { label: "All", value: "All" },
          { label: "Low", value: "Low" },
          { label: "High", value: "High" },
          { label: "Medium", value: "Medium" },
        ]}
        roleFilters={[]}
        fieldOptions={[
          { label: "Ticket ID", value: "Ticket ID" },
          { label: "Priority", value: "Priority" },
          { label: "User", value: "User" },
          { label: "Status", value: "Status" },
          { label: "Issue", value: "Issue" },
          { label: "Created Date", value: "Created Date" },
        ]}
      />
    </div>
  );
}