from pathlib import Path
from html import escape
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.pdfbase.pdfmetrics import stringWidth

OUT = Path(__file__).resolve().parent
W, H = 1600, 1100
NAVY, INK, MUTED = '#152C44', '#263B50', '#52677A'
BLUE, LINE, PALE, WHITE = '#176B91', '#B6C5D0', '#F1F6F9', '#FFFFFF'
TEAL = '#176C67'
c = canvas.Canvas(str(OUT / 'polad-charkhesh-designer-handoff.pdf'), pagesize=(1152, 792))
c.setTitle('Polad Charkhesh | Information Architecture & System Map')
c.setAuthor('Polad Charkhesh - Designer handoff')
svg = []

def start():
    global svg
    c.saveState(); c.scale(.72, .72)
    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">', '<title>Polad Charkhesh designer handoff</title>']
    rect(0, 0, W, H, WHITE, WHITE)

def rect(x,y,w,h,fill=WHITE,stroke=LINE,dash=False):
    c.setFillColor(HexColor(fill)); c.setStrokeColor(HexColor(stroke)); c.setLineWidth(1)
    c.setDash([5,4] if dash else [])
    c.rect(x,H-y-h,w,h,stroke=1,fill=1); c.setDash([])
    d=' stroke-dasharray="5 4"' if dash else ''
    svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{stroke}"{d}/>')

def text(x,y,s,size=18,color=INK,bold=False,mono=False):
    font = 'Courier' if mono else ('Helvetica-Bold' if bold else 'Helvetica')
    width = stringWidth(s, font, size)
    assert x+width <= W-30, (s, x+width)
    c.setFont(font,size); c.setFillColor(HexColor(color)); c.drawString(x,H-y,s)
    family = 'Courier New,monospace' if mono else 'Arial,Helvetica,sans-serif'
    weight = '700' if bold else '400'
    svg.append(f'<text x="{x}" y="{y}" font-family="{family}" font-size="{size}" font-weight="{weight}" fill="{color}">{escape(s)}</text>')

def path(points,color=LINE,width=1.5,dash=False,arrow=False):
    c.setStrokeColor(HexColor(color)); c.setLineWidth(width); c.setDash([6,5] if dash else [])
    p=c.beginPath(); p.moveTo(points[0][0], H-points[0][1])
    for x,y in points[1:]: p.lineTo(x,H-y)
    c.drawPath(p); c.setDash([])
    d='M '+' L '.join(f'{x},{y}' for x,y in points)
    da=' stroke-dasharray="6 5"' if dash else ''
    svg.append(f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{width}"{da}/>')
    if arrow:
        x,y=points[-1]; px,py=points[-2]
        if x>px: ends=[(x-7,y-4),(x,y),(x-7,y+4)]
        elif x<px: ends=[(x+7,y-4),(x,y),(x+7,y+4)]
        elif y>py: ends=[(x-4,y-7),(x,y),(x+4,y-7)]
        else: ends=[(x-4,y+7),(x,y),(x+4,y+7)]
        path(ends,color,width)

def header(index,title,subtitle):
    text(56,48,'POLAD CHARKHESH / DESIGN HANDOFF',14,BLUE,True)
    text(56,100,title,36,NAVY,True)
    text(56,134,subtitle,18,MUTED)
    text(1320,48,f'SHEET {index} / 02',14,MUTED,True)
    path([(56,155),(1544,155)])

def footer(index,source):
    text(56,1023,source,13,MUTED)
    path([(56,1042),(1544,1042)])
    text(56,1070,'18 OCT 2026  |  Source-based structure  |  Simplified for design review; no live acceptance claim',13,MUTED)
    text(1435,1070,f'PC / {index:02d}',13,MUTED,True)

def finish(name):
    svg.append('</svg>'); (OUT / f'{name}.svg').write_text('\n'.join(svg),encoding='utf-8')
    c.restoreState(); c.showPage()

def card(x,y,w,h,number,title,route,rows):
    rect(x,y,w,h)
    rect(x,y,w,47,PALE,LINE)
    text(x+17,y+31,f'{number}  {title}',21,NAVY,True)
    text(x+18,y+77,route,15,BLUE,mono=True)
    for i,line in enumerate(rows): text(x+18,y+113+i*29,line,17)

start()
header(1,'Public sitemap & interaction model','Visitor-facing information architecture, URL targets and primary task flow')
text(56,184,'Solid lines: page composition',14,MUTED)
text(420,184,'Dashed outline: retained direct route',14,MUTED)
text(870,184,'Blue arrows: interaction / progression',14,BLUE)
rect(56,211,1488,65,NAVY,NAVY)
text(78,240,'PUBLIC HOME',21,WHITE,True)
text(78,262,'/  -  One continuous page with embedded catalogue and engineering workspaces',16,WHITE)
text(1210,248,'FA / RTL   |   EN / LTR',19,WHITE,True)
path([(800,276),(800,296)])
path([(233,296),(1367,296)])
for x in (233,611,989,1367): path([(x,296),(x,319)])
card(56,319,354,251,'01','Company & context','/  |  #about  |  #industries',[
    'Hero and quick product search','Capabilities and company profile','Industries and applications','Why choose us / technical support'])
card(434,319,354,251,'02','Product catalogue','/#catalog',[
    'Search: code, size, application','Family and dimension filters','Product results and selection','Open product information panel'])
card(812,319,354,251,'03','Engineering workspace','/#engineering',[
    'Product selection / input context','Life and equivalent load','Basic rating life and fit limits','Technical comparison','Unit conversion'])
card(1190,319,354,251,'04','Contact & inquiry','/#contact',[
    'Company contact information','Technical inquiry form','Submission feedback'])
path([(611,570),(611,605)],BLUE,arrow=True)
rect(434,605,732,108,PALE,BLUE)
text(453,633,'PRODUCT INFORMATION PANEL',18,BLUE,True)
text(453,662,'Identity / specifications / images / illustrative 3D / documents',18)
text(453,690,'Shareable selection: /?item=:slug#catalog',15,MUTED,mono=True)
rect(56,605,354,108,WHITE,LINE,True)
text(74,632,'RETAINED DIRECT ROUTES',16,MUTED,True)
text(74,659,'/catalog   /engineering',16,BLUE,mono=True)
text(74,687,'/product/:slug',16,BLUE,mono=True)
rect(1190,605,354,108,WHITE,LINE)
text(1208,633,'SHARED SITE SHELL',17,NAVY,True)
text(1208,662,'Header / section navigation / footer',16)
text(1208,690,'Language and reading direction',16)
text(56,756,'PRIMARY VISITOR FLOW',16,BLUE,True)
steps=[('01 / DISCOVER','Search and filter'),('02 / INSPECT','Review product details'),('03 / EVALUATE','Use engineering tools'),('04 / REFERENCE','Read documents'),('05 / CONNECT','Send a technical inquiry')]
for i,(label,detail) in enumerate(steps):
    x=56+i*303
    rect(x,776,276,76,WHITE,LINE)
    text(x+15,803,label,15,BLUE,True)
    text(x+15,831,detail,17)
    if i<4: path([(x+280,814),(x+298,814)],BLUE,arrow=True)
text(56,883,'Recommended walkthrough; users may jump between sections and tools.',16,MUTED)
path([(56,906),(1544,906)])
text(56,937,'DESIGN CONTRACT',15,BLUE,True)
text(56,967,'Preserve bilingual RTL/LTR layouts, technical data hierarchy, product context and clear interaction states.',18)
text(56,995,'Design review coverage: keyboard/focus, loading, empty/error states, mobile reflow and reduced-motion behavior.',16,MUTED)
footer(1,'Source: app/Router.tsx; Home.tsx; HomeSections.tsx; Engineering.tsx; lib/public-links.ts. Sections are grouped for readability.')
finish('01-public-sitemap')

start()
header(2,'Administration & data architecture','Application boundaries, content ownership and the operational inquiry loop')
text(56,184,'Two-way arrows: requests and responses, or storage reads and writes. Module boundaries are shown explicitly.',15,MUTED)
rect(56,211,448,251)
rect(56,211,448,47,NAVY,NAVY)
text(76,242,'PUBLIC INTERFACE',21,WHITE,True)
text(76,288,'React + TypeScript',23,NAVY,True)
text(76,323,'Company / catalogue / contact',18)
text(76,353,'Client-side engineering tools',18)
text(76,383,'Three.js illustrative mechanical views',18)
text(76,426,'Reads public content; submits inquiries.',16,MUTED)
rect(550,211,994,251)
rect(550,211,994,47,NAVY,NAVY)
text(570,242,'ADMIN CONTROL CENTER',21,WHITE,True)
text(1210,241,'/admin  |  /admin/',17,WHITE,mono=True)
text(570,286,'Authenticated access / role-based permissions',18,BLUE,True)
left=['Overview','Products','Media','Company','Inquiries']
right=['Website editor','Header','SEO','System & security','Audit logs']
for i in range(5):
    text(570,319+i*27,left[i],18)
    text(1015,319+i*27,right[i],18)
path([(280,462),(280,557)],BLUE,arrow=True)
path([(280,557),(280,462)],BLUE,arrow=True)
text(66,496,'Public content responses',15,MUTED)
text(66,521,'Inquiry submissions',15,MUTED)
path([(1047,462),(1047,557)],BLUE,arrow=True)
path([(1047,557),(1047,462)],BLUE,arrow=True)
text(1067,496,'Authenticated reads / writes',15,MUTED)
text(1067,521,'Uploads and status updates',15,MUTED)
rect(56,557,1488,114,PALE,BLUE)
text(78,593,'APPLICATION SERVER',23,NAVY,True)
text(78,625,'Node + Express API',20,BLUE,True)
text(530,593,'Public data and inquiries / protected administration / validation',19)
text(530,625,'Server sessions / media handling / audit events / backup endpoints',19)
text(78,652,'Returns saved content and operation results to the relevant interface.',15,MUTED)
path([(410,671),(410,755)],BLUE,arrow=True)
path([(410,755),(410,671)],BLUE,arrow=True)
path([(1184,671),(1184,755)],BLUE,arrow=True)
path([(1184,755),(1184,671)],BLUE,arrow=True)
text(430,713,'Read / write structured records',16,MUTED)
text(1204,713,'Store / serve file bytes',16,MUTED)
rect(56,755,714,138)
rect(56,755,714,43,PALE,LINE)
text(76,784,'SQLITE / AUTHORITATIVE SAVED DATA',20,NAVY,True)
text(76,831,'Products / website content / company settings / inquiries',18)
text(76,862,'Media metadata / accounts and sessions / audit records',18)
rect(830,755,714,138)
rect(830,755,714,43,PALE,LINE)
text(850,784,'MEDIA STORAGE / UPLOADED FILES',20,NAVY,True)
text(850,831,'Image and PDF bytes are stored separately from SQLite.',18)
text(850,862,'Product and content records refer to media resources.',18)
text(56,932,'INQUIRY OPERATIONS',15,BLUE,True)
text(56,965,'Visitor submits',20,NAVY,True)
path([(225,959),(270,959)],BLUE,arrow=True)
for x,s in [(290,'NEW'),(540,'REVIEWED'),(830,'CONTACTED'),(1160,'CLOSED')]:
    text(x,965,s,20,TEAL,True)
for a,b in [(370,520),(680,810),(980,1140)]: path([(a,959),(b,959)],BLUE,arrow=True)
text(56,996,'Staff change inquiry status. Engineering formulas remain in application code; routine content is managed in the CMS.',16,MUTED)
footer(2,'Source: README.md; components/admin/Admin.tsx; platform components. Deployment topology and entity-level schema are outside this view.')
finish('02-admin-data-architecture')
c.save()
print(OUT / 'polad-charkhesh-designer-handoff.pdf')
