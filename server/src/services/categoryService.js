import Category from '../models/Category.js';
import { ApiError } from '../utils/ApiError.js';

export const createCategory = async (shopId, data) => {
  const existing = await Category.findOne({ shop: shopId, name: new RegExp(`^${data.name}$`, 'i') });
  if (existing) throw new ApiError(409, 'A category with this name already exists');
  return Category.create({ shop: shopId, ...data });
};

export const listCategories = async (shopId, { search = '', active } = {}) => {
  const query = { shop: shopId };
  if (search) query.name = { $regex: search, $options: 'i' };
  if (active !== undefined) query.isActive = active === 'true';
  return Category.find(query).sort({ createdAt: -1 });
};

export const getCategory = async (shopId, id) => {
  const category = await Category.findOne({ _id: id, shop: shopId });
  if (!category) throw new ApiError(404, 'Category not found');
  return category;
};

export const updateCategory = async (shopId, id, data) => {
  const category = await getCategory(shopId, id);
  if (data.name && data.name.toLowerCase() !== category.name.toLowerCase()) {
    const existing = await Category.findOne({ shop: shopId, name: new RegExp(`^${data.name}$`, 'i') });
    if (existing) throw new ApiError(409, 'A category with this name already exists');
  }
  Object.assign(category, data);
  await category.save();
  return category;
};

export const deleteCategory = async (shopId, id) => {
  const category = await getCategory(shopId, id);
  await category.deleteOne();
  return category;
};
