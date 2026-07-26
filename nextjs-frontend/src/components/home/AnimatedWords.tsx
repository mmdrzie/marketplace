'use client';

export function AnimatedWords({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split(' ').map((word, i) => (
        <span
          key={i}
          className="inline-block ml-[0.28em] animate-fade-in-up"
          style={{ animationDelay: `${0.15 + i * 0.09}s`, animationFillMode: 'both' }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
