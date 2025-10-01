import React from "react";
import styles from "./CardImage.module.css";

export interface CardImageProps {
  src: string;
  alt: string;
  loading?: boolean;
  error?: boolean;
  parallax?: boolean;
  overlay?: boolean;
  className?: string;
}

export default function CardImage({
  src,
  alt,
  loading = false,
  error = false,
  parallax = false,
  overlay = false,
  className = "",
}: CardImageProps) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  return (
    <div
      className={`
      relative overflow-hidden rounded-t-lg bg-gray-200
      ${parallax ? styles.parallaxContainer : ""}
      ${className}
    `}
    >
      {/* Loading state - Tailwind cho layout */}
      {(loading || !imageLoaded) && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className={`w-8 h-8 ${styles.loadingSpinner}`} />
        </div>
      )}

      {/* Error state - Tailwind cho layout */}
      {(error || imageError) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400">
          <span className="text-2xl mb-2">🖼️</span>
          <span className="text-sm">Image not found</span>
        </div>
      )}

      {/* Main image - Tailwind cho layout, CSS Module cho effects */}
      <img
        src={src}
        alt={alt}
        className={`
          w-full h-32 object-cover transition-all duration-300
          ${parallax ? styles.parallaxImage : ""}
          ${imageLoaded ? "opacity-100" : "opacity-0"}
        `}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
      />

      {/* Overlay effects - CSS Module */}
      {overlay && imageLoaded && !imageError && (
        <>
          <div className={styles.imageOverlay} />
          <div className={styles.overlayGradient} />
        </>
      )}

      {/* Hover shine effect - CSS Module */}
      <div className={styles.shineEffect} />
    </div>
  );
}
