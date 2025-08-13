"use client";

import { searchAndReplaceAction } from "@/app/actions";
import { Label } from "@radix-ui/react-label";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

/**
 * Component that allows users to search and replace elements in an image using the Stability AI API.
 * Default example:
 * - Desired Output: "A dog of the Golden Retriever breed in a field"
 * - Element to Replace: "Dog in middle of the picture"
 */
const StabilityAISearchReplace: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [desiredOutput, setDesiredOutput] = useState("A dog of the Golden Retriever breed in a field");
  const [replaceElement, setReplaceElement] = useState("Dog in middle of the picture");
  const [outputFormat, setOutputFormat] = useState("webp");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    if (!image || !desiredOutput || !replaceElement) {
      setError(
        "Please provide an image, desired output description, and element to replace.",
      );
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("prompt", desiredOutput);
    formData.append("search_prompt", replaceElement);
    formData.append("output_format", outputFormat);

    const result = await searchAndReplaceAction(formData);

    if (result.success) {
      setResult(result.data ?? null);
    } else {
      setError(result.error);
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
            placeholder="A dog of the Golden Retriever breed in a field"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="replaceElement">Element to Replace</Label>
          <Input
            id="replaceElement"
            value={replaceElement}
            onChange={(e) => setReplaceElement(e.target.value)}
            placeholder="Dog in middle of the picture"
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
    </div>
  );
};

export default StabilityAISearchReplace;
