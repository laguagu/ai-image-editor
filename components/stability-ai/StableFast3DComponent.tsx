"use client";
import axios from "axios";
import React, { ChangeEvent, FormEvent, useState } from "react";

const StableFast3DComponent: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
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

    if (!image) {
      setError("Image is required");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await axios.post(
        "https://api.stability.ai/v2beta/3d/stable-fast-3d",
        formData,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STABILITY_API_KEY}`,
            "Content-Type": "multipart/form-data",
          },
          responseType: "arraybuffer",
        },
      );

      if (response.status === 200) {
        const blob = new Blob([response.data], { type: "model/gltf-binary" });
        const url = URL.createObjectURL(blob);
        setResult(url);
      } else {
        throw new Error(
          `${response.status}: ${Buffer.from(response.data).toString()}`,
        );
      }
    } catch (error: any) {
      console.error("Error:", error);
      if (error.response) {
        const errorMessage = error.response.headers["content-type"].includes(
          "application/json",
        )
          ? JSON.parse(Buffer.from(error.response.data).toString())
          : Buffer.from(error.response.data).toString();
        setError(
          `Error ${error.response.status}: ${JSON.stringify(errorMessage)}`,
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
      <h1>Generate 3D Model from Image</h1>
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
        <button type="submit" disabled={loading || !image}>
          {loading ? "Generating..." : "Generate 3D Model"}
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {result && (
        <div>
          <h2>Result:</h2>
          <p>
            3D model generated successfully.{" "}
            <a href={result} download="model.glb">
              Download GLB file
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default StableFast3DComponent;
