export const paths: Record<string, any> = {
  '/auth/register': {
    post: {
      summary: 'ثبت‌نام کاربر جدید',
      tags: ['Auth'],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterInput' } } },
      },
      responses: {
        '201': { description: 'ثبت‌نام موفق', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
        '409': { description: 'ایمیل یا شماره تکراری', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
  '/auth/login': {
    post: {
      summary: 'ورود کاربر',
      tags: ['Auth'],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } } },
      },
      responses: {
        '200': { description: 'ورود موفق', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
        '401': { description: 'اطلاعات نادرست', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
  '/auth/refresh': {
    post: {
      summary: 'تمدید توکن',
      tags: ['Auth'],
      security: [{ bearerAuth: [] }],
      responses: {
        '200': { description: 'توکن تمدید شد', content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' }, refreshToken: { type: 'string' } } } } } },
      },
    },
  },
  '/auth/me': {
    get: {
      summary: 'پروفایل کاربر فعلی',
      tags: ['Auth'],
      security: [{ bearerAuth: [] }],
      responses: {
        '200': { description: 'پروفایل کاربر', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
      },
    },
  },
  '/categories': {
    get: {
      summary: 'لیست دسته‌بندی‌ها',
      tags: ['Categories'],
      responses: {
        '200': { description: 'دسته‌بندی‌ها', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Category' } } } } },
      },
    },
  },
  '/provinces': {
    get: {
      summary: 'لیست استان‌ها',
      tags: ['Locations'],
      responses: {
        '200': { description: 'استان‌ها', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Province' } } } } },
      },
    },
  },
  '/provinces/{slug}/cities': {
    get: {
      summary: 'لیست شهرهای یک استان',
      tags: ['Locations'],
      parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' }, description: 'slug استان' }],
      responses: {
        '200': { description: 'شهرها', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/City' } } } } },
      },
    },
  },
  '/listings': {
    get: {
      summary: 'جستجو و لیست آگهی‌ها',
      tags: ['Listings'],
      parameters: [
        { name: 'q', in: 'query', schema: { type: 'string' }, description: 'عبارت جستجو' },
        { name: 'category', in: 'query', schema: { type: 'string' }, description: 'slug دسته‌بندی' },
        { name: 'province_id', in: 'query', schema: { type: 'string' } },
        { name: 'brand', in: 'query', schema: { type: 'string' } },
        { name: 'model', in: 'query', schema: { type: 'string' } },
        { name: 'sort', in: 'query', schema: { type: 'string', enum: ['newest', 'oldest', 'price_asc', 'price_desc'] } },
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'per_page', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
      ],
      responses: {
        '200': { description: 'نتایج', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Listing' } }, pagination: { $ref: '#/components/schemas/Pagination' } } } } } },
      },
    },
    post: {
      summary: 'ایجاد آگهی جدید',
      tags: ['Listings'],
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ListingCreate' } } } },
      responses: {
        '201': { description: 'آگهی ایجاد شد', content: { 'application/json': { schema: { $ref: '#/components/schemas/Listing' } } } },
      },
    },
  },
  '/listings/{id}': {
    get: {
      summary: 'جزئیات آگهی',
      tags: ['Listings'],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': { description: 'جزئیات آگهی', content: { 'application/json': { schema: { $ref: '#/components/schemas/Listing' } } } },
        '404': { description: 'آگهی یافت نشد' },
      },
    },
    put: {
      summary: 'ویرایش آگهی',
      tags: ['Listings'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ListingCreate' } } } },
      responses: { '200': { description: 'ویرایش شد' } },
    },
    delete: {
      summary: 'حذف آگهی',
      tags: ['Listings'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'حذف شد' } },
    },
  },
  '/listings/{id}/submit': {
    post: {
      summary: 'ارسال آگهی برای تأیید',
      tags: ['Listings'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'ارسال شد' } },
    },
  },
  '/listings/{id}/approve': {
    post: {
      summary: 'تأیید آگهی (مدیر)',
      tags: ['Listings', 'Admin'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'تأیید شد' } },
    },
  },
  '/listings/{id}/reject': {
    post: {
      summary: 'رد آگهی (مدیر)',
      tags: ['Listings', 'Admin'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }, { name: 'reason', in: 'query', schema: { type: 'string' } }],
      responses: { '200': { description: 'رد شد' } },
    },
  },
  '/listings/{id}/renew': {
    post: {
      summary: 'تمدید آگهی',
      tags: ['Listings'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'تمدید شد' } },
    },
  },
  '/listings/{id}/mark-sold': {
    post: {
      summary: 'علامت فروش',
      tags: ['Listings'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'ثبت شد' } },
    },
  },
  '/search': {
    get: {
      summary: 'جستجوی پیشرفته',
      tags: ['Search'],
      parameters: [
        { name: 'q', in: 'query', required: true, schema: { type: 'string' } },
        { name: 'category', in: 'query', schema: { type: 'string' } },
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
      ],
      responses: { '200': { description: 'نتایج جستجو' } },
    },
  },
  '/conversations': {
    get: {
      summary: 'لیست گفتگوها',
      tags: ['Messages'],
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'گفتگوها', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Conversation' } } } } } },
    },
    post: {
      summary: 'شروع گفتگوی جدید',
      tags: ['Messages'],
      security: [{ bearerAuth: [] }],
      responses: { '201': { description: 'گفتگو ایجاد شد' } },
    },
  },
  '/conversations/{id}/messages': {
    get: {
      summary: 'پیام‌های یک گفتگو',
      tags: ['Messages'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'پیام‌ها' } },
    },
    post: {
      summary: 'ارسال پیام',
      tags: ['Messages'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '201': { description: 'پیام ارسال شد' } },
    },
  },
  '/notifications': {
    get: {
      summary: 'لیست اعلان‌ها',
      tags: ['Notifications'],
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'اعلان‌ها', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Notification' } } } } } },
    },
  },
  '/upload/presigned': {
    post: {
      summary: 'دریافت آپلود URL',
      tags: ['Upload'],
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['filename'], properties: { filename: { type: 'string' }, contentType: { type: 'string' } } } } } },
      responses: { '200': { description: 'URL', content: { 'application/json': { schema: { $ref: '#/components/schemas/UploadUrl' } } } } },
    },
  },
  '/payments': {
    get: {
      summary: 'لیست پرداخت‌ها',
      tags: ['Payments'],
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'پرداخت‌ها', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Payment' } } } } } },
    },
    post: {
      summary: 'ایجاد پرداخت',
      tags: ['Payments'],
      security: [{ bearerAuth: [] }],
      responses: { '201': { description: 'پرداخت ایجاد شد' } },
    },
  },
  '/wallet': {
    get: {
      summary: 'اطلاعات کیف پول',
      tags: ['Wallet'],
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'کیف پول' } },
    },
  },
  '/admin': {
    get: {
      summary: 'داشبورد مدیریت',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'داشبورد' } },
    },
  },
  '/health': {
    get: {
      summary: 'بررسی سلامت سرویس',
      tags: ['System'],
      responses: { '200': { description: 'OK' } },
    },
  },
  '/favorites': {
    get: {
      summary: 'لیست علاقه‌مندی‌ها',
      tags: ['Favorites'],
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'علاقه‌مندی‌ها' } },
    },
    post: {
      summary: 'افزودن به علاقه‌مندی',
      tags: ['Favorites'],
      security: [{ bearerAuth: [] }],
      responses: { '201': { description: 'افزوده شد' } },
    },
    delete: {
      summary: 'حذف از علاقه‌مندی',
      tags: ['Favorites'],
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'حذف شد' } },
    },
  },
  '/tenders': {
    get: {
      summary: 'لیست مناقصه‌ها',
      tags: ['Tenders'],
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'مناقصه‌ها', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Tender' } } } } } },
    },
    post: {
      summary: 'ثبت مناقصه',
      tags: ['Tenders'],
      security: [{ bearerAuth: [] }],
      responses: { '201': { description: 'مناقصه ثبت شد' } },
    },
  },
  '/dealers': {
    get: {
      summary: 'لیست فروشندگان',
      tags: ['Dealers'],
      responses: { '200': { description: 'فروشندگان' } },
    },
  },
  '/parts': {
    get: {
      summary: 'لیست قطعات',
      tags: ['Parts'],
      responses: { '200': { description: 'قطعات' } },
    },
  },
  '/escrow': {
    get: {
      summary: 'لیست معاملات امانی',
      tags: ['Escrow'],
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'معاملات' } },
    },
    post: {
      summary: 'ایجاد معامله امانی',
      tags: ['Escrow'],
      security: [{ bearerAuth: [] }],
      responses: { '201': { description: 'ایجاد شد' } },
    },
  },
  '/email/verify': {
    post: {
      summary: 'تأیید ایمیل با کد',
      tags: ['Verification'],
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'تأیید شد' } },
    },
  },
  '/email/verify/{token}': {
    get: {
      summary: 'تأیید ایمیل با توکن',
      tags: ['Verification'],
      parameters: [{ name: 'token', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'تأیید شد' } },
    },
  },
  '/phone/verify': {
    post: {
      summary: 'تأیید شماره موبایل',
      tags: ['Verification'],
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'تأیید شد' } },
    },
  },
  '/phone/send-code': {
    post: {
      summary: 'ارسال کد تأیید',
      tags: ['Verification'],
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'کد ارسال شد' } },
    },
  },
  '/vehicles/brands': {
    get: {
      summary: 'لیست برندها',
      tags: ['Vehicles'],
      responses: { '200': { description: 'برندها', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/VehicleBrand' } } } } } },
    },
    post: {
      summary: 'ایجاد برند جدید',
      tags: ['Vehicles', 'Admin'],
      security: [{ bearerAuth: [] }],
      responses: { '201': { description: 'برند ایجاد شد' } },
    },
  },
  '/vehicles/brands/{brandId}/models': {
    get: {
      summary: 'مدل‌های یک برند',
      tags: ['Vehicles'],
      parameters: [{ name: 'brandId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'مدل‌ها', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/VehicleModel' } } } } } },
    },
    post: {
      summary: 'ایجاد مدل جدید',
      tags: ['Vehicles', 'Admin'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'brandId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '201': { description: 'مدل ایجاد شد' } },
    },
  },
};
