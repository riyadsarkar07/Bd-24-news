"use client";

import * as React from "react";
import { UploadCloud, Image as ImageIcon, Loader2, Trash2, RefreshCw, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { uploadMediaFile } from "@/services/mediaService";
import { MediaPicker } from "@/features/admin/media-picker";
import { cn } from "@/lib/utils";

interface CoverImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

export function CoverImageUpload({ value, onChange, className }: CoverImageUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const [progress, setProgress] = React.useState<number | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [pickerOpen, setPickerOpen] = React.useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const item = await uploadMediaFile(file, (p) => setProgress(p));
      onChange(item.src);
    } catch (err) {
      console.error("Cover upload failed:", err);
    } finally {
      setUploading(false);
      setProgress(null);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {value ? (
        <div className="relative overflow-hidden rounded-xl border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Cover preview" className="aspect-video w-full object-cover" />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-muted-foreground transition-colors hover:border-brand hover:text-brand",
            dragging && "border-brand bg-brand/5 text-brand",
            uploading && "pointer-events-none opacity-70",
          )}
        >
          <ImageIcon className="h-8 w-8" />
          <span className="text-xs font-semibold">
            {uploading ? "Uploading…" : "Drag & drop an image here, or click to upload"}
          </span>
        </button>
      )}

      {uploading && (
        <Progress value={progress ?? 0} className="h-1.5" />
      )}

      {!uploading && (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            <UploadCloud className="h-3.5 w-3.5" />
            {value ? "Replace" : "Upload"}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
            <Library className="h-3.5 w-3.5" />
            Media library
          </Button>
          {value && (
            <Button type="button" variant="outline" size="sm" onClick={() => onChange("")} className="text-danger hover:text-danger">
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </Button>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />

      <MediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(src) => {
          onChange(src);
          setPickerOpen(false);
        }}
      />

      {!value && (
        <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <RefreshCw className="h-3 w-3" />
          Images are stored in Firebase Storage and saved to the media library.
        </p>
      )}
    </div>
  );
}
