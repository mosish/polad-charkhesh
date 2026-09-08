import { cloneElement, isValidElement, ReactNode } from 'react';
import { usePlatform } from './Context';
export default function PageSection({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const { content } = usePlatform();
  if (content?.layout?.hidden?.includes(id)) return null;
  const order = content?.layout?.order?.indexOf(id) ?? 0;
  return isValidElement(children) ? (
    cloneElement<any>(children as any, {
      'data-section': id,
      style: {
        ...(children as any).props.style,
        order: order < 0 ? 100 : order,
      },
    })
  ) : (
    <>{children}</>
  );
}
export function CustomSections() {
  const { content, fa } = usePlatform();
  return (
    <>
      {content?.layout?.custom
        ?.filter((c: any) => c.enabled)
        .map((c: any) => (
          <PageSection key={c.id} id={c.id}>
            <section className="section custom-section" id={c.id}>
              <div>
                <h2>{c[fa ? 'titleFa' : 'titleEn']}</h2>
                <p>{c[fa ? 'descriptionFa' : 'descriptionEn']}</p>
                {c.href && (
                  <a className="button primary" href={c.href}>
                    {c[fa ? 'buttonFa' : 'buttonEn']}
                  </a>
                )}
              </div>
              {c.imageUrl && (
                <img
                  src={c.imageUrl}
                  alt={c[fa ? 'titleFa' : 'titleEn']}
                  loading="lazy"
                />
              )}
            </section>
          </PageSection>
        ))}
    </>
  );
}
