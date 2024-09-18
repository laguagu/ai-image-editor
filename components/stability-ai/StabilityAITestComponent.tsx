"use client";
import { generateImage } from "@/app/actions";
import React, { ChangeEvent, useState } from "react";

const StabilityAITestComponent: React.FC = () => {
  const [prompt, setPrompt] = useState<string>(
    "Lighthouse on a cliff overlooking the ocean",
  );
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handlePromptChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const result = await generateImage(prompt);
      if (result.success) {
        setResult(result.data ?? null);
      } else {
        setError(result.error ?? null);
      }
    } catch (error: any) {
      console.error("Error:", error);
      setError(`Error: ${error.message}`);
    }

    setLoading(false);
  };

  return (
    <div>
      <h1>Test Stability AI Stable Image Ultra API</h1>
      <div>
        <label htmlFor="prompt">Prompt: </label>
        <input
          type="text"
          id="prompt"
          value={prompt}
          onChange={handlePromptChange}
          style={{ width: "300px" }}
        />
      </div>
      <button
        onClick={testAPI}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {loading ? "Generating..." : "Generate Image"}
      </button>
      {error && (
        <div style={{ color: "red", marginTop: "10px" }}>
          <h3>Error:</h3>
          <pre>{error}</pre>
        </div>
      )}
      {result && (
        <div style={{ marginTop: "10px" }}>
          <h3>Generated Image:</h3>
          <img src={result} alt="Generated" style={{ maxWidth: "100%" }} />
        </div>
      )}
    </div>
  );
};

export default StabilityAITestComponent;
