import { NextResponse } from "next/server";

const BASE_URL = "https://music-minds-backend.onrender.com/api/v1";

export async function GET(
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

    // Call the Music Minds API
    const response = await fetch(
      `${BASE_URL}/admin/users/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch user" },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(
      { 
        message: "User fetched successfully",
        user: data
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("User fetch error:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// app/api/admin/users/[id]/route.ts (add PUT method)
export async function PUT(
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
      const body = await request.json();
  
      // Call the Music Minds API
      const response = await fetch(
        `${BASE_URL}/admin/users/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json(
          { error: errorData.message || "Failed to update user" },
          { status: response.status }
        );
      }
  
      const data = await response.json();
      
      return NextResponse.json(
        { 
          message: "User updated successfully",
          user: data
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("User update error:", error);
      
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }

  // app/api/admin/users/[id]/route.ts (add DELETE method)
export async function DELETE(
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
  
      // Call the Music Minds API
      const response = await fetch(
        `${BASE_URL}/admin/users/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json(
          { error: errorData.message || "Failed to delete user" },
          { status: response.status }
        );
      }
  
      const data = await response.json();
      
      return NextResponse.json(
        { 
          message: data.message || "User deleted successfully"
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("User delete error:", error);
      
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }