import { NextResponse } from "next/server";

const BASE_URL = "https://music-minds-backend.onrender.com/api/v1";

export async function GET(
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

    // Call the backend API
    const response = await fetch(`${BASE_URL}/admin/broadcasts/${id}`, {
      method: "GET",
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
      
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch broadcast" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(
      { message: "Broadcast fetched successfully", broadcast: data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch broadcast error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const body = await request.json();

    const {
      title,
      message,
      recipientsType,
      specificUsers,
      userFilters,
      isEmergency,
      priority,
      sendAt,
      status
    } = body;

    if (!title || !message || !recipientsType) {
      return NextResponse.json(
        { error: "Missing required fields: title, message, recipientsType" },
        { status: 400 }
      );
    }

    // Call the backend API
    const response = await fetch(`${BASE_URL}/admin/broadcasts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        message,
        recipientsType,
        specificUsers: specificUsers || [],
        userFilters: userFilters || {},
        isEmergency: isEmergency || false,
        priority: priority || "NORMAL",
        sendAt: sendAt || null,
        status: status || "DRAFT"
      }),
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
          { error: errorData.message || "Cannot update sent broadcast" },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: errorData.message || "Failed to update broadcast" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(
      { message: "Broadcast updated successfully", broadcast: data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update broadcast error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Call the backend API
    const response = await fetch(`${BASE_URL}/admin/broadcasts/${id}`, {
      method: "DELETE",
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
          { error: errorData.message || "Cannot delete non-draft broadcast" },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: errorData.message || "Failed to delete broadcast" },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: "Broadcast deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete broadcast error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}