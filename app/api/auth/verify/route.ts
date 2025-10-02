import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    // Basic validation
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }
    if (!otp || typeof otp !== "string" || otp.length !== 6) {
      return NextResponse.json(
        { error: "OTP must be 6 digits" },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://music-minds-backend.onrender.com/api/v1/admin/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Invalid OTP" },
        { status: 400 }
      );
    }

    const data = await response.json();
    console.log("Backend verify response:", data);

    // Extract token and user data
    const token = data?.data?.access_token;
    const user = data?.data?.user;

    if (!token) {
      return NextResponse.json(
        { error: "Token not found in response" },
        { status: 500 }
      );
    }

    // Create response
    const nextResponse = NextResponse.json(
      {
        message: "OTP verified successfully",
        user: {
          id: user?.id,
          email: user?.email,
          role: user?.role,
          isEmailVerified: user?.is_email_verified,
        },
      },
      { status: 200 }
    );

    // Set access token cookie (httpOnly for security)
    nextResponse.cookies.set({
      name: "accessToken",
      value: token,
      path: "/",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60, // 7 days
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Set user email cookie (accessible client-side)
    nextResponse.cookies.set({
      name: "userEmail",
      value: user?.email || email,
      path: "/",
      httpOnly: false,
      maxAge: 7 * 24 * 60 * 60,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Set user role cookie (accessible client-side)
    nextResponse.cookies.set({
      name: "userRole",
      value: user?.role || "ADMIN",
      path: "/",
      httpOnly: false,
      maxAge: 7 * 24 * 60 * 60,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return nextResponse;
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { error: "Invalid OTP" },
      { status: 400 }
    );
  }
}