import Product from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';

export const createProduct = async (shopId, data) => {
  const barcode = String(data.barcode || '').trim();
  if (barcode) {
    const existingBarcode = await Product.findOne({ shop: shopId, barcode });
    if (existingBarcode) throw new ApiError(409, 'A product with this barcode already exists');
  }
  if (data.sku) {
    const existing = await Product.findOne({ shop: shopId, sku: data.sku });
    if (existing) throw new ApiError(409, 'A product with this SKU already exists');
  }
  return Product.create({ shop: shopId, ...data, barcode: barcode || undefined });
};

export const listProducts = async (
  shopId,
  { search = '', category, lowStock = '', page = 1, limit = 50 } = {}
) => {
  const query = { shop: shopId };
  if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { sku: { $regex: search, $options: 'i' } }, { barcode: { $regex: search, $options: 'i' } }];
  if (category) query.category = category;
  if (lowStock === 'true') query.$expr = { $lte: ['$quantity', '$lowStockThreshold'] };

  const pageNum = Math.max(parseInt(page) || 1, 1);
  const pageSize = Math.max(parseInt(limit) || 50, 1);
  const skip = (pageNum - 1) * pageSize;

  const [products, total] = await Promise.all([
    Product.find(query).populate('category', 'name').sort({ createdAt: -1 }).skip(skip).limit(pageSize),
    Product.countDocuments(query),
  ]);

  return { products, total, page: pageNum, pages: Math.ceil(total / pageSize) };
};

export const getProductByBarcode = async (shopId, barcode) => {
  const product = await Product.findOne({ shop: shopId, barcode: String(barcode).trim(), isActive: true }).populate('category', 'name');
  if (!product) throw new ApiError(404, 'No product with this barcode is registered in this shop');
  return product;
};

export const getProduct = async (shopId, id) => {
  const product = await Product.findOne({ _id: id, shop: shopId }).populate('category', 'name');
  if (!product) throw new ApiError(404, 'Product not found');
  return product;
};

export const updateProduct = async (shopId, id, data) => {
  const product = await getProduct(shopId, id);
  const barcode = String(data.barcode || '').trim();
  if (barcode && barcode !== product.barcode) {
    const existingBarcode = await Product.findOne({ shop: shopId, barcode, _id: { $ne: id } });
    if (existingBarcode) throw new ApiError(409, 'A product with this barcode already exists');
  }
  if (data.sku && data.sku !== product.sku) {
    const existing = await Product.findOne({ shop: shopId, sku: data.sku });
    if (existing) throw new ApiError(409, 'A product with this SKU already exists');
  }
  Object.assign(product, data, { barcode: barcode || undefined });
  await product.save();
  return product;
};

export const deleteProduct = async (shopId, id) => {
  const product = await getProduct(shopId, id);
  await product.deleteOne();
  return product;
};
