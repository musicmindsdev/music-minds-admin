import { NextResponse } from "next/server";

const BASE_URL = "https://music-minds-backend.onrender.com/api/v1/admin";

export async function GET(request: Request) {
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
      console.log("Extracted token:", token);
    }

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const status = searchParams.get("status") || "";
    // Note: searchQuery, fromDate, toDate not supported by API; included for UI compatibility
    const searchQuery = searchParams.get("searchQuery") || "";
    const fromDate = searchParams.get("fromDate") || "";
    const toDate = searchParams.get("toDate") || "";

    console.log("Query parameters:", { page, limit, status, searchQuery, fromDate, toDate });

    const query = new URLSearchParams({
      page,
      limit,
      ...(status && { status }),
      ...(searchQuery && { searchQuery }),
      ...(fromDate && { fromDate }),
      ...(toDate && { toDate }),
    }).toString();

    const response = await fetch(`${BASE_URL}/kyc?${query}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Backend response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Failed to parse backend error response",
      }));
      console.error("Backend error response:", errorData);
      return NextResponse.json(
        {
          error: errorData.message || "Failed to fetch KYC submissions",
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Backend response data:", data);

    return NextResponse.json(
      {
        message: "KYC submissions fetched successfully",
        data: data.data || [],
        meta: data.meta || { total: data.data?.length || 0, page: parseInt(page), last_page: data.meta?.last_page || 1 },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch KYC error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: { params: { kycId: string; action: string } }) {
  const { action } = params; // Define action outside the try block
  try {
    const { kycId } = params;
    if (!kycId || !["approve", "decline"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid KYC ID or action" },
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

    const response = await fetch(`${BASE_URL}/kyc/${kycId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: action === "approve" ? "APPROVED" : "REJECTED" }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Failed to parse backend error response",
      }));
      console.error(`Backend error response for ${action}:`, errorData);
      return NextResponse.json(
        {
          error: errorData.message || `Failed to ${action} KYC`,
          details: errorData,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: `KYC ${action}d successfully` },
      { status: 200 }
    );
  } catch (error) {
    console.error(`${action} KYC error:`, error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}