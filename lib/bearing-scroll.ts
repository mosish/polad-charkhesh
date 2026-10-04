const clamp = (value: number) =>
  Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
/** Scroll maps to an illustrative assembly state, never to actual shaft RPM. */
export function bearingScrollState(value: number) {
  const progress = clamp(value),
    opening = clamp((progress - 0.15) / 0.7);
  const expansion = opening * opening * (3 - 2 * opening);
  const retreat = clamp((progress - .7) / .3);
  const recession = retreat * retreat * (3 - 2 * retreat);
  return {
    recession,
    progress,
    expansion,
    turn: progress * 0.55,
    phase:
      expansion < 0.05
        ? 'assembled'
        : expansion > 0.95
          ? 'components'
          : 'opening',
  };
}
export function bearingScrollProgress(
  top: number,
  height: number,
  visibleHeight: number,
  pinTop = 90,
) {
  const travel = height - visibleHeight;
  return travel > 0 ? clamp((pinTop - top) / travel) : 0;
}

/** Complete the closing assembly as its section enters the viewport. */
export function bearingReturnProgress(top:number,height:number,viewport:number){
 return height>0&&viewport>0?clamp((viewport-top)/Math.min(height,viewport*.8)):0;
}

/** Open early, travel behind content, then close at the page end. */
export function continuousBearingState(value:number){
 const progress=clamp(value);
 const assembly=Math.min(clamp(progress/.18),clamp((1-progress)/.18));
 const envelope=Math.min(clamp(progress/.06),clamp((1-progress)/.06));
 return {assembly,opacity:envelope*.10,drift:Math.sin(progress*Math.PI*2)*12};
}
