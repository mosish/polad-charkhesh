<div dir="rtl">

# راهنمای فارسی طراحان وب

**فارسی** | [English](README.md) | [معرفی فارسی پروژه](../../README.fa.md)

این دو برگه ساختار پولاد چرخش آرین تک را برای گفتگو با طراحان و توسعه‌دهندگان توضیح می‌دهند. تاریخ تهیهٔ نسخهٔ فارسی: ۱۸ اکتبر ۲۰۲۶.

## دریافت فایل‌ها

- [PDF دوصفحه‌ای فارسی](polad-charkhesh-designer-handoff-fa.pdf)
- [نقشهٔ عمومی و تعاملات؛ SVG قابل‌ویرایش](01-public-sitemap-fa.svg) · [تصویر PNG](01-public-sitemap-fa.png)
- [پنل مدیریت و معماری داده؛ SVG قابل‌ویرایش](02-admin-data-architecture-fa.svg) · [تصویر PNG](02-admin-data-architecture-fa.png)
- [کد تولید نسخهٔ فارسی](build_diagrams_fa.py)

متن، اجزا و جهت مسیر کاربر راست‌به‌چپ هستند؛ آدرس‌ها و نام فناوری‌ها چپ‌به‌راست باقی می‌مانند. فونت آزاد وزیرمتن در PDF و SVG جاسازی شده است. اجزای SVG شامل متن، شکل و مسیر استاندارد هستند؛ امکان ویرایش متن پس از واردکردن به ابزار طراحی، به پشتیبانی همان ابزار از فارسی وابسته است.

## قرارداد خواندن نمودار

- خط پیوسته رابطهٔ اجزای صفحه را نشان می‌دهد؛ هر کادر یک آدرس مستقل نیست.
- کادر خط‌چین برای مسیر مستقیم حفظ‌شده است.
- پیکان آبی یک تعامل یا حرکت در مسیر را نشان می‌دهد.
- پیکان دوطرفه در معماری برای درخواست/پاسخ یا خواندن/نوشتن داده است.
- بخش‌های عمومی برای خوانایی گروه‌بندی شده‌اند؛ ترتیب کادرها مشخصات دقیق ترتیب اسکرول صفحه نیست.
- الزامات طراحی، فهرست موارد بازبینی است و به‌معنای قبولی همهٔ آزمون‌های دسترس‌پذیری یا واکنش‌گرایی نیست.

نسخهٔ فارسی تغییر تازهٔ مهندسی را نیز مشخص می‌کند: محاسبات محصول به تأیید روش وابسته‌اند، اما ابزار دستی مستقل است. رجیستری تأیید روش در زمان این مرور هنوز پروفایل تولیدی تأییدشده ندارد. [شواهد](../engineering-tools/foundation/C0B_C1A_DELIVERY.md)

## مبنای تهیه

[مسیریابی](../../app/Router.tsx)، [صفحهٔ اصلی](../../components/platform/Home.tsx)، [بخش‌های عمومی](../../components/platform/HomeSections.tsx)، [مهندسی](../../components/platform/Engineering.tsx)، [پنل مدیریت](../../components/admin/Admin.tsx) و [پیوندهای عمومی](../../lib/public-links.ts) مبنای نمودارها هستند. نمودارها، طرح جزئی جداول یا توپولوژی استقرار نیستند و تأیید نهایی سایت زنده محسوب نمی‌شوند.

## بازتولید فایل‌ها

از ریشهٔ مخزن، با Python و ابزار `pdftoppm` متعلق به Poppler اجرا کنید:

<div dir="ltr">

```bash
python -m pip install reportlab arabic-reshaper python-bidi
python docs/designer-handoff/build_diagrams_fa.py
pdftoppm -f 1 -l 1 -singlefile -scale-to 1800 -png docs/designer-handoff/polad-charkhesh-designer-handoff-fa.pdf docs/designer-handoff/01-public-sitemap-fa
pdftoppm -f 2 -l 2 -singlefile -scale-to 1800 -png docs/designer-handoff/polad-charkhesh-designer-handoff-fa.pdf docs/designer-handoff/02-admin-data-architecture-fa
```

</div>

اسکریپت از SVGهای انگلیسی و فونت‌های وزیرمتن موجود در `public-site/fonts` استفاده می‌کند. اگر متن انگلیسی تغییر کند، ترجمهٔ آن باید در نگاشت اسکریپت افزوده شود؛ متن ترجمه‌نشده خطا ایجاد می‌کند. فایل‌های PDF، SVG و PNG پس از تغییر باید با هم تولید و از نظر بصری بررسی شوند.

فونت وزیرمتن با مجوز [SIL Open Font License](../../public-site/fonts/Vazirmatn-LICENSE.txt) استفاده شده است. کپی همین مجوز کنار خروجی‌ها در [FONT-LICENSE.txt](FONT-LICENSE.txt) قرار دارد.

</div>
