import re

filepath = r'C:\projects\marketplace\nextjs-frontend\src\app\(public)\page.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update listings section - replace old containers with glass-3d
# Replace error state
old_error = '''<SlideUp rootMargin="-60px" className="relative bg-surface/20 border border-border rounded-3xl p-4 md:p-6 overflow-hidden">
            <EmptyState title="خطا در بارگذاری" description="امکان دریافت آگهی‌ها وجود ندارد. لطفاً بعداً تلاش کنید." icon="listing" />
          </SlideUp>'''
new_error = '''<SlideUp rootMargin="-60px">
            <div className="glass-3d">
              <div className="glass-3d__inner">
                <div className="glass-3d__spotlight"></div>
                <div className="glass-3d__content p-4 md:p-6">
                  <EmptyState title="خطا در بارگذاری" description="امکان دریافت آگهی‌ها وجود ندارد. لطفاً بعداً تلاش کنید." icon="listing" />
                </div>
              </div>
            </div>
          </SlideUp>'''
content = content.replace(old_error, new_error)

# Replace empty state
old_empty = '''<SlideUp rootMargin="-60px" className="relative bg-surface/20 border border-border rounded-3xl p-4 md:p-6 overflow-hidden">
            <EmptyState title="آگهی‌ای یافت نشد" description="هنوز آگهی برای نمایش وجود ندارد." icon="listing" />
          </SlideUp>'''
new_empty = '''<SlideUp rootMargin="-60px">
            <div className="glass-3d">
              <div className="glass-3d__inner">
                <div className="glass-3d__spotlight"></div>
                <div className="glass-3d__content p-4 md:p-6">
                  <EmptyState title="آگهی‌ای یافت نشد" description="هنوز آگهی برای نمایش وجود ندارد." icon="listing" />
                </div>
              </div>
            </div>
          </SlideUp>'''
content = content.replace(old_empty, new_empty)

# Replace listings container
old_listings = '''<SlideUp rootMargin="-60px" className="relative">
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
                  <ListingGrid listings={latest} />
                </div>
              </div>
            </div>
          </SlideUp>'''
content = content.replace(old_listings, new_listings)

# 2. Update How It Works step icon
old_step = '<div className="relative z-10 w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center text-primary mb-5 shadow-[0_0_25px_-10px_var(--color-primary)]">'
new_step = '<div className="relative z-10 w-16 h-16 rounded-2xl glass-3d-step flex items-center justify-center text-primary mb-5">'
content = content.replace(old_step, new_step)

# 3. Update Stats section
old_stats = '''<div
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
              e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
            }}
            className="border border-border rounded-3xl bg-surface/20 backdrop-blur-sm overflow-hidden group hover:shadow-[0_0_50px_-16px_var(--color-primary)] transition-shadow duration-500"
          >
            {/* spotlight */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-3xl"
              style={{ background: 'radial-gradient(700px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--color-primary) 8%, transparent), transparent 60%)' }}
            />
            {/* noise texture */}
            <div className="absolute inset-0 opacity-[0.01] pointer-events-none rounded-3xl" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 divide-x divide-x-reverse divide-border">'''
new_stats = '''<div className="glass-3d">
            <div className="glass-3d__inner">
              <div className="glass-3d__spotlight"></div>
              <div className="glass-3d__content">
                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-x-reverse divide-border">'''
content = content.replace(old_stats, new_stats)

# Close stats properly
old_stats_close = '''</div>
          </div>
        </SlideUp>
      </section>

      {SectionDivider}

      {/* ===== 10. CTA ===== */}'''
new_stats_close = '''</div>
              </div>
            </div>
          </div>
        </SlideUp>
      </section>

      {SectionDivider}

      {/* ===== 10. CTA ===== */}'''
content = content.replace(old_stats_close, new_stats_close)

# 4. Update CTA section
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

# Close CTA properly
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

# 5. Update Feature cards
# This is the trickiest part - need to replace the entire feature card structure
old_feature = '''<div
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
                e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
              }}
              className="group relative bg-gradient-to-br from-card to-surface/30 border border-border rounded-2xl p-8 hover:border-primary/40 transition-all duration-500 overflow-hidden h-full hover:shadow-[0_0_50px_-16px_var(--color-primary)] hover:-translate-y-0.5"
            >
              {/* mouse spotlight */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-2xl"
                style={{ background: 'radial-gradient(500px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--color-primary) 12%, transparent), transparent 60%)' }}
              />
              {/* shimmer sweep on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden rounded-2xl">
                <div className="absolute inset-0 animate-shimmer" style={{ background: 'linear-gradient(110deg, transparent, color-mix(in srgb, var(--color-primary) 4%, transparent), transparent)', backgroundSize: '200% 100%' }} />
              </div>
              {/* noise texture */}
              <div className="absolute inset-0 opacity-[0.012] pointer-events-none rounded-2xl" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
              <span className="absolute top-6 left-6 text-5xl font-black text-foreground/[0.04] group-hover:text-primary/10 transition-colors select-none">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-12 h-12 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-primary mb-6 transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-hover:shadow-[0_0_20px_-6px_var(--color-primary)]">
                  <Icon d={feature.icon} className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>'''
new_feature = '''<div className="glass-3d">
              <div className="glass-3d__inner">
                <div className="glass-3d__spotlight"></div>
                <div className="glass-3d__content flex flex-col h-full p-6">
                  <span className="absolute top-5 left-5 text-4xl font-black text-foreground/[0.03] select-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-primary mb-5 transition-all duration-500 group-hover:-translate-y-1 group-hover:scale-110 group-hover:shadow-[0_0_20px_-6px_var(--color-primary)]">
                    <Icon d={feature.icon} className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            </div>'''
content = content.replace(old_feature, new_feature)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done!')
