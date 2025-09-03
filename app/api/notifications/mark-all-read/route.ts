import { NextResponse } from "next/server";

const BASE_URL = "https://music-minds-backend.onrender.com/api/v1";

export async function PUT(request: Request) {
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
      console.log("Extracted token for PUT /api/notifications/mark-all-read:", token ? token.substring(0, 20) + "..." : "Missing");
    }

    if (!token) {
      console.warn("Authentication required: No access token found in cookies for PUT /api/notifications/mark-all-read");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      console.warn("Missing userId for PUT /api/notifications/mark-all-read");
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BASE_URL}/admin/content/notifications/mark-all-read?userId=${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    console.log("Backend response status for PUT /api/v1/admin/content/notifications/mark-all-read:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Backend error response:", errorData);
      return NextResponse.json(
        { error: errorData.message || "Failed to mark all notifications as read", details: errorData },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: "All notifications marked as read successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}