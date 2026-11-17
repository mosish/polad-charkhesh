export const workbookTools = [
  {
    id: 'target',
    en: 'Target life',
    fa: 'عمر هدف',
    description: [
      'Required dynamic capacity from known load and speed.',
      'ظرفیت دینامیکی لازم از بار و دور معلوم.',
    ],
  },
  {
    id: 'scenarios',
    en: 'Compare scenarios',
    fa: 'مقایسه سناریو',
    description: [
      'Compare manual cases and load sensitivity.',
      'مقایسه شرایط و حساسیت عمر به تغییر بار.',
    ],
  },
  {
    id: 'fits',
    en: 'Fit explorer',
    fa: 'انطباق شفت و سوراخ',
    description: [
      'Visualize entered dimensional limits in micrometres.',
      'نمایش حدود ابعادی و بازهٔ لقی یا تداخل.',
    ],
  },
  {
    id: 'lubrication',
    en: 'Lubrication worksheet',
    fa: 'کاربرگ روانکاری',
    description: [
      'Collect conditions for a manufacturer-based review.',
      'جمع‌آوری شرایط برای بررسی طبق راهنمای سازنده.',
    ],
  },
  {
    id: 'maintenance',
    en: 'Troubleshooting',
    fa: 'نگهداری و عیب‌یابی',
    description: [
      'Turn symptoms into an inspection checklist.',
      'تبدیل نشانه‌ها به چک‌لیست بررسی.',
    ],
  },
  {
    id: 'duty',
    en: 'Variable duty cycle',
    fa: 'چرخهٔ بار متغیر',
    description: [
      'Combine rotating load stages using time shares.',
      'ترکیب مراحل بار و دور با سهم زمانی.',
    ],
  },
  {
    id: 'power',
    en: 'Shaft power & torque',
    fa: 'توان و گشتاور',
    description: [
      'Find shaft power, torque or speed from two known values.',
      'محاسبه توان مکانیکی، گشتاور یا دور از دو مقدار معلوم.',
    ],
  },
] as const;
export type WorkbookTool = (typeof workbookTools)[number]['id'];
export const methodSources = {
  life: 'https://cdn.skfmediahub.skf.com/api/public/0901d196802809de/pdf_preview_medium/0901d196802809de_pdf_preview_medium.pdf',
  duty: 'https://cdn.skfmediahub.skf.com/api/public/0901d19680495562/pdf_preview_medium/0901d19680495562_pdf_preview_medium.pdf',
  maintenance:
    'https://www.nsk.com/am-en/tools-resources/bearings/maintenance/operation-inspection/',
  symptoms:
    'https://cdn.skfmediahub.skf.com/api/public/0901d1968024f02a/pdf_preview_medium/0901d1968024f02a_pdf_preview_medium.pdf',
  power:
    'https://openstax.org/books/university-physics-volume-1/pages/10-8-work-and-power-for-rotational-motion',
};
export const maintenancePaths = [
  {
    id: 'heat',
    title: ['Heat increase', 'افزایش دما'],
    inspect: [
      'Compare the trend at the same speed/load; review lubricant quantity, seal friction and mounting clearance.',
      'روند دما را در بار و دور یکسان مقایسه کنید؛ مقدار روانکار، اصطکاک آب‌بند و لقی پس از نصب را بررسی کنید.',
    ],
  },
  {
    id: 'noise',
    title: ['Unusual noise', 'صدای غیرعادی'],
    inspect: [
      'Record when the sound begins and changes; inspect lubrication, contamination and mounting history.',
      'زمان شروع و تغییر صدا را ثبت کنید؛ روانکاری، آلودگی و سابقهٔ نصب را بررسی کنید.',
    ],
  },
  {
    id: 'vibration',
    title: ['Vibration', 'لرزش'],
    inspect: [
      'Compare measurements at consistent points and operating conditions; review alignment, looseness and damage evidence.',
      'اندازه‌گیری را در نقاط و شرایط یکسان مقایسه کنید؛ هم‌راستایی، شل‌شدگی و شواهد آسیب بررسی شود.',
    ],
  },
  {
    id: 'movement',
    title: ['Shaft movement', 'حرکت اضافی شفت'],
    inspect: [
      'Measure play against the machine specification; review retention, fits and bearing arrangement.',
      'لقی را با مشخصات دستگاه مقایسه کنید؛ مهار محوری، انطباق و آرایش بیرینگ بررسی شود.',
    ],
  },
  {
    id: 'early',
    title: ['Premature damage', 'خرابی زودرس'],
    inspect: [
      'Preserve failed parts and lubricant samples; record load history, installation and contamination before replacing parts.',
      'قطعهٔ معیوب و نمونهٔ روانکار را حفظ کنید؛ پیش از تعویض، سابقهٔ بار، نصب و آلودگی ثبت شود.',
    ],
  },
] as const;
