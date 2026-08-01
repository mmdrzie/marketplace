'use client';

import { useState, useRef, useCallback } from 'react';
import { toast } from '@/components/common/Toast';
import { cn } from '@/lib/utils';

interface Props {
  documents: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  accept?: string;
}

export function DocumentUploader({
  documents,
  onChange,
  maxFiles = 3,
  accept = 'image/*,.pdf',
}: Props) {
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File): Promise<string | null> => {
      if (file.size > 5 * 1024 * 1024) {
        toast({ type: 'error', title: `حجم فایل "${file.name}" بیش از ۵MB است` });
        return null;
      }

      setUploadingFiles((prev) => new Set(prev).add(file.name));

      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
        const data = await res.json();
        if (!data.url) throw new Error('No URL returned');
        return data.url;
      } catch (err) {
        toast({ type: 'error', title: `آپلود "${file.name}" ناموفق بود` });
        return null;
      } finally {
        setUploadingFiles((prev) => {
          const next = new Set(prev);
          next.delete(file.name);
          return next;
        });
      }
    },
    [],
  );

  const handleFiles = useCallback(
    async (files: FileList) => {
      const remaining = maxFiles - documents.length;
      if (remaining <= 0) {
        toast({ type: 'error', title: `حداکثر ${maxFiles} فایل مجاز است` });
        return;
      }

      const fileArray = Array.from(files).slice(0, remaining);
      const results = await Promise.all(fileArray.map(uploadFile));
      const newUrls = results.filter((u): u is string => u !== null);
      if (newUrls.length > 0) {
        onChange([...documents, ...newUrls]);
      }
    },
    [documents, maxFiles, onChange, uploadFile],
  );

  const handleInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files?.length) return;
      await handleFiles(files);
      if (inputRef.current) inputRef.current.value = '';
    },
    [handleFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) await handleFiles(files);
    },
    [handleFiles],
  );

  const removeDoc = useCallback(
    (index: number) => {
      onChange(documents.filter((_, i) => i !== index));
    },
    [documents, onChange],
  );

  const canAdd = documents.length < maxFiles;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {documents.map((doc, i) => (
          <div key={i} className="relative">
            <div className="w-24 h-24 rounded-xl border border-border bg-surface-2 overflow-hidden">
              <img src={doc} alt={`مدرک ${i + 1}`} className="w-full h-full object-cover" />
            </div>
            <button
              type="button"
              onClick={() => removeDoc(i)}
              className={cn(
                'absolute -top-2 -right-2',
                'w-5 h-5 rounded-full',
                'bg-red-500 text-white',
                'flex items-center justify-center',
                'text-xs font-bold',
                'shadow-md',
                'hover:bg-red-600 transition-colors',
              )}
            >
              ×
            </button>
          </div>
        ))}

        {canAdd && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              multiple
              onChange={handleInputChange}
              className="hidden"
              id="doc-upload"
            />

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={cn(
                'w-24 h-24 rounded-xl border-2 border-dashed',
                'flex flex-col items-center justify-center gap-1',
                'cursor-pointer transition-all',
                isDragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/40 hover:bg-surface-1',
              )}
            >
              <svg className="h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="text-[10px] text-muted-foreground">افزودن</span>
            </div>
          </>
        )}
      </div>

      {isDragOver && canAdd && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'absolute inset-0 z-10',
            'flex items-center justify-center',
            'rounded-xl border-2 border-dashed border-primary',
            'bg-primary/10 text-primary text-sm',
          )}
        >
          فایل‌ها را اینجا رها کنید
        </div>
      )}

      {uploadingFiles.size > 0 && (
        <div className="text-xs text-muted-foreground">
          {Array.from(uploadingFiles).map((name) => (
            <div key={name} className="flex items-center gap-2">
              <span className="animate-pulse">⏳</span>
              <span>{name}: در حال آپلود...</span>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground">کارت ملی، جواز کسب (تصویر یا PDF) — حداکثر ۵MB</p>
    </div>
  );
}