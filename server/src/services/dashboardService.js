import mongoose from 'mongoose';
import Invoice from '../models/Invoice.js';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';
import Payment from '../models/Payment.js';

export const getDashboardStats = async (shopId) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const shopObjectId = new mongoose.Types.ObjectId(shopId);

  const [todayRevenue, totalRevenue, totalDues, customerCount, productCount, lowStockCount, recentInvoices] =
    await Promise.all([
      Invoice.aggregate([
        { $match: { shop: shopObjectId, invoiceDate: { $gte: todayStart, $lte: todayEnd } } },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } },
      ]),
      Invoice.aggregate([
        { $match: { shop: shopObjectId } },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } },
      ]),
      Customer.aggregate([
        { $match: { shop: shopObjectId } },
        { $group: { _id: null, total: { $sum: '$totalDue' } } },
      ]),
      Customer.countDocuments({ shop: shopId }),
      Product.countDocuments({ shop: shopId }),
      Product.countDocuments({ shop: shopId, $expr: { $lte: ['$quantity', '$lowStockThreshold'] } }),
      Invoice.find({ shop: shopId })
        .populate('customer', 'name')
        .sort({ createdAt: -1 })
        .limit(8),
    ]);

  return {
    todayRevenue: todayRevenue[0]?.total || 0,
    totalRevenue: totalRevenue[0]?.total || 0,
    totalDues: totalDues[0]?.total || 0,
    customerCount,
    productCount,
    lowStockCount,
    todayInvoices: todayRevenue[0]?.count || 0,
    recentInvoices,
  };
};
