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
    const createdById = searchParams.get("createdById") || "";
    const fromDate = searchParams.get("fromDate") || "";
    const toDate = searchParams.get("toDate") || "";
    const searchQuery = searchParams.get("searchQuery") || "";

    // Build query string
    const query = new URLSearchParams({
      page,
      limit,
      ...(status && { status }),
      ...(type && { type }),
      ...(createdById && { createdById }),
      ...(fromDate && { fromDate }),
      ...(toDate && { toDate }),
      ...(searchQuery && { searchQuery }),
    }).toString();

    // Call the backend API
    const response = await fetch(
      `${BASE_URL}/admin/content/announcements?${query}`,
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
        { error: errorData.message || "Failed to fetch announcements" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(
      {
        message: "Announcements fetched successfully",
        announcements: data.announcements || data,
        total: data.total || data.length,
        pages: data.pages || Math.ceil(data.total / parseInt(limit)),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch announcements error:", error);
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

    // Parse multipart/form-data
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const media = formData.get("media") as File | null;
    const type = formData.get("type") as string;
    const status = formData.get("status") as string;

    if (!title || !content || !type || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create FormData for backend API
    const backendFormData = new FormData();
    backendFormData.append("title", title);
    backendFormData.append("content", content);
    backendFormData.append("type", type);
    backendFormData.append("status", status);
    if (media) {
      backendFormData.append("media", media);
    }

    // Call the backend API
    const response = await fetch(`${BASE_URL}/admin/content/announcements`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Failed to create announcement" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(
      { message: "Announcement created successfully", data },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create announcement error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}