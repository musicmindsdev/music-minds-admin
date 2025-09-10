import { NextResponse } from "next/server";

const BASE_URL = "https://music-minds-backend.onrender.com/api/v1/admin";

// Update booking status
export async function PUT(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params since they're now a Promise
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Booking ID is required" },
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
      console.log("Extracted token for booking status update:", token);
    }

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Valid status is required. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // Call the backend API
    const response = await fetch(`${BASE_URL}/content/bookings/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    console.log("Backend response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Failed to parse backend error response",
      }));
      console.error("Backend error response:", errorData);
      return NextResponse.json(
        {
          error: errorData.message || "Failed to update booking status",
          details: errorData,
        },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    console.log("Backend response data:", responseData);

    return NextResponse.json(
      {
        message: `Booking status updated to ${status} successfully`,
        data: responseData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update booking status error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}