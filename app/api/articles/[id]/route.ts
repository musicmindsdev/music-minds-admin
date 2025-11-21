import { NextResponse } from "next/server";

const BASE_URL = "https://music-minds-backend.onrender.com/api/v1";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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

    // Await the params Promise
    const { id } = await params;

    const response = await fetch(`${BASE_URL}/admin/articles/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Article not found" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(
      { message: "Article fetched successfully", article: data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch article error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update article
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

    // Await the params Promise
    const { id } = await params;
    
    const contentType = request.headers.get("content-type") || '';
    console.log("PUT Request Content-Type:", contentType);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let body: Record<string, any> = {};

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData
      const formData = await request.formData();
      
      // Extract all fields from formData
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          // Skip files for now since we're not handling file uploads in PUT
          console.log("File received in PUT:", key, value.name, value.size);
          continue;
        } else {
          body[key] = value;
        }
      }
      
      console.log("PUT FormData parsed body:", body);
      
    } else if (contentType.includes('application/json')) {
      // Handle JSON
      const textBody = await request.text();
      console.log("PUT Raw JSON body:", textBody);
      
      if (!textBody) {
        body = {};
      } else {
        try {
          body = JSON.parse(textBody);
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          return NextResponse.json(
            { error: "Invalid JSON in request body" },
            { status: 400 }
          );
        }
      }
      
      console.log("PUT JSON parsed body:", body);
    } else {
      return NextResponse.json(
        { error: "Unsupported content-type. Expected application/json or multipart/form-data" },
        { status: 400 }
      );
    }

    // Make the request to the backend using PUT
    const response = await fetch(`${BASE_URL}/admin/articles/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    console.log("Backend PUT response status:", response.status);

    // Get the response text to see the actual error
    const responseText = await response.text();
    console.log("Backend PUT response text:", responseText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText || `HTTP ${response.status}` };
      }
      
      console.error("Backend PUT error details:", errorData);
      
      return NextResponse.json(
        { error: errorData.message || `Failed to update article: ${response.status}` },
        { status: response.status }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { message: "Article updated successfully" };
    }

    return NextResponse.json(
      { message: "Article updated successfully", article: data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update article error:", error);
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

    // Await the params Promise
    const { id } = await params;

    const response = await fetch(`${BASE_URL}/admin/articles/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Failed to delete article" },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: "Article deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete article error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}