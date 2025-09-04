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
      console.log("Extracted token for GET /api/audit-logs:", token ? token.substring(0, 10) + "..." : "Missing");
    }

    if (!token) {
      console.warn("Authentication required: No access token found in cookies for GET /api/audit-logs");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "";
    const userId = searchParams.get("userId") || "";
    const role = searchParams.get("role") || "";
    const startTime = searchParams.get("startTime") || "";
    const endTime = searchParams.get("endTime") || "";
    const search = searchParams.get("search") || "";
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";

    const query = new URLSearchParams({
      ...(action && { action }),
      ...(userId && { userId }),
      ...(role && { role }),
      ...(startTime && { startTime }),
      ...(endTime && { endTime }),
      ...(search && { search }),
      page,
      limit,
    }).toString();

    console.log("Request URL:", `${BASE_URL}/audit-logs?${query}`);
    console.log("Token being sent:", `Bearer ${token.substring(0, 10)}...`);

    const response = await fetch(`${BASE_URL}/audit-logs?${query}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Backend response status for GET /api/v1/admin/audit-logs:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Failed to parse backend error response",
      }));
      console.error("Backend error response:", errorData);
      return NextResponse.json(
        {
          error: errorData.message || "Failed to fetch audit logs",
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Backend response data:", data);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Fetch audit logs error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
      console.log("Extracted token for POST /api/audit-logs:", token ? token.substring(0, 10) + "..." : "Missing");
    }

    if (!token) {
      console.warn("Authentication required: No access token found in cookies for POST /api/audit-logs");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("POST /api/audit-logs request body:", body);

    console.log("Request URL:", `${BASE_URL}/audit-logs`);
    console.log("Token being sent:", `Bearer ${token.substring(0, 10)}...`);

    const response = await fetch(`${BASE_URL}/audit-logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    console.log("Backend response status for POST /api/v1/admin/audit-logs:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Failed to parse backend error response",
      }));
      console.error("Backend error response:", errorData);
      return NextResponse.json(
        {
          error: errorData.message || "Failed to create audit log",
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Backend response data:", data);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Create audit log error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}