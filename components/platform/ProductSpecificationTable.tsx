import type { BearingProduct } from '../../domain/product';
import { productSpecifications } from '../../domain/product-presentation';
import { usePlatform } from './Context';

export default function ProductSpecificationTable({ product }: { product: BearingProduct }) {
  const { fa, t } = usePlatform();
  return <div className="product-spec-table-wrap">
    <table className="product-spec-table">
      <caption>{t('Technical specifications', 'مشخصات فنی')} · <bdi>{product.code}</bdi></caption>
      <thead><tr><th scope="col">{t('Property', 'مشخصه')}</th><th scope="col">{t('Recorded value', 'مقدار ثبت‌شده')}</th></tr></thead>
      <tbody>{productSpecifications(product, fa).map(row => <tr key={row.key}><th scope="row">{row.label}</th><td dir="auto">{row.value}</td></tr>)}</tbody>
    </table>
  </div>;
}
