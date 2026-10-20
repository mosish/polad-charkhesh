import type { CompanyContactInfo } from '../domain/company';
import type { SiteContent } from '../domain/site-content';
import type {BearingProduct} from '../domain/product';
import type {SeoSettings} from '../domain/seo';

const object=(value:unknown):value is Record<string,unknown>=>Boolean(value)&&typeof value==='object'&&!Array.isArray(value);
/** Send only the active dictionary; CMS editing still receives the complete record. */
export function compactPublicContent(content: SiteContent, fa: boolean) {
  return {
    content: { ...content, copy: {} },
    localizedCopy: Object.fromEntries(Object.entries(content.copy).map(([key, value]) => [key, value[fa ? 'fa' : 'en']])),
  };
}
/** The production HTML carries the same freshly read, public database records as the API. */
export function parsePublicSnapshot(text:string|null){
  try{
    const data:unknown=JSON.parse(text||'null');
    if(!object(data)||!Array.isArray(data.products)||!object(data.company)||!object(data.content)||!object(data.seo))return null;
    const localized = object(data.localizedCopy) && Object.values(data.localizedCopy).every(v => typeof v === 'string')
      ? data.localizedCopy as Record<string,string> : undefined;
    return {...data,...(typeof data.indexingEnabled === 'boolean' ? { indexingEnabled: data.indexingEnabled } : {}),...(localized ? { localizedCopy: localized } : {}),fa:typeof data.fa==='boolean'?data.fa:undefined,products:data.products as BearingProduct[],company:data.company as unknown as CompanyContactInfo,content:data.content as unknown as SiteContent,seo:data.seo as SeoSettings};
  }catch{return null;}
}
