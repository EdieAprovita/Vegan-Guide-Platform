"use client";

import React, { useState, useEffect } from "react";

interface DebugInfo {
  nextImageAvailable: boolean;
  reactVersion: string;
  nextVersion: string;
  userAgent: string;
  imageSupport: {
    webp: boolean;
    avif: boolean;
    svg: boolean;
  };
}

export function DebugInfo() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const info: DebugInfo = {
      nextImageAvailable: false,
      reactVersion: React.version || "Unknown",
      nextVersion: "Unknown",
      userAgent: navigator.userAgent,
      imageSupport: {
        webp: false,
        avif: false,
        svg: true,
      },
    };

    // Check Next.js Image availability - use dynamic import instead of require
    try {
      // Check if we're in a Next.js environment
      if (
        typeof window !== "undefined" &&
        (window as Window & { __NEXT_DATA__?: unknown }).__NEXT_DATA__
      ) {
        info.nextImageAvailable = true;
        info.nextVersion = "15+ (detected from __NEXT_DATA__)";
      } else {
        // Try to check if Next.js Image is available
        info.nextImageAvailable =
          typeof window !== "undefined" &&
          typeof (window as Window & { __NEXT_IMAGE_IMPORT_DEFAULT__?: unknown })
            .__NEXT_IMAGE_IMPORT_DEFAULT__ !== "undefined";
      }
    } catch {
      info.nextImageAvailable = false;
    }

    // Check image format support
    if (typeof window !== "undefined") {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Check WebP support
        canvas.width = 1;
        canvas.height = 1;
        try {
          const webpData = canvas.toDataURL("image/webp");
          info.imageSupport.webp = webpData.startsWith("data:image/webp");
        } catch {
          info.imageSupport.webp = false;
        }

        // Check AVIF support
        try {
          const avifData = canvas.toDataURL("image/avif");
          info.imageSupport.avif = avifData.startsWith("data:image/avif");
        } catch {
          info.imageSupport.avif = false;
        }
      }
    }

    setDebugInfo(info);
  }, []);

  if (!debugInfo) return null;

  return (
    <>
      {/* Debug Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed right-4 bottom-4 z-50 rounded-md bg-gray-800 px-3 py-2 text-xs text-white opacity-50 transition-opacity hover:opacity-100"
        title="Toggle Debug Info"
      >
        🐛 Debug
      </button>

      {/* Debug Info Panel */}
      {isVisible && (
        <div className="fixed right-4 bottom-16 z-50 max-w-sm rounded-md bg-gray-900 p-4 text-xs text-white shadow-lg">
          <h3 className="mb-2 font-bold text-green-400">Debug Information</h3>

          <div className="space-y-1">
            <div>
              <span className="text-gray-400">Next.js Image:</span>
              <span className={debugInfo.nextImageAvailable ? "text-green-400" : "text-red-400"}>
                {debugInfo.nextImageAvailable ? "Available" : "Not Available"}
              </span>
            </div>

            <div>
              <span className="text-gray-400">React:</span>
              <span className="text-blue-400">{debugInfo.reactVersion}</span>
            </div>

            <div>
              <span className="text-gray-400">Next.js:</span>
              <span className="text-blue-400">{debugInfo.nextVersion}</span>
            </div>

            <div>
              <span className="text-gray-400">WebP:</span>
              <span className={debugInfo.imageSupport.webp ? "text-green-400" : "text-red-400"}>
                {debugInfo.imageSupport.webp ? "Supported" : "Not Supported"}
              </span>
            </div>

            <div>
              <span className="text-gray-400">AVIF:</span>
              <span className={debugInfo.imageSupport.avif ? "text-green-400" : "text-red-400"}>
                {debugInfo.imageSupport.avif ? "Supported" : "Not Supported"}
              </span>
            </div>

            <div>
              <span className="text-gray-400">SVG:</span>
              <span className={debugInfo.imageSupport.svg ? "text-green-400" : "text-red-400"}>
                {debugInfo.imageSupport.svg ? "Supported" : "Not Supported"}
              </span>
            </div>
          </div>

          <div className="mt-3 border-t border-gray-700 pt-2">
            <div className="text-xs text-gray-400">
              <div>User Agent:</div>
              <div className="break-all">{debugInfo.userAgent.substring(0, 100)}...</div>
            </div>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="mt-3 w-full rounded bg-gray-700 px-2 py-1 text-xs transition-colors hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      )}
    </>
  );
}
