import Customer from '../models/Customer.js';
import { ApiError } from '../utils/ApiError.js';

export const createCustomer = async (shopId, data) => {
  const existing = await Customer.findOne({ shop: shopId, mobile: data.mobile });
  if (existing) throw new ApiError(409, 'A customer with this mobile number already exists');
  return Customer.create({ shop: shopId, ...data });
};

export const listCustomers = async (
  shopId,
  { search = '', page = 1, limit = 50 } = {}
) => {
  const query = { shop: shopId };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { mobile: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(parseInt(page) || 1, 1);
  const pageSize = Math.max(parseInt(limit) || 50, 1);
  const skip = (pageNum - 1) * pageSize;

  const [customers, total] = await Promise.all([
    Customer.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
    Customer.countDocuments(query),
  ]);

  return { customers, total, page: pageNum, pages: Math.ceil(total / pageSize) };
};

export const getCustomer = async (shopId, id) => {
  const customer = await Customer.findOne({ _id: id, shop: shopId });
  if (!customer) throw new ApiError(404, 'Customer not found');
  return customer;
};

export const updateCustomer = async (shopId, id, data) => {
  const customer = await getCustomer(shopId, id);
  if (data.mobile && data.mobile !== customer.mobile) {
    const existing = await Customer.findOne({ shop: shopId, mobile: data.mobile });
    if (existing) throw new ApiError(409, 'A customer with this mobile number already exists');
  }
  Object.assign(customer, data);
  await customer.save();
  return customer;
};

export const deleteCustomer = async (shopId, id) => {
  const customer = await getCustomer(shopId, id);
  await customer.deleteOne();
  return customer;
};
