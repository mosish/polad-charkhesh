import { manufacturerResources } from './manufacturer-resources';
import { jsPDF } from 'jspdf';
import type { BearingProduct } from '../domain/product';
export function buildDatasheet(
  p: BearingProduct,
  company: any,
  options: {
    fontBase64?: string;
    logo?: Uint8Array | string;
    image?: Uint8Array | string;
    reference?: boolean;
  } = {},
) {
  const pdf = new jsPDF();
  const brandFont = options.fontBase64 ? 'IRANSans' : 'helvetica';
  if (options.fontBase64) {
    pdf.addFileToVFS('IRANSans.ttf', options.fontBase64);
    pdf.addFont('IRANSans.ttf', 'IRANSans', 'normal');
  }
  pdf.setFont(brandFont);
  pdf.setProperties({
    title: p.code + ' | Technical datasheet',
    author: 'Polad Charkhesh',
    subject: 'Imported engineering catalog specifications',
  });
  const header = () => {
    pdf.setFillColor(21, 36, 67);
    pdf.rect(0, 0, 210, 36, 'F');
    pdf.setTextColor(255);
    pdf.setFont(brandFont);
    pdf.setFontSize(18);
    pdf.text('POLAD CHARKHESH', 16, 16);
    if (options.logo) {
      pdf.setFillColor(255, 255, 255);
      pdf.rect(169, 3, 28, 29, 'F');
      pdf.addImage(options.logo, 'PNG', 171, 4.7, 24, (24 * 575) / 560);
    }
    pdf.setFontSize(9);
    pdf.text('TECHNICAL PRODUCT DATASHEET', 16, 27);
    pdf.setTextColor(21, 36, 67);
  };
  header();
  pdf.setFontSize(15);
  const code = pdf.splitTextToSize(p.code, 125);
  pdf.text(code, 16, 50);
  let y = 50 + code.length * 6;
  pdf.setFontSize(10);
  const name = pdf.splitTextToSize(p.nameEn, 125);
  pdf.text(name, 16, y + 3);
  y += name.length * 5 + 9;
  if (options.fontBase64) {
    pdf.setFont(brandFont);
    pdf.setFontSize(10);
    const names = pdf.splitTextToSize(
      p.nameFa
        .replace(/[A-Za-z0-9®°/()–—-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim(),
      125,
    );
    pdf.text(names, 141, y, { align: 'right' });
    y += names.length * 6 + 4;
    pdf.setFont(brandFont);
  }
  if (options.image) {
    pdf.addImage(options.image, 'PNG', 153, 42, 40, 40);
    pdf.setFontSize(7);
    pdf.text(
      options.reference ? 'Bearing family reference' : 'Product image',
      173,
      86,
      { align: 'center' },
    );
  } else {
    pdf.setDrawColor(130);
    pdf.circle(173, 63, 18);
    pdf.circle(173, 63, 8);
    pdf.setFontSize(7);
    pdf.text(`d ${p.d} / D ${p.D} / B ${p.B} mm`, 173, 87, { align: 'center' });
  }
  y = Math.max(y, 98);
  pdf.setFontSize(10);
  const rows = [
    ['Bore d / outside D / width B', `${p.d} / ${p.D} / ${p.B} mm`],
    ['Weight', p.weightKg + ' kg'],
    ['Dynamic / static rating', `${p.crKn} / ${p.corKn} kN`],
    ...(p.speedLimitingRpm ? [
      ['Reference speed', p.speedReferenceRpm ? `${p.speedReferenceRpm} rpm` : 'Not specified'],
      ['Limiting speed', `${p.speedLimitingRpm} rpm`],
    ] : [['Grease / oil speed', `${p.speedGreaseRpm} / ${p.speedOilRpm} rpm`]]),
    ['Cage', p.cageMaterialEn],
    ['Sealing', p.sealingEn],
    ['Clearance options', p.clearanceOptions.join(', ')],
  ];
  for (const [k, v] of rows) {
    const lines = pdf.splitTextToSize(v, 87);
    const height = Math.max(12, lines.length * 5 + 5);
    if (y + height > 248) {
      pdf.addPage();
      header();
      y = 50;
    }
    pdf.setDrawColor(222);
    pdf.line(16, y + height - 4, 194, y + height - 4);
    pdf.setTextColor(100);
    pdf.text(k, 16, y);
    pdf.setTextColor(21, 36, 67);
    pdf.text(lines, 105, y);
    y += height;
  }
  const paragraph = (text: string) => {
    pdf.setFontSize(9);
    const lines = pdf.splitTextToSize(text, 178);
    if (y + lines.length * 4.5 > 252) {
      pdf.addPage();
      header();
      y = 50;
    }
    pdf.text(lines, 16, y);
    y += lines.length * 4.5 + 7;
  };
  y += 7;
  paragraph('POLAD CHARKHESH TECHNICAL SUMMARY - not a manufacturer-issued datasheet.');
  paragraph('TECHNICAL SOURCES (INHERITED RECORDS)');
  for (const s of p.technicalSources || [])
    paragraph(
      s.manufacturer +
        ' | ' +
        (s.catalogCode || '') +
        ' | ' +
        s.reference +
        ' | Source date: ' +
        (s.verifiedAt || 'Unverified'),
    );
  paragraph(
    'Specifications are imported from the reference catalog. Source verification dates are inherited and have not been independently reverified in this build. Confirm manufacturer, suffix, load, lubricant, speed, fit and application suitability before selection. No availability or performance guarantee is implied.',
  );
  paragraph('OFFICIAL MANUFACTURER REFERENCES (family catalogs; verify exact suffix)');
  for(const r of manufacturerResources.filter(r=>p.brands.some(b=>b.toLowerCase().includes(r.brand.toLowerCase())))){
    if(y+8>252){pdf.addPage();header();y=50;}
    pdf.setFontSize(9);pdf.setTextColor(35,75,130);pdf.textWithLink(r.brand+' - Official reference',16,y,{url:r.url});y+=7;
  }
  pdf.setTextColor(21,36,67);
  if (options.reference)
    paragraph(
      'Reference imagery: Wikimedia Commons. Image credits and licenses: /asset-credits.html. The reference image illustrates a component family, not this exact product.',
    );
  for (let page = 1; page <= pdf.getNumberOfPages(); page++) {
    pdf.setPage(page);
    header();
    pdf.setFont(brandFont);
    pdf.setFontSize(8);
    pdf.setTextColor(100);
    pdf.setDrawColor(210);
    pdf.line(16, 268, 194, 268);
    pdf.text(company.email + ' | ' + company.primaryPhoneDisplayEn, 16, 276);
    pdf.text('https://poladcharkhesh.com/product/' + p.slug, 16, 283);
    pdf.text(`${page} / ${pdf.getNumberOfPages()}`, 194, 283, {
      align: 'right',
    });
  }
  return pdf;
}
