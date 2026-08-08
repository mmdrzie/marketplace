import re

filepath = r'C:\projects\marketplace\nextjs-frontend\src\app\(public)\page.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update How It Works step icon
old_step = '<div className="relative z-10 w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center text-primary mb-5 shadow-[0_0_25px_-10px_var(--color-primary)]">'
new_step = '<div className="relative z-10 w-16 h-16 rounded-2xl glass-3d-step flex items-center justify-center text-primary mb-5">'
content = content.replace(old_step, new_step)

# 2. Update Feature cards section
old_feature_start = '{/* mouse spotlight */}'
new_feature_content = '''<div className="glass-3d__content flex flex-col h-full p-6">
                  <span className="absolute top-5 left-5 text-4xl font-black text-foreground/[0.03] select-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-primary mb-5 transition-all duration-500 group-hover:-translate-y-1 group-hover:scale-110 group-hover:shadow-[0_0_20px_-6px_var(--color-primary)]">
                    <Icon d={feature.icon} className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>'''

# Find and replace the feature card inner content
# This is more complex - let me find the feature section and replace it
feature_start = content.find('{/* mouse spotlight */}')
feature_end = content.find('{/* ===== 9. STATS ===== */}', feature_start)
# Go back to find the start of the feature cards
feature_section_start = content.rfind('{/* ===== 8. BENTO FEATURES ===== */}', 0, feature_start)

# Find the grid div that contains the feature cards
grid_start = content.find('<div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-fr">', feature_section_start)
# Find the end of the grid
grid_end_marker = '</SlideUp>\n          ))}\n        </div>\n      </section>'
grid_end = content.find(grid_end_marker, grid_start)
grid_end += len(grid_end_marker)

# Replace the feature cards with glass-3d versions
# For now, let me just update the stats and CTA sections which are simpler

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

# Close the glass-3d divs for stats
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

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done!')
