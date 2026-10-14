import { metadataFor, updateMetadata } from '../../lib/seo';
import { textKey } from '../../domain/site-content';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { api } from '../../lib/api';
import type { BearingProduct } from '../../domain/product';
import { clientLanguage } from '../../lib/language';
import {parsePublicSnapshot} from '../../lib/public-snapshot';
type State = {
  fa: boolean;
  t: (en: string, fa: string) => string;
  toggle: () => void;
  products: BearingProduct[];
  company: any;
  content: any;
  seo: any;
  loading: boolean;
  error: string;
  reload: () => void;
};
const Context = createContext<State>(null!);
function publicSnapshot() {
  return parsePublicSnapshot(document.getElementById('public-data')?.textContent||null);
}
export const usePlatform = () => useContext(Context);
export function Provider({ children }: { children: ReactNode }) {
  const [snapshot]=useState(publicSnapshot);
  const [fa, setFa] = useState(() => {
    const initial = snapshot||undefined;
    let saved: string | null = null;
    try { saved = localStorage.getItem('pc-language'); } catch { /* Storage can be disabled. */ }
    return clientLanguage(location.hostname, location.search, saved, initial);
  });
  const [state, setState] = useState(() => snapshot ? { ...snapshot, loading: false, error: '' } : {
    products: [] as BearingProduct[],
    company: null as any,
    content: null as any,
    seo: null as any,
    loading: true,
    error: '',
  });
  const reload = useCallback(() => {
    setState((s) => ({ ...s, loading: !s.company, error: '' }));
    Promise.all([
      api('/products'),
      api('/company'),
      api('/content'),
      api('/seo'),
    ])
      .then(([p, c, b, s]) =>
        setState({
          products: p.products,
          company: c.data,
          content: b.data,
          seo: s.data,
          loading: false,
          error: '',
        }),
      )
      .catch((e) =>
        setState((s) => ({ ...s, loading: false, error: e.message })),
      );
  },[]);
  // Production HTML is fresh on every visit. Dev/admin routes still fetch; Retry remains explicit.
  useEffect(()=>{if(!snapshot)reload();},[snapshot,reload]);
  useEffect(() => {
    let alive = true;
    const receive = async (event: MessageEvent) => {
      if (
        event.origin !== location.origin ||
        event.source !== window.parent ||
        window.parent === window ||
        new URLSearchParams(location.search).get('preview') !== '1' ||
        event.data?.type !== 'pc-content-preview'
      )
        return;
      try {
        const status = await api('/auth/status');
        if (alive && status.user)
          setState((s) => ({ ...s, content: event.data.content }));
      } catch {}
    };
    window.addEventListener('message', receive);
    return () => {
      alive = false;
      window.removeEventListener('message', receive);
    };
  }, []);
  useEffect(() => {
    const brand = state.content?.brand;
    if (!brand || /^\/admin\/*$/.test(location.pathname)) return;
    for (const key of ['navy', 'accent', 'ink'])
      document.documentElement.style.setProperty(
        '--' + (key === 'accent' ? 'blue' : key),
        brand[key],
      );
  }, [state.content]);
  useEffect(() => {
    document.documentElement.lang = fa ? 'fa' : 'en';
    document.documentElement.dir = fa ? 'rtl' : 'ltr';
    if (new URLSearchParams(location.search).get('preview') !== '1') {
      try { localStorage.setItem('pc-language', fa ? 'fa' : 'en'); } catch { /* Keep the current session usable. */ }
    }
    if (state.seo && state.company) {
      let slug = '';
      try { slug = decodeURIComponent(location.pathname.replace(/\/+$/, '').split('/').pop() || ''); } catch {}
      const p = location.pathname.startsWith('/product/') ? state.products.find((p: BearingProduct) => p.slug === slug) : undefined;
      updateMetadata(
        metadataFor(location.pathname, fa, state.seo, state.company, p, state.content, state.products, location.search),
      );
    }
  }, [fa, state.seo, state.company, state.content, state.products]);
  return (
    <Context.Provider
      value={{
        ...state,
        fa,
        t: (e, f) => {
          const entry =
            /^\/admin\/*$/.test(location.pathname)
              ? null
              : state.content?.copy?.[textKey(e)];
          return entry?.[fa ? 'fa' : 'en'] ?? (fa ? f : e);
        },
        toggle: () => {
          const next = !fa;
          const params = new URLSearchParams(location.search);
          const live = state.seo && [new URL(state.seo.domainEn).hostname, new URL(state.seo.domainFa).hostname].includes(location.hostname);
          if (live && !location.pathname.startsWith('/admin') && params.get('preview') !== '1') {
            params.delete('lang');
            location.assign(new URL(location.pathname + (params.size ? '?' + params.toString() : '') + location.hash, state.seo[next ? 'domainFa' : 'domainEn']).href);
          } else {
            params.set('lang', next ? 'fa' : 'en');
            history.replaceState(null, '', location.pathname + '?' + params.toString() + location.hash);
            setFa(next);
          }
        },
        reload,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function DataState() {
  const { loading, error, reload, t } = usePlatform();
  return loading ? (
    <div className="state" role="status">
      {t('Loading technical catalog…', 'در حال دریافت کاتالوگ فنی…')}
    </div>
  ) : error ? (
    <div className="state error" role="alert">
      {error}
      <button className="button" onClick={reload}>
        {t('Retry connection', 'تلاش دوباره')}
      </button>
    </div>
  ) : null;
}
