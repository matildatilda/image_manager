"use client";

import { useState } from "react";
import ImageUploader from "./components/ImageUploader";
import ImageGallery from "./components/ImageGallery";

interface ImageItem {
  id: string;
  preview: string;
  file: File;
}

export default function Home() {
  const [images, setImages] = useState<ImageItem[]>([]);

  const handleImageUpload = (file: File, preview: string) => {
    const newImage: ImageItem = {
      id: `${Date.now()}-${Math.random()}`,
      preview,
      file,
    };
    setImages((prev) => [...prev, newImage]);
  };

  const handleDelete = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20">
      <main className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Image Manager</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload, preview, and manage your images
          </p>
        </div>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Upload Image</h2>
          <ImageUploader onImageUpload={handleImageUpload} />
        </section>

        <section>
          <ImageGallery images={images} onDelete={handleDelete} />
        </section>
      </main>
    </div>
  );
}
