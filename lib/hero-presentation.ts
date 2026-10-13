export const heroFamilies = ['ball', 'roller', 'thrust', 'engineered', 'track'] as const;

/** A fresh page gets a new bearing; the previous pick only prevents immediate repeats. */
export function chooseHeroFamily(previous: string | null, random = Math.random) {
  const choices = heroFamilies.filter(family => family !== previous);
  return choices[Math.min(choices.length - 1, Math.max(0, Math.floor(random() * choices.length)))];
}

export const headlinePhrases = {
  en: ['Precision in selection. Confidence in motion.', 'The right bearing. The right motion.', 'Expertise at the heart of every rotation.'],
  fa: ['دقت در انتخاب. اطمینان در حرکت.', 'بیرینگ مناسب، حرکت مطمئن.', 'تخصص در قلب هر چرخش.'],
};

export function heroHeadlines(fa: boolean, title?: string, additional?: string) {
  const primary = title?.replace(/\s+/g, ' ').trim() || (fa ? 'مهندسی برای حرکتی مطمئن.' : 'Engineered for what keeps industry moving.');
  const extra = additional?.trim() ? additional.split('\n').map(text => text.trim()).filter(Boolean).slice(0, 6) : headlinePhrases[fa ? 'fa' : 'en'];
  return [...new Set([primary, ...extra])];
}
