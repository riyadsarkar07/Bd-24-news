"use client";

import * as React from "react";
import { Search, Image as ImageIcon, Film, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { listMedia, subscribeMedia, type MediaItem } from "@/services/mediaService";
import { cn } from "@/lib/utils";

interface MediaPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (src: string) => void;
}

export function MediaPicker({ open, onOpenChange, onSelect }: MediaPickerProps) {
  const [items, setItems] = React.useState<MediaItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setLoading(true);
    let unsub: (() => void) | undefined;
    listMedia()
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    unsub = subscribeMedia((data) => {
      setItems(data);
      setLoading(false);
    });
    return () => unsub?.();
  }, [open]);

  const filtered = items.filter(
    (m) => m.type === "image" && (search === "" || m.name.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Media library</DialogTitle>
          <DialogDescription>Select an image to use as the cover.</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search media…"
            className="pl-9"
          />
        </div>
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
              <ImageIcon className="h-8 w-8" />
              <p className="text-sm font-semibold">No images yet</p>
              <p className="text-xs">Upload an image first.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {filtered.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelect(m.src)}
                  className="group relative aspect-video overflow-hidden rounded-xl border bg-muted"
                >
                  {m.src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.src}
                      alt={m.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-muted-foreground">
                      <Film className="h-6 w-6" />
                    </span>
                  )}
                  <span className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-2 py-1 text-left text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {m.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
