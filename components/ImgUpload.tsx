"use client";

import React, { useRef, useState } from "react";

const ImgUpload = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (file) await handleFileUpload(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) await handleFileUpload(file);
  };

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    try {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });
     if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Upload failed from imgupload component");
    }

      const data = await res.json();
      console.log("Uploaded URL frontend:", data.url);
      setImageUrl(data.url);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1]; // remove "data:image/png;base64,"
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-4 border-dashed border-gray-400 rounded-lg w-80 h-48 flex items-center justify-center text-center text-gray-600 cursor-pointer"
      >
        {loading
          ? "Uploading..."
          : "Click or Drag & Drop to upload image"}
      </div>

      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleChange}
        className="hidden"
      />

      {imageUrl && (
        <div>
          <p className="text-sm text-gray-500">Uploaded Image:</p>
          <img
            src={imageUrl}
            alt="Uploaded"
            className="mt-2 rounded shadow-md max-w-xs"
          />
        </div>
      )}
    </div>
  );
};

export default ImgUpload;
