import mongoose from 'mongoose';
import Invoice from '../models/Invoice.js';
import Customer from '../models/Customer.js';
import Payment from '../models/Payment.js';
import Product from '../models/Product.js';

export const salesSummary = async (shopId, { from, to }) => {
  const match = { shop: new mongoose.Types.ObjectId(shopId) };
  if (from || to) {
    match.invoiceDate = {};
    if (from) match.invoiceDate.$gte = new Date(from);
    if (to) match.invoiceDate.$lte = new Date(to);
  }

  const [summary, byStatus, recent] = await Promise.all([
    Invoice.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$grandTotal' },
          totalInvoices: { $sum: 1 },
          totalCollected: { $sum: '$paidAmount' },
          totalPending: { $sum: '$pendingAmount' },
          avgInvoice: { $avg: '$grandTotal' },
        },
      },
    ]),
    Invoice.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$grandTotal' } } },
    ]),
    Invoice.find(match).populate('customer', 'name').sort({ invoiceDate: -1 }).limit(10),
  ]);

  return {
    summary: summary[0] || {
      totalRevenue: 0,
      totalInvoices: 0,
      totalCollected: 0,
      totalPending: 0,
      avgInvoice: 0,
    },
    byStatus,
    recent,
  };
};

export const customerDues = async (shopId) => {
  const customers = await Customer.find({ shop: shopId, totalDue: { $gt: 0 } })
    .sort({ totalDue: -1 })
    .limit(50);
  const totalDues = customers.reduce((sum, c) => sum + c.totalDue, 0);
  return { customers, totalDues };
};

export const topProducts = async (shopId, { limit = 5 } = {}) => {
  const result = await Invoice.aggregate([
    { $match: { shop: new mongoose.Types.ObjectId(shopId) } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.name',
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: parseInt(limit) || 5 },
  ]);
  return result;
};

export const collectionReport = async (shopId, { from, to }) => {
  const match = { shop: new mongoose.Types.ObjectId(shopId) };
  if (from || to) {
    match.paymentDate = {};
    if (from) match.paymentDate.$gte = new Date(from);
    if (to) match.paymentDate.$lte = new Date(to);
  }

  const [byMethod, total, recent] = await Promise.all([
    Payment.aggregate([
      { $match: match },
      { $group: { _id: '$method', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Payment.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Payment.find(match).populate('customer', 'name').sort({ paymentDate: -1 }).limit(10),
  ]);

  return {
    byMethod,
    total: total[0]?.total || 0,
    count: total[0]?.count || 0,
    recent,
  };
};
