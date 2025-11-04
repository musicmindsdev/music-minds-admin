// /api/users/[id]/unblacklist/route.ts
import { NextResponse } from "next/server";

const BASE_URL = "https://music-minds-backend.onrender.com/api/v1";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("=== UNBLACKLIST USER API CALL STARTED ===");
    
    const cookieHeader = request.headers.get("cookie");
    let token = null;
    
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

    const { id } = await params;
    console.log("User ID to unblacklist:", id);

    // CORRECTED: Use the correct unblacklist endpoint
    const backendUrl = `${BASE_URL}/admin/users/${id}/unblacklist`;
    
    console.log("=== BACKEND API CALL DETAILS ===");
    console.log("Full URL:", backendUrl);
    console.log("Request method: PUT");
    console.log("Headers:", {
      "Authorization": `Bearer ${token.substring(0, 20)}...`
    });

    // Call the backend API
    const startTime = Date.now();
    const response = await fetch(
      backendUrl,
      {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      }
    );
    const responseTime = Date.now() - startTime;

    console.log("=== BACKEND RESPONSE ===");
    console.log("Response time:", responseTime + "ms");
    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);
    console.log("OK:", response.ok);

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
            rawResponse: responseText.substring(0, 500)
          },
        },
        { status: 500 }
      );
    }

    console.log("=== UNBLACKLIST SUCCESSFUL ===");
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("=== UNEXPECTED ERROR IN UNBLACKLIST ===");
    console.error("Error:", error);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    
    return NextResponse.json(
      {
        error: "Internal server error",
        details: {
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}