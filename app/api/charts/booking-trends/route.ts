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

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "last30Days";
    const groupBy = searchParams.get("groupBy") || "daily";
    const status = searchParams.get("status") || "";

    // Build query string
    const queryParams = new URLSearchParams({
      range,
      groupBy,
    });

    // Only add status if it exists and is not "all"
    if (status && status !== "all") {
      queryParams.append("status", status);
    }

    console.log("Fetching booking trends from:", `${BASE_URL}/overview/bookings/trends?${queryParams.toString()}`);

    // Call the backend API
    const response = await fetch(
      `${BASE_URL}/overview/bookings/trends?${queryParams.toString()}`,
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
      console.error("Backend API error:", {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      
      return NextResponse.json(
        { error: errorData.message || `Failed to fetch booking trends (${response.status})` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Booking trends API response data:", data);
    
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Fetch booking trends error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}