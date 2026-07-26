'use client';

import { useState, useEffect } from 'react';

export function Typewriter({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (subIndex === words[index].length + 1 && !deleting) {
      const t = setTimeout(() => setDeleting(true), 1600);
      return () => clearTimeout(t);
    }
    if (subIndex === 0 && deleting) {
      const t = setTimeout(() => {
        setDeleting(false);
        setIndex((p) => (p + 1) % words.length);
      }, 60);
      return () => clearTimeout(t);
    }
    const timeout = setTimeout(() => setSubIndex((p) => p + (deleting ? -1 : 1)), deleting ? 45 : 95);
    return () => clearTimeout(timeout);
  }, [subIndex, deleting, index, words]);

  return (
    <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary via-primary/85 to-primary/60">
      {words[index].substring(0, subIndex)}
      <span className="motion-safe:animate-pulse text-primary">|</span>
    </span>
  );
}
