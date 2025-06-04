"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProfileTab from "./ProfileTab";
import NotificationsTab from "./NotificationsTab";
import RolesTab from "./RolesTab";

interface SettingsTabsProps {
  user: {
    name: string;
    email: string;
    role: string;
    image: string;
  };
  onUpdateName: (name: string) => void;
}

export default function SettingsTabs({ user, onUpdateName }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState("profile");

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileTab user={user} onUpdateName={onUpdateName} />;
      case "notifications":
        return <NotificationsTab />;
      case "roles":
        return <RolesTab />;
      default:
        return <ProfileTab user={user} onUpdateName={onUpdateName} />;
    }
  };

  return (
    <>
      <div className="flex space-x-2 border border-b-0 mb-0 px-2 pt-2 rounded-t-lg bg-card">
        <Button
          variant="ghost"
          className={`px-4 rounded-none ${activeTab === "profile" ? "border-b border-[#5243FE] text-[#5243FE]" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </Button>
        <Button
          variant="ghost"
          className={`px-4 rounded-none ${activeTab === "notifications" ? "border-b border-[#5243FE] text-[#5243FE]" : ""}`}
          onClick={() => setActiveTab("notifications")}
        >
          Notifications
        </Button>
        <Button
          variant="ghost"
          className={`px-4 rounded-none ${activeTab === "roles" ? "border-b border-[#5243FE] text-[#5243FE]" : ""}`}
          onClick={() => setActiveTab("roles")}
        >
          Roles
        </Button>
      </div>
      <Card className="rounded-none mt-0">
        <CardContent>{renderContent()}</CardContent>
      </Card>
    </>
  );
}