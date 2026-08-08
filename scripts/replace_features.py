import re

filepath = r'C:\projects\marketplace\nextjs-frontend\src\app\(public)\page.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the feature cards section
# The feature cards start at '{/* mouse spotlight */}' and end before '{/* ===== 9. STATS ===== */}'

# Find the start of feature cards content
feature_start_marker = '{/* mouse spotlight */}'
feature_end_marker = '{/* ===== 9. STATS ===== */}'

feature_start = content.find(feature_start_marker)
feature_end = content.find(feature_end_marker, feature_start)

# Find the grid div that contains the feature cards
grid_start = content.find('<div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-fr">', feature_start)
# Find the end of the grid (the </div> before </SlideUp> from the map)
# The map ends with `))}` then `</div>`
grid_end_marker = '</SlideUp>\n          ))}\n        </div>\n      </section>'
grid_end = content.find(grid_end_marker, grid_start)
grid_end += len(grid_end_marker)

# Extract the feature section
feature_section = content[grid_start:grid_end]

# Create new feature section with glass-3d
new_feature_section = '''<div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-fr">
          {FEATURES.map((feature, i) => (
            <SlideUp
              key={feature.title}
              delay={i * 0.1}
              rootMargin="-40px"
              className={feature.size}
            >
            <div className="glass-3d">
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
            </div>
            </SlideUp>
          ))}
        </div>
      </section>'''

# Replace
new_content = content[:grid_start] + new_feature_section + content[grid_end:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Done!')
