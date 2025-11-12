import { NextResponse } from "next/server";

const BASE_URL = "https://music-minds-backend.onrender.com/api/v1";

export async function POST(request: Request) {
  try {
    // Get authentication token from cookies
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
    
    console.log("Export request received:", {
      dataLength: body.data?.length,
      format: body.format,
      filename: body.options?.filename,
    });

    // Validate required fields
    if (!body.data || !Array.isArray(body.data)) {
      return NextResponse.json(
        { error: "Invalid data format. Expected array of objects." },
        { status: 400 }
      );
    }

    if (!body.format || !["csv", "excel", "pdf"].includes(body.format.toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid format. Must be csv, excel, or pdf." },
        { status: 400 }
      );
    }

    // Call the backend export API
    const response = await fetch(
      `${BASE_URL}/exports/custom`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    console.log("Backend export response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error response:", errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || "Failed to export data" };
      }
      
      return NextResponse.json(
        { error: errorData.message || `HTTP error! status: ${response.status}` },
        { status: response.status }
      );
    }

    const backendResponse = await response.json();
    console.log("Backend full response:", backendResponse);

    // ✅ FIX: Extract data from the nested structure
    const exportData = backendResponse.data || backendResponse;
    
    console.log("Export successful:", {
      filename: exportData.filename,
      format: exportData.format,
      size: exportData.size,
      url: exportData.url ? "URL present" : "No URL",
    });

    // ✅ FIX: Return the nested data object, not the wrapper
    return NextResponse.json(exportData, { status: 201 });
    
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Internal server error",
        details: "An error occurred while processing the export request"
      },
      { status: 500 }
    );
  }
}