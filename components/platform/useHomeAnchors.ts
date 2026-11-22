import { useEffect } from 'react';

/** Keep lower destinations aligned while lazy workspaces above them finish loading. */
export function useHomeAnchors(loading: boolean) {
  useEffect(() => {
    if (loading) return;
    let generation = 0, frame = 0, timer = 0;
    let observer: ResizeObserver | null = null;
    const stop = () => {
      generation++;
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      observer?.disconnect();
      observer = null;
    };
    const navigate = () => {
      stop();
      let id: string;
      try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
      const target = document.getElementById(id);
      if (!target) return;
      const current = generation;
      const align = () => {
        if (current === generation && target.isConnected)
          target.scrollIntoView({ behavior:'instant', block:'start' });
      };
      if (id !== 'about' && id !== 'contact') {
        timer = window.setTimeout(align, 120);
        return;
      }
      const schedule = () => {
        if (current !== generation) return;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(align);
      };
      observer = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null;
      observer?.observe(target.closest('main') || target);
      schedule();
      void document.fonts?.ready.then(schedule);
      timer = window.setTimeout(stop, 4000);
    };
    window.addEventListener('hashchange', navigate);
    // A correction must never fight the visitor's next interaction.
    window.addEventListener('wheel', stop, {passive:true});
    window.addEventListener('touchstart', stop, {passive:true});
    window.addEventListener('pointerdown', stop);
    window.addEventListener('keydown', stop);
    navigate();
    return () => {
      stop();
      window.removeEventListener('hashchange', navigate);
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchstart', stop);
      window.removeEventListener('pointerdown', stop);
      window.removeEventListener('keydown', stop);
    };
  }, [loading]);
}
