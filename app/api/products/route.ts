import { NextResponse } from "next/server";

const BASE_URL = "https://music-minds-backend.onrender.com/api/v1";

export async function GET(request: Request) {
  console.log("=== PRODUCTS API ROUTE CALLED ===");
  
  try {
    // Extract token from cookies
    const cookieHeader = request.headers.get("cookie");
    console.log("Cookie header:", cookieHeader || "None");

    let token = null;
    if (cookieHeader) {
      const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split("=");
        acc[name] = value;
        return acc;
      }, {} as Record<string, string>);
      token = cookies.accessToken || null;
    }

    console.log("Token found:", !!token, "Token:", token || "None");

    if (!token) {
      console.log("Returning 401 - No token");
      return NextResponse.json(
        { error: "Authentication required", details: "No accessToken found in cookies" },
        { status: 401 }
      );
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "20";
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const type = searchParams.get("type") || "";
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";
    const rating = searchParams.get("rating") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const creatorId = searchParams.get("creatorId") || "";
    const featured = searchParams.get("featured") || "";
    const digital = searchParams.get("digital") || "";
    const tags = searchParams.get("tags") || "";

    const query = new URLSearchParams({
      page,
      limit,
      ...(status && { status }),
      ...(search && { search }),
      ...(category && { category }),
      ...(type && { type }),
      ...(minPrice && { minPrice }),
      ...(maxPrice && { maxPrice }),
      ...(rating && { rating }),
      ...(sortBy && { sortBy }),
      ...(sortOrder && { sortOrder }),
      ...(creatorId && { creatorId }),
      ...(featured && { featured }),
      ...(digital && { digital }),
      ...(tags && { tags }),
    }).toString();

    const apiUrl = `${BASE_URL}/products?${query}`;
    console.log("Backend URL:", apiUrl);

    // Call the backend API
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Backend response status:", response.status, "Status text:", response.statusText);

    if (!response.ok) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let errorData: { message?: string; [key: string]: any } = {};
      try {
        errorData = await response.json();
        console.error("Backend error data:", JSON.stringify(errorData, null, 2));
      } catch (jsonError) {
        console.error("Failed to parse backend error response:", jsonError);
        errorData = { message: `HTTP Error: ${response.status} ${response.statusText}` };
      }
      return NextResponse.json(
        {
          error: errorData.message || `Failed to fetch products (Status: ${response.status})`,
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Backend response data:", JSON.stringify(data, null, 2));

    return NextResponse.json(
      {
        message: "Products fetched successfully",
        data: Array.isArray(data) ? data : data.data || [],
        meta: {
          total: data.meta?.total || data.length || 0,
          page: parseInt(page),
          last_page: data.meta?.last_page || Math.ceil((data.meta?.total || data.length || 0) / parseInt(limit)),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("=== PRODUCTS API ERROR ===");
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack available");
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}