// /api/exports/route.ts
import { NextResponse } from "next/server";

const BASE_URL = "https://music-minds-backend.onrender.com/api/v1";

export async function POST(request: Request) {
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
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Export request body:", JSON.stringify(body, null, 2));

    const { data, format, options } = body;

    // Validate payload
    if (!data || !Array.isArray(data)) {
      return NextResponse.json({ error: "Invalid data: must be an array" }, { status: 400 });
    }

    const invalidItems = data.filter((item, index) => {
      const isObject = item !== null && typeof item === "object" && !Array.isArray(item);
      if (!isObject) {
        console.log(`Invalid item at index ${index}:`, JSON.stringify(item, null, 2));
        console.log(`Type: ${typeof item}, Is array: ${Array.isArray(item)}, Is null: ${item === null}`);
      }
      return !isObject;
    });

    if (invalidItems.length > 0) {
      return NextResponse.json(
        { error: "Each value in data must be a plain object", invalidItems: invalidItems.map((_, index) => index) },
        { status: 400 }
      );
    }

    // Validate field types
    const fieldIssues: string[] = [];
    data.forEach((item, index) => {
      Object.entries(item).forEach(([key, value]) => {
        if (key !== "id" && typeof value !== "string") {
          fieldIssues.push(`Item ${index}, field ${key}: expected string, got ${typeof value}`);
        }
        if (key === "id" && (typeof value !== "number" || !Number.isInteger(value))) {
          fieldIssues.push(`Item ${index}, field id: expected integer, got ${typeof value} (${value})`);
        }
      });
    });

    if (fieldIssues.length > 0) {
      console.log("Field validation issues:", fieldIssues);
      return NextResponse.json({ error: "Invalid field types", details: fieldIssues }, { status: 400 });
    }

    if (!format || !["csv", "excel", "pdf"].includes(format)) {
      return NextResponse.json({ error: "Format must be one of: csv, excel, pdf" }, { status: 400 });
    }

    if (!options || !options.columns || !options.columnHeaders) {
      return NextResponse.json({ error: "Options with columns and columnHeaders are required" }, { status: 400 });
    }

    // Ensure plain objects and numeric IDs
    const cleanedData = data.map((item) => {
      const cleaned = JSON.parse(JSON.stringify(item));
      // Ensure id is a number
      cleaned.id = Number(cleaned.id);
      return cleaned;
    });

    const exportPayload = {
      data: cleanedData,
      format,
      options: {
        ...options,
        orientation: format === "pdf" ? options.orientation || "landscape" : undefined,
      },
      urlExpiresIn: body.urlExpiresIn || 3600,
    };

    console.log("Sending export payload:", JSON.stringify(exportPayload, null, 2));
    console.log("First data item:", JSON.stringify(exportPayload.data[0], null, 2));
    console.log("Type check:", typeof exportPayload.data[0], Array.isArray(exportPayload.data[0]));
    console.log("Is plain object:", Object.getPrototypeOf(exportPayload.data[0]) === Object.prototype);
    console.log("ID type:", typeof exportPayload.data[0].id);

    const response = await fetch(`${BASE_URL}/exports/custom`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(exportPayload),
    });

    const responseText = await response.text();
    console.log("Export API response status:", response.status);
    console.log("Export API response:", responseText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { message: responseText };
        console.log("Failed to parse error response as JSON:", e);
      }
      return NextResponse.json(
        { error: errorData.message || errorData.error || "Failed to export data" },
        { status: response.status }
      );
    }

    const exportData = JSON.parse(responseText);
    return NextResponse.json({ message: "Export created successfully", ...exportData }, { status: 200 });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}