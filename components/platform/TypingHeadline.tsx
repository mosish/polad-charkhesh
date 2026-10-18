import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { heroHeadlines } from '../../lib/hero-presentation';
import { usePlatform } from './Context';
import {subscribeMediaQuery} from '../../lib/browser-compat';

export default function TypingHeadline() {
  const { fa, content } = usePlatform();
  const phrases = heroHeadlines(fa, content?.hero?.[fa ? 'titleFa' : 'titleEn'], content?.hero?.[fa ? 'typingPhrasesFa' : 'typingPhrasesEn']);
  // CMS edits and language changes reset the sequence without changing its accessible heading.
  return <HeadlineSequence key={JSON.stringify(phrases)} phrases={phrases} fa={fa} />;
}

function HeadlineSequence({ phrases, fa }: { phrases: string[]; fa: boolean }) {
  const [order] = useState(() => {
    const shuffled = [...phrases];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });
  const [index, setIndex] = useState(0), [count, setCount] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'holding' | 'erasing' | 'waiting'>('typing');
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [visible, setVisible] = useState(() => typeof IntersectionObserver !== 'function'), [tabVisible, setTabVisible] = useState(!document.hidden);
  const root = useRef<HTMLDivElement>(null);
  const letters = Array.from(order[index]);
  const stopped = paused || reduced || !visible || !tabVisible;
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const motion = () => setReduced(media.matches);
    const visibility = () => setTabVisible(!document.hidden);
    const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting)) : null;
    if (root.current) observer?.observe(root.current);
    const unsubscribe = subscribeMediaQuery(media, motion);
    document.addEventListener('visibilitychange', visibility);
    return () => { observer?.disconnect(); unsubscribe(); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  useEffect(() => {
    if (stopped || order.length < 2) return;
    const delay = phase === 'holding' ? 3200 : phase === 'waiting' ? 450 : phase === 'erasing' ? 28 : 65;
    const timer = window.setTimeout(() => {
      if (phase === 'typing') {
        if (count < letters.length) setCount(count + 1); else setPhase('holding');
      } else if (phase === 'holding') setPhase('erasing');
      else if (phase === 'erasing') {
        if (count > 0) setCount(count - 1); else setPhase('waiting');
      } else { setIndex((index + 1) % order.length); setPhase('typing'); }
    }, delay);
    return () => window.clearTimeout(timer);
  }, [stopped, order.length, phase, count, letters.length, index]);
  return <div ref={root} className="hero-headline" data-typing-state={stopped ? 'paused' : phase}>
    <h1 className="typing-headline">
      <span className="headline-accessible">{phrases[0]}</span>
      {phrases.map(phrase => <span key={phrase} className="headline-reserve" aria-hidden="true">{phrase}</span>)}
      <span className="headline-typed" aria-hidden="true">{reduced || order.length < 2 ? phrases[0] : letters.slice(0, count).join('')}<span className={'typing-cursor' + (stopped ? ' is-still' : '')} /></span>
    </h1>
    {!reduced && order.length > 1 && <button type="button" className="headline-pause" aria-label={fa ? (paused ? 'ادامه تایپ عنوان' : 'توقف تایپ عنوان') : (paused ? 'Resume headline animation' : 'Pause headline animation')} aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? <Play size={13} /> : <Pause size={13} />}</button>}
  </div>;
}
