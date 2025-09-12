import { NextResponse } from "next/server";

const BASE_URL = "https://music-minds-backend.onrender.com/api/v1/admin";

// Get specific KYC submission details (optional - if you need this functionality)
export async function GET(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params since they're now a Promise
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "KYC ID is required" },
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
    }

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const response = await fetch(`${BASE_URL}/kyc/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Failed to parse backend error response",
      }));
      return NextResponse.json(
        {
          error: errorData.message || "Failed to fetch KYC submission",
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(
      {
        message: "KYC submission fetched successfully",
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch specific KYC error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Review KYC submission (approve or reject)
export async function PATCH(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "KYC ID is required" },
        { status: 400 }
      );
    }

    // Extract authentication token
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
    const { status, rejectionReason } = body;

    // Validate required fields
    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Valid status (APPROVED or REJECTED) is required" },
        { status: 400 }
      );
    }

    // Extract user ID from token to use as reviewedById
    let reviewedById = null;
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      reviewedById = payload.id;
    } catch (error) {
      console.error("Failed to extract user ID from token:", error);
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reviewData: any = {
      id,
      status,
      reviewedById,
    };

    // Handle rejection reason based on status
    if (status === "REJECTED") {
      if (!rejectionReason) {
        return NextResponse.json(
          { error: "Rejection reason is required when rejecting KYC" },
          { status: 400 }
        );
      }
      reviewData.rejectionReason = rejectionReason;
    } else {
      // For APPROVED status, send empty string if backend requires it
      reviewData.rejectionReason = "";
    }

    console.log("Sending to backend:", reviewData);

    // Call the backend API using the correct endpoint
    const response = await fetch(`${BASE_URL}/kyc/${id}/review`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reviewData),
    });

    console.log("Backend response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Failed to parse backend error response",
      }));
      console.error("Backend error response:", errorData);
      return NextResponse.json(
        {
          error: errorData.message || `Failed to review KYC submission`,
          details: errorData,
        },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    return NextResponse.json(
      {
        message: `KYC submission ${status.toLowerCase()} successfully`,
        data: responseData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Review KYC error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}