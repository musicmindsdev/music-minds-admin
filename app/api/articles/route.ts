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

    // Parse as FormData for file upload
    const formData = await request.formData();

    // Extract all fields
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const excerpt = formData.get("excerpt") as string;
    const content = formData.get("content") as string;
    const category = formData.get("category") as string;
    const status = formData.get("status") as string;
    const thumbnail = formData.get("thumbnail") as File;
    const emailTemplate = formData.get("emailTemplate") as string;
    const emailSubject = formData.get("emailSubject") as string;
    const emailPreview = formData.get("emailPreview") as string;
    const seoTitle = formData.get("seoTitle") as string;
    const seoDescription = formData.get("seoDescription") as string;
    const tags = formData.get("tags") as string;
    const publishAt = formData.get("publishAt") as string;
    const sendImmediately = formData.get("sendImmediately") as string;

    // Validate required fields
    if (!title || !content || !category || !status) {
      return NextResponse.json(
        { error: "Missing required fields: title, content, category, status" },
        { status: 400 }
      );
    }

    // Create FormData for the backend API
    const backendFormData = new FormData();
    
    // Append all fields
    backendFormData.append("title", title);
    backendFormData.append("slug", slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    backendFormData.append("content", content);
    backendFormData.append("category", category);
    backendFormData.append("status", status);
    
    // Append optional fields if they exist
    if (excerpt) backendFormData.append("excerpt", excerpt);
    if (thumbnail) backendFormData.append("thumbnail", thumbnail);
    if (emailTemplate) backendFormData.append("emailTemplate", emailTemplate);
    if (emailSubject) backendFormData.append("emailSubject", emailSubject);
    if (emailPreview) backendFormData.append("emailPreview", emailPreview);
    if (seoTitle) backendFormData.append("seoTitle", seoTitle);
    if (seoDescription) backendFormData.append("seoDescription", seoDescription);
    if (tags) backendFormData.append("tags", tags);
    if (publishAt) backendFormData.append("publishAt", publishAt);
    if (sendImmediately) backendFormData.append("sendImmediately", sendImmediately);

    // Call the backend API with FormData
    const response = await fetch(`${BASE_URL}/admin/articles`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type - let browser set it with boundary
      },
      body: backendFormData,
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