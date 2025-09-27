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
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const status = searchParams.get("status") || "";
    const type = searchParams.get("type") || "";
    const isEmergency = searchParams.get("isEmergency") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    // Build query string
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(status && { status }),
      ...(type && { type }),
      ...(isEmergency && { isEmergency }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });

    // Call the backend API
    const response = await fetch(
      `${BASE_URL}/admin/broadcasts?${queryParams.toString()}`,
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
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch broadcasts" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(
      {
        message: "Broadcasts fetched successfully",
        broadcasts: data.broadcasts || data,
        total: data.total || data.length,
        pages: data.pages || Math.ceil((data.total || data.length) / parseInt(limit)),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch broadcasts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    // Parse request body
    const body = await request.json();
    const {
      title,
      message,
      type,
      recipientsType,
      specificUsers,
      userFilters,
      isEmergency,
      priority,
      sendAt,
      status
    } = body;

    if (!title || !message || !type || !recipientsType) {
      return NextResponse.json(
        { error: "Missing required fields: title, message, type, recipientsType" },
        { status: 400 }
      );
    }

    // Call the backend API
    const response = await fetch(`${BASE_URL}/admin/broadcasts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        message,
        type,
        recipientsType,
        specificUsers: specificUsers || [],
        userFilters: userFilters || {},
        isEmergency: isEmergency || false,
        priority: priority || "NORMAL",
        sendAt: sendAt || null,
        status: status || "DRAFT"
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Failed to create broadcast" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(
      { message: "Broadcast created successfully", broadcast: data },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create broadcast error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}