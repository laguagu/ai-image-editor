"use client";

import Image from "next/image";
import React, { ChangeEvent, useState } from "react";

const BackgroundRemovalTester: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
      setError("Valitse kelvollinen kuvatiedosto.");
    }
  };

  const removeBackground = async () => {
    if (!selectedFile) {
      setError("Valitse ensin kuva.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile, selectedFile.name);

    try {
      const response = await fetch("http://localhost:8000/remove-background/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const blob = await response.blob();
      setResultImage(URL.createObjectURL(blob));
    } catch (err) {
      console.error("Error details:", err);
      setError(
        `Virhe taustan poistossa: ${
          err instanceof Error ? err.message : "Tuntematon virhe"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Taustan poiston testaus</h1>

      <input
        type="file"
        onChange={handleFileChange}
        accept="image/*"
        className="mb-4"
      />

      {previewUrl && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Alkuperäinen kuva:</h2>
          <Image
            src={previewUrl}
            alt="Preview"
            style={{ maxWidth: "300px", height: "auto" }}
            width={300}
            height={300}
          />
        </div>
      )}

      <button
        onClick={removeBackground}
        disabled={!selectedFile || isLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {isLoading ? "Käsitellään..." : "Poista tausta"}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {resultImage && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Käsitelty kuva:</h2>
          <Image
            src={resultImage}
            alt="Result"
            style={{ maxWidth: "300px", height: "auto" }}
            width={300}
            height={300}
          />
        </div>
      )}
    </div>
  );
};

export default BackgroundRemovalTester;
