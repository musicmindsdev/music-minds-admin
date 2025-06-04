"use client";

import { Button } from "@/components/ui/button";
import { CiExport } from "react-icons/ci";
import { useState } from "react";
import SettingsTabs from "./_components/SettingsTab";

export default function SettingsPage() {
  const [user, setUser] = useState({
    name: "Admin User",
    email: "admin@musicminds.com",
    role: "Administrator",
    lastLogin: "Apr 19, 2025 • 09:00 AM",
    image: "https://github.com/shadcn.png",
  });

  const handleExport = () => {
    console.log("Exporting settings data...");
    // Add export logic here
  };

  const handleUpdateName = (newName: string) => {
    setUser((prev) => ({ ...prev, name: newName }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-light text-lg">General Settings</h2>
        <Button
          className=" flex items-center space-x-2 rounded-lg"
          onClick={handleExport}
        >
          <CiExport className="mr-2" />
          <span>Export Data</span>
        </Button>
      </div>
          <SettingsTabs user={user} onUpdateName={handleUpdateName} />
      
    </div>
  );
}