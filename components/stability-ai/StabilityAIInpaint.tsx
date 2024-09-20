"use client";

/*
Esimerkki prompt: a modern living room with white walls and wooden floor
*/
import axios from "axios";
import React, { useState } from "react";

const StabilityAIInpaint: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [mask, setMask] = useState<File | null>(null);
  const [prompt, setPrompt] = useState(
    "a modern living room with white walls and wooden floor"
  );
  const [outputFormat, setOutputFormat] = useState("webp");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "mask"
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

    if (!image || !mask || !prompt) {
      setError("Please provide an image, mask, and prompt.");
      setLoading(false);
      return;
    }

    addDebugInfo(`Image size: ${image.size} bytes`);
    addDebugInfo(`Mask size: ${mask.size} bytes`);
    addDebugInfo(`Prompt: ${prompt}`);
    addDebugInfo(`Output format: ${outputFormat}`);

    const formData = new FormData();
    formData.append("image", image);
    formData.append("mask", mask);
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
        }
      );

      addDebugInfo(`Response status: ${response.status}`);
      addDebugInfo(`Response size: ${response.data.byteLength} bytes`);

      if (response.status === 200) {
        const base64 = Buffer.from(response.data, "binary").toString("base64");
        setResult(`data:image/${outputFormat};base64,${base64}`);
        addDebugInfo("Image successfully processed and displayed");
      } else {
        throw new Error(
          `${response.status}: ${Buffer.from(response.data).toString()}`
        );
      }
    } catch (error: any) {
      console.error("Error:", error);
      addDebugInfo(`Error occurred: ${error.message}`);
      if (error.response) {
        addDebugInfo(`Error status: ${error.response.status}`);
        addDebugInfo(
          `Error data: ${Buffer.from(error.response.data).toString()}`
        );
        setError(
          `Error ${error.response.status}: ${Buffer.from(error.response.data).toString()}`
        );
      } else {
        setError(
          error.message || "An error occurred while processing the image."
        );
      }
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Poista kuvan tausta</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700"
          >
            Original Image
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "image")}
            className="mt-1 block w-full"
            required
          />
        </div>
        <div>
          <label
            htmlFor="mask"
            className="block text-sm font-medium text-gray-700"
          >
            Mask Image
          </label>
          <input
            type="file"
            id="mask"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "mask")}
            className="mt-1 block w-full"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Upload a black and white mask image. White areas will be replaced,
            black areas will be preserved.
          </p>
        </div>
        <div>
          <label
            htmlFor="prompt"
            className="block text-sm font-medium text-gray-700"
          >
            Prompt
          </label>
          <input
            type="text"
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A modern kitchen with stainless steel appliances"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Describe what you want to see in the white areas of the mask.
          </p>
        </div>
        <div>
          <label
            htmlFor="outputFormat"
            className="block text-sm font-medium text-gray-700"
          >
            Output Format
          </label>
          <select
            id="outputFormat"
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          >
            <option value="webp">WebP</option>
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Processing..." : "Generate Image"}
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {result && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Result:</h3>
          <img
            src={result}
            alt="Generated image"
            className="max-w-full rounded-md shadow-lg"
          />
        </div>
      )}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Debug Information:</h3>
        <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
          {debugInfo}
        </pre>
      </div>
      <div>
        <p className="text-gray-600 text-sm">
          Vinkkejä hyvän maskin luomiseen: Varmista, että maski on tarkka
          reunoiltaan. Käytä pehmeää sivellintä (soft brush) tarvittaessa
          pehmentääksesi reunoja. Tarkista, että maski on täysin mustavalkoinen
          ilman harmaasävyjä. Maskin tulee olla sama kokoa kuin alkuperäinen
          kuva.
        </p>
      </div>
    </div>
  );
};

export default StabilityAIInpaint;
