// app/api/auth/request-otp/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://music-minds-backend.onrender.com/api/v1/admin/auth/forgot-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      
      // Handle 404 specifically (Admin not found)
      if (response.status === 404) {
        return NextResponse.json(
          { error: errorData.message || "Admin not found" },
          { status: 404 }
        );
      }
      
      // Handle other errors
      return NextResponse.json(
        { error: errorData.message || "Failed to request OTP" },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: "Password reset OTP sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Request OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}