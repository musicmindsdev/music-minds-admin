import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  // Await the params before using them
  const { id } = await params;
  
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await fetch(`https://music-minds-backend.onrender.com/api/v1/admin/products/${id}/unfeature`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({ error: errorData.error || "Failed to unfeature product" }, { status: response.status });
    }

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error("Error in unfeature product API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}