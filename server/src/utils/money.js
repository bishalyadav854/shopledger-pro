export const calculateInvoiceTotals = ({ items, taxPercent = 0 }) => {
  const normalized = (items || []).map((item) => {
    const quantity = Number(item.quantity);
    const price = Number(item.price);
    const discount = Number(item.discount || 0);
    if (!Number.isFinite(quantity) || quantity <= 0) throw new Error('Item quantity must be greater than zero');
    if (!Number.isFinite(price) || price < 0) throw new Error('Item price must be non-negative');
    if (!Number.isFinite(discount) || discount < 0 || discount > price * quantity) throw new Error('Item discount is invalid');
    return { ...item, quantity, price, discount };
  });
  const subtotal = normalized.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountTotal = normalized.reduce((sum, item) => sum + item.discount, 0);
  const rate = Number(taxPercent || 0);
  if (!Number.isFinite(rate) || rate < 0 || rate > 100) throw new Error('Tax percentage must be between 0 and 100');
  const taxAmount = Math.round((subtotal - discountTotal) * rate) / 100;
  const grandTotal = Math.round((subtotal - discountTotal + taxAmount) * 100) / 100;
  return { items: normalized, subtotal, discountTotal, taxAmount, grandTotal };
};
