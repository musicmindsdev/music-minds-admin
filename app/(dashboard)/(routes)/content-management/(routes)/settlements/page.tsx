"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CiExport } from "react-icons/ci";
import ExportModal from "@/components/ExportModal";
import SettlementsTable from "../../_components/SettlementTable";
import { Settlement } from "../../_components/SettlementTable";

export default function SettlementsPage() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [settlements, ] = useState<Settlement[]>([]);
  return (
    <div className="p-6 space-y-6">
      {/* Header with Export Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg text-light">Settlements</h2>
        <Button
          className="text-white flex items-center space-x-2"
          onClick={() => setIsExportModalOpen(true)}
        >
          <CiExport className="mr-2" />
          <span className="hidden md:inline">Export Data</span>
        </Button>
      </div>
      
      {/* Settlements Table */}
      <Card className="rounded-none">
        <CardContent>
          <SettlementsTable
            showCheckboxes={true}
            showPagination={true}
            onActionComplete={() => console.log("Settlement action completed")}
          />
        </CardContent>
      </Card>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Settlements Data"
         data={settlements}
        dataType="settlements"
        statusFilters={[
          { label: "Pending", value: "PENDING" },
          { label: "Approved", value: "APPROVED" },
          { label: "Processing", value: "PROCESSING" },
          { label: "Completed", value: "COMPLETED" },
          { label: "Failed", value: "FAILED" },
          { label: "Cancelled", value: "CANCELLED" },
          { label: "Rejected", value: "REJECTED" },
        ]}
        roleFilters={[]}
        fieldOptions={[
          { label: "Settlement ID", value: "id" },
          { label: "User Name", value: "userName" },
          { label: "User Email", value: "userEmail" },
          { label: "Amount", value: "amount" },
          { label: "Service Fee", value: "serviceFee" },
          { label: "Net Amount", value: "netAmount" },
          { label: "Currency", value: "currency" },
          { label: "Status", value: "status" },
          { label: "Requested Date", value: "requestedAt" },
          { label: "Processed Date", value: "processedAt" },
          { label: "Completed Date", value: "completedAt" },
          { label: "Notes", value: "notes" },
          { label: "Admin Notes", value: "adminNotes" },
        ]}
      />
    </div>
  );
}