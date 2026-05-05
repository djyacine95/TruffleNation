import { useState } from "react";
import { cn } from "@/lib/utils";

type SafeImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
};

export function SafeImage({
  src,
  alt,
  className,
  fallbackClassName,
  fallbackTitle = "Image unavailable",
  fallbackSubtitle,
}: SafeImageProps) {
  const [broken, setBroken] = useState(false);
  const hasRandomHost =
    !!src &&
    (src.includes("loremflickr.com") ||
      src.includes("picsum.photos") ||
      src.includes("source.unsplash.com"));
  const showFallback = !src || broken || hasRandomHost;

  if (showFallback) {
    return (
      <div
        className={cn(
          "w-full h-full bg-primary/5 flex items-center justify-center text-center p-4",
          fallbackClassName,
        )}
      >
        <div className="text-primary/30">
          <svg
            viewBox="0 0 120 80"
            className="mx-auto mb-2 h-12 w-16 text-primary/35"
            aria-hidden
          >
            <ellipse cx="38" cy="45" rx="24" ry="18" fill="currentColor" />
            <ellipse cx="74" cy="40" rx="28" ry="22" fill="currentColor" />
            <ellipse cx="58" cy="52" rx="20" ry="16" fill="hsl(var(--primary) / 0.4)" />
          </svg>
          <p className="text-sm font-medium">{fallbackTitle}</p>
          {fallbackSubtitle ? (
            <p className="text-xs text-muted-foreground mt-1">{fallbackSubtitle}</p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setBroken(true)}
    />
  );
}
