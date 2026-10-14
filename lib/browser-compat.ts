/** Older Safari exposes MediaQueryList.addListener instead of EventTarget methods. */
export function subscribeMediaQuery(media: MediaQueryList, listener: () => void) {
  if (typeof media.addEventListener === 'function') {
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }
  /* oxlint-disable typescript/no-deprecated -- Required only when older Safari lacks EventTarget methods. */
  if (typeof media.addListener === 'function') {
    media.addListener(listener);
    return () => media.removeListener(listener);
  }
  /* oxlint-enable typescript/no-deprecated */
  return () => {};
}

/** One small probe per document, released immediately; it downloads no renderer. */
export function gpuRendererPreference(createCanvas:()=>HTMLCanvasElement=()=>document.createElement('canvas')){
  let preference:'webgl1'|'webgl2'|undefined;
  return ()=>{
    if(preference)return preference;
    try{
      const context=createCanvas().getContext('webgl2',{antialias:false,powerPreference:'low-power'});
      preference=context?'webgl2':'webgl1';
      context?.getExtension('WEBGL_lose_context')?.loseContext();
    }catch{preference='webgl1';}
    return preference;
  };
}
export const preferredGpuRenderer=gpuRendererPreference();
