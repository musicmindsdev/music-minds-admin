import { NextResponse } from "next/server";

const BASE_URL = "https://music-minds-backend.onrender.com/api/v1";

export async function GET(request: Request) {
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

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const status = searchParams.get("status") || "";
    const payerId = searchParams.get("payerId") || "";
    const payeeId = searchParams.get("payeeId") || "";
    const bookingId = searchParams.get("bookingId") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const minAmount = searchParams.get("minAmount") || "";
    const maxAmount = searchParams.get("maxAmount") || "";

    // Build the API URL with query parameters
    let apiUrl = `${BASE_URL}/admin/transactions?page=${page}&limit=${limit}`;
    
    if (status) apiUrl += `&status=${status}`;
    if (payerId) apiUrl += `&payerId=${payerId}`;
    if (payeeId) apiUrl += `&payeeId=${payeeId}`;
    if (bookingId) apiUrl += `&bookingId=${bookingId}`;
    if (dateFrom) apiUrl += `&dateFrom=${dateFrom}`;
    if (dateTo) apiUrl += `&dateTo=${dateTo}`;
    if (minAmount) apiUrl += `&minAmount=${minAmount}`;
    if (maxAmount) apiUrl += `&maxAmount=${maxAmount}`;

    // Call the Music Minds API
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch transactions" },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(
      { 
        message: "Transactions fetched successfully",
        transactions: data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          // You might need to extract total count from headers or response
          total: Array.isArray(data) ? data.length : 0
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Transactions fetch error:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}