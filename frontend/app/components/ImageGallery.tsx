"use client";

interface ImageItem {
  id: string;
  preview: string;
  file: File;
}

interface ImageGalleryProps {
  images: ImageItem[];
  onDelete?: (id: string) => void;
}

export default function ImageGallery({ images, onDelete }: ImageGalleryProps) {
  if (images.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No images uploaded yet
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Uploaded Images ({images.length})</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="relative group bg-white dark:bg-gray-800 rounded-lg overflow-hidden aspect-square"
          >
            <img
              src={image.preview}
              alt={image.file.name}
              className="w-full h-full object-contain relative z-0"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center pointer-events-none group-hover:pointer-events-auto relative z-10">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
                <button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = image.preview;
                    link.download = image.file.name;
                    link.click();
                  }}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  Download
                </button>
                {onDelete && (
                  <button
                    onClick={() => onDelete(image.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-2 truncate">
              {image.file.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
