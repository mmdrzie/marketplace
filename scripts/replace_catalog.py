import re

filepath = r'C:\projects\marketplace\nextjs-frontend\src\app\(public)\page.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the start and end of the 5 catalog sections
start_marker = '{/* ===== 4. TUNING CATALOG ENTRY ===== */}'
end_marker = '{SectionDivider}\n\n      {/* ===== 5. LATEST LISTINGS ===== */}'

start_idx = content.find(start_marker)
# Find the last </section> before SectionDivider
end_idx = content.find(end_marker, start_idx)
# Go back to find the </section> before SectionDivider
section_end = content.rfind('</section>', start_idx, end_idx)
section_end += len('</section>')

print(f'Start: {start_idx}, Section end: {section_end}')

# Create the replacement
replacement = '''      {/* ===== 4. CATALOG ENTRY CARDS (Floating) ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-10 w-full">
        <SlideUp rootMargin="-40px">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CatalogEntryCard
              href="/catalog/tuning"
              title="قطعات تیونینگ"
              description="ارتقای عملکرد خودرو و موتورسیکلت؛ پیستون، اگزوز اسپرت، ریمپ ECU، زیربندی و بدنه"
              linkText="ورود به کاتالوگ"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
                </svg>
              }
            />
            <CatalogEntryCard
              href="/catalog/accessory"
              title="اکسسوری و تزئینات خودرو"
              description="دکوراسیون داخلی، نورپردازی، محافظت بدنه و لوازم جانبی موتورسیکلت"
              linkText="ورود به کاتالوگ"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M12 3l1.9 5.8a2 2 0 001.3 1.3L21 12l-5.8 1.9a2 2 0 00-1.3 1.3L12 21l-1.9-5.8a2 2 0 00-1.3-1.3L3 12l5.8-1.9a2 2 0 001.3-1.3L12 3z" />
                </svg>
              }
            />
            <CatalogEntryCard
              href="/parts"
              title="قطعات یدکی و ادوات"
              description="جستجوی قطعات اصلی، تأمینی، ادوات و مصرفی خودروها و ماشین‌آلات"
              linkText="ورود به فروشگاه"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              }
            />
            <CatalogEntryCard
              href="/workshops"
              title="تعمیرکاران و تیونرها"
              description="معرفی تعمیرگاه‌ها و تیونرهای معتبر با آدرس، تخصص و خدمات"
              linkText="مشاهده تعمیرکاران"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M12 15l3.5-3.5M20.3 18a10 10 0 10-16.6 0" />
                </svg>
              }
            />
            <CatalogEntryCard
              href="/insurance"
              title="بیمه خودرو و ماشین‌آلات"
              description="مقایسه و خرید آنلاین بیمه شخص ثالث، بدنه، موتور و ماشین‌آلات از معتبرترین شرکت‌های بیمه"
              linkText="خرید بیمه"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              }
            />
          </div>
        </SlideUp>
      </section>'''

# Replace
new_content = content[:start_idx] + replacement + content[section_end:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Done!')
