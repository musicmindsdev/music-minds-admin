import { NextResponse } from "next/server";

const BASE_URL = process.env.BACKEND_URL || "https://music-minds-backend.onrender.com/api/v1";

export async function GET(request: Request) {
  try {
    // Extract token from cookies
    const cookieHeader = request.headers.get("cookie");
    let token = null;

    console.log("=== FRONTEND REQUEST STARTED ===");
    console.log("Cookie header present:", !!cookieHeader);

    if (cookieHeader) {
      const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split("=");
        acc[name] = value;
        return acc;
      }, {} as Record<string, string>);
      token = cookies.accessToken || null;
      console.log("Token extracted:", token ? "YES" : "NO");
      if (token) {
        console.log("Token length:", token.length);
        console.log("Token preview:", token.substring(0, 20) + "...");
      }
    }

    if (!token) {
      console.log("=== ERROR: No token found ===");
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

    // CORRECT ENDPOINT for admins
    const backendUrl = `${BASE_URL}/admin/admins?${query}`;
    
    console.log("=== BACKEND API CALL DETAILS ===");
    console.log("Full URL:", backendUrl);
    console.log("Query params:", { page, limit, searchQuery });
    console.log("Request method: GET");
    console.log("Headers:", {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token.substring(0, 20)}...`
    });

    // Call the backend API
    const startTime = Date.now();
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const responseTime = Date.now() - startTime;

    console.log("=== BACKEND RESPONSE ===");
    console.log("Response time:", responseTime + "ms");
    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);
    console.log("OK:", response.ok);
    
    // Log all response headers
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    console.log("Response Headers:", responseHeaders);

    if (!response.ok) {
      console.log("=== BACKEND ERROR RESPONSE ===");
      const errorText = await response.text();
      console.log("Error Response Body (raw):", errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
        console.log("Error Response Body (parsed):", JSON.stringify(errorData, null, 2));
      } catch (parseError) {
        console.log("Error parsing error response as JSON");
        errorData = { 
          message: "Failed to parse error response", 
          raw: errorText,
          parseError: parseError instanceof Error ? parseError.message : String(parseError)
        };
      }
      
      console.log("=== RETURNING ERROR TO FRONTEND ===");
      return NextResponse.json(
        {
          error: errorData.message || `Backend returned ${response.status}`,
          details: errorData,
          status: response.status,
        },
        { status: response.status }
      );
    }

    // Success case
    console.log("=== BACKEND SUCCESS RESPONSE ===");
    const responseText = await response.text();
    console.log("Success Response Body (raw):", responseText);
    console.log("Response length:", responseText.length);
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log("Success Response Body (parsed):", JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.log("=== JSON PARSE ERROR ===");
      console.log("Parse error:", parseError);
      console.log("Response text that failed to parse:", responseText);
      
      return NextResponse.json(
        {
          error: "Invalid JSON response from backend",
          details: {
            parseError: parseError instanceof Error ? parseError.message : String(parseError),
            rawResponse: responseText.substring(0, 500) // First 500 chars
          },
        },
        { status: 500 }
      );
    }

    console.log("=== RESPONSE ANALYSIS ===");
    console.log("Data type:", typeof data);
    console.log("Is array:", Array.isArray(data));
    console.log("Data length:", Array.isArray(data) ? data.length : "N/A (not array)");
    
    if (Array.isArray(data)) {
      console.log("First item sample:", data[0] ? JSON.stringify(data[0], null, 2) : "Empty array");
    } else {
      console.log("Data keys:", Object.keys(data));
    }

    // Prepare response data
    const users = Array.isArray(data) ? data : data.admins || data.data || [];
    const total = data.total || data.meta?.total || (Array.isArray(data) ? data.length : 0);
    const pages = data.pages || data.meta?.lastPage || Math.ceil(total / parseInt(limit));

    console.log("=== FINAL RESPONSE TO FRONTEND ===");
    console.log("Users count:", users.length);
    console.log("Total:", total);
    console.log("Pages:", pages);

    const finalResponse = {
      message: "Admins fetched successfully",
      admins: users,
      total: total,
      pages: pages,
      currentPage: parseInt(page),
      limit: parseInt(limit),
    };

    console.log("Final response structure:", JSON.stringify(finalResponse, null, 2));

    return NextResponse.json(finalResponse, { status: 200 });
  } catch (error) {
    console.error("=== UNEXPECTED ERROR ===");
    console.error("Error type:", typeof error);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
    console.error("Error full object:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        details: {
          message: error instanceof Error ? error.message : "Unknown error",
          type: typeof error,
        },
      },
      { status: 500 }
    );
  }
}