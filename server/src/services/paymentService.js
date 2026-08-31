import Payment from '../models/Payment.js';
import Invoice from '../models/Invoice.js';
import Customer from '../models/Customer.js';
import { ApiError } from '../utils/ApiError.js';

export const recordPayment = async (shopId, userId, data) => {
  const invoice = await Invoice.findOne({ _id: data.invoice, shop: shopId });
  if (!invoice) throw new ApiError(404, 'Invoice not found');

  if (invoice.pendingAmount <= 0) {
    throw new ApiError(400, 'This invoice is already fully paid');
  }

  const amount = Math.min(data.amount, invoice.pendingAmount);

  const payment = await Payment.create({
    shop: shopId,
    invoice: invoice._id,
    customer: invoice.customer,
    amount,
    method: data.method || 'cash',
    paymentDate: data.paymentDate,
    notes: data.notes,
    recordedBy: userId,
  });

  const newPaid = invoice.paidAmount + amount;
  const newPending = invoice.pendingAmount - amount;
  const status = newPending <= 0 ? 'paid' : 'partial';

  await Invoice.updateOne(
    { _id: invoice._id },
    { $set: { paidAmount: newPaid, pendingAmount: newPending, status } }
  );

  await Customer.updateOne(
    { _id: invoice.customer },
    { $inc: { totalPaid: amount, totalDue: -amount } }
  );

  return Payment.findById(payment._id)
    .populate('invoice', 'invoiceNumber grandTotal')
    .populate('customer', 'name mobile');
};

export const listPayments = async (
  shopId,
  { invoice, customer, page = 1, limit = 50 } = {}
) => {
  const query = { shop: shopId };
  if (invoice) query.invoice = invoice;
  if (customer) query.customer = customer;

  const pageNum = Math.max(parseInt(page) || 1, 1);
  const pageSize = Math.max(parseInt(limit) || 50, 1);
  const skip = (pageNum - 1) * pageSize;

  const [payments, total] = await Promise.all([
    Payment.find(query)
      .populate('invoice', 'invoiceNumber grandTotal')
      .populate('customer', 'name mobile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize),
    Payment.countDocuments(query),
  ]);

  return { payments, total, page: pageNum, pages: Math.ceil(total / pageSize) };
};

export const getPaymentsByInvoice = async (shopId, invoiceId) => {
  const invoice = await Invoice.findOne({ _id: invoiceId, shop: shopId });
  if (!invoice) throw new ApiError(404, 'Invoice not found');
  return Payment.find({ invoice: invoiceId, shop: shopId })
    .populate('customer', 'name mobile')
    .sort({ createdAt: -1 });
};
