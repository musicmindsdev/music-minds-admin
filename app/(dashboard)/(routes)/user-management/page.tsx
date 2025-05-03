"use client";

import UserTable from "../dashboard/_components/UserTable";
import { Card, CardContent } from "@/components/ui/card";

export default function UserManagementPage() {
  const handleExport = () => {
    console.log("Exporting data...");
    // export logic here 
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="rounded-none">
        <CardContent>
          <UserTable
            showCheckboxes={true}
            showPagination={true}
            showExportButton={true}
            onExport={handleExport}
            headerText="All Users"
          />
        </CardContent>
      </Card>
    </div>
  );
}