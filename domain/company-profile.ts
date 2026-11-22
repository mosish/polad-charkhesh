/** Company profile supplied by the owner in Scan_0001.jpg; years use the Iranian calendar. */
export const companyProfileFields = [
  { key:'profileHistory', en:'Our history', fa:'سابقهٔ فعالیت',
    textEn:'Polad Charkhesh Arian Tech began operating in 1378 SH as a specialist supplier of industrial, agricultural and automotive bearings, high-temperature grease and seals. Following the development of its technical expertise, the company was formally registered in 1394 SH and expanded its activities across Iran.',
    textFa:'پولاد چرخش آرین تک فعالیت خود را از سال ۱۳۷۸ با تهیه و توزیع انواع بیرینگ صنعتی، کشاورزی و خودرویی، گریس نسوز و کاسه‌نمد آغاز کرد. پس از گسترش تجربه و مهارت‌های فنی، شرکت در سال ۱۳۹۴ به‌صورت رسمی ثبت شد و دامنهٔ فعالیت خود را در سراسر ایران توسعه داد.' },
  { key:'profileScope', en:'What we supply', fa:'حوزه‌های تأمین',
    textEn:'Our supply activities cover bearings for industrial machinery, agriculture, rail, oil and gas, together with machinery components and equipment. Particular areas include parts for oil and drilling rigs and the steel industry. Sourcing also extends to other industrial requirements through domestic and international manufacturers and suppliers.',
    textFa:'حوزهٔ فعالیت شرکت، تأمین و واردات انواع بیرینگ برای ماشین‌آلات صنعتی، کشاورزی، خطوط ریلی و صنایع نفت و گاز، در کنار قطعات و تجهیزات ماشین‌آلات است. تأمین قطعات مورد نیاز دکل‌های نفتی و حفاری و صنایع فولاد از زمینه‌های تخصصی فعالیت شرکت به شمار می‌رود. این خدمات با اتکا به سازندگان و تأمین‌کنندگان داخلی و خارجی، سایر نیازهای صنعتی را نیز پوشش می‌دهد.' },
  { key:'profileIndustries', en:'Industrial experience', fa:'تجربهٔ همکاری با صنایع',
    textEn:'The company’s experience includes cooperation with organisations in oil and petrochemicals, tipper-body manufacturing, asphalt plants, sand and aggregate production, tile and ceramic manufacturing, and machinery manufacturing.',
    textFa:'سوابق همکاری شرکت، مجموعه‌های فعال در نفت و پتروشیمی، کمپرسی‌سازی، کارخانه‌های آسفالت، شن و ماسه، کاشی و سرامیک و شرکت‌های ماشین‌سازی را در بر می‌گیرد.' },
  { key:'profileNetwork', en:'Sourcing network', fa:'شبکهٔ ارتباطات و تأمین',
    textEn:'The company profile records an office presence in France and established commercial relationships with Turkey and China. Alongside domestic supplier relationships, this experience supports the identification and sourcing of industrial components to customer requirements.',
    textFa:'سوابق شرکت شامل حضور دفتری در فرانسه و روابط تجاری با ترکیه و چین است. این تجربه، در کنار ارتباط با سازندگان و تأمین‌کنندگان داخلی، پشتوانهٔ شناسایی و تأمین قطعات صنعتی متناسب با نیاز مشتریان است.' },
  { key:'profileBearingBrands', en:'Bearing brands within our sourcing scope', fa:'برندهای حوزهٔ تأمین بیرینگ',
    textEn:'SKF · FAG · Koyo · NSK · TIMKEN · INA · IKO · RHP · RBC · THK · KINEX · MAGILL · REXROTH',
    textFa:'SKF · FAG · Koyo · NSK · TIMKEN · INA · IKO · RHP · RBC · THK · KINEX · MAGILL · REXROTH' },
  { key:'profileComponentBrands', en:'Industrial component brands', fa:'برندهای حوزهٔ تأمین قطعات صنعتی',
    textEn:'GARLOCK · SIEMENS · ABB · CCS · NOV · ITAG · PARKER · DANFOSS',
    textFa:'GARLOCK · SIEMENS · ABB · CCS · NOV · ITAG · PARKER · DANFOSS' },
] as const;
export const companyProfileDefaults: Record<string,string> = Object.fromEntries(companyProfileFields.flatMap(field => [[field.key+'En',field.textEn],[field.key+'Fa',field.textFa]]));
export function companyProfile(copy: Record<string, unknown> | undefined, fa: boolean) {
  return companyProfileFields.map(field => {
    const key=field.key+(fa?'Fa':'En');
    const text=copy?.[key] ?? companyProfileDefaults[key];
    return {id:field.key,title:fa?field.fa:field.en,text:typeof text==='string'?text:'',brands:field.key.endsWith('Brands')};
  }).filter(field=>field.text.trim());
}
