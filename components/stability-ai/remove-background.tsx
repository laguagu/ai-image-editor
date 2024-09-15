"use client";
import axios from "axios";
import React, { ChangeEvent, FormEvent, useState } from "react";

const RemoveBackgroundComponent: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [outputFormat, setOutputFormat] = useState<string>("png");

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleOutputFormatChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setOutputFormat(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    if (!image) {
      setError("Image is required");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("output_format", outputFormat);

    try {
      const response = await axios.post(
        "https://api.stability.ai/v2beta/stable-image/edit/remove-background",
        formData,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STABILITY_API_KEY}`,
            Accept: "application/json",
          },
          responseType: "json",
        }
      );

      console.log("API Response:", response.data);

      if (response.status === 200 && response.data && response.data.image) {
        setResult(`data:image/${outputFormat};base64,${response.data.image}`);
      } else if (response.data.errors && response.data.errors.length > 0) {
        throw new Error(response.data.errors[0]);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error: any) {
      console.error("Error:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        setError(
          `Error ${error.response.status}: ${JSON.stringify(error.response.data)}`
        );
      } else if (error.request) {
        setError("No response received from the server");
      } else {
        setError(`Error: ${error.message}`);
      }
    }

    setLoading(false);
  };

  return (
    <div>
      <h1>Remove Background from Image</h1>
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
          <label htmlFor="outputFormat">Output Format:</label>
          <select
            id="outputFormat"
            value={outputFormat}
            onChange={handleOutputFormatChange}
          >
            <option value="png">PNG</option>
            <option value="webp">WebP</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading || !image}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {loading ? "Processing..." : "Remove Background"}
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

export default RemoveBackgroundComponent;
