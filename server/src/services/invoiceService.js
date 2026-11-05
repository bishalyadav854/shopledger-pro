import Invoice from '../models/Invoice.js';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';
import Counter from '../models/Counter.js';
import Settings from '../models/Settings.js';
import { ApiError } from '../utils/ApiError.js';
import { calculateInvoiceTotals } from '../utils/money.js';

const computeTotals = ({ items, taxPercent }) => {
  try {
    return calculateInvoiceTotals({ items, taxPercent });
  } catch (error) {
    throw new ApiError(400, error.message || 'Invalid invoice totals');
  }
};

export const createInvoice = async (shopId, userId, data) => {
  let customer = null;
  if (data.customer) {
    customer = await Customer.findOne({ _id: data.customer, shop: shopId });
    if (!customer) throw new ApiError(404, 'Customer not found');
  }

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

  const paidAmount = Number(data.paidAmount || 0);
  if (!Number.isFinite(paidAmount) || paidAmount < 0) throw new ApiError(400, 'Paid amount must be a non-negative number');
  const pendingAmount = Math.round((grandTotal - paidAmount) * 100) / 100;
  const status = pendingAmount <= 0 ? 'paid' : paidAmount > 0 ? 'partial' : 'pending';

  // Walk-in sales need no customer record when fully paid. If any balance remains,
  // collect customer details and create/find a customer for the pending ledger.
  if (pendingAmount > 0 && !customer) {
    const details = data.customerDetails || {};
    const name = String(details.name || '').trim();
    const mobile = String(details.mobile || '').trim();
    if (!name || !mobile) throw new ApiError(400, 'Customer name and mobile are required for pending payments');
    customer = await Customer.findOne({ shop: shopId, mobile });
    if (!customer) customer = await Customer.create({ shop: shopId, name, mobile, email: details.email, address: details.address });
  }

  // Reserve stock with a conditional atomic update so two simultaneous sales
  // cannot both sell the final units. Roll reservations back if any later write fails.
  const reserved = [];
  let invoice;
  try {
    for (const item of items) {
      if (!item.product) continue;
      const result = await Product.updateOne(
        { _id: item.product, shop: shopId, quantity: { $gte: item.quantity } },
        { $inc: { quantity: -item.quantity } }
      );
      if (result.modifiedCount !== 1) throw new ApiError(409, `Insufficient stock for ${item.name}. Refresh products and try again.`);
      reserved.push({ product: item.product, quantity: item.quantity });
    }

    invoice = await Invoice.create({
      shop: shopId,
      invoiceNumber,
      ...(customer ? { customer: customer._id } : {}),
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

    if (customer) await Customer.updateOne(
      { _id: customer._id, shop: shopId },
      { $inc: { totalPurchased: grandTotal, totalPaid: paidAmount, totalDue: pendingAmount } }
    );
  } catch (error) {
    if (invoice?._id) await Invoice.deleteOne({ _id: invoice._id, shop: shopId }).catch(() => {});
    for (const item of reserved.reverse()) {
      await Product.updateOne({ _id: item.product, shop: shopId }, { $inc: { quantity: item.quantity } }).catch(() => {});
    }
    throw error;
  }

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
  if (invoice.customer) await Customer.updateOne(
    { _id: invoice.customer, shop: shopId },
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
