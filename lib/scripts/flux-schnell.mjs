import dotenv from "dotenv";
import fs from "fs";
import fetch from "node-fetch";
import { dirname, join } from "path";
import Replicate from "replicate";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, ".env.local") });

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

if (!REPLICATE_API_TOKEN) {
  console.error("REPLICATE_API_TOKEN is not set in .env.local");
  process.exit(1);
}

const replicate = new Replicate({
  auth: REPLICATE_API_TOKEN,
});

async function createMask(imagePath) {
  console.log("Creating mask...");
  const image = fs.readFileSync(imagePath, { encoding: "base64" });

  const input = {
    image: `data:image/png;base64,${image}`,
  };

  try {
    const output = await replicate.run(
      "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
      { input },
    );

    console.log("Replicate output:", output);

    let maskUrl;
    if (typeof output === "string") {
      maskUrl = output;
    } else if (output && output.mask) {
      maskUrl = output.mask;
    } else {
      throw new Error("Unexpected output format from Replicate API");
    }

    // Lataa ja tallenna maski
    const response = await fetch(maskUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const buffer = await response.buffer();
    const maskPath = join(__dirname, "generated_mask.png");
    fs.writeFileSync(maskPath, buffer);

    console.log("Mask saved as generated_mask.png");
    return maskPath;
  } catch (error) {
    console.error("Error creating mask:", error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response body:", await error.response.text());
    }
    return null;
  }
}

async function changeBackground(imagePath, maskPath, prompt) {
  console.log("Changing background...");
  const image = fs.readFileSync(imagePath, { encoding: "base64" });
  const mask = fs.readFileSync(maskPath, { encoding: "base64" });

  const input = {
    image: `data:image/png;base64,${image}`,
    mask: `data:image/png;base64,${mask}`,
    prompt: prompt,
    num_outputs: 1,
    guidance_scale: 7.5,
    num_inference_steps: 50,
  };

  try {
    const output = await replicate.run(
      "stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd68b3",
      { input },
    );

    // Lataa ja tallenna lopullinen kuva
    const response = await fetch(output[0]);
    const buffer = await response.buffer();
    const outputPath = join(__dirname, "output_with_new_background.png");
    fs.writeFileSync(outputPath, buffer);

    console.log("Final image saved as output_with_new_background.png");
  } catch (error) {
    console.error("Error changing background:", error);
  }
}

async function main() {
  const imagePath = join(__dirname, "sohva.jpg");
  const newBackgroundPrompt =
    "A luxurious living room with modern furniture and a view of a cityscape through large windows";
  const maskPath = await createMask(imagePath);
  if (!maskPath) {
    console.error("Failed to create mask. Exiting.");
    return;
  }

  await changeBackground(imagePath, maskPath, newBackgroundPrompt);
}

main().catch(console.error);
