"use client";
import axios from "axios";
import React, { ChangeEvent, FormEvent, useState } from "react";

const SearchAndRecolorComponent: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [selectPrompt, setSelectPrompt] = useState<string>("");
  const [outputFormat, setOutputFormat] = useState<string>("webp");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    if (!image || !prompt || !selectPrompt) {
      setError("Image, prompt, and select prompt are required");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("prompt", prompt);
    formData.append("select_prompt", selectPrompt);
    formData.append("output_format", outputFormat);

    try {
      const response = await axios.post(
        "https://api.stability.ai/v2beta/stable-image/edit/search-and-recolor",
        formData,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STABILITY_API_KEY}`,
            Accept: "image/*",
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
      setError(`Error: ${error.message}`);
    }

    setLoading(false);
  };

  return (
    <div>
      <h1>Search and Recolor Image</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="image">Image (required):</label>
          <input
            type="file"
            id="image"
            onChange={handleImageChange}
            required
            accept="image/jpeg,image/png,image/webp"
          />
        </div>
        <div>
          <label htmlFor="prompt">Prompt (required):</label>
          <input
            type="text"
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="selectPrompt">Select Prompt (required):</label>
          <input
            type="text"
            id="selectPrompt"
            value={selectPrompt}
            onChange={(e) => setSelectPrompt(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="outputFormat">Output Format:</label>
          <select
            id="outputFormat"
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
          >
            <option value="webp">WebP</option>
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading || !image || !prompt || !selectPrompt}
        >
          {loading ? "Processing..." : "Search and Recolor"}
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {result && (
        <div>
          <h2>Result:</h2>
          <img
            src={result}
            alt="Processed Image"
            style={{ maxWidth: "100%" }}
          />
        </div>
      )}
    </div>
  );
};

export default SearchAndRecolorComponent;
