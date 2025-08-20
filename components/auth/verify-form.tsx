"use client";

import CardWrapper from "@/components/auth/card-wrapper";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const flowType = searchParams.get("flow"); // 'login' or 'reset'
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

  useEffect(() => {
    if (timer > 0 && !canResend) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && !canResend) {
      setCanResend(true);
    }
  }, [timer, canResend]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || typeof email !== "string") {
      setError("Email is missing or invalid");
      return;
    }
    if (otp.length !== 6) {
      setOtpError("OTP must be 6 digits");
      return;
    }
    setIsLoading(true);
    setError(null);
    setOtpError(null);
    
    try {
      if (flowType === 'reset') {
        // For password reset flow, redirect to reset password page
        router.push(`/reset?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`);
      } else {
        // For login flow, verify OTP and login
        const response = await fetch("/api/auth/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, otp }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "OTP verification failed");
        }

        // No need to handle token here; cookie is set server-side
        router.push("/dashboard");
      }
    } catch (err) {
      const errorMessage = (err as Error).message || "An error occurred during OTP verification";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (canResend && email && typeof email === "string") {
      setIsLoading(true);
      setError(null);
      try {
        // Determine which API to call based on flow type
        const endpoint = flowType === 'reset' ? '/api/auth/forgot' : '/api/auth/resend';
        
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to resend OTP");
        }

        setCanResend(false);
        setTimer(60);
      } catch (err) {
        const errorMessage = (err as Error).message || "Failed to resend OTP";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Update header text based on flow type
  const headerLabel = flowType === 'reset' 
    ? "An OTP was sent to your email, verify to reset your password" 
    : "An OTP was sent to your email, verify to login to your account";

  return (
    <CardWrapper headerH1="Verify it's you" headerLabel={headerLabel}>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-4 flex flex-col items-center justify-center">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              disabled={isLoading}
            >
              <InputOTPGroup className="gap-3">
                <InputOTPSlot index={0} className="w-[50px] h-[50px] bg-input border-#F8FBFF" />
                <InputOTPSlot index={1} className="w-[50px] h-[50px] bg-input border-#F8FBFF" />
                <InputOTPSlot index={2} className="w-[50px] h-[50px] bg-input border-#F8FBFF" />
                <InputOTPSlot index={3} className="w-[50px] h-[50px] bg-input border-#F8FBFF" />
                <InputOTPSlot index={4} className="w-[50px] h-[50px] bg-input border-#F8FBFF" />
                <InputOTPSlot index={5} className="w-[50px] h-[50px] bg-input border-#F8FBFF" />
              </InputOTPGroup>
            </InputOTP>
            {otpError && <p className="text-red-500 text-sm mt-1">{otpError}</p>}
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          ) : flowType === 'reset' ? (
            "Continue to Reset Password"
          ) : (
            "Verify OTP"
          )}
        </Button>
        <div className="flex items-center justify-center text-sm">
          <span>Didn&apos;t receive a code?</span>
          {canResend ? (
            <Button
              variant="link"
              size="sm"
              onClick={handleResend}
              className="ml-1 bg-gradient-to-r from-[#0065FF] via-[#952BDA] to-[#FE02BF] text-white"
              disabled={isLoading}
            >
              Resend code
            </Button>
          ) : (
            <span className="ml-1 text-gray-500">Resend in {timer}s</span>
          )}
        </div>
      </form>
    </CardWrapper>
  );
}

export default VerifyForm;