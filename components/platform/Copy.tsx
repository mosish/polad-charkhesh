import { usePlatform } from './Context';
export default function Copy({ text }: { text: string }) {
  const { t } = usePlatform();
  return <>{t(text, text)}</>;
}
