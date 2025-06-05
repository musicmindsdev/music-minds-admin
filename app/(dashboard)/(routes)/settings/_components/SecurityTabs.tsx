"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PasswordTab from "./PasswordTab";
import TwoFATab from "./TwoFaTab";

interface SecurityTabsProps {
  onUpdatePassword: (currentPassword: string, newPassword: string) => void;
}

export default function SecurityTabs({ }: SecurityTabsProps) {
  const [activeTab, setActiveTab] = useState("password");

  const renderContent = () => {
    switch (activeTab) {
      case "password":
        return <PasswordTab  />;
      case "2fa":
        return <TwoFATab />;
      default:
        return <PasswordTab  />;
    }
  };

  return (
    <>
      <div className="flex space-x-2 border border-b-0 mb-0 px-2 pt-2 rounded-t-lg bg-card">
        <Button
          variant="ghost"
          className={`px-4 rounded-none ${activeTab === "password" ? "border-b border-[#5243FE] text-[#5243FE]" : ""}`}
          onClick={() => setActiveTab("password")}
        >
          Password
        </Button>
        <Button
          variant="ghost"
          className={`px-4 rounded-none ${activeTab === "2fa" ? "border-b border-[#5243FE] text-[#5243FE]" : ""}`}
          onClick={() => setActiveTab("2fa")}
        >
          Two-Factor Authentication
        </Button>
      </div>
      <Card className="rounded-none mt-0">
        <CardContent>{renderContent()}</CardContent>
      </Card>
    </>
  );
}