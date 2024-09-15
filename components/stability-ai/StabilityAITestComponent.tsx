"use client";
import axios from "axios";
import React, { ChangeEvent, useState } from "react";

const StabilityAITestComponent: React.FC = () => {
  const [prompt, setPrompt] = useState<string>(
    "Lighthouse on a cliff overlooking the ocean"
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

    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("output_format", "webp");

    try {
      const response = await axios.post(
        "https://api.stability.ai/v2beta/stable-image/generate/ultra",
        formData,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STABILITY_API_KEY}`,
            Accept: "image/*",
          },
          responseType: "arraybuffer",
        }
      );

      const base64 = Buffer.from(response.data, "binary").toString("base64");
      setResult(`data:image/webp;base64,${base64}`);
    } catch (error: any) {
      console.error("Error:", error);

      if (error.response) {
        const errorMessage = error.response.headers["content-type"].includes(
          "application/json"
        )
          ? JSON.stringify(
              JSON.parse(Buffer.from(error.response.data).toString()),
              null,
              2
            )
          : error.response.data.toString();

        console.error("Response data:", errorMessage);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
        setError(
          `Server responded with status ${error.response.status}: ${errorMessage}`
        );
      } else if (error.request) {
        console.error("Request:", error.request);
        setError("No response received from the server");
      } else {
        console.error("Error message:", error.message);
        setError(`Error: ${error.message}`);
      }
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
