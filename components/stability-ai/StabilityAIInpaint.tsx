"use client";

import { inpaintAction } from "@/app/actions";
import { Label } from "@radix-ui/react-label";
import Image from "next/image";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Slider } from "../ui/slider";
import { Textarea } from "../ui/textarea";

const StabilityAIInpaint: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [mask, setMask] = useState<File | null>(null);
  const [maskOption, setMaskOption] = useState("auto");
  const [prompt, setPrompt] = useState("A sunny day in Helsinki");
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
      const response = await fetch("/api/create-mask", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const maskBlob = await response.blob();
      return new File([maskBlob], "mask.png", { type: "image/png" });
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error creating mask:", error.message);
      } else {
        console.error("Error creating mask:", error);
      }
      throw new Error("Failed to create mask automatically.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log("handleSubmit");
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
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("An unknown error occurred.");
        }
        setLoading(false);
        return;
      }
    }
    // console.log("maskToUse", maskToUse);
    // setLoading(false);
    // return;
    const formData = new FormData();
    formData.append("image", image);
    if (maskToUse) {
      formData.append("mask", maskToUse);
    }
    formData.append("prompt", prompt);
    formData.append("output_format", outputFormat);
    formData.append("grow_mask", growMask.toString());

    const response = await inpaintAction(formData);

    if (response.data) {
      setResult(response.data);
    } else {
      setError(response.error);
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
          <div className="relative w-full max-w-[800px] aspect-[4/3]">
            <Image
              src={result}
              alt="Edited image"
              fill
              className="object-contain rounded-md shadow-lg"
            />
          </div>
          <Button onClick={handleDownload} className="w-full">
            Download Image
          </Button>
        </div>
      )}
    </div>
  );
};

export default StabilityAIInpaint;
