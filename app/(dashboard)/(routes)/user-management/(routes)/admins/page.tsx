"use client";

import { Card, CardContent } from "@/components/ui/card";
import AdminTeamTable from "../../_components/AdminTable";

export default function AdminTeamPage() {
  return (
    <div className="p-6 space-y-6">
      <Card className="rounded-none">
        <CardContent>
          <AdminTeamTable
            showCheckboxes={true}
            showExportButton={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}