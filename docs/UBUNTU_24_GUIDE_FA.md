# راهنمای فارسی نصب سایت و پنل ادمین روی Ubuntu 24.04

تاریخ: ۲۰۲۶-۱۰-۱۳ — شرکت پولاد چرخش آرین تک

این راهنما برای **اولین نصب روی VPS اختصاص‌یافته به همین سایت** است. اسکریپت، نصب موجود را بازنویسی نمی‌کند. راه‌اندازی اولیه به‌صورت آزمایشی و محدود به IP شماست؛ طبق [گزارش آمادگی](VPS_READINESS_2026-10-13.md)، رفع lint، تأیید داده‌ها و تصاویر و آزمون واقعی سرور هنوز لازم است. نوشتن این راهنما به معنی اجرای استقرار روی VPS نیست.

## ۱. چه چیزی بخریم؟

- Ubuntu **24.04 LTS**، ترجیحاً ۲ هسته، ۴ گیگابایت RAM و ۶۰ گیگابایت SSD؛ ماهانه برای شروع.
- دسترسی root یا sudo، IPv4 عمومی، اینترنت بین‌المللی و کنسول اضطراری ارائه‌دهنده.
- امکان بازکردن پورت SSH واقعی و پورت‌های ۸۰ و ۴۴۳ در فایروال شرکت میزبان.
- فضای پایدار مناسب SQLite/WAL؛ فایل‌های دیتابیس نباید روی NFS/SMB باشند.
- کنترل DNS دامنه‌های `poladcharkhesh.com` و `poladcharkhesh.ir`.

برای این پروژه نیازی به cPanel، Plesk، MariaDB یا GPU نیست. مخزن کد شامل رابط عمومی، پنل ادمین، API، مدل‌های سه‌بعدی و ابزارهای مهندسی است. پنل ادمین یک نصب جداگانه ندارد.

## ۲. کد عمومی و اطلاعات خصوصی را جدا نگه دارید

مخزن عمومی [GitHub](https://github.com/mosish/polad-charkhesh) فقط کد و دارایی‌های عمومی پروژه را نگه می‌دارد. فایل `.env`، رمزها، کلیدها، دیتابیس، حساب ادمین و رسانه‌های آپلودی را وارد Git نکنید. «Download ZIP» از GitHub فقط آرشیو کد است و بکاپ اطلاعات پنل نیست. پوشه `node_modules` نیز روی خود لینوکس نصب می‌شود.

برای حفظ ویرایش‌های فعلی، **مسیر بکاپ** را انتخاب کنید. گزینه `--initialize-empty` فقط برای نصب عمداً جدید است: کاتالوگ اولیه را می‌سازد و حساب‌ها، ویرایش‌ها و آپلودهای فعلی را منتقل نمی‌کند.

## ۳. اتصال از ویندوز

در PowerShell، به‌جای `SERVER_IP` آدرس واقعی VPS و به‌جای `22` پورت اعلام‌شده میزبان را بگذارید:

```powershell
ssh -p 22 root@SERVER_IP
```

اثر انگشت SSH را با کنسول/اطلاعات میزبان تطبیق دهید. اگر ارائه‌دهنده حساب دیگری داده است، همان حساب را استفاده کنید و دستورهای مدیریتی را با `sudo` اجرا کنید. رمز و کلید خصوصی را داخل چت نفرستید. هنگام تایپ رمز در SSH، چیزی نمایش داده نمی‌شود؛ این طبیعی است.

برای استفاده روزمره، کلید SSH و حساب sudo شخصی بسازید. طبق [راهنمای Ubuntu](https://ubuntu.com/server/docs/openssh-server/)، پیش از محدودکردن ورود root یا ورود با رمز، ورود با کلید را در **یک پنجره دوم** آزمایش کنید. پنجره فعلی را باز نگه دارید. اسکریپت SSH را تغییر نمی‌دهد.

پیش از نصب برنامه، بسته‌های سیستم‌عامل را با `sudo apt-get update` و `sudo apt-get upgrade` به‌روز کنید. اگر `/var/run/reboot-required` وجود داشت، در همین مرحله با `sudo reboot` راه‌اندازی مجدد کنید و دوباره وصل شوید؛ سپس مراحل نصب را ادامه دهید.

## ۴. انتقال اطلاعات فعلی پنل — روش پیشنهادی

ابتدا برنامه محلی و هر فرایندی را که روی اطلاعات آن می‌نویسد متوقف کنید. پوشه‌ای را انتخاب کنید که **واقعاً سایت فعلی با آن اجرا می‌شود**؛ ممکن است داده‌ها در `.local-data` یا `data` باشند. نام پوشه را حدس نزنید. متغیرهای محیطی اجرای سایت یا تنظیمات لانچر محلی مشخص می‌کنند کدام مسیر فعال است. دستور بکاپ فایل `.env` را خودکار نمی‌خواند.

در PowerShell داخل پوشه پروژه، مسیرهای واقعی را جایگزین کنید:

```powershell
$env:DATABASE_PATH = 'C:\REPLACE_WITH_ACTIVE_DATA_FOLDER\platform.sqlite'
$env:UPLOAD_DIR = 'C:\REPLACE_WITH_ACTIVE_DATA_FOLDER\uploads'
if (!(Test-Path -LiteralPath $env:DATABASE_PATH)) { throw 'Database path is wrong' }
if (!(Test-Path -LiteralPath $env:UPLOAD_DIR)) { throw 'Upload path is wrong' }
pnpm backup:data 'C:\Users\Shahi\Documents\Polad-private-backups'
```

اگر دستور موفق شد، مسیر دقیق `backup-...` چاپ‌شده را در این دستور بگذارید:

```powershell
pnpm verify:backup 'C:\Users\Shahi\Documents\Polad-private-backups\backup-REPLACE_WITH_EXACT_NAME'
```

فقط پس از مشاهده `Backup verified` ادامه دهید. برنامه محلی را می‌توانید دوباره اجرا کنید، اما تغییرهای بعد از بکاپ به VPS منتقل نمی‌شوند؛ برای انتقال نهایی یک بازه توقف و بکاپ نهایی در نظر بگیرید.

در **SSH سرور** یک پوشه خصوصی بسازید:

```bash
sudo install -d -m 0700 /root/polad-transfer
```

در **PowerShell ویندوز** کل پوشه بکاپ را منتقل کنید. حرف `P` در گزینه پورت `scp` بزرگ است:

```powershell
scp -P 22 -r 'C:\Users\Shahi\Documents\Polad-private-backups\backup-REPLACE_WITH_EXACT_NAME' root@SERVER_IP:/root/polad-transfer/
```

اگر root SSH مجاز نیست، با حساب sudo خودتان به پوشه خصوصی در home همان حساب انتقال دهید و سپس روی سرور با `sudo mv` آن پوشه مشخص را به `/root/polad-transfer/` منتقل کنید. محتوای بکاپ شامل رمزهای هش‌شده و اطلاعات خصوصی است؛ آن را در وب یا GitHub قرار ندهید.

## ۵. دریافت نسخه مشخص از GitHub

از این مرحله دستورهای Bash را در **ترمینال SSH سرور** اجرا کنید، نه PowerShell. برای حساب غیر-root، `sudo -i` بزنید. نصب اولیه را روی سرور تازه انجام دهید؛ این اسکریپت ابزار به‌روزرسانی نیست.

```bash
apt-get update
apt-get install -y ca-certificates curl git
PC_COMMIT=$(git ls-remote https://github.com/mosish/polad-charkhesh.git refs/heads/main | cut -f1)
[[ "$PC_COMMIT" =~ ^[0-9a-f]{40}$ ]] || { echo 'Cannot resolve GitHub main'; exit 1; }
curl --fail --show-error --location \
  "https://raw.githubusercontent.com/mosish/polad-charkhesh/$PC_COMMIT/deploy/install-ubuntu.sh" \
  -o /root/install-ubuntu.sh
bash -n /root/install-ubuntu.sh
less /root/install-ubuntu.sh
```

با `q` از نمایش فایل خارج شوید. این کار نسخه مشخصی از اسکریپت را دریافت می‌کند؛ اجرای آن مرحله بعد است. اسکریپت به‌صورت root اجرا می‌شود، بنابراین قبل از اجرا آن را مرور کنید. اگر ترمینال را بستید، متغیر `PC_COMMIT` باقی نمی‌ماند؛ مقدار نسخه را دوباره مشخص کنید. آخرین `main` لزوماً مجوز انتشار عمومی ندارد.

## ۶. نصب خودکار با بکاپ فعلی

پورت SSH و نام دقیق پوشه بکاپ را جایگزین کنید:

```bash
bash /root/install-ubuntu.sh install \
  --ref "$PC_COMMIT" \
  --ssh-port 22 \
  --backup /root/polad-transfer/backup-REPLACE_WITH_EXACT_NAME
```

اسکریپت این کارها را انجام می‌دهد:

1. سازگاری Ubuntu و نبود نصب قبلی را بررسی می‌کند.
2. Nginx، Certbot، ابزارهای لازم، آپدیت امنیتی خودکار و UFW را تنظیم می‌کند؛ پورت SSH اعلام‌شده و ۸۰/۴۴۳ را مجاز می‌کند. فایروال پنل میزبان جداگانه باید تنظیم شود.
3. Node **24.21.0** را از سایت رسمی با بررسی SHA-256، و pnpm نسخه مشخص را نصب می‌کند. این نسخه در گزارش پروژه آزموده شده است؛ پین‌بودن نسخه جایگزین بررسی امنیتی به‌روزرسانی‌های آینده نیست.
4. نسخه مشخص مخزن را دریافت و وابستگی‌ها را با lockfile نصب می‌کند. نصب و build با کاربر بدون دسترسی root انجام می‌شود.
5. audit وابستگی‌ها، TypeScript، تست‌ها، build، حجم bundle و smoke test را اجرا می‌کند. شکست این بررسی‌ها نصب را متوقف می‌کند.
6. نتیجه lint را ثبت می‌کند. شکست lint فقط اجازه راه‌اندازی آزمایشی محدود را می‌دهد و مجوز انتشار عمومی نیست.
7. بکاپ خصوصی را دوباره بررسی و اطلاعات را در فضای پایدار بازیابی می‌کند؛ فایل مبدأ را حذف نمی‌کند.
8. secretهای جدید می‌سازد، سرویس systemd را راه‌اندازی و `/api/health` را بررسی می‌کند. نشست‌های ورود قبلی منتقل‌شده به دلیل تعویض secret نیاز به ورود مجدد دارند؛ حساب و رمز قبلی باقی می‌ماند.

تا پایان HTTPS، پاسخ `503` روی دامنه **عمدی** است. پورت‌های ۳۰۰۱ و ۵۱۷۳ را باز نکنید.

**فقط برای یک نصب عمداً جدید و بدون اطلاعات قبلی**، به‌جای دستور بالا این را اجرا کنید؛ هر دو روش را پشت سر هم اجرا نکنید:

```bash
bash /root/install-ubuntu.sh install --ref "$PC_COMMIT" --ssh-port 22 --initialize-empty
```

نصب جدید با داده اولیه پروژه شروع می‌شود؛ برای انتقال سایت فعلی از آن استفاده نکنید. هیچ نام کاربری یا رمز پیش‌فرضی وجود ندارد.

## ۷. اتصال هر دو دامنه

در پنل DNS هر دامنه:

| دامنه | نوع رکورد | نام | مقدار |
| --- | --- | --- | --- |
| poladcharkhesh.com | A | @ | IPv4 سرور |
| poladcharkhesh.ir | A | @ | همان IPv4 سرور |

رکوردهای ایمیل MX/TXT را حفظ کنید. اگر AAAA قدیمی وجود دارد ولی IPv6 این سرور تنظیم نشده، آن را اصلاح/حذف کنید؛ نباید به سرور دیگری اشاره کند. این نصب فقط دامنه‌های اصلی را پوشش می‌دهد؛ `www` را بدون افزودن تنظیمات و گواهی مربوطه منتشر نکنید. تغییر DNS دامنه‌ای که اکنون سایت فعال دارد، ترافیک آن سایت را منتقل می‌کند؛ برای آن زمان انتقال جداگانه در نظر بگیرید.

پس از انتشار DNS، در PowerShell بررسی کنید که هر دو مقدار درست هستند:

```powershell
Resolve-DnsName poladcharkhesh.com -Type A
Resolve-DnsName poladcharkhesh.ir -Type A
```

## ۸. HTTPS و دسترسی آزمایشی

IPv4 عمومی اینترنتی را که با آن سایت را در مرورگر باز می‌کنید مشخص کنید؛ این **IP رایانه/اتصال اینترنت شماست، نه IP سرور**. VPN می‌تواند آن را تغییر دهد. سپس در SSH:

```bash
bash /root/install-ubuntu.sh https --allow-ip YOUR_PUBLIC_IPV4
```

Certbot ایمیل و پذیرش شرایط را می‌پرسد؛ شخصاً پاسخ دهید. گواهی هر دو دامنه صادر و تمدید آزمایشی بررسی می‌شود. Nginx فقط IP شما را به برنامه راه می‌دهد؛ سایر کاربران ۴۰۳ می‌گیرند. موتور جست‌وجو نیز هدر `noindex` دریافت می‌کند. این محدودیت، همراه TLS، امکان بررسی امن پنل تولید را می‌دهد.

- سایت انگلیسی: `https://poladcharkhesh.com/`
- سایت فارسی: `https://poladcharkhesh.ir/`
- پنل: `https://poladcharkhesh.com/admin/`

برای دیتابیس بازیابی‌شده با همان حساب قبلی وارد شوید. برای نصب جدید، توکن را فقط در ترمینال خصوصی خود ببینید:

```bash
sudo grep '^SETUP_TOKEN=' /etc/polad-charkhesh/env
```

در فرم اولیه ادمین، توکن و نام کاربری و رمز تازه را وارد کنید. پس از موفقیت و امتحان ورود، با دستور زیر فایل را باز کنید و **فقط دو خط** `SETUP_TOKEN=...` و `ALLOW_INITIALIZE_DATABASE=1` را حذف کنید؛ secretهای دیگر را تغییر ندهید:

```bash
sudo nano /etc/polad-charkhesh/env
sudo systemctl restart polad-charkhesh
curl --fail http://127.0.0.1:3001/api/health
```

## ۹. بررسی سرور و بکاپ

```bash
sudo systemctl status polad-charkhesh --no-pager
sudo journalctl -u polad-charkhesh -n 60 --no-pager
sudo cat /etc/polad-charkhesh/source-commit
sudo cat /etc/polad-charkhesh/readiness
sudo cat /etc/polad-charkhesh/hosting-probe.json
sudo ufw status verbose
sudo systemctl list-timers certbot.timer
```

گزارش hosting-probe دستور `--verify` مخصوص پوشه آزمون همان سرور را چاپ می‌کند. آن را یادداشت کنید، در یک بازه آزمایشی سرور را با `sudo reboot` راه‌اندازی مجدد کنید، دوباره SSH بزنید و همان بررسی را با کاربر `polad-charkhesh` و Node نصب‌شده اجرا کنید. وضعیت سرویس و health باید درست باشند. `systemctl stop` عمدی سرویس را متوقف نگه می‌دارد؛ با آزمون بازیابی از crash متفاوت است.

قبل از هر تغییر نسخه و به‌طور منظم، از **دیتابیس و فایل‌ها با هم** بکاپ بگیرید. این دستورها برای مسیرهای همین نصب هستند؛ خط آخر را حتی در صورت شکست بکاپ اجرا کنید تا سرویس عمداً خاموش نماند، اما با بکاپ ناموفق به‌روزرسانی نکنید:

```bash
cd /opt/polad-charkhesh/current
sudo systemctl stop polad-charkhesh
sudo env DATABASE_PATH=/var/lib/polad-charkhesh/platform.sqlite \
  UPLOAD_DIR=/var/lib/polad-charkhesh/uploads \
  /opt/polad-node-v24.21.0/bin/node --import tsx scripts/backup-data.ts /var/backups/polad-charkhesh
sudo systemctl start polad-charkhesh
```

با مسیر دقیق خروجی، صحت بکاپ را بررسی کنید:

```bash
sudo /opt/polad-node-v24.21.0/bin/node --import tsx scripts/verify-backup.ts \
  /var/backups/polad-charkhesh/backup-REPLACE_WITH_EXACT_NAME
```

یک نسخه رمزگذاری‌شده خارج از VPS نگه دارید و بازیابی آن را در محیط جداگانه امتحان کنید. زمان‌بندی بکاپ و انتقال خارج از سرور باید پیش از انتشار نهایی تنظیم شود؛ اسکریپت نصب این دو کار را خودکار نمی‌کند. بکاپ ارائه‌دهنده را هم جداگانه فعال و بازیابی‌اش را آزمایش کنید.

## ۱۰. انتشار عمومی، فقط بعد از تأیید

پیش از انتشار: ورود/خروج ادمین، ویرایش و آپلود، تصاویر واقعی، داده محصولات، هر دو زبان، موبایل، محاسبات مهندسی، لینک‌ها، 404، sitemap، robots، TLS، reboot، بازیابی بکاپ، lint و دسترس‌پذیری/امنیت را تکمیل کنید. [موارد باز فعلی](VPS_READINESS_2026-10-13.md#open-release-gates) را با نسخه نصب‌شده تطبیق دهید.

پس از تأیید، از تنظیم Nginx نسخه بگیرید و در فایل سایت فقط خطوط دسترسی آزمایشی `allow ...;`، `deny all;` و `add_header X-Robots-Tag "noindex, nofollow" always;` را از بلوک `location /` مربوط به HTTPS بردارید:

```bash
sudo cp -a /etc/nginx/sites-available/polad-charkhesh /etc/polad-charkhesh/nginx-before-public.conf
sudo nano /etc/nginx/sites-available/polad-charkhesh
sudo nginx -t && sudo systemctl reload nginx
```

هر دو دامنه را از اینترنت دیگری بررسی کنید. فایل‌های sitemap هر دو دامنه را در Search Console ثبت کنید. حذف محدودیت IP، سایت و صفحه ورود ادمین را عمومی می‌کند؛ احراز هویت ادمین همچنان لازم است.

## خطاهای متداول و به‌روزرسانی

| نشانه | اقدام |
| --- | --- |
| Existing path | نصب یا تلاش قبلی وجود دارد؛ فایل‌ها را پاک نکنید. وضعیت و گزارش را بررسی و ادامه را دستی انجام دهید. |
| خطای audit، تست یا build | همان خطا را اصلاح کنید؛ بررسی را دور نزنید. |
| خطای بکاپ یا نبود administrator | مسیر/بکاپ صحیح را پیدا کنید؛ با نصب خالی آن را پنهان نکنید. |
| 503 پیش از HTTPS | صفحه موقت عمدی است؛ DNS و مرحله HTTPS را کامل کنید. |
| 403 بعد از HTTPS | IP عمومی شما با allow فرق دارد؛ IP صحیح را در تنظیم Nginx جایگزین و با `nginx -t` بررسی کنید. |
| 502 | `systemctl status`، گزارش برنامه و health روی ۳۰۰۱ را بررسی کنید. |
| صدور SSL ناموفق | A/AAAA، پورت ۸۰ در دو فایروال، CAA و انتشار DNS را بررسی کنید. |
| Cross-origin request rejected | با URL صحیح HTTPS وارد شوید؛ Host و X-Forwarded-Proto در Nginx را تغییر ندهید. |

**برای به‌روزرسانی، این نصب‌کننده را دوباره اجرا نکنید.** بکاپ تأییدشده بگیرید؛ نسخه جدید را در پوشه release جدا بسازید، بررسی کنید، لینک `current` را تغییر دهید و سرویس را restart کنید. نسخه قبل را برای بازگشت نگه دارید. اگر تغییر دیتابیس وجود دارد، بازگشت فقط کد کافی نیست. جزئیات در [راهنمای انگلیسی](UBUNTU_24_RUNBOOK.md#backup-updates-and-rollback) است؛ مسیر Node این نصب `/opt/polad-node-v24.21.0/bin/node` است.

منابع فنی: [Node رسمی و checksum](https://nodejs.org/download/release/v24.21.0/)، [فایروال Ubuntu](https://ubuntu.com/server/docs/firewalls/)، [Certbot](https://eff-certbot.readthedocs.io/en/stable/using.html#webroot)، [محدودیت‌های SQLite WAL](https://www.sqlite.org/wal.html). این نصب از بسته Certbot اوبونتو استفاده می‌کند؛ روش Snap جایگزین جداگانه است و نباید بدون بررسی با آن مخلوط شود.
