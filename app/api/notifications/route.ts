import { NextResponse } from "next/server";

const BASE_URL = "https://music-minds-backend.onrender.com/api/v1";

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
      console.log("Extracted token for GET /api/notifications:", token ? token.substring(0, 20) + "..." : "Missing");
    }

    if (!token) {
      console.warn("Authentication required: No access token found in cookies for GET /api/notifications");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const userId = searchParams.get("userId") || "";
    const read = searchParams.get("read") || "";
    const announcementId = searchParams.get("announcementId") || "";
    const fromDate = searchParams.get("fromDate") || "";
    const toDate = searchParams.get("toDate") || "";

    const query = new URLSearchParams({
      page,
      limit,
      ...(userId && { userId }),
      ...(read && { read }),
      ...(announcementId && { announcementId }),
      ...(fromDate && { fromDate }),
      ...(toDate && { toDate }),
    }).toString();

    const response = await fetch(`${BASE_URL}/admin/content/notifications?${query}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    console.log("Backend response status for GET /api/v1/admin/content/notifications:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Backend error response:", errorData);
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch notifications" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(
      {
        message: "Notifications fetched successfully",
        notifications: data.notifications || data,
        total: data.total || data.length,
        pages: data.pages || Math.ceil(data.total / parseInt(limit)),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}