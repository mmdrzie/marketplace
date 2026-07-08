'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

export function SearchBar({ value, onChange, onSubmit }: SearchBarProps) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const supported = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.();
  };

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    setListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (listening) { stopListening(); return; }
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'fa-IR';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      onChange(transcript);
    };

    recognition.onerror = () => {
      stopListening();
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening, onChange, stopListening]);

  useEffect(() => {
    return () => { if (recognitionRef.current) { try { recognitionRef.current.abort(); } catch { /* ignore */ } } };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 w-full">
      
      {/* فیلد ورودی جستجو */}
      <div className="relative flex-1 group">
        {/* آیکون جستجو در سمت راست (مطابق با RTL) */}
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-hover:text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="جستجو در هزاران آگهی خودرو و ماشین‌آلات..."
          className="w-full pr-12 pl-12 py-4 glass-input rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 hover:border-border-subtle transition-all duration-300"
        />

        {/* دکمه میکروفون برای جستجوی صوتی — سمت چپ (RTL) */}
        {supported && (
          <button
            type="button"
            onClick={startListening}
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 ${
              listening
                ? 'bg-destructive/15 text-destructive'
                : 'text-muted-foreground hover:text-primary hover:bg-surface-2/50'
            }`}
            title={listening ? 'توقف ضبط صدا' : 'جستجوی صوتی'}
            aria-label={listening ? 'توقف ضبط صدا' : 'جستجوی صوتی'}
          >
            {listening ? (
              <span className="relative flex items-center justify-center">
                <span className="absolute w-5 h-5 rounded-full bg-destructive/30 animate-ping" />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 relative" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              </span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* دکمه جستجو */}
      <button
        type="submit"
        className="flex-shrink-0 flex items-center justify-center gap-2 px-8 py-4 btn btn-primary btn-lg"
      >
        <span className="hidden sm:inline">جستجو</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
    </form>
  );
}
