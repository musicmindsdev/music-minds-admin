"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ReviewTable, { ApiReview, Review } from "../../_components/ReviewTable";
import { Button } from "@/components/ui/button";
import { CiExport } from "react-icons/ci";
import ExportModal from "@/components/ExportModal";

export default function ReviewsPage() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [reviewsData, setReviewsData] = useState<Review[]>([]);

  // This receives the data from the ReviewTable
  const handleExportData = (reviews: Review[]) => {
    setReviewsData(reviews);
  };

  const fetchAllReviews = async (exportDateRangeFrom: string, exportDateRangeTo: string) => {
    try {
      const queryParams: Record<string, string> = {
        limit: "10000",
      };

      if (exportDateRangeFrom) {
        queryParams.fromDate = exportDateRangeFrom;
      }
      if (exportDateRangeTo) {
        queryParams.toDate = exportDateRangeTo;
      }

      const query = new URLSearchParams(queryParams).toString();

      const response = await fetch(`/api/reviews?${query}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch all reviews");
      }

      const { reviews: apiReviews } = await response.json();

      const allReviews: Review[] = Array.isArray(apiReviews)
        ? apiReviews.map((review: ApiReview) => ({
            id: review.id,
            userName: review.userName || "Unknown",
            email: review.email || "",
            serviceOffered: review.serviceOffered || "Unknown",
            rating: review.rating ?? 0,
            reviewText: review.reviewText || "",
            date: review.date || new Date().toISOString(),
            status: review.status || "Pending",
            flagged: review.flagged || "No",
            reviewer: {
              name: review.reviewer?.name || "Unknown",
              email: review.reviewer?.email || "",
              role: review.reviewer?.role || "User",
            },
          }))
        : [];

      return allReviews;
    } catch (err) {
      console.error("Error fetching all reviews for export:", err);
      return [];
    }
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
            onExportData={handleExportData} 
            onFetchAllData={fetchAllReviews}
          />
        </CardContent>
      </Card>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Reviews Data"
        data={reviewsData}
        dataType="reviews"
        statusFilters={[
          { label: "All", value: "All" },
          { label: "Flagged", value: "Yes" },
          { label: "Not Flagged", value: "No" },
        ]}
        fieldOptions={[
          { label: "Review ID", value: "id" },
          { label: "Provider Name", value: "userName" },
          { label: "Email", value: "email" },
          { label: "Service Offered", value: "serviceOffered" },
          { label: "Rating", value: "rating" },
          { label: "Review Text", value: "reviewText" },
          { label: "Date", value: "date" },
          { label: "Status", value: "status" },
          { label: "Flagged", value: "flagged" },
        ]}
        onFetchAllData={fetchAllReviews}
      />
    </div>
  );
}