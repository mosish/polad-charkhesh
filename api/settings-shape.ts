export function sameShape(value: any, template: any): boolean {
  if (typeof template === 'string') return typeof value === 'string';
  if (!template || typeof template !== 'object' || Array.isArray(template))
    return true;
  return (
    !!value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.keys(template).every((k) => sameShape(value[k], template[k])) &&
    Object.keys(value).every((k) => k in template)
  );
}
