import { NextResponse } from "next/server";

const BASE_URL = "https://music-minds-backend.onrender.com/api/v1/admin";

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie");
    let token = null;
    
    if (cookieHeader) {
      const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split("=");
        acc[name] = value;
        return acc;
      }, {} as Record<string, string>);
      
      token = cookies.accessToken || null;
      console.log("Extracted token:", token);
    }
    
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Extract all possible query parameters from the API docs
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const status = searchParams.get("status") || "";
    const userId = searchParams.get("userId") || "";
    const serviceId = searchParams.get("serviceId") || "";
    const fromDate = searchParams.get("fromDate") || "";
    const toDate = searchParams.get("toDate") || "";
    const minRange = searchParams.get("minRange") || "";
    const maxRange = searchParams.get("maxRange") || "";
    const minRating = searchParams.get("minRating") || "";
    const maxRating = searchParams.get("maxRating") || "";

    console.log("Query parameters:", { 
      page, limit, status, userId, serviceId, fromDate, toDate, 
      minRange, maxRange, minRating, maxRating 
    });

    // Build query string with all available parameters
    const query = new URLSearchParams({
      page,
      limit,
      ...(status && { status }),
      ...(userId && { userId }),
      ...(serviceId && { serviceId }),
      ...(fromDate && { fromDate }),
      ...(toDate && { toDate }),
      ...(minRange && { minRange }),
      ...(maxRange && { maxRange }),
      ...(minRating && { minRating }),
      ...(maxRating && { maxRating }),
    }).toString();

    // Use the correct API endpoint from the documentation
    const response = await fetch(`${BASE_URL}/content/bookings?${query}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    console.log("Backend response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Failed to parse backend error response",
      }));
      console.error("Backend error response:", errorData);
      return NextResponse.json(
        {
          error: errorData.message || "Failed to fetch bookings",
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Backend response data:", data);
    
    return NextResponse.json(
      { 
        message: "Bookings fetched successfully",
        data: data.data || data,
        meta: data.meta || {
          total: Array.isArray(data.data || data) ? (data.data || data).length : 0,
          page: parseInt(page),
          limit: parseInt(limit),
          last_page: data.meta?.last_page || Math.ceil((Array.isArray(data.data || data) ? (data.data || data).length : 0) / parseInt(limit))
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Bookings fetch error:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}