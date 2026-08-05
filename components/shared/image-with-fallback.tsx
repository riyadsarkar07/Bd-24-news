"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageWithFallbackProps extends Omit<React.ComponentProps<typeof Image>, "src" | "onError"> {
  src: string;
  fallback?: string;
}

export function ImageWithFallback({ src, fallback = "/images/placeholder.svg", className, alt, ...props }: ImageWithFallbackProps) {
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    setError(false);
  }, [src]);

  return (
    <Image
      src={error ? fallback : src}
      alt={alt}
      onError={() => setError(true)}
      className={cn("object-cover", className)}
      {...props}
    />
  );
}
