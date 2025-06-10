"use client";
import { useEffect, useState } from "react";

export default function WardrobeGallery() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      const res = await fetch("/api/images");
      const data = await res.json();
      setImages(data.images || []);
      setLoading(false);
    };
    fetchImages();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Your Wardrobe</h2>
      {loading ? (
        <p>Loading images...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Wardrobe item ${index}`}
              className="w-full rounded shadow"
            />
          ))}
        </div>
      )}
    </div>
  );
}
