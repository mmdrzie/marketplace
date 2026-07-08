'use client';

import { useState, useRef, useCallback, useEffect, JSX } from 'react';
import Image from 'next/image';
import api from '@/lib/api';

interface UploadedImage {
  id: string;
  objectKey: string;
  url: string;
  file: File;
  uploading: boolean;
  progress: number;
}

interface ImageUploaderProps {
  onImagesChange: (keys: string[]) => void;
  maxImages?: number;
}

const Icons = {
  upload: <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12" />,
  close: <path d="M18 6L6 18M6 6l12 12" />,
  star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
  image: <path d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M21 15l-5-5L5 21" />,
};

const Icon = ({ path, className = "h-6 w-6" }: { path: JSX.Element; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {path}
  </svg>
);

export function ImageUploader({ onImagesChange, maxImages = 15 }: ImageUploaderProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const tempUrlsRef = useRef<string[]>([]);
  const onImagesChangeRef = useRef(onImagesChange);

  useEffect(() => { onImagesChangeRef.current = onImagesChange; }, [onImagesChange]);

  useEffect(() => {
    return () => {
      for (const url of tempUrlsRef.current) URL.revokeObjectURL(url);
      tempUrlsRef.current = [];
    };
  }, []);

  const uploadImage = useCallback(async (file: File) => {
    const id = Math.random().toString(36).substring(2);
    const tempUrl = URL.createObjectURL(file);
    tempUrlsRef.current.push(tempUrl);

    const newImage: UploadedImage = {
      id,
      objectKey: '',
      url: tempUrl,
      file,
      uploading: true,
      progress: 0,
    };

    setImages((prev) => [...prev, newImage]);

    try {
      const presigned = await api.post('/upload/presigned', {
        filename: file.name,
        content_type: file.type,
        size: file.size,
      });

      const { upload_url, object_key } = presigned.data.data;

      await fetch(upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      setImages((prev) => {
        const updated = prev.map((img) =>
          img.id === id
            ? { ...img, objectKey: object_key, uploading: false, progress: 100 }
            : img
        );
        const keys = updated.map((img) => img.objectKey).filter(Boolean);
        onImagesChangeRef.current(keys);
        return updated;
      });
    } catch {
      setImages((prev) => prev.filter((img) => img.id !== id));
    }
  }, []);

  const handleFiles = useCallback((files: FileList) => {
    const toUpload = Array.from(files).slice(0, maxImages);
    for (const f of toUpload) uploadImage(f);
  }, [maxImages, uploadImage]);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const removed = prev.find((img) => img.id === id);
      if (removed) {
        const idx = tempUrlsRef.current.indexOf(removed.url);
        if (idx !== -1) {
          URL.revokeObjectURL(removed.url);
          tempUrlsRef.current.splice(idx, 1);
        }
      }
      const updated = prev.filter((img) => img.id !== id);
      const keys = updated.map((img) => img.objectKey).filter(Boolean);
      onImagesChangeRef.current(keys);
      return updated;
    });
  }, []);

  const moveImage = useCallback((fromIndex: number, toIndex: number) => {
    setImages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      const keys = updated.map((img) => img.objectKey).filter(Boolean);
      onImagesChangeRef.current(keys);
      return updated;
    });
  }, []);

  return (
    <div className="space-y-6">
      <div
        className={`relative border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 cursor-pointer overflow-hidden group ${
          dragOver 
            ? 'border-primary bg-primary/5 scale-[1.02]' 
            : 'border-border bg-background/30 hover:border-border-subtle hover:bg-surface'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[100px] transition-opacity duration-500 ${dragOver ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent-blue) 10%, transparent)' }}></div>

        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            dragOver ? 'bg-primary/20 text-primary scale-110' : 'bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-surface-2'
          }`}>
            <Icon path={Icons.upload} className="h-8 w-8" />
          </div>
          <p className="text-sm font-bold text-foreground">
            تصاویر را بکشید و رها کنید
          </p>
          <p className="text-xs text-muted-foreground">
            یا کلیک کنید تا انتخاب کنید (حداکثر {maxImages} تصویر - jpg, png, webp)
          </p>
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((img, index) => (
            <div 
              key={img.id} 
              className="relative group aspect-square bg-card border border-border rounded-2xl overflow-hidden shadow-lg"
            >
              <Image
                src={img.url}
                alt="تصویر آپلود شده"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {img.uploading && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="follow-the-leader scale-75"><div></div><div></div><div></div><div></div><div></div></div>
                </div>
              )}

              {!img.uploading && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                  className="absolute top-2 left-2 w-7 h-7 bg-destructive/90 backdrop-blur-md text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-destructive active:scale-90 shadow-lg"
                  title="حذف تصویر"
                >
                  <Icon path={Icons.close} className="h-4 w-4" />
                </button>
              )}

              {index === 0 && !img.uploading && (
                <span className="absolute top-2 right-2 flex items-center gap-1 bg-gradient-accent-horizontal text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-glow-accent">
                  <Icon path={Icons.star} className="h-3 w-3" />
                  اصلی
                </span>
              )}

              {index > 0 && !img.uploading && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); moveImage(index, 0); }}
                  className="absolute bottom-2 left-2 right-2 bg-muted/80 backdrop-blur-md text-white text-[10px] font-medium py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-surface-3 active:scale-95 flex items-center justify-center gap-1"
                >
                  <Icon path={Icons.star} className="h-3 w-3 text-accent-blue" />
                  تنظیم به عنوان اصلی
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
