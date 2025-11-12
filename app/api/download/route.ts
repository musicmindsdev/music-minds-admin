import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get("fileUrl");

  if (!fileUrl) {
    return NextResponse.json({ error: "Missing file URL" }, { status: 400 });
  }

  try {
    const response = await fetch(fileUrl);

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch file" }, { status: 400 });
    }

    // Get content headers from backend file
    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const filename = decodeURIComponent(fileUrl.split("/").pop() || "exported-file");

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Download proxy error:", error);
    return NextResponse.json(
      { error: "Internal error during file download" },
      { status: 500 }
    );
  }
}
