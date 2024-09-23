"use server";

import axios from "axios";

export async function generateImage(prompt: string) {
  const formData = new FormData();
  formData.append("prompt", prompt);
  formData.append("output_format", "webp");

  try {
    const response = await axios.post(
      "https://api.stability.ai/v2beta/stable-image/generate/ultra",
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          Accept: "image/*",
        },
        responseType: "arraybuffer",
      },
    );

    const base64 = Buffer.from(response.data, "binary").toString("base64");
    return { success: true, data: `data:image/webp;base64,${base64}` };
  } catch (error: any) {
    console.error("Error:", error);
    let errorMessage = "An unknown error occurred";

    if (error.response) {
      const responseData = error.response.headers["content-type"].includes(
        "application/json",
      )
        ? JSON.parse(Buffer.from(error.response.data).toString())
        : error.response.data.toString();

      errorMessage = `Server responded with status ${error.response.status}: ${JSON.stringify(responseData)}`;
    } else if (error.request) {
      errorMessage = "No response received from the server";
    } else {
      errorMessage = `Error: ${error.message}`;
    }

    return { success: false, error: errorMessage };
  }
}

export const createAutomaticMask = async (imageBuffer: ArrayBuffer) => {
  const formData = new FormData();
  formData.append("file", new Blob([imageBuffer]), "image.png");
  console.log("createAutomaticMask called");

  try {
    const response = await axios.post(
      "http://stability-ai-backend-service.alyakokeilut.svc.cluster.local:8000/create_mask/",
      formData,
      {
        responseType: "arraybuffer",
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("Error creating mask:", error);

    const errorMessage = error.response
      ? `Server error: ${error.response.status} ${error.response.data}`
      : `Request error: ${error.message}`;

    throw new Error(errorMessage);
  }
};
