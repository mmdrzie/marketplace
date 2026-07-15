import DOMPurify from 'isomorphic-dompurify';

export function SanitizedHtml({ html, className }: { html: string; className?: string }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />;
}
