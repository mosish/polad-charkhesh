export const heroFamilies = ['ball', 'roller', 'thrust', 'engineered', 'track'] as const;

/** A fresh page gets a new bearing; the previous pick only prevents immediate repeats. */
export function chooseHeroFamily(previous: string | null, random = Math.random) {
  const choices = heroFamilies.filter(family => family !== previous);
  return choices[Math.min(choices.length - 1, Math.max(0, Math.floor(random() * choices.length)))];
}

export type HeroFamily = typeof heroFamilies[number];
export type HeroLineup = readonly [HeroFamily, HeroFamily, HeroFamily];

/** Physical left / centre / right. Replace exactly one slot on the next page load.
 * Storage is optional: invalid or unavailable storage starts a fresh unique trio.
 * Extend heroFamilies with a supported renderer family to add a new model.
 */
export function chooseHeroLineup(previous: unknown, random = Math.random): HeroLineup {
  const pick = <T,>(items: readonly T[]) => items[Math.min(items.length - 1, Math.max(0, Math.floor(random() * items.length)))];
  if (Array.isArray(previous) && previous.length === 3 && new Set(previous).size === 3 && previous.every(f => heroFamilies.includes(f))) {
    const next = [...previous] as [HeroFamily, HeroFamily, HeroFamily];
    const slot = pick([0, 1, 2]);
    next[slot] = pick(heroFamilies.filter(f => !previous.includes(f)));
    return next;
  }
  const pool: HeroFamily[] = [...heroFamilies];
  const take = () => { const family = pick(pool); pool.splice(pool.indexOf(family), 1); return family; };
  return [take(), take(), take()];
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
