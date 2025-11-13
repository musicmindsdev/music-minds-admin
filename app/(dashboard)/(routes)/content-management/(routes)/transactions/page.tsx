"use client";

import { Card, CardContent } from "@/components/ui/card";
import TransactionTable from "../../../dashboard/_components/TransactionTable";

export default function TransactionsPage() {

  return (
    <div className="p-6 space-y-6">
      <Card className="rounded-none">
        <CardContent>
          <TransactionTable
            showCheckboxes={true}
            showPagination={true}
            showExportButton={true}
            headerText="All Transactions"
          />
        </CardContent>
      </Card>
    </div>
  );
}