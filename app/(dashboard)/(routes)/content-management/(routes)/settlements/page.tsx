"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CiExport } from "react-icons/ci";
import ExportModal from "@/components/ExportModal";
import SettlementsTable, { Settlement, SettlementAPIResponse } from "../../_components/SettlementTable";

export default function SettlementsPage() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [settlementsData, setSettlementsData] = useState<Settlement[]>([]);

  // This receives the data from the SettlementsTable
  const handleExportData = (settlements: Settlement[]) => {
    setSettlementsData(settlements);
  };

  const fetchAllSettlements = async (exportDateRangeFrom: string, exportDateRangeTo: string) => {
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

      const response = await fetch(`/api/settlements?${query}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch all settlements");
      }

      const { data } = await response.json();

      const allSettlements: Settlement[] = Array.isArray(data)
        ? data.map((settlement: SettlementAPIResponse) => ({
            id: settlement.id,
            walletId: settlement.walletId,
            userId: settlement.userId,
            amount: settlement.amount,
            serviceFee: settlement.serviceFee,
            netAmount: settlement.netAmount,
            currency: settlement.currency,
            status: settlement.status,
            requestedAt: settlement.requestedAt,
            processedAt: settlement.processedAt,
            completedAt: settlement.completedAt,
            payoutMethodId: settlement.payoutMethodId,
            notes: settlement.notes,
            metadata: settlement.metadata,
            adminNotes: settlement.adminNotes,
            processedById: settlement.processedById,
            createdAt: settlement.createdAt,
            updatedAt: settlement.updatedAt,
            stripeTransferId: settlement.stripeTransferId,
            stripePayoutId: settlement.stripePayoutId,
            user: settlement.user,
            payoutMethod: settlement.payoutMethod,
            processedBy: settlement.processedBy,
          }))
        : [];

      return allSettlements;
    } catch (err) {
      console.error("Error fetching all settlements for export:", err);
      return [];
    }
  };


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
            onExportData={handleExportData} 
            onFetchAllData={fetchAllSettlements}
          />
        </CardContent>
      </Card>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Settlements Data"
        data={settlementsData} // Use the data from table
        dataType="settlements"
        roleFilters={[]}
        fieldOptions={[
          { label: "Settlement ID", value: "id" },
          { label: "Wallet ID", value: "walletId" },
          { label: "User ID", value: "userId" },
          { label: "User Name", value: "user.username" },
          { label: "User Email", value: "user.email" },
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
          { label: "Stripe Transfer ID", value: "stripeTransferId" },
          { label: "Stripe Payout ID", value: "stripePayoutId" },
          { label: "Created At", value: "createdAt" },
          { label: "Updated At", value: "updatedAt" },
        ]}
        onFetchAllData={fetchAllSettlements}
      />
    </div>
  );
}