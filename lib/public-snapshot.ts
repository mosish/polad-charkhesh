import type {BearingProduct} from '../domain/product';
import type {SeoSettings} from '../domain/seo';

const object=(value:unknown):value is Record<string,unknown>=>Boolean(value)&&typeof value==='object'&&!Array.isArray(value);
/** The production HTML carries the same freshly read, public database records as the API. */
export function parsePublicSnapshot(text:string|null){
  try{
    const data:unknown=JSON.parse(text||'null');
    if(!object(data)||!Array.isArray(data.products)||!object(data.company)||!object(data.content)||!object(data.seo))return null;
    return {...data,fa:typeof data.fa==='boolean'?data.fa:undefined,products:data.products as BearingProduct[],company:data.company,content:data.content,seo:data.seo as SeoSettings};
  }catch{return null;}
}
