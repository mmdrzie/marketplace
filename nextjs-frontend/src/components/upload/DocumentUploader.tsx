'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Loader2, RefreshCw, Trash2, UploadCloud, X } from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

type ItemStatus = 'uploading' | 'done' | 'error';

interface UploadItem {
  id: string;
  url: string;
  file?: File;
  status: ItemStatus;
  progress: number;
  error?: string;
}

interface DocumentUploaderProps {
  value: string[];
  onChange: (docs: string[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
  className?: string;
}

export function DocumentUploader({
  value,
  onChange,
  maxImages = 5,
  maxSizeMB = 5,
  className,
}: DocumentUploaderProps) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const tempUrlsRef = useRef<string[]>([]);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const itemsRef = useRef<UploadItem[]>([]);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      tempUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      tempUrlsRef.current = [];
    };
  }, []);

  const startUpload = useCallback((file: File, existingId?: string) => {
    const id = existingId ?? Math.random().toString(36).substring(2);
    const tempUrl = URL.createObjectURL(file);
    tempUrlsRef.current.push(tempUrl);

    if (existingId) {
      const existing = itemsRef.current.find((it) => it.id === existingId);
      if (existing?.url && tempUrlsRef.current.includes(existing.url)) {
        URL.revokeObjectURL(existing.url);
        tempUrlsRef.current = tempUrlsRef.current.filter((u) => u !== existing.url);
      }
    }

    const patch = (p: Partial<UploadItem>) =>
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...p } : it)));

    setItems((prev) =>
      existingId
        ? prev.map((it) =>
            it.id === id ? { ...it, url: tempUrl, file, status: 'uploading', progress: 0, error: undefined } : it,
          )
        : [...prev, { id, url: tempUrl, file, status: 'uploading', progress: 0 }],
    );

    api
      .post('/upload/presigned', { filename: file.name, contentType: file.type })
      .then((res) => {
        const { upload_url, public_url } = res.data.data as { upload_url: string; public_url?: string };
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', upload_url);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) patch({ progress: Math.round((e.loaded / e.total) * 100) });
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const finalUrl = public_url || upload_url;
            patch({ status: 'done', progress: 100, url: finalUrl });
            onChangeRef.current([...valueRef.current, finalUrl]);
          } else {
            patch({ status: 'error', error: 'آپلود ناموفق بود' });
          }
        };
        xhr.onerror = () => patch({ status: 'error', error: 'خطای شبکه در آپلود' });
        xhr.send(file);
      })
      .catch(() => patch({ status: 'error', error: 'خطا در آماده‌سازی آپلود' }));
  }, []);

  const addInvalid = useCallback((message: string) => {
    const id = Math.random().toString(36).substring(2);
    setItems((prev) => [...prev, { id, url: '', status: 'error', progress: 0, error: message }]);
  }, []);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const remaining = Math.max(0, maxImages - itemsRef.current.length);
      Array.from(files)
        .slice(0, remaining)
        .forEach((f) => {
          if (!f.type.startsWith('image/')) {
            addInvalid('فرمت فایل باید تصویر باشد');
          } else if (f.size > maxSizeMB * 1024 * 1024) {
            addInvalid(`حجم فایل حداکثر ${maxSizeMB} مگابایت است`);
          } else {
            startUpload(f);
          }
        });
    },
    [addInvalid, maxImages, maxSizeMB, startUpload],
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const removed = prev.find((it) => it.id === id);
      if (removed?.url && tempUrlsRef.current.includes(removed.url)) {
        URL.revokeObjectURL(removed.url);
        tempUrlsRef.current = tempUrlsRef.current.filter((u) => u !== removed.url);
      }
      if (removed && removed.status === 'done' && removed.url) {
        onChangeRef.current(valueRef.current.filter((u) => u !== removed.url));
      }
      return prev.filter((it) => it.id !== id);
    });
  }, []);

  return (
    <div className={cn('space-y-4', className)}>
      <label
        className={cn(
          'relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all duration-300 overflow-hidden',
          dragOver
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-border bg-background/30 hover:border-primary/40 hover:bg-surface',
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground transition-colors">
          <UploadCloud className="h-7 w-7" aria-hidden="true" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-foreground">مدارک را بکشید و رها کنید</p>
          <p className="text-xs text-muted-foreground mt-1">
            یا کلیک کنید — تصویر (jpg/png/webp) حداکثر {maxSizeMB}MB — تا {maxImages} سند
          </p>
        </div>
      </label>

      {items.length > 0 && (
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="relative aspect-square bg-card border border-border rounded-xl overflow-hidden shadow-card group"
            >
              {item.url ? (
                <Image
                  src={item.url}
                  alt="سند آپلود شده"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-surface-2/40" aria-hidden="true" />
              )}

              {item.status === 'uploading' && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 p-3">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
                  <div
                    className="w-full h-1.5 bg-surface-3 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={item.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="در حال آپلود"
                  >
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground tabular-nums">{item.progress}٪</span>
                </div>
              )}

              {item.status === 'error' && (
                <div className="absolute inset-0 bg-destructive/10 backdrop-blur-sm flex flex-col items-center justify-center gap-2 p-3 text-center">
                  <p className="text-[11px] text-destructive font-medium leading-relaxed">{item.error ?? 'آپلود ناموفق بود'}</p>
                  <div className="flex items-center gap-2">
                    {item.file && (
                      <button
                        type="button"
                        onClick={() => startUpload(item.file as File, item.id)}
                        className="flex items-center gap-1.5 text-[11px] font-medium bg-surface-2 border border-border rounded-lg px-2.5 py-1.5 text-foreground hover:border-primary transition-colors"
                      >
                        <RefreshCw className="h-3 w-3" aria-hidden="true" />
                        تلاش مجدد
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="flex items-center gap-1.5 text-[11px] font-medium bg-destructive/10 border border-destructive/30 rounded-lg px-2.5 py-1.5 text-destructive hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" aria-hidden="true" />
                      حذف
                    </button>
                  </div>
                </div>
              )}

              {item.status === 'done' && (
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="absolute top-2 left-2 w-7 h-7 bg-destructive/90 backdrop-blur-md text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-destructive active:scale-90 shadow-lg"
                  title="حذف سند"
                  aria-label="حذف سند"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
