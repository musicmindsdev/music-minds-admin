"use client";

import { Card, CardContent } from "@/components/ui/card";
import TransactionTable from "../../../dashboard/_components/TransactionTable";

export default function TransactionsPage() {
  const handleExport = (data: {
    statusFilter: Record<string, boolean>;
    dateRangeFrom: string;
    dateRangeTo: string;
    format: string;
    fields: Record<string, boolean>;
  }) => {
    console.log("Exporting transaction data:", data);
    // Add export logic here (e.g., generate CSV/JSON)
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="rounded-none">
        <CardContent>
          <TransactionTable
            showCheckboxes={true}
            showPagination={true}
            showExportButton={true}
            onExport={handleExport}
            headerText="All Transactions"
          />
        </CardContent>
      </Card>
    </div>
  );
}