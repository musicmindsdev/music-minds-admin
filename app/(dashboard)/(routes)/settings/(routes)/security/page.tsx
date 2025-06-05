"use client";

import { toast } from "sonner";
import SecurityTabs from "../../_components/SecurityTabs";

export default function SecurityPage() {
  const handleUpdatePassword = async (currentPassword: string, newPassword: string) => {
    // Placeholder for API call to update password
    try {
      await fetch("/api/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      // Password update is handled in PasswordTab with toast feedback
    } catch (error) {
      toast.error("Failed to update password via API. Please try again.");
      console.log("Error updating password:", error);
    }
  };

  return (
    <div className="p-6 space-y-6">
        <h1 className="text-sm ">Security</h1>
       
      
      <SecurityTabs onUpdatePassword={handleUpdatePassword} />
    </div>
  );
}