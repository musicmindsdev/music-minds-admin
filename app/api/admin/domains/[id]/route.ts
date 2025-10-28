import { NextResponse } from "next/server";

const BASE_URL = process.env.BACKEND_URL || "https://music-minds-backend.onrender.com/api/v1/admin";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Await the params since they're now a Promise
    const { id } = await params;
    
    console.log("🔄 Deleting domain with ID:", id);
    console.log("🔗 Backend URL:", `${BASE_URL}/domains/${id}`);

    const response = await fetch(`${BASE_URL}/domains/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("📊 Backend response status:", response.status);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      console.error("❌ Backend delete error:", errorData);
      
      return NextResponse.json(
        {
          error: errorData.message || "Failed to delete domain",
          details: errorData,
        },
        { status: response.status }
      );
    }

    // Check if backend returns any content
    let responseData;
    try {
      responseData = await response.json();
    } catch {
      responseData = { message: "Domain deleted successfully" };
    }

    console.log("✅ Domain deleted successfully");

    return NextResponse.json(
      responseData,
      { status: 200 }
    );
  } catch (error) {
    console.error("💥 Delete domain error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}