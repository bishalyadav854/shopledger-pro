import Invoice from '../models/Invoice.js';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';
import Counter from '../models/Counter.js';
import Settings from '../models/Settings.js';
import { ApiError } from '../utils/ApiError.js';

const computeTotals = ({ items, taxPercent }) => {
  let subtotal = 0;
  let discountTotal = 0;
  const normalizedItems = items.map((item) => {
    const lineTotal = item.price * item.quantity;
    const discount = item.discount || 0;
    subtotal += lineTotal;
    discountTotal += discount;
    return { ...item, discount };
  });

  const tax = (subtotal - discountTotal) * ((taxPercent || 0) / 100);
  const grandTotal = subtotal - discountTotal + tax;
  return { items: normalizedItems, subtotal, discountTotal, taxAmount: tax, grandTotal };
};

export const createInvoice = async (shopId, userId, data) => {
  const customer = await Customer.findOne({ _id: data.customer, shop: shopId });
  if (!customer) throw new ApiError(404, 'Customer not found');

  const productIds = data.items.filter((i) => i.product).map((i) => i.product);
  const products = productIds.length
    ? await Product.find({ _id: { $in: productIds }, shop: shopId })
    : [];
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  for (const item of data.items) {
    if (item.product) {
      const product = productMap.get(String(item.product));
      if (!product) throw new ApiError(404, `Product not found: ${item.name}`);
      if (product.quantity < item.quantity) {
        throw new ApiError(400, `Insufficient stock for ${product.name}`);
      }
    }
  }

  const settings = await Settings.findOne({ shop: shopId });
  const prefix = settings?.invoicePrefix || 'INV';
  const seq = await Counter.getNextSequence(`invoice_${shopId}`);
  const invoiceNumber = `${prefix}-${String(seq).padStart(4, '0')}`;

  const { items, subtotal, discountTotal, taxAmount, grandTotal } = computeTotals({
    items: data.items,
    taxPercent: data.taxPercent ?? settings?.taxPercentDefault ?? 0,
  });

  const paidAmount = data.paidAmount || 0;
  const pendingAmount = grandTotal - paidAmount;
  const status = pendingAmount <= 0 ? 'paid' : paidAmount > 0 ? 'partial' : 'pending';

  const invoice = await Invoice.create({
    shop: shopId,
    invoiceNumber,
    customer: data.customer,
    items,
    subtotal,
    discountTotal,
    taxPercent: data.taxPercent ?? settings?.taxPercentDefault ?? 0,
    taxAmount,
    grandTotal,
    paidAmount,
    pendingAmount,
    status,
    notes: data.notes,
    invoiceDate: data.invoiceDate,
    createdBy: userId,
  });

  // Decrement product stock
  for (const item of data.items) {
    if (item.product) {
      await Product.updateOne(
        { _id: item.product, shop: shopId },
        { $inc: { quantity: -item.quantity } }
      );
    }
  }

  // Update customer ledger
  await Customer.updateOne(
    { _id: customer._id },
    {
      $inc: {
        totalPurchased: grandTotal,
        totalPaid: paidAmount,
        totalDue: pendingAmount,
      },
    }
  );

  return Invoice.findById(invoice._id)
    .populate('customer', 'name mobile')
    .populate('items.product', 'name');
};

export const listInvoices = async (
  shopId,
  { search = '', status, page = 1, limit = 50 } = {}
) => {
  const query = { shop: shopId };
  if (status) query.status = status;
  if (search) query.$or = [{ invoiceNumber: { $regex: search, $options: 'i' } }];

  const pageNum = Math.max(parseInt(page) || 1, 1);
  const pageSize = Math.max(parseInt(limit) || 50, 1);
  const skip = (pageNum - 1) * pageSize;

  const [invoices, total] = await Promise.all([
    Invoice.find(query)
      .populate('customer', 'name mobile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize),
    Invoice.countDocuments(query),
  ]);

  return { invoices, total, page: pageNum, pages: Math.ceil(total / pageSize) };
};

export const getInvoice = async (shopId, id) => {
  const invoice = await Invoice.findOne({ _id: id, shop: shopId })
    .populate('customer')
    .populate('items.product');
  if (!invoice) throw new ApiError(404, 'Invoice not found');
  return invoice;
};

export const updateInvoiceStatus = async (shopId, id, { status }) => {
  if (!['paid', 'partial', 'pending'].includes(status)) {
    throw new ApiError(400, 'Invalid status');
  }
  const invoice = await getInvoice(shopId, id);
  invoice.status = status;
  await invoice.save();
  return invoice;
};

export const deleteInvoice = async (shopId, id) => {
  const invoice = await getInvoice(shopId, id);
  // Restore customer ledger
  await Customer.updateOne(
    { _id: invoice.customer },
    {
      $inc: {
        totalPurchased: -invoice.grandTotal,
        totalPaid: -invoice.paidAmount,
        totalDue: -invoice.pendingAmount,
      },
    }
  );
  // Restore stock
  for (const item of invoice.items) {
    if (item.product) {
      await Product.updateOne(
        { _id: item.product, shop: shopId },
        { $inc: { quantity: item.quantity } }
      );
    }
  }
  await invoice.deleteOne();
  return invoice;
};
