import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  const newFormData = new FormData();
  newFormData.append("file", new Blob([buffer]), file.name);

  try {
    const response = await axios.post(
      `${process.env.STABILITY_AI_BACKEND_URL}/create_mask/` ||
        "http://localhost:8000/create_mask/",
      newFormData,
      {
        responseType: "arraybuffer",
      },
    );

    return new NextResponse(response.data, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
      },
    });
  } catch (error: any) {
    console.error("Error creating mask:", error);
    const errorMessage = error.response
      ? `Server error: ${error.response.status} ${error.response.data}`
      : `Request error: ${error.message}`;
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
