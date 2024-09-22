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
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Slider } from "../ui/slider";
import { Textarea } from "../ui/textarea";

const StabilityAIInpaint: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [mask, setMask] = useState<File | null>(null);
  const [maskOption, setMaskOption] = useState("auto");
  const [prompt, setPrompt] = useState(
    "a modern living room with white walls and wooden floor",
  );
  const [outputFormat, setOutputFormat] = useState("webp");
  const [growMask, setGrowMask] = useState(5);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "mask",
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === "image") {
        setImage(file);
      } else if (type === "mask") {
        setMask(file);
      }
    }
  };

  const createAutomaticMask = async (imageFile: File) => {
    const formData = new FormData();
    formData.append("file", imageFile);

    try {
      const response = await axios.post(
        "http://localhost:8000/create_mask/",
        formData,
        {
          responseType: "blob",
        },
      );

      const maskFile = new File([response.data], "mask.png", {
        type: "image/png",
      });
      return maskFile;
    } catch (error) {
      console.error("Error creating mask:", error);
      throw new Error("Failed to create mask automatically.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    if (!image || !prompt) {
      setError("Please provide an image and prompt.");
      setLoading(false);
      return;
    }

    let maskToUse = mask;

    if (maskOption === "auto") {
      try {
        maskToUse = await createAutomaticMask(image);
      } catch (error) {
        setError(
          "Failed to create automatic mask. Please try again or use a custom mask.",
        );
        setLoading(false);
        return;
      }
    }

    const formData = new FormData();
    formData.append("image", image);
    if (maskToUse) {
      formData.append("mask", maskToUse);
    }
    formData.append("prompt", prompt);
    formData.append("output_format", outputFormat);
    formData.append("grow_mask", growMask.toString());

    try {
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

      if (response.status === 200) {
        const base64 = Buffer.from(response.data, "binary").toString("base64");
        setResult(`data:image/${outputFormat};base64,${base64}`);
      } else {
        throw new Error(
          `${response.status}: ${Buffer.from(response.data).toString()}`,
        );
      }
    } catch (error: any) {
      console.error("Error:", error);
      if (error.response) {
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

  const handleDownload = () => {
    if (result) {
      const link = document.createElement("a");
      link.href = result;
      link.download = `generated_image.${outputFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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
          <p className="text-sm text-gray-500">
            When &quot;Use automatic mask&quot; is selected, a mask will be
            created automatically when generating the image.
          </p>
        </div>
        <div className="space-y-2">
          <Label>Mask Options</Label>
          <RadioGroup value={maskOption} onValueChange={setMaskOption}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="auto" id="auto" />
              <Label htmlFor="auto">Use automatic mask</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom">Use custom mask</Label>
            </div>
          </RadioGroup>
        </div>
        {maskOption === "custom" && (
          <div className="space-y-2">
            <Label htmlFor="mask">Mask Image</Label>
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
        )}
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
        <div className="space-y-2">
          <Label htmlFor="growMask">Grow Mask</Label>
          <div className="flex items-center space-x-4">
            <Slider
              id="growMask"
              min={0}
              max={100}
              step={1}
              value={[growMask]}
              onValueChange={(value) => setGrowMask(value[0])}
              className="flex-grow"
            />
            <span className="text-sm font-medium">{growMask}</span>
          </div>
          <p className="text-sm text-gray-500">
            Grows the edges of the mask outward. Higher values can help smooth
            transitions but may affect details.
          </p>
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Processing..." : "Create Edited Image"}
        </Button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {result && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold mb-2">Result:</h3>
          <img
            src={result}
            alt="Edited image"
            className="max-w-full rounded-md shadow-lg"
          />
          <Button onClick={handleDownload} className="w-full">
            Download Image
          </Button>
        </div>
      )}
    </div>
  );
};

export default StabilityAIInpaint;
