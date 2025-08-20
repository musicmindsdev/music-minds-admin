"use client";

import React, { useState } from "react";
import CardWrapper from "@/components/auth/card-wrapper";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useSearchParams, useRouter } from "next/navigation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");
  const otp = searchParams.get("otp");
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);

    // Validate that we have email and OTP
    if (!email || !otp) {
      setError("Email or OTP is missing. Please restart the reset process.");
      setIsLoading(false);
      return;
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      setIsLoading(false);
      return;
    }

    // Validate password match
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // Call the reset password API endpoint
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email, 
          otp, 
          newPassword 
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to reset password");
      }

      // Password reset successful, redirect to login with success message
      router.push("/login?message=Password reset successfully");
    } catch (err) {
      const errorMessage = (err as Error).message || "An error occurred during password reset";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CardWrapper headerH1="Reset Password" headerLabel="Set a new secure password to login">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          {/* New Password Field */}
          <div>
            <div className="relative">
              <Input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                className="bg-input w-[300px] lg:w-[513px] h-[53px] pr-10"
                type={showNewPassword ? "text" : "password"}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 cursor-pointer"
                disabled={isLoading}
              >
                {showNewPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
              </button>
            </div>
            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
          </div>
          
          {/* Confirm Password Field */}
          <div>
            <div className="relative">
              <Input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                className="bg-input w-[300px] lg:w-[513px] h-[53px] pr-10"
                type={showConfirmPassword ? "text" : "password"}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 cursor-pointer"
                disabled={isLoading}
              >
                {showConfirmPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
              </button>
            </div>
            {confirmPasswordError && <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>}
          </div>
        </div>
        
        <Button
          type="submit"
          className="w-[300px] lg:w-[513px] h-[53px] font-bold"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>
    </CardWrapper>
  );
}

export default ResetPasswordForm;