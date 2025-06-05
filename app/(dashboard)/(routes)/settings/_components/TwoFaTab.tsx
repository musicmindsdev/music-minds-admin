"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function TwoFATab() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(true); // Enabled by default as per design
  const [isOTPEnabled, setIsOTPEnabled] = useState(true); // Enabled by default as per design
  const [isPINEnabled, setIsPINEnabled] = useState(false); // Disabled by default as per design
  const [isPasswordEnabled, setIsPasswordEnabled] = useState(true); // Enabled by default as per design

  const handleToggle2FA = async () => {
    try {
      // Simulate API call to toggle 2FA
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIs2FAEnabled(!is2FAEnabled);
      if (!is2FAEnabled) {
        // Reset authentication methods when enabling 2FA
        setIsOTPEnabled(true);
        setIsPINEnabled(false);
        setIsPasswordEnabled(true);
      } else {
        // Disable all methods when disabling 2FA
        setIsOTPEnabled(false);
        setIsPINEnabled(false);
        setIsPasswordEnabled(false);
      }
      toast.success(`2FA ${!is2FAEnabled ? "enabled" : "disabled"} successfully.`);
    } catch (error) {
      toast.error(`Failed to ${!is2FAEnabled ? "enable" : "disable"} 2FA. Please try again.`);
      console.log(error);
    }
  };

  const handleToggleOTP = async () => {
    if (is2FAEnabled) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsOTPEnabled(!isOTPEnabled);
        if (isOTPEnabled) {
          setIsPINEnabled(false);
          setIsPasswordEnabled(true); // Default to Password if OTP is disabled
        }
        toast.success(`OTP authentication ${!isOTPEnabled ? "disabled" : "enabled"} successfully.`);
      } catch (error) {
        toast.error(`Failed to ${!isOTPEnabled ? "disable" : "enable"} OTP authentication.`);
        console.log(error);
      }
    }
  };

  const handleTogglePIN = async () => {
    if (is2FAEnabled) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsPINEnabled(!isPINEnabled);
        if (isPINEnabled) {
          setIsOTPEnabled(false);
          setIsPasswordEnabled(true); // Default to Password if PIN is disabled
        }
        toast.success(`PIN authentication ${!isPINEnabled ? "disabled" : "enabled"} successfully.`);
      } catch (error) {
        toast.error(`Failed to ${!isPINEnabled ? "disable" : "enable"} PIN authentication.`);
        console.log(error);
      }
    }
  };

  const handleTogglePassword = async () => {
    if (is2FAEnabled) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsPasswordEnabled(!isPasswordEnabled);
        if (isPasswordEnabled) {
          setIsOTPEnabled(true); // Default to OTP if Password is disabled
          setIsPINEnabled(false);
        }
        toast.success(`Password authentication ${!isPasswordEnabled ? "disabled" : "enabled"} successfully.`);
      } catch (error) {
        toast.error(`Failed to ${!isPasswordEnabled ? "disable" : "enable"} password authentication.`);
        console.log(error);
      }
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div>
        <h2 className="text-sm font-semibold ">Two-Factor Authentication (2FA)</h2>
        <p className="text-xs font-light">
              Toggling this on will require 2FA for all admin logins.
            </p>
        <div className="flex items-center justify-between mt-2">
          <div>
            <Label className="text-sm font-medium">Enable 2FA</Label>
           
          </div>
          <Switch
            checked={is2FAEnabled}
            onCheckedChange={handleToggle2FA}
            className="data-[state=checked]:bg-[#5243FE]"
          />
        </div>
      </div>
      {is2FAEnabled && (
        <div>
          <h2 className="text-sm font-semibold ">Authentication Method</h2>
          <p className="text-xs ">
          Select the method in which you want to authenticate logins
            </p>
          <div className="space-y-4 mt-2">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">OTP Code</Label>
              </div>
              <Switch
                checked={isOTPEnabled}
                onCheckedChange={handleToggleOTP}
                className="data-[state=checked]:bg-[#5243FE]"
                disabled={!is2FAEnabled}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">PIN</Label>
              </div>
              <Switch
                checked={isPINEnabled}
                onCheckedChange={handleTogglePIN}
                className="data-[state=checked]:bg-[#5243FE]"
                disabled={!is2FAEnabled}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Password</Label>
              </div>
              <Switch
                checked={isPasswordEnabled}
                onCheckedChange={handleTogglePassword}
                className="data-[state=checked]:bg-[#5243FE]"
                disabled={!is2FAEnabled}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}