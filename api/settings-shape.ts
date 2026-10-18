import { object } from './content-validation';

export function sameShape(value: unknown, template: unknown): boolean {
  if (typeof template === 'string') return typeof value === 'string';
  if (!object(template))
    return true;
  return (
    object(value) &&
    Object.keys(template).every((k) => sameShape(value[k], template[k])) &&
    Object.keys(value).every((k) => k in template)
  );
}
