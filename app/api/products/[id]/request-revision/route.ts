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
    const body = await request.json();
    if (!body.revisionNotes || typeof body.revisionNotes !== "string" || !body.revisionNotes.trim()) {
      return NextResponse.json({ error: "Revision notes are required" }, { status: 400 });
    }

    const response = await fetch(`https://music-minds-backend.onrender.com/api/v1/admin/products/${id}/request-revision`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ revisionNotes: body.revisionNotes }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({ error: errorData.error || "Failed to request revision" }, { status: response.status });
    }

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error("Error in request revision API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}