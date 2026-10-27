import { technicalTextParts } from '../../domain/technical-text';

export default function TechnicalText({ text }: { text: string }) {
  return <>{technicalTextParts(text).map((part, index) => part.ltr ? <bdi dir="ltr" key={index}>{part.text}</bdi> : part.text)}</>;
}
