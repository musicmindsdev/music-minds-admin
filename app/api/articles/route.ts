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
    const category = searchParams.get("category") || "";
    const authorId = searchParams.get("authorId") || "";
    const fromDate = searchParams.get("fromDate") || "";
    const toDate = searchParams.get("toDate") || "";
    const search = searchParams.get("search") || "";
    const tag = searchParams.get("tag") || "";

    // Build query string
    const query = new URLSearchParams({
      page,
      limit,
      ...(status && { status }),
      ...(category && { category }),
      ...(authorId && { authorId }),
      ...(fromDate && { fromDate }),
      ...(toDate && { toDate }),
      ...(search && { search }),
      ...(tag && { tag }),
    }).toString();

    // Call the backend API
    const response = await fetch(
      `${BASE_URL}/admin/articles?${query}`,
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
        { error: errorData.message || "Failed to fetch articles" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(
      {
        message: "Articles fetched successfully",
        articles: data.articles || data,
        total: data.total || data.length,
        pages: data.pages || Math.ceil(data.total / parseInt(limit)),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch articles error:", error);
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

    // Parse request body for JSON
    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      category,
      status,
      thumbnail,
      emailTemplate,
      emailSubject,
      emailPreview,
      seoTitle,
      seoDescription,
      tags,
      publishAt,
      sendImmediately
    } = body;

    if (!title || !content || !category || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Call the backend API
    const response = await fetch(`${BASE_URL}/admin/articles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        slug,
        excerpt,
        content,
        category,
        status,
        thumbnail,
        emailTemplate,
        emailSubject,
        emailPreview,
        seoTitle,
        seoDescription,
        tags,
        publishAt,
        sendImmediately
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Failed to create article" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(
      { message: "Article created successfully", data },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create article error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}