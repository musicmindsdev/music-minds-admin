import { NextResponse } from "next/server";

const BASE_URL = "https://music-minds-backend.onrender.com/api/v1";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "all";
    const status = searchParams.get("status") || "active";

    const cookieHeader = request.headers.get("cookie");
    let token = null;

    if (cookieHeader) {
      const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split("=");
        acc[name] = value;
        return acc;
      }, {} as Record<string, string>);
      token = cookies.accessToken || null;
      console.log(`✅ Extracted token: ${token ? token.substring(0, 10) + "..." : "Missing"}`);
    }

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Construct full backend URL
    const apiUrl = `${BASE_URL}/overview/users?range=${range}&status=${status}`;
    console.log("🌐 Fetching:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    console.log("🔹 Backend response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Failed to parse backend error response",
      }));
      console.error("❌ Backend error:", errorData);
      return NextResponse.json(
        {
          error: errorData.message || "Failed to fetch user stats",
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("✅ User stats data received:", data);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("🔥 Internal error fetching user stats:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
