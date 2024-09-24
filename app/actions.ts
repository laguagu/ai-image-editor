"use server";

import axios from "axios";

export async function generateImageAction(prompt: string) {
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

export async function searchAndReplaceAction(formData: FormData) {
  try {
    const response = await axios.post(
      "https://api.stability.ai/v2beta/stable-image/edit/search-and-replace",
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          Accept: "image/*",
          "Content-Type": "multipart/form-data",
        },
        responseType: "arraybuffer",
      },
    );

    if (response.status === 200) {
      const base64 = Buffer.from(response.data).toString("base64");
      const outputFormat = formData.get("output_format") as string;
      return {
        success: true,
        data: `data:image/${outputFormat};base64,${base64}`,
      };
    } else {
      throw new Error(
        `${response.status}: ${Buffer.from(response.data).toString()}`,
      );
    }
  } catch (error: any) {
    console.error("Error:", error);
    return {
      success: false,
      error: error.response
        ? `Error ${error.response.status}: ${Buffer.from(error.response.data).toString()}`
        : error.message || "An error occurred while processing the image.",
    };
  }
}

export async function inpaintAction(formData: FormData) {
  try {
    const response = await axios.post(
      "https://api.stability.ai/v2beta/stable-image/edit/inpaint",
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          Accept: "image/*",
          "Content-Type": "multipart/form-data",
        },
        responseType: "arraybuffer",
      },
    );

    if (response.status === 200) {
      const base64 = Buffer.from(response.data, "binary").toString("base64");
      const outputFormat = formData.get("output_format") as string;
      return {
        success: true,
        data: `data:image/${outputFormat};base64,${base64}`,
      };
    } else {
      throw new Error(
        `${response.status}: ${Buffer.from(response.data).toString()}`,
      );
    }
  } catch (error: any) {
    console.error("Error:", error);
    return {
      success: false,
      error: error.response
        ? `Error ${error.response.status}: ${Buffer.from(error.response.data).toString()}`
        : error.message || "An error occurred while processing the image.",
    };
  }
}
