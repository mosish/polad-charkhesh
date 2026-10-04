import { useEffect } from 'react';
export default function ScrollReveal() {
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.06 },
    );
    const elements = new Set<Element>();
    const scan = () =>
      document
        .querySelectorAll('main > section, main .product-grid > *, main .panel')
        .forEach((el) => {
          if (elements.has(el)) return;
          elements.add(el);
          if (el.getBoundingClientRect().top > innerHeight) {
            el.classList.add('reveal-pending');
            observer.observe(el);
          }
        });
    scan();
    let scanFrame = 0;
    const mutation = new MutationObserver(() => {
      if (!scanFrame) scanFrame = requestAnimationFrame(() => { scanFrame = 0; scan(); });
    });
    const root = document.querySelector('#root');
    if (root) mutation.observe(root, { childList: true, subtree: true });
    const reset = () => {
      if (media.matches) elements.forEach((el) => el.classList.add('revealed'));
    };
    media.addEventListener('change', reset);
    return () => {
      observer.disconnect();
      mutation.disconnect();
      cancelAnimationFrame(scanFrame);
      media.removeEventListener('change', reset);
      elements.forEach((el) =>
        el.classList.remove('reveal-pending', 'revealed'),
      );
    };
  }, []);
  return null;
}
