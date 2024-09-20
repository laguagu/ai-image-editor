/**
 * Component that allows users to search and replace elements in an image using the Stability AI API.
 * Esimerkki prompt: husky standing on a beach with ocean waves
 * Esimerkki search_prompt: background
 * Toinen: golden retriever standing on a beach with ocean waves
 */

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

const StabilityAISearchReplace: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [desiredOutput, setDesiredOutput] = useState("");
  const [replaceElement, setReplaceElement] = useState("");
  const [outputFormat, setOutputFormat] = useState("webp");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
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

    if (!image || !desiredOutput || !replaceElement) {
      setError(
        "Please provide an image, desired output description, and element to replace.",
      );
      setLoading(false);
      return;
    }

    addDebugInfo(`Image size: ${image.size} bytes`);
    addDebugInfo(`Desired Output (prompt): ${desiredOutput}`);
    addDebugInfo(`Replace Element (search_prompt): ${replaceElement}`);
    addDebugInfo(`Output format: ${outputFormat}`);

    const formData = new FormData();
    formData.append("image", image);
    formData.append("prompt", desiredOutput);
    formData.append("search_prompt", replaceElement);
    formData.append("output_format", outputFormat);

    try {
      addDebugInfo("Sending request to API...");
      const response = await axios.post(
        "https://api.stability.ai/v2beta/stable-image/edit/search-and-replace",
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
          <Label htmlFor="image">Image to Edit</Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="desiredOutput">Desired Output Description</Label>
          <Textarea
            id="desiredOutput"
            value={desiredOutput}
            onChange={(e) => setDesiredOutput(e.target.value)}
            placeholder="e.g., golden retriever in a field"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="replaceElement">Element to Replace</Label>
          <Input
            id="replaceElement"
            value={replaceElement}
            onChange={(e) => setReplaceElement(e.target.value)}
            placeholder="e.g., dog"
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
          {loading ? "Processing..." : "Replace Element"}
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
    </div>
  );
};

export default StabilityAISearchReplace;
