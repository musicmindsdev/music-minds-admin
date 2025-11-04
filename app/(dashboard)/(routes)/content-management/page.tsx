"use client";

import { Card, CardContent } from "@/components/ui/card";
import BookingTable from "../dashboard/_components/BookingTable";

export default function BookingsPage() {
 
  return (
    <div className="p-6 space-y-6">
      <Card className="rounded-none">
        <CardContent>
          <BookingTable
            showCheckboxes={true}
            showPagination={true}
            showExportButton={true}
            headerText="All Bookings" />
        </CardContent>
      </Card>
    </div>
  );
}