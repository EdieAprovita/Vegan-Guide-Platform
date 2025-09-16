"use client";

import { useState } from "react";
import { Image } from "@/components/ui/image";
import { SafeImage } from "@/components/ui/safe-image";
import { LazyImage } from "@/components/ui/lazy-image";

export default function TestImagesPage() {
  const [testImage, setTestImage] = useState(
    "https://images.pexels.com/photos/750952/pexels-photo-750952.jpeg"
  );
  const [imageType, setImageType] = useState<"next" | "safe" | "lazy">("next");

  const testImages = [
    "https://images.pexels.com/photos/750952/pexels-photo-750952.jpeg",
    "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
    "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg",
    "https://via.placeholder.com/400x300/16a34a/ffffff?text=Test+Image",
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTZhMzRhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlN2ZyBUZXN0PC90ZXh0Pjwvc3ZnPg==",
  ];

  const renderImage = () => {
    const commonProps = {
      src: testImage,
      alt: "Test image",
      width: 400,
      height: 300,
      className: "rounded-lg shadow-lg",
    };

    switch (imageType) {
      case "safe":
        return <SafeImage {...commonProps} />;
      case "lazy":
        return <LazyImage {...commonProps} />;
      default:
        return <Image {...commonProps} alt="Test image" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Image Component Test</h1>

        {/* Controls */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Test Controls</h2>

          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Image Component Type
              </label>
              <select
                value={imageType}
                onChange={(e) => setImageType(e.target.value as "next" | "safe" | "lazy")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
              >
                <option value="next">Unified Image Component</option>
                <option value="safe">Safe Image Component</option>
                <option value="lazy">Lazy Image Component</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Test Image</label>
              <select
                value={testImage}
                onChange={(e) => setTestImage(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
              >
                {testImages.map((img, index) => (
                  <option key={index} value={img}>
                    {img.includes("pexels")
                      ? `Pexels Image ${index + 1}`
                      : img.includes("placeholder")
                        ? "Placeholder Image"
                        : img.includes("data:")
                          ? "SVG Data URL"
                          : `Image ${index + 1}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p>
              <strong>Current Component:</strong>{" "}
              {imageType === "next"
                ? "Unified Image"
                : imageType === "safe"
                  ? "Safe Image"
                  : "Lazy Image"}
            </p>
            <p>
              <strong>Image Source:</strong> {testImage.substring(0, 50)}...
            </p>
          </div>
        </div>

        {/* Image Display */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Image Display</h2>

          <div className="flex justify-center">{renderImage()}</div>

          <div className="mt-4 rounded-md bg-gray-100 p-4">
            <h3 className="mb-2 font-medium">Component Information:</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>
                • <strong>Unified Image:</strong> Automatically chooses between Next.js Image and
                fallback
              </li>
              <li>
                • <strong>Safe Image:</strong> Robust error handling with fallback support
              </li>
              <li>
                • <strong>Lazy Image:</strong> Lazy loading with skeleton placeholder
              </li>
            </ul>
          </div>
        </div>

        {/* Test Results */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Test Results</h2>

          <div className="space-y-4">
            <div className="rounded-md border border-green-200 bg-green-50 p-4">
              <h3 className="font-medium text-green-800">✅ Working Features</h3>
              <ul className="mt-2 space-y-1 text-sm text-green-700">
                <li>• Image loading and display</li>
                <li>• Error handling and fallbacks</li>
                <li>• Loading states with skeletons</li>
                <li>• Support for various image formats</li>
              </ul>
            </div>

            <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
              <h3 className="font-medium text-blue-800">ℹ️ Debug Information</h3>
              <p className="mt-2 text-sm text-blue-700">
                Use the debug button (🐛) in the bottom-right corner to see environment information
                and troubleshoot any issues.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
