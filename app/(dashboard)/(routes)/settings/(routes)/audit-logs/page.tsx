"use client";

import { Card, CardContent } from "@/components/ui/card";
import AuditLogsTable from "../../_components/AuditLogsTable";

export default function AuditLogsPage() {
  const handleExport = () => {
    console.log("Exporting audit logs...");
    // Add export logic here
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="rounded-none">
        <CardContent>
          <AuditLogsTable
            showPagination={true}
            showExportButton={true}
            onExport={handleExport}
            headerText="AUDIT LOGS"
          />
        </CardContent>
      </Card>
    </div>
  );
}