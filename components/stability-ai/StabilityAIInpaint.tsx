"use client";

import { Label } from "@radix-ui/react-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select";
import axios from "axios";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

const StabilityAIInpaint: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [mask, setMask] = useState<File | null>(null);
  const [prompt, setPrompt] = useState(
    "a modern living room with white walls and wooden floor",
  );
  const [outputFormat, setOutputFormat] = useState("webp");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "mask",
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === "image") setImage(file);
      else setMask(file);
    }
  };

  const addDebugInfo = (info: string) => {
    setDebugInfo((prev) => prev + info + "\n");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setDebugInfo("");

    if (!image || !prompt) {
      setError("Please provide an image and prompt.");
      setLoading(false);
      return;
    }

    addDebugInfo(`Image size: ${image.size} bytes`);
    if (mask) addDebugInfo(`Mask size: ${mask.size} bytes`);
    addDebugInfo(`Prompt: ${prompt}`);
    addDebugInfo(`Output format: ${outputFormat}`);

    const formData = new FormData();
    formData.append("image", image);
    if (mask) formData.append("mask", mask);
    formData.append("prompt", prompt);
    formData.append("output_format", outputFormat);

    try {
      addDebugInfo("Sending request to API...");
      const response = await axios.post(
        "https://api.stability.ai/v2beta/stable-image/edit/inpaint",
        formData,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STABILITY_API_KEY}`,
            Accept: "image/*",
            "Content-Type": "multipart/form-data",
          },
          responseType: "arraybuffer",
        },
      );

      addDebugInfo(`Response status: ${response.status}`);
      addDebugInfo(`Response size: ${response.data.byteLength} bytes`);

      if (response.status === 200) {
        const base64 = Buffer.from(response.data, "binary").toString("base64");
        setResult(`data:image/${outputFormat};base64,${base64}`);
        addDebugInfo("Image successfully processed and displayed");
      } else {
        throw new Error(
          `${response.status}: ${Buffer.from(response.data).toString()}`,
        );
      }
    } catch (error: any) {
      console.error("Error:", error);
      addDebugInfo(`Error occurred: ${error.message}`);
      if (error.response) {
        addDebugInfo(`Error status: ${error.response.status}`);
        addDebugInfo(
          `Error data: ${Buffer.from(error.response.data).toString()}`,
        );
        setError(
          `Error ${error.response.status}: ${Buffer.from(error.response.data).toString()}`,
        );
      } else {
        setError(
          error.message || "An error occurred while processing the image.",
        );
      }
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="image">Original Image</Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "image")}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mask">Mask Image (Optional)</Label>
          <Input
            id="mask"
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "mask")}
          />
          <p className="text-sm text-gray-500">
            Upload a black and white mask image. White areas will be replaced
            with new content, black areas will be preserved.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="prompt">Description</Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A modern kitchen with stainless steel appliances"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="outputFormat">Output Format</Label>
          <Select value={outputFormat} onValueChange={setOutputFormat}>
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="webp">WebP</SelectItem>
              <SelectItem value="png">PNG</SelectItem>
              <SelectItem value="jpeg">JPEG</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Processing..." : "Create Edited Image"}
        </Button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {result && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Result:</h3>
          <img
            src={result}
            alt="Edited image"
            className="max-w-full rounded-md shadow-lg"
          />
        </div>
      )}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Debug Info:</h3>
        <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
          {debugInfo}
        </pre>
      </div>
      <div className="mt-4">
        <p className="text-gray-600 text-sm">
          Tips for creating a good mask: Ensure the mask has sharp edges. Use a
          soft brush to feather edges if needed. Check that the mask is purely
          black and white without grayscale. The mask should be the same size as
          the original image.
        </p>
      </div>
    </div>
  );
};

export default StabilityAIInpaint;
