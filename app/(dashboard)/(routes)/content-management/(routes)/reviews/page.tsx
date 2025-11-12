"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ReviewTable, { Review } from "../../_components/ReviewTable";
import { Button } from "@/components/ui/button";
import { CiExport } from "react-icons/ci";
import ExportModal from "@/components/ExportModal";




export default function ReviewsPage() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [reviews, ] = useState<Review[]>([])

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
        title="Export Reviews Data"
          data={reviews}
        dataType="reviews"
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
      />
    </div>
  );
}