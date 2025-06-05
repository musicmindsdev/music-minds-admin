"use client";

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


  const handleUpdateName = (newName: string) => {
    setUser((prev) => ({ ...prev, name: newName }));
  };

  return (
    <div className="p-6 space-y-6">
   
        <h2 className="font-light text-lg">General Settings</h2>
        
      
          <SettingsTabs user={user} onUpdateName={handleUpdateName} />
      
    </div>
  );
}