import { Component, type ReactNode } from 'react';
import { usePlatform } from './Context';

// Capture the server's escaped public HTML before React replaces it on startup.
// Admin routes have no public snapshot and never expose account data here.
const pageSnapshot = typeof document === 'undefined' ? '' : document.getElementById('root')?.innerHTML || '';
const sections = typeof document === 'undefined' ? {} : {
  catalog: document.getElementById('catalog')?.innerHTML || '',
  engineering: document.getElementById('engineering')?.innerHTML || '',
};

export default class RecoveryBoundary extends Component<{
  children: ReactNode;
  fallback: ReactNode;
  resetKey?: unknown;
}, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) { console.error('Website section could not start:', error); }
  componentDidUpdate(previous: Readonly<typeof this.props>) {
    if (this.state.failed && !Object.is(previous.resetKey, this.props.resetKey)) this.setState({ failed: false });
  }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export function PageRecovery() {
  const fa = document.documentElement.lang === 'fa';
  return <>
    <div className="site-recovery" role="alert">
      <strong>{fa ? 'نمای خواندنی سایت در دسترس است.' : 'The readable website is still available.'}</strong>
      <p>{fa ? 'بخش تعاملی بارگذاری نشد. برای تلاش دوباره، صفحه را بارگذاری کنید.' : 'An interactive section did not load. Reload the page to try again.'}</p>
      <button className="button" onClick={() => location.reload()}>{fa ? 'بارگذاری دوباره' : 'Reload website'}</button>
    </div>
    {pageSnapshot ? <div className="public-recovery-snapshot" dangerouslySetInnerHTML={{ __html: pageSnapshot }} /> : <main id="main" className="state"><a href="/">{fa ? 'بازگشت به سایت' : 'Return to website'}</a></main>}
  </>;
}

export function WorkspaceRecovery({ section }: { section?: 'catalog' | 'engineering' }) {
  const { t } = usePlatform();
  const html = section ? sections[section] : '';
  return <div className="workspace-recovery">
    <div className="site-recovery" role="alert">
      <p>{t('This interactive section did not load. Other sections remain available.', 'این بخش تعاملی بارگذاری نشد. سایر بخش‌های سایت در دسترس هستند.')}</p>
      <button className="button" onClick={() => location.reload()}>{t('Try loading again', 'تلاش دوباره برای بارگذاری')}</button>
    </div>
    {html && <div className="public-recovery-snapshot" dangerouslySetInnerHTML={{ __html: html }} />}
  </div>;
}
