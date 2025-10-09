import { NextResponse } from "next/server";

const BASE_URL = "https://music-minds-backend.onrender.com/api/v1";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["PENDING", "COMPLETED", "FAILED", "CANCELLED", "REFUNDED"];
    if (!validStatuses.includes(status.toUpperCase())) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Call the Music Minds API to update transaction status
    const response = await fetch(`${BASE_URL}/admin/transactions/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ status: status.toUpperCase() }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Transaction not found" },
          { status: 404 }
        );
      }
      
      if (response.status === 400) {
        return NextResponse.json(
          { error: "Invalid status transition" },
          { status: 400 }
        );
      }
      
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Failed to update transaction status" },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(
      { 
        message: "Transaction status updated successfully",
        transaction: data
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Transaction status update error:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}