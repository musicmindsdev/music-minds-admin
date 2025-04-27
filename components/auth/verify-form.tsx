"use client";

import CardWrapper from "@/components/auth/card-wrapper";
import {
  Form
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@/schemas";
import { Button } from "../ui/button";
// import { useRouter } from "next/router";
import { verifyOTP, resendOTP } from "@/lib/api";
import { Oval } from "react-loader-spinner";

function VerifyForm() {
  // const router = useRouter();
  // const { email } = router.query;
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });
  const [value, setValue] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    // if (!email || typeof email !== "string") {
    //   setError("Email is missing or invalid");
    //   return;
    // }
    // setIsLoading(true);
    // setError(null);
    // try {
    //   const response = await verifyOTP(email, value);
    //   // On success, store token or user data if provided in response
    //   if (response.token) {
    //     localStorage.setItem("authToken", response.token); // Adjust based on actual response
    //   }
    //   router.push("/dashboard"); // Redirect to dashboard
    // } catch (err: any) {
    //   setError(err.message || "An error occurred during OTP verification");
    // } finally {
    //   setIsLoading(false);
    // }
  };

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

  const handleResend = async () => {
    // if (canResend && email && typeof email === "string") {
    //   setIsLoading(true);
    //   setError(null);
    //   try {
    //     await resendOTP(email);
    //     setCanResend(false);
    //     setTimer(60);
    //   } catch (err: any) {
    //     setError(err.message || "Failed to resend OTP");
    //   } finally {
    //     setIsLoading(false);
    //   }
    // }
  };

  return (
    <CardWrapper headerH1="Verify its you" headerLabel="An OTP was sent to your email, verify to login to your account">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4 flex flex-col items-center justify-center">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <InputOTP
              maxLength={6}
              value={value}
              onChange={(value) => setValue(value)}
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
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Oval height={24} width={24} color="#ffffff" secondaryColor="#cccccc" strokeWidth={4} />
            ) : (
              "Verify OTP"
            )}
          </Button>
          <div className="flex items-center justify-center text-sm">
            <span>Didn't receive a code?</span>
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
      </Form>
    </CardWrapper>
  );
}

export default VerifyForm;