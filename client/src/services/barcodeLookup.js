import { productService } from './productService';

export async function lookupBarcode(code) {
  const normalized = String(code || '').trim();
  if (!normalized) throw new Error('Enter a barcode first');
  try {
    const local = await productService.getByBarcode(normalized);
    if (local?.data?.data) return { source: 'local', product: local.data.data };
  } catch (error) {
    if (error.response?.status !== 404) throw error;
  }

  // Open Food Facts is a community catalog. It usually provides name/brand/packaging,
  // not a trustworthy local selling price or inventory count; those remain manual.
  const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(normalized)}.json`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('External product catalog is temporarily unavailable');
  const data = await response.json();
  if (data.status !== 1 || !data.product) return { source: 'not-found', product: null, barcode: normalized };
  const p = data.product;
  return {
    source: 'external', barcode: normalized,
    product: {
      name: [p.product_name, p.brands].filter(Boolean).join(' - ') || '',
      unit: p.quantity || 'pcs',
      categoryName: Array.isArray(p.categories_tags) ? p.categories_tags[0]?.replace(/^en:/, '').replaceAll('-', ' ') : '',
      sellingPrice: '', costPrice: '', quantity: '', sku: '', lowStockThreshold: 5,
    },
  };
}
