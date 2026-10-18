"""Localize the editable English SVG sheets into RTL Persian SVG and vector PDF.

Dependencies: reportlab, arabic-reshaper, python-bidi. The existing repository's
SIL OFL Vazirmatn font is embedded in the generated SVG/PDF documents.
"""
from pathlib import Path
import argparse
import base64
import copy
import re
import xml.etree.ElementTree as ET
import arabic_reshaper
from bidi.algorithm import get_display
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

HERE = Path(__file__).resolve().parent
parser = argparse.ArgumentParser()
parser.add_argument('--source-dir', type=Path, default=HERE)
parser.add_argument('--out', type=Path, default=HERE)
parser.add_argument('--font-dir', type=Path, default=HERE.parents[1] / 'public-site/fonts')
args = parser.parse_args()
args.out.mkdir(parents=True, exist_ok=True)
W, H = 1600, 1100
NS = 'http://www.w3.org/2000/svg'
ET.register_namespace('', NS)
T = {
 'POLAD CHARKHESH / DESIGN HANDOFF':'پولاد چرخش آرین تک | راهنمای طراحان وب',
 'Public sitemap & interaction model':'نقشهٔ وب‌سایت و الگوی تعامل',
 'Visitor-facing information architecture, URL targets and primary task flow':'معماری اطلاعات بخش عمومی، مسیرهای دسترسی و جریان اصلی کاربر',
 'SHEET 1 / 02':'برگهٔ ۱ از ۲', 'SHEET 2 / 02':'برگهٔ ۲ از ۲',
 'Solid lines: page composition':'خط پیوسته: ساختار اجزای صفحه',
 'Dashed outline: retained direct route':'کادر خط‌چین: مسیر مستقیم حفظ‌شده',
 'Blue arrows: interaction / progression':'پیکان آبی: تعامل یا حرکت در مسیر',
 'PUBLIC HOME':'صفحهٔ اصلی عمومی',
 '/  -  One continuous page with embedded catalogue and engineering workspaces':'یک صفحهٔ پیوسته با کاتالوگ و فضای ابزارهای مهندسی درون صفحه',
 'FA / RTL   |   EN / LTR':'فارسی: راست‌به‌چپ | انگلیسی: چپ‌به‌راست',
 '01  Company & context':'۰۱  معرفی و زمینهٔ فعالیت',
 'Hero and quick product search':'بخش آغازین و جست‌وجوی سریع محصول',
 'Capabilities and company profile':'توانمندی‌ها و معرفی شرکت',
 'Industries and applications':'صنایع و کاربردها',
 'Why choose us / technical support':'مزیت‌های شرکت و پشتیبانی فنی',
 '02  Product catalogue':'۰۲  کاتالوگ محصولات',
 'Search: code, size, application':'جست‌وجو بر اساس کد، ابعاد و کاربرد',
 'Family and dimension filters':'فیلتر خانوادهٔ محصول و ابعاد',
 'Product results and selection':'نمایش نتایج و انتخاب محصول',
 'Open product information panel':'باز کردن پنل اطلاعات محصول',
 '03  Engineering workspace':'۰۳  فضای ابزارهای مهندسی',
 'Product selection / input context':'محاسبهٔ محصول: مشروط به تأیید روش',
 'Life and equivalent load':'محاسبهٔ دستی مستقل از انتخاب محصول',
 'Basic rating life and fit limits':'عمر نامی و بار معادل بیرینگ',
 'Technical comparison':'حدود انطباق و مقایسهٔ فنی',
 'Unit conversion':'تبدیل واحدها',
 '04  Contact & inquiry':'۰۴  تماس و درخواست فنی',
 'Company contact information':'اطلاعات تماس شرکت',
 'Technical inquiry form':'فرم درخواست مشاورهٔ فنی',
 'Submission feedback':'نمایش نتیجهٔ ارسال درخواست',
 'PRODUCT INFORMATION PANEL':'پنل اطلاعات محصول',
 'Identity / specifications / images / illustrative 3D / documents':'شناسه و مشخصات فنی / تصاویر / مدل سه‌بعدی نمایشی / مستندات',
 'Shareable selection: /?item=:slug#catalog':'/?item=:slug#catalog',
 'RETAINED DIRECT ROUTES':'مسیرهای مستقیم حفظ‌شده',
 'SHARED SITE SHELL':'اجزای مشترک رابط کاربری',
 'Header / section navigation / footer':'سربرگ / ناوبری بخش‌ها / پابرگ',
 'Language and reading direction':'زبان و جهت نمایش محتوا',
 'PRIMARY VISITOR FLOW':'مسیر اصلی بازدیدکننده',
 '01 / DISCOVER':'۰۱ / یافتن', 'Search and filter':'جست‌وجو و فیلتر',
 '02 / INSPECT':'۰۲ / بررسی', 'Review product details':'بررسی جزئیات محصول',
 '03 / EVALUATE':'۰۳ / ارزیابی', 'Use engineering tools':'استفاده از ابزارهای مهندسی',
 '04 / REFERENCE':'۰۴ / مطالعه', 'Read documents':'مطالعهٔ مستندات',
 '05 / CONNECT':'۰۵ / ارتباط', 'Send a technical inquiry':'ارسال درخواست فنی',
 'Recommended walkthrough; users may jump between sections and tools.':'این مسیر برای معرفی پیشنهاد می‌شود؛ کاربر می‌تواند آزادانه بین بخش‌ها و ابزارها جابه‌جا شود.',
 'DESIGN CONTRACT':'الزامات طراحی',
 'Preserve bilingual RTL/LTR layouts, technical data hierarchy, product context and clear interaction states.':'چیدمان دو‌زبانه، سلسله‌مراتب داده‌های فنی، زمینهٔ محصول و وضعیت‌های روشن تعامل حفظ شوند.',
 'Design review coverage: keyboard/focus, loading, empty/error states, mobile reflow and reduced-motion behavior.':'بازبینی طراحی: صفحه‌کلید و تمرکز، بارگذاری، حالت خالی و خطا، چیدمان موبایل و کاهش حرکت.',
 'Source: app/Router.tsx; Home.tsx; HomeSections.tsx; Engineering.tsx; lib/public-links.ts. Sections are grouped for readability.':'مبنا: کد مسیریابی، صفحهٔ اصلی، ابزارهای مهندسی و پیوندهای عمومی؛ گروه‌بندی برای خوانایی است.',
 '18 OCT 2026  |  Source-based structure  |  Simplified for design review; no live acceptance claim':'۱۸ اکتبر ۲۰۲۶ | مبتنی بر کد پروژه | راهنمای طراحی؛ به‌معنای تأیید نهایی سایت نیست',
 'PC / 01':'پ‌چ / ۰۱', 'PC / 02':'پ‌چ / ۰۲',
 'Administration & data architecture':'پنل مدیریت و معماری داده',
 'Application boundaries, content ownership and the operational inquiry loop':'مرزهای نرم‌افزار، مسئولیت نگهداری محتوا و چرخهٔ رسیدگی به درخواست‌ها',
 'Two-way arrows: requests and responses, or storage reads and writes. Module boundaries are shown explicitly.':'پیکان دوطرفه: درخواست و پاسخ یا خواندن و نوشتن داده؛ مرز هر بخش مشخص است.',
 'PUBLIC INTERFACE':'رابط عمومی وب‌سایت',
 'Company / catalogue / contact':'معرفی شرکت / کاتالوگ / تماس',
 'Client-side engineering tools':'ابزارهای مهندسی در مرورگر کاربر',
 'Three.js illustrative mechanical views':'نمایش سه‌بعدی مکانیکی با Three.js',
 'Reads public content; submits inquiries.':'دریافت محتوای عمومی و ارسال درخواست فنی',
 'ADMIN CONTROL CENTER':'مرکز مدیریت وب‌سایت',
 'Authenticated access / role-based permissions':'ورود احراز هویت‌شده و دسترسی بر اساس نقش',
 'Overview':'نمای کلی', 'Website editor':'ویرایشگر وب‌سایت',
 'Products':'محصولات', 'Header':'سربرگ', 'Media':'رسانه', 'SEO':'سئو',
 'Company':'شرکت', 'System & security':'سیستم و امنیت',
 'Inquiries':'درخواست‌ها', 'Audit logs':'گزارش رویدادها',
 'Public content responses':'دریافت محتوای عمومی', 'Inquiry submissions':'ارسال درخواست فنی',
 'Authenticated reads / writes':'خواندن و ویرایش با دسترسی مجاز',
 'Uploads and status updates':'بارگذاری فایل و تغییر وضعیت',
 'APPLICATION SERVER':'سرور برنامه',
 'Public data and inquiries / protected administration / validation':'داده‌های عمومی و درخواست‌ها / مدیریت حفاظت‌شده / اعتبارسنجی',
 'Server sessions / media handling / audit events / backup endpoints':'نشست‌های کاربری / مدیریت رسانه / ثبت رویداد / خدمات پشتیبان‌گیری',
 'Returns saved content and operation results to the relevant interface.':'محتوای ذخیره‌شده و نتیجهٔ عملیات به رابط مربوط بازگردانده می‌شود.',
 'Read / write structured records':'خواندن و نوشتن رکوردهای ساختاریافته',
 'Store / serve file bytes':'ذخیره‌سازی و ارائهٔ محتوای فایل',
 'SQLITE / AUTHORITATIVE SAVED DATA':'SQLite / مرجع داده‌های ذخیره‌شده',
 'Products / website content / company settings / inquiries':'محصولات / محتوای وب‌سایت / تنظیمات شرکت / درخواست‌ها',
 'Media metadata / accounts and sessions / audit records':'فرادادهٔ رسانه / حساب‌ها و نشست‌ها / گزارش رویدادها',
 'MEDIA STORAGE / UPLOADED FILES':'فضای رسانه / فایل‌های بارگذاری‌شده',
 'Image and PDF bytes are stored separately from SQLite.':'محتوای فایل‌های تصویر و PDF جدا از پایگاه داده ذخیره می‌شود.',
 'Product and content records refer to media resources.':'رکوردهای محصول و محتوا به فایل‌های رسانه ارجاع می‌دهند.',
 'INQUIRY OPERATIONS':'چرخهٔ رسیدگی به درخواست', 'Visitor submits':'ارسال توسط بازدیدکننده',
 'NEW':'جدید', 'REVIEWED':'بررسی‌شده', 'CONTACTED':'تماس گرفته‌شده', 'CLOSED':'بسته‌شده',
 'Staff change inquiry status. Engineering formulas remain in application code; routine content is managed in the CMS.':'کارکنان وضعیت درخواست را تغییر می‌دهند؛ فرمول‌ها در کد برنامه و محتوای معمول در پنل مدیریت نگهداری می‌شوند.',
 'Source: README.md; components/admin/Admin.tsx; platform components. Deployment topology and entity-level schema are outside this view.':'مبنا: راهنمای پروژه و کد پنل مدیریت؛ این نمودار شامل توپولوژی استقرار و طرح جزئی جداول نیست.',
}
allowed = {'React + TypeScript','Node + Express API','/admin  |  /admin/'}
pdfmetrics.registerFont(TTFont('Vazirmatn', str(args.font_dir / 'Vazirmatn-Arabic.ttf')))
font = pdfmetrics.getFont('Vazirmatn')
font_styles = []
for name in ('vazirmatn-arabic.woff2','vazirmatn-latin.woff2'):
    data=base64.b64encode((args.font_dir/name).read_bytes()).decode('ascii')
    unicode_range = 'U+0600-06FF,U+0750-077F,U+08A0-08FF,U+200C-200F,U+202A-202E,U+FB50-FDFF,U+FE70-FEFF' if 'arabic' in name else 'U+0000-00FF,U+2000-200B,U+2010-2029'
    font_styles.append(f"@font-face{{font-family:VazirmatnDoc;src:url(data:font/woff2;base64,{data}) format('woff2');font-weight:100 900;unicode-range:{unicode_range};}}")
c=canvas.Canvas(str(args.out/'polad-charkhesh-designer-handoff-fa.pdf'),pagesize=(1152,792))
c.setTitle('Polad Charkhesh - Persian designer handoff')
c.setAuthor('Polad Charkhesh')
for stem in ('01-public-sitemap','02-admin-data-architecture'):
    source=ET.parse(args.source_dir/f'{stem}.svg').getroot()
    root=ET.Element(f'{{{NS}}}svg',{'width':str(W),'height':str(H),'viewBox':f'0 0 {W} {H}','lang':'fa'})
    ET.SubElement(root,f'{{{NS}}}title').text='پولاد چرخش آرین تک - راهنمای طراحان'
    ET.SubElement(root,f'{{{NS}}}style').text='\n'.join(font_styles)
    c.saveState(); c.scale(.72,.72)
    for el in source:
        tag=el.tag.split('}')[-1]
        if tag=='title': continue
        item=copy.deepcopy(el)
        a=item.attrib
        if tag=='rect':
            x,y,w,h=map(float,(a['x'],a['y'],a['width'],a['height']))
            x=W-x-w; a['x']=str(x)
            c.setFillColor(HexColor(a['fill'])); c.setStrokeColor(HexColor(a['stroke'])); c.setLineWidth(1)
            c.setDash([5,4] if 'stroke-dasharray' in a else [])
            c.rect(x,H-y-h,w,h,fill=1,stroke=1); c.setDash([])
        elif tag=='path':
            pts=[(W-float(x),float(y)) for x,y in re.findall(r'([\d.]+),([\d.]+)',a['d'])]
            a['d']='M '+' L '.join(f'{x},{y}' for x,y in pts)
            c.setStrokeColor(HexColor(a['stroke'])); c.setLineWidth(float(a.get('stroke-width',1)))
            c.setDash([6,5] if 'stroke-dasharray' in a else [])
            p=c.beginPath(); p.moveTo(pts[0][0],H-pts[0][1])
            for x,y in pts[1:]: p.lineTo(x,H-y)
            c.drawPath(p); c.setDash([])
        elif tag=='text':
            raw=item.text or ''
            if raw not in T and raw not in allowed and not raw.startswith('/'):
                raise ValueError(f'Missing translation: {raw}')
            s=T.get(raw,raw)
            x,y=W-float(a['x']),float(a['y'])
            size=float(a['font-size'])
            # Keep the bilingual header and inquiry lifecycle labels comfortably inside their columns.
            if raw=='FA / RTL   |   EN / LTR': size=16
            if raw=='Visitor submits': size=17
            fa=bool(re.search('[\u0600-\u06ff]',s))
            visual=get_display(arabic_reshaper.reshape(s),base_dir='R') if fa else s
            face='Vazirmatn' if fa else ('Courier' if 'mono' in a['font-family'] else 'Helvetica')
            if fa:
                missing=[ch for ch in visual if ord(ch)>32 and ord(ch) not in font.face.charToGlyph]
                assert not missing, missing
            width=pdfmetrics.stringWidth(visual,face,size)
            assert x-width>=30, (s,x,width)
            c.setFont(face,size); c.setFillColor(HexColor(a['fill'])); c.drawRightString(x,H-y,visual)
            item.text=s; a['x']=str(x); a['font-size']=str(size)
            a['font-family']='VazirmatnDoc,Tahoma,Arial,sans-serif' if fa else 'Courier New,monospace'
            a['direction']='rtl' if fa else 'ltr'
            a['text-anchor']='start' if fa else 'end'
            a['unicode-bidi']='plaintext'
        else: raise ValueError(tag)
        root.append(item)
    ET.ElementTree(root).write(args.out/f'{stem}-fa.svg',encoding='utf-8',xml_declaration=True)
    c.restoreState(); c.showPage()
c.save()
print('Created Persian PDF and two editable RTL SVGs.')
