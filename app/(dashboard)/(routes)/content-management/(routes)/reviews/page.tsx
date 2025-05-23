"use client";

import { useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import ReviewTable from "../../_components/ReviewTable";
import { Button } from "@/components/ui/button";
import { CiExport } from "react-icons/ci";
import ExportModal from "@/components/ExportModal";



export default function ReviewsPage() {
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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg text-light">Reviews Overview</h2>
        <Button
          className="text-white flex items-center space-x-2"
          onClick={() => setIsExportModalOpen(true)}
        >
          <CiExport className="mr-2" />
          <span className="hidden md:inline">Export Data</span>
        </Button>
      </div>
      
      <Card className="rounded-none">
        <CardContent>
          <ReviewTable
            showCheckboxes={true}
            showPagination={true}
            headerText="All Reviews"
          />
        </CardContent>
      </Card>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Data"
        statusFilters={[
          { label: "Approved", value: "Approved" },
          { label: "Pending", value: "Pending" },
          { label: "Rejected", value: "Rejected" },
        ]}
        roleFilters={[]}
        fieldOptions={[
          { label: "Review ID", value: "Review ID" },
          { label: "User Name", value: "User Name" },
          { label: "Rating", value: "Rating" },
          { label: "Review Text", value: "Review Text" },
          { label: "Date", value: "Date" },
          { label: "Status", value: "Status" },
        ]}
        onExport={handleExport}
      />
    </div>
  );
}