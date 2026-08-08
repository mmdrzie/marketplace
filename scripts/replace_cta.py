import re

filepath = r'C:\projects\marketplace\nextjs-frontend\src\app\(public)\page.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the listings section (lines around 435-460)
old_listings = '''<SlideUp rootMargin="-60px" className="relative bg-surface/20 border border-border rounded-3xl p-4 md:p-6 overflow-hidden">
            <EmptyState title="خطا در بارگذاری" description="امکان دریافت آگهی‌ها وجود ندارد. لطفاً بعداً تلاش کنید." icon="listing" />
          </SlideUp>
        ) : !latest || latest.length === 0 ? (
          <SlideUp rootMargin="-60px" className="relative bg-surface/20 border border-border rounded-3xl p-4 md:p-6 overflow-hidden">
            <EmptyState title="آگهی‌ای یافت نشد" description="هنوز آگهی برای نمایش وجود ندارد." icon="listing" />
          </SlideUp>
        ) : (
          <SlideUp rootMargin="-60px" className="relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent pointer-events-none z-[2]" />
            <div
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
                e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
              }}
              className="relative bg-surface/20 border border-border rounded-3xl p-4 md:p-6 h-full overflow-hidden group hover:shadow-[0_0_50px_-16px_var(--color-primary)] transition-shadow duration-500"
            >
              {/* spotlight */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-3xl"
                style={{ background: 'radial-gradient(600px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--color-primary) 8%, transparent), transparent 60%)' }}
              />
              {/* noise texture */}
              <div className="absolute inset-0 opacity-[0.01] pointer-events-none rounded-3xl" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
              <ListingGrid listings={latest} />
            </div>
          </SlideUp>'''

new_listings = '''<SlideUp rootMargin="-60px">
            <div className="glass-3d">
              <div className="glass-3d__inner">
                <div className="glass-3d__spotlight"></div>
                <div className="glass-3d__content p-4 md:p-6">
                  <EmptyState title="خطا در بارگذاری" description="امکان دریافت آگهی‌ها وجود ندارد. لطفاً بعداً تلاش کنید." icon="listing" />
                </div>
              </div>
            </div>
          </SlideUp>
        ) : !latest || latest.length === 0 ? (
          <SlideUp rootMargin="-60px">
            <div className="glass-3d">
              <div className="glass-3d__inner">
                <div className="glass-3d__spotlight"></div>
                <div className="glass-3d__content p-4 md:p-6">
                  <EmptyState title="آگهی‌ای یافت نشد" description="هنوز آگهی برای نمایش وجود ندارد." icon="listing" />
                </div>
              </div>
            </div>
          </SlideUp>
        ) : (
          <SlideUp rootMargin="-60px">
            <div className="glass-3d">
              <div className="glass-3d__inner">
                <div className="glass-3d__spotlight"></div>
                <div className="glass-3d__content p-4 md:p-6">
                  <ListingGrid listings={latest} />
                </div>
              </div>
            </div>
          </SlideUp>'''

content = content.replace(old_listings, new_listings)

# 2. Update CTA section
old_cta = '''<div
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
              e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
            }}
            className="relative bg-gradient-to-br from-card via-primary/[0.06] to-card border border-border rounded-3xl p-12 md:p-20 overflow-hidden text-center group hover:border-primary/30 transition-colors duration-500 hover:shadow-[0_0_60px_-20px_var(--color-primary)]"
          >
            {/* spotlight */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-3xl"
              style={{ background: 'radial-gradient(600px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--color-primary) 12%, transparent), transparent 60%)' }}
            />
            {/* noise texture */}
            <div className="absolute inset-0 opacity-[0.012] pointer-events-none rounded-3xl" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
            {/* animated glow orb */}'''

new_cta = '''<div className="glass-3d">
            <div className="glass-3d__inner">
              <div className="glass-3d__spotlight"></div>
              <div className="glass-3d__content relative p-12 md:p-20 text-center">
                {/* animated glow orb */}'''

content = content.replace(old_cta, new_cta)

# Close CTA section properly
old_cta_close = '''</div>
           </div>
          </div>
         </ScaleIn>
       </section>'''

new_cta_close = '''</div>
              </div>
            </div>
          </div>
         </ScaleIn>
       </section>'''

content = content.replace(old_cta_close, new_cta_close)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done!')
