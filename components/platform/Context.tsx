import { metadataFor, updateMetadata } from '../../lib/seo';
import { textKey } from '../../domain/site-content';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { api } from '../../lib/api';
import type { BearingProduct } from '../../domain/product';
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
export const usePlatform = () => useContext(Context);
export function Provider({ children }: { children: ReactNode }) {
  const [fa, setFa] = useState(() => {
    const q = new URLSearchParams(location.search).get('lang');
    const saved = localStorage.getItem('pc-language');
    return q
      ? q === 'fa'
      : saved
        ? saved === 'fa'
        : location.hostname.endsWith('.ir');
  });
  const [state, setState] = useState({
    products: [] as BearingProduct[],
    company: null as any,
    content: null as any,
    seo: null as any,
    loading: true,
    error: '',
  });
  const reload = () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
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
  };
  useEffect(reload, []);
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
    const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (icon) icon.href = brand.logoUrl;
  }, [state.content]);
  useEffect(() => {
    document.documentElement.lang = fa ? 'fa' : 'en';
    document.documentElement.dir = fa ? 'rtl' : 'ltr';
    if (new URLSearchParams(location.search).get('preview') !== '1')
      localStorage.setItem('pc-language', fa ? 'fa' : 'en');
    if (state.seo && state.company) {
      const slug = location.pathname.split('/').pop();
      const p = state.products.find((p) => p.slug === slug);
      updateMetadata(
        metadataFor(location.pathname, fa, state.seo, state.company, p),
      );
    }
  }, [fa, state.seo]);
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
        toggle: () => setFa((x) => !x),
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
