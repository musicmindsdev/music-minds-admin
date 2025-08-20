"use client";

import React, { useState } from "react";
import CardWrapper from "@/components/auth/card-wrapper";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const router = useRouter();

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : "Invalid email address";
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setEmailError(null);

    const emailValidation = validateEmail(email);
    if (emailValidation) {
      setEmailError(emailValidation);
      setIsLoading(false);
      return;
    }

    try {
      // Updated to use the correct endpoint
      const response = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to request OTP");
      }

      // ✅ After requesting OTP, navigate to verify page with email param
      router.push(`/verify?email=${encodeURIComponent(email)}&flow=reset`);
    } catch (err) {
      const errorMessage = (err as Error).message || "Something went wrong";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CardWrapper
      headerH1="Forgot password"
      headerLabel="Request OTP"
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="bg-input w-[300px] lg:w-[513px] h-[53px]"
              type="email"
              disabled={isLoading}
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1">{emailError}</p>
            )}
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
            "Request OTP"
          )}
        </Button>
      </form>
    </CardWrapper>
  );
}

export default ForgotPasswordForm;