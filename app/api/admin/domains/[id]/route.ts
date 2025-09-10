import {  NextResponse } from "next/server";

const BASE_URL = process.env.BACKEND_URL || "https://music-minds-backend.onrender.com/api/v1/admin";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
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

    const { id } = params;

    const response = await fetch(`${BASE_URL}/domains/${id}`, {
      method: "DELETE",
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
          error: errorData.message || "Failed to delete domain",
          details: errorData,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: "Domain deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete domain error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}