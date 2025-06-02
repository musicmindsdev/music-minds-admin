"use client";

import { useState } from "react";
import UserTable from "../dashboard/_components/UserTable";
import UserDetailsView from "../user-management/_components/UserDetailsView";
import { Card, CardContent } from "@/components/ui/card";


interface User {
  id: string;
  name: string;
  email: string;
  profileType: string;
  status: "Active" | "Suspended" | "Deactivated";
  verified: boolean;
  lastLogin: string;
  image: string;
}

export default function UserManagementPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleExport = () => {
    console.log("Exporting data...");
    // Export logic here
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
  };

  const handleCloseDetails = () => {
    setSelectedUser(null);
  };

  return (
    <div className="p-6 space-y-6">
      {selectedUser ? (
        // Render UserDetailsView without wrapping in a Card to match the design
        <UserDetailsView user={selectedUser} onClose={handleCloseDetails} />
      ) : (
        // Render UserTable wrapped in a Card
        <Card className="rounded-none">
          <CardContent>
            <UserTable
              showCheckboxes={true}
              showPagination={true}
              showExportButton={true}
              onExport={handleExport}
              headerText="All Users"
              onViewDetails={handleViewDetails} // Pass callback to handle view details
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}