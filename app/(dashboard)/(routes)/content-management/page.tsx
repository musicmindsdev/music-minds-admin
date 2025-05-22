"use client";

import { Card, CardContent } from "@/components/ui/card";
import BookingTable from "../dashboard/_components/BookingTable";

export default function BookingsPage() {
  const handleExport = (data: {
    statusFilter: Record<string, boolean>;
    dateRangeFrom: string;
    dateRangeTo: string;
    format: string;
    fields: Record<string, boolean>;
  }) => {
    console.log("Exporting booking data:", data);
    // Add export logic here (e.g., generate CSV/JSON)
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="rounded-none">
        <CardContent>
          <BookingTable
            showCheckboxes={true}
            showPagination={true}
            showExportButton={true}
            onExport={handleExport}
            headerText="All Bookings"
          />
        </CardContent>
      </Card>
    </div>
  );
}