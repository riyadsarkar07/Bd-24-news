"use client";

import * as React from "react";
import QRCodeLib from "qrcode";
import { cn } from "@/lib/utils";

interface QRCodeProps {
  value: string;
  className?: string;
  size?: number;
}

export function QRCode({ value, className, size = 160 }: QRCodeProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (canvasRef.current) {
      QRCodeLib.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 1,
        color: { dark: "#020617", light: "#ffffff" },
        errorCorrectionLevel: "M",
      });
    }
  }, [value, size]);

  return <canvas ref={canvasRef} className={cn("rounded-lg", className)} aria-label="QR code" />;
}
