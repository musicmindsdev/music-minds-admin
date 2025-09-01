import { NextResponse } from "next/server";

const BASE_URL = "https://music-minds-backend.onrender.com/api/v1/admin/content";

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
      console.log("Extracted token:", token);
    }

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const searchQuery = searchParams.get("searchQuery") || "";
    const minRating = searchParams.get("minRating") || "";
    const maxRating = searchParams.get("maxRating") || "";
    const fromDate = searchParams.get("fromDate") || "";
    const toDate = searchParams.get("toDate") || "";
    const flagged = searchParams.get("flagged") || "";
    const serviceOffered = searchParams.get("serviceOffered") || "";

    console.log("Query parameters:", {
      page,
      limit,
      searchQuery,
      minRating,
      maxRating,
      fromDate,
      toDate,
      flagged,
      serviceOffered,
    });

    // Build query string
    const query = new URLSearchParams({
      page,
      limit,
      ...(searchQuery && { searchQuery }),
      ...(minRating && { minRating }),
      ...(maxRating && { maxRating }),
      ...(fromDate && { fromDate }),
      ...(toDate && { toDate }),
      ...(flagged && { flagged }),
      ...(serviceOffered && { serviceOffered }),
    }).toString();

    // Call the backend API
    const response = await fetch(`${BASE_URL}/reviews?${query}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
          error: errorData.message || "Failed to fetch reviews",
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Backend response data:", data);

    return NextResponse.json(
      {
        message: "Reviews fetched successfully",
        reviews: data.reviews || data || [],
        total: data.total || data.length || 0,
        pages: data.pages || Math.ceil((data.total || data.length || 0) / parseInt(limit)),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch reviews error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { }: { params: { reviewId: string } }) {
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
      console.log("Extracted token for DELETE:", token);
    }

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const reviewId = new URL(request.url).pathname.split("/").pop();
    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BASE_URL}/reviews/${reviewId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Failed to parse backend error response",
      }));
      console.error("Backend error response:", errorData);
      return NextResponse.json(
        {
          error: errorData.message || "Failed to delete review",
          details: errorData,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: "Review deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete review error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}