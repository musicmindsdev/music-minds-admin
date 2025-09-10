import {  NextResponse } from "next/server";

const BASE_URL = process.env.BACKEND_URL || "https://music-minds-backend.onrender.com/api/v1/admin";

export async function POST(request: Request) {
  try {
    console.log("Invite API called");
    
    const cookieHeader = request.headers.get("cookie");
    let token = null;

    if (cookieHeader) {
      const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split("=");
        acc[name] = value;
        return acc;
      }, {} as Record<string, string>);
      token = cookies.accessToken || null;
      console.log("Token found:", !!token);
    }

    if (!token) {
      console.error("No token found");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("Request body:", JSON.stringify(body, null, 2));

    const response = await fetch(`${BASE_URL}/invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    console.log("Backend response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Failed to parse backend error response",
      }));
      console.error("Backend error:", errorData);
      
      return NextResponse.json(
        {
          error: errorData.message || "Failed to send invitation",
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Backend success:", data);

    return NextResponse.json(
      {
        message: "Invitation sent successfully",
        invitation: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Send invitation error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}