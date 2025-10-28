import { NextResponse } from "next/server";

const BASE_URL = "https://music-minds-backend.onrender.com/api/v1/admin/content";

export async function POST(
  request: Request, 
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  try {
    // Await the params since they're now a Promise
    const { id, action } = await params;
    
    if (!id || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid review ID or action" },
        { status: 400 }
      );
    }

    const cookieHeader = request.headers.get("cookie");
    let token = null;
    if (cookieHeader) {
      const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split("=");
        acc[name] = value;
        return acc;
      }, {} as Record<string, string>);
      token = cookies.accessToken || null;
      console.log(`Extracted token for ${action}:`, token);
    }

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Assume backend uses PATCH with a status body
    const response = await fetch(`${BASE_URL}/reviews/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: action === "approve" ? "Approved" : "Rejected" }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Failed to parse backend error response",
      }));
      console.error(`Backend error response for ${action}:`, errorData);
      return NextResponse.json(
        {
          error: errorData.message || `Failed to ${action} review`,
          details: errorData,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: `Review ${action}d successfully` },
      { status: 200 }
    );
  } catch (error) {
    console.error(` review error:`, error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}