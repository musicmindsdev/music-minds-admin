"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";



export default function PasswordTab() {
  const [isPasswordGenerationEnabled, setIsPasswordGenerationEnabled] = useState(true);
  const [isPasswordResetEnabled, setIsPasswordResetEnabled] = useState(false);

  const handleTogglePasswordGeneration = async () => {
    try {
      // Simulate API call to toggle password generation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsPasswordGenerationEnabled(!isPasswordGenerationEnabled);
      toast.success(`Password generation ${!isPasswordGenerationEnabled ? "enabled" : "disabled"} successfully.`);
    } catch (error) {
      toast.error(`Failed to ${!isPasswordGenerationEnabled ? "enable" : "disable"} password generation.`);
      console.log(error)
    }
  };

  const handleTogglePasswordReset = async () => {
    if (isPasswordResetEnabled) {
      try {
        // Simulate API call to toggle password reset
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsPasswordResetEnabled(false);
        toast.success("Password reset disabled successfully.");
      } catch (error) {
        toast.error("Failed to disable password reset.");
        console.log(error)
      }
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Password Generation</Label>
          <p className="text-xs font-light">
            Toggle this on to enable the automatic generation of temporary passwords.
          </p>
        </div>
        <Switch
          checked={isPasswordGenerationEnabled}
          onCheckedChange={handleTogglePasswordGeneration}
          className="data-[state=checked]:bg-[#5243FE]"
        />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Password Reset</Label>
          <p className="text-xs font-light">
            By choosing to reset your password, you&apos;ll be sent a temporary password for a new login to your mailbox.
          </p>
        </div>
        <Switch
          checked={isPasswordResetEnabled}
          onCheckedChange={handleTogglePasswordReset}
          disabled={!isPasswordResetEnabled} // Disabled when off, as per design
          className="data-[state=checked]:bg-[#5243FE]"
        />
      </div>
    </div>
  );
}