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
    console.log("Backend verify response:", data); // 👈 see structure

    // ✅ extract correct token
    const token = data?.data?.access_token;
    if (!token) {
      return NextResponse.json(
        { error: "Token not found in response" },
        { status: 500 }
      );
    }

    // Create response with Set-Cookie header
    const nextResponse = NextResponse.json(
      {
        message: "OTP verified successfully",
        user: data?.data?.user, // include user in response if needed
      },
      { status: 200 }
    );

    // ✅ set cookie
    nextResponse.cookies.set({
      name: "accessToken",
      value: token,
      path: "/",
      httpOnly: true, // make cookie secure
      maxAge: 3600, // 1 hour
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
