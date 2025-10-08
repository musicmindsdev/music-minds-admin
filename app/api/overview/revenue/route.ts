import { NextResponse } from "next/server";

const BASE_URL = "https://music-minds-backend.onrender.com/api/v1";

export async function GET(request: Request) {
  try {
    // Extract token from cookies
    const cookieHeader = request.headers.get("cookie");
    let token = null;

    if (cookieHeader) {
      const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split("=");
        acc[name] = value;
        return acc;
      }, {} as Record<string, string>);
      
      token = cookies.accessToken || null;
    }

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Call the backend API
    const response = await fetch(
      `${BASE_URL}/overview/bookings/total`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch total bookings" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Fetch total bookings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}