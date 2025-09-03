import { NextResponse } from "next/server";

const BASE_URL = "https://music-minds-backend.onrender.com/api/v1";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const cookieHeader = request.headers.get("cookie");
    let token = null;

    if (cookieHeader) {
      const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split("=");
        acc[name] = value;
        return acc;
      }, {} as Record<string, string>);
      token = cookies.accessToken || null;
      console.log(`Extracted token for PUT /api/notifications/${id}/read:`, token ? token.substring(0, 20) + "..." : "Missing");
    }

    if (!token) {
      console.warn(`Authentication required: No access token found in cookies for PUT /api/notifications/${id}/read`);
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const response = await fetch(`${BASE_URL}/admin/content/notifications/${id}/read`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    console.log(`Backend response status for PUT /api/v1/admin/content/notifications/${id}/read:`, response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Backend error response:", errorData);
      return NextResponse.json(
        { error: errorData.message || "Failed to mark notification as read", details: errorData },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: "Notification marked as read successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Mark notification as read error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}