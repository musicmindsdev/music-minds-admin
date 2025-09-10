import { NextResponse } from "next/server";

const BASE_URL = process.env.BACKEND_URL || "https://music-minds-backend.onrender.com/api/v1/admin";

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
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const searchQuery = searchParams.get("searchQuery") || "";

    // Build query string
    const query = new URLSearchParams({
      page,
      limit,
      ...(searchQuery && { search: searchQuery }),
    }).toString();

    // Call the backend API
    const response = await fetch(`${BASE_URL}/admins?${query}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Failed to parse backend error response",
      }));
      return NextResponse.json(
        {
          error: errorData.message || "Failed to fetch admins",
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(
      {
        message: "Admins fetched successfully",
        admins: data.admins || data || [],
        total: data.total || data.length || 0,
        pages: data.pages || Math.ceil((data.total || data.length || 0) / parseInt(limit)),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch admins error:", error);
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
    }

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const response = await fetch(`${BASE_URL}/admins`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Failed to parse backend error response",
      }));
      return NextResponse.json(
        {
          error: errorData.message || "Failed to create admin",
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(
      {
        message: "Admin created successfully",
        admin: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create admin error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}