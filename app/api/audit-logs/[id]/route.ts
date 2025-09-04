import { NextResponse } from "next/server";

const BASE_URL = "https://music-minds-backend.onrender.com/api/v1/admin";

export async function GET(request: Request, { params }: { params: { id: string } }) {
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
      console.log("Extracted token for GET /api/audit-logs/[id]:", token ? token.substring(0, 10) + "..." : "Missing");
    }

    if (!token) {
      console.warn("Authentication required: No access token found in cookies for GET /api/audit-logs/[id]");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = params;
    console.log("Request URL:", `${BASE_URL}/audit-logs/${id}`);
    console.log("Token being sent:", `Bearer ${token.substring(0, 10)}...`);

    const response = await fetch(`${BASE_URL}/audit-logs/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Backend response status for GET /api/v1/admin/audit-logs/[id]:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Failed to parse backend error response",
      }));
      console.error("Backend error response:", errorData);
      return NextResponse.json(
        {
          error: errorData.message || "Failed to fetch audit log details",
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Backend response data:", data);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Fetch audit log details error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}