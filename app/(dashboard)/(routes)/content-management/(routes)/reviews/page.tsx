"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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

          { label: "All", value: "All" },
          { label: "Yes", value: "Yes" },
          { label: "No", value: "NO" },
        ]}
        roleFilters={[
        
          {
            label: "Client", value: "Client"
          },
          {
            label: "Service Provider", value: "Service Provider"
          }
        ]}
        fieldOptions={[
          { label: "Review ID", value: "Review ID" },
          { label: "Service", value: "Service" },
          { label: "Comment", value: "Comment" },
          { label: "Client", value: "Client" },
          { label: "Date & Time", value: "Date & Time" },
          { label: "Ratings", value: "Ratings" },
          { label: "Provider", value: "Provider" },
          { label: "Status", value: "Status" },
        ]}
        onExport={handleExport}
      />
    </div>
  );
}