'use client';

import { useState, useRef } from 'react';

export function VoiceRecorder({ onSend, onCancel }: { onSend?: (blob: Blob) => void; onCancel?: () => void }) {
  const [recording, setRecording] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const toggle = async () => {
    if (recording) {
      mediaRef.current?.stop();
      setRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        mediaRef.current = recorder;
        chunksRef.current = [];
        recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          onSend?.(blob);
          stream.getTracks().forEach((t) => t.stop());
        };
        recorder.start();
        setRecording(true);
      } catch { /* permission denied */ }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={toggle} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${recording ? 'bg-destructive/10 text-destructive border border-destructive/30 animate-pulse' : 'text-muted-foreground hover:text-foreground bg-surface-2 border border-border-subtle'}`} title={recording ? 'توقف ضبط' : 'ضبط صدا'}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="22" /></svg>
      </button>
      {recording && onCancel && (
        <button type="button" onClick={onCancel} className="text-xs text-muted-foreground hover:text-foreground transition-colors" title="لغو">
          لغو
        </button>
      )}
    </div>
  );
}
