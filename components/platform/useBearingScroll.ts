import { useEffect, useState, type RefObject } from 'react';
import { bearingScrollProgress, bearingBannerProgress } from '../../lib/bearing-scroll';
import {subscribeMediaQuery} from '../../lib/browser-compat';
/** One passive listener and one measurement per animation frame; no scroll lock. */
export function useBearingScroll(
  stage: RefObject<HTMLDivElement | null>,
  active: boolean,
) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const node = stage.current;
    if (!node || !active) return;
    const wrapper = node.closest<HTMLElement>('.hero-scroll');
    const hero = wrapper?.querySelector<HTMLElement>('.hero');
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const measure = () => {
      frame = 0;
      if (document.hidden || media.matches) return;
      const rect = node.getBoundingClientRect();
      const pinned = hero && getComputedStyle(hero).position === 'sticky';
      const next =
        hero?.classList.contains('hero-cinematic') && wrapper
          ? bearingBannerProgress(wrapper.getBoundingClientRect().top, wrapper.getBoundingClientRect().height)
          : pinned && wrapper
          ? bearingScrollProgress(
              wrapper.getBoundingClientRect().top,
              wrapper.getBoundingClientRect().height,
              hero.getBoundingClientRect().height,
              parseFloat(getComputedStyle(hero).top) || 90,
            )
          : Math.max(
              0,
              Math.min(
                1,
                (innerHeight * 0.85 - rect.top) /
                  (rect.height + innerHeight * 0.45),
              ),
            );
      setProgress(Math.round(next * 1000) / 1000);
    };
    const schedule = () => {
      if (!frame && !document.hidden) frame = requestAnimationFrame(measure);
    };
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null;
    observer?.observe(node);
    if (wrapper) observer?.observe(wrapper);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    document.addEventListener('visibilitychange', schedule);
    const unsubscribe = subscribeMediaQuery(media, schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('visibilitychange', schedule);
      unsubscribe();
    };
  }, [active, stage]);
  return progress;
}
