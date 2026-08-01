export class ContentService {
  calculateReadingTime(body: string): number {
    if (!body) return 1;
    const text = body.replace(/<[^>]*>/g, '');
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  }

  extractTOC(body: string): { id: string; text: string; level: number }[] {
    if (!body) return [];
    const headingRegex = /<h([2-4])(?:\s+[^>]*)?>(.*?)<\/h\1>/gi;
    const toc: { id: string; text: string; level: number }[] = [];
    let match: RegExpExecArray | null;
    while ((match = headingRegex.exec(body)) !== null) {
      const level = parseInt(match[1], 10);
      const text = match[2].replace(/<[^>]*>/g, '').trim();
      const id = text.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-').replace(/^-|-$/g, '');
      toc.push({ id, text, level });
    }
    return toc;
  }

  addHeadingIds(body: string): string {
    return body.replace(/<h([2-4])(?:\s+[^>]*)?>(.*?)<\/h\1>/gi, (match, level, content) => {
      const text = content.replace(/<[^>]*>/g, '').trim();
      const id = text.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-').replace(/^-|-$/g, '');
      return `<h${level} id="${id}">${content}</h${level}>`;
    });
  }
}