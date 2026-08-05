import Link from 'next/link';
import { ContentCard } from '@/components/content/ContentCard';
import { FadeIn } from '@/components/common/MotionDiv';
import { ContentDetail } from '@/components/content/ContentDetail';
import type { Content } from '@/types/content';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const ENCYCLOPEDIA_TYPES = ['guide', 'how_to', 'maintenance', 'glossary', 'tech_spec', 'review', 'comparison', 'buying_guide'];

async function fetchContent(slug: string): Promise<Content | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/v2/contents/${slug}`, { next: { revalidate: 120 } });
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch { return null; }
}

async function fetchRelated(contentId: number): Promise<Content[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/v2/contents/${contentId}/related`, { next: { revalidate: 120 } });
    if (!res.ok) return [];
    return (await res.json()).data;
  } catch { return []; }
}

export default async function EncyclopediaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await fetchContent(slug);

  if (!content || !ENCYCLOPEDIA_TYPES.includes(content.contentType.slug)) {
    return (
      <div className="relative min-h-screen text-foreground overflow-hidden flex items-center justify-center">
                <div className="text-center relative z-10">
          <div className="w-20 h-20 rounded-3xl bg-surface/40 border border-border flex items-center justify-center mx-auto mb-4 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">مطلب یافت نشد</h1>
          <p className="text-muted-foreground mb-6">محتوای مورد نظر وجود ندارد یا حذف شده است.</p>
          <Link href="/encyclopedia" className="btn btn-primary rounded-xl">بازگشت به دانشنامه</Link>
        </div>
      </div>
    );
  }

  const related = await fetchRelated(content.id);

  return (
    <FadeIn>
      <div className="relative min-h-screen text-foreground overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] z-0 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[130px] z-0 pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="px-4 pt-12">
            <Link href="/encyclopedia" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              بازگشت به دانشنامه
            </Link>
          </div>

          <ContentDetail content={content} />

          {related.length > 0 && (
            <div className="max-w-4xl mx-auto px-4 mt-16 pt-10 border-t border-border">
              <h2 className="text-2xl font-bold tracking-tighter text-foreground mb-6">مطالب مرتبط</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {related.map((c) => <ContentCard key={c.id} content={c} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </FadeIn>
  );
}