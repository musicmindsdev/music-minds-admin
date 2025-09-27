import { NextResponse } from "next/server";

const BASE_URL = "https://music-minds-backend.onrender.com/api/v1";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    // Call the backend API
    const response = await fetch(`${BASE_URL}/admin/broadcasts/${id}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Broadcast not found" },
          { status: 404 }
        );
      }
      
      if (response.status === 409) {
        return NextResponse.json(
          { error: errorData.message || "Cannot cancel non-scheduled broadcast" },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: errorData.message || "Failed to cancel broadcast" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(
      { message: "Broadcast cancelled successfully", broadcast: data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cancel broadcast error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}