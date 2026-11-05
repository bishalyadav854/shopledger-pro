import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiFileText, FiPlus, FiSearch, FiEye, FiTrash2, FiX, FiDollarSign, FiPrinter } from 'react-icons/fi';
import { invoiceService } from '../services/invoiceService';
import { customerService } from '../services/customerService';
import { productService } from '../services/productService';
import { settingsService } from '../services/settingsService';
import { paymentService } from '../services/paymentService';
import { formatCurrency, formatDate, statusStyles, statusLabels } from '../utils/format';
import BarcodeScanner from '../components/BarcodeScanner';
import { lookupBarcode } from '../services/barcodeLookup';

const emptyItem = { product: '', name: '', quantity: 1, price: 0, discount: 0 };

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('cash');

  // Create form
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [taxPercent, setTaxPercent] = useState(0);
  const [paidAmount, setPaidAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search };
      if (statusFilter) params.status = statusFilter;
      const res = await invoiceService.getAll(params);
      setInvoices(res.data.invoices || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(loadInvoices, 300);
    return () => clearTimeout(t);
  }, [loadInvoices]);

  const loadFormData = useCallback(async () => {
    try {
      const [custRes, prodRes, setRes] = await Promise.all([
        customerService.getAll({ limit: 200 }),
        productService.getAll({ limit: 200 }),
        settingsService.get(),
      ]);
      setCustomers(custRes.data.customers || []);
      setProducts(prodRes.data.products || []);
      setSettings(setRes.data.data);
      setTaxPercent(setRes.data.data?.taxPercentDefault || 0);
    } catch (err) {
      // ignore
    }
  }, []);

  const openCreate = () => {
    loadFormData();
    setCustomerId('');
    setItems([{ ...emptyItem }]);
    setPaidAmount('');
    setNotes('');
    setShowCreate(true);
  };

  const handleItemChange = (idx, field, value) => {
    const updated = [...items];
    updated[idx][field] = value;
    // If product selected, auto-fill name and price
    if (field === 'product') {
      const prod = products.find((p) => p._id === value);
      if (prod) {
        updated[idx].name = prod.name;
        updated[idx].price = prod.sellingPrice;
        updated[idx].unit = prod.unit;
      }
    }
    setItems(updated);
  };

  const handleInvoiceBarcode = async (barcode) => {
    try {
      const result = await lookupBarcode(barcode);
      if (result.source === 'local') {
        const p = result.product;
        if (Number(p.quantity) <= 0) return toast.error(`${p.name} is out of stock`);
        const existing = items.findIndex((it) => it.product === p._id);
        if (existing >= 0) {
          if (Number(items[existing].quantity) + 1 > Number(p.quantity)) return toast.error(`Only ${p.quantity} ${p.unit || 'pcs'} in stock`);
          handleItemChange(existing, 'quantity', Number(items[existing].quantity) + 1);
        } else {
          const emptyIndex = items.findIndex((it) => !it.name && !it.product);
          const next = { product: p._id, name: p.name, quantity: 1, price: p.sellingPrice, discount: 0, unit: p.unit };
          if (emptyIndex >= 0) { const copy = [...items]; copy[emptyIndex] = next; setItems(copy); } else setItems((current) => [...current, next]);
        }
        toast.success(`${p.name} added to draft invoice`);
      } else if (result.source === 'external') {
        const p = result.product;
        const emptyIndex = items.findIndex((it) => !it.name && !it.product);
        const next = { product: '', name: p.name, quantity: 1, price: '', discount: 0, unit: p.unit || 'pcs', barcode };
        if (emptyIndex >= 0) { const copy = [...items]; copy[emptyIndex] = next; setItems(copy); } else setItems((current) => [...current, next]);
        toast('Catalog name added. Set price and register the barcode in Products before saving a stock-tracked sale.', { icon: 'ℹ️' });
      } else { toast.error('Barcode not found. Add the product in Products first or enter the item manually.'); }
    } catch (error) { toast.error(error.message || 'Barcode lookup failed'); }
  };

  const addItem = () => setItems([...items, { ...emptyItem }]);
  const removeItem = (idx) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const calcTotals = () => {
    let subtotal = 0;
    let discountTotal = 0;
    items.forEach((it) => {
      const lineTotal = (Number(it.price) || 0) * (Number(it.quantity) || 0);
      subtotal += lineTotal;
      discountTotal += Number(it.discount) || 0;
    });
    const tax = (subtotal - discountTotal) * ((Number(taxPercent) || 0) / 100);
    const grandTotal = subtotal - discountTotal + tax;
    return { subtotal, discountTotal, tax, grandTotal };
  };

  const handleCreateInvoice = async () => {
    if (!customerId) {
      toast.error('Select a customer');
      return;
    }
    const validItems = items.filter((it) => it.name && Number(it.quantity) > 0);
    if (validItems.length === 0) {
      toast.error('Add at least one item');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        customer: customerId,
        items: validItems.map((it) => ({
          product: it.product || undefined,
          name: it.name,
          quantity: Number(it.quantity),
          price: Number(it.price),
          discount: Number(it.discount) || 0,
        })),
        taxPercent: Number(taxPercent) || 0,
        paidAmount: Number(paidAmount) || 0,
        notes,
      };
      const res = await invoiceService.create(payload);
      toast.success('Invoice created successfully');
      setShowCreate(false);
      loadInvoices();
      setViewInvoice(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setSaving(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!viewInvoice || !payAmount) {
      toast.error('Enter payment amount');
      return;
    }
    try {
      await paymentService.create({
        invoice: viewInvoice._id,
        amount: Number(payAmount),
        method: payMethod,
      });
      toast.success('Payment recorded');
      setShowPayment(false);
      setPayAmount('');
      const res = await invoiceService.get(viewInvoice._id);
      setViewInvoice(res.data.data);
      loadInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this invoice? Stock and customer ledger will be restored.')) return;
    try {
      await invoiceService.delete(id);
      toast.success('Invoice deleted');
      loadInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete invoice');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const { subtotal, discountTotal, tax, grandTotal } = calcTotals();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FiFileText className="text-indigo-400" />
            Invoices
          </h1>
          <p className="text-slate-500 mt-1">Create and manage customer invoices.</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <FiPlus className="w-4 h-4" />
          New Invoice
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice number..."
            className="input-modern pl-11"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-modern sm:w-44"
        >
          <option value="">All Statuses</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50 text-left text-slate-500">
                <th className="px-6 py-4 font-medium">Invoice #</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Paid</th>
                <th className="px-6 py-4 font-medium">Due</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    No invoices found. Create your first invoice.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-indigo-400">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4 text-white">{inv.customer?.name || '—'}</td>
                    <td className="px-6 py-4 text-slate-400">{formatDate(inv.invoiceDate)}</td>
                    <td className="px-6 py-4 text-white font-medium">{formatCurrency(inv.grandTotal)}</td>
                    <td className="px-6 py-4 text-green-400">{formatCurrency(inv.paidAmount)}</td>
                    <td className="px-6 py-4">
                      {Number(inv.pendingAmount) > 0 ? (
                        <span className="text-orange-400 font-medium">{formatCurrency(inv.pendingAmount)}</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${statusStyles[inv.status]}`}>
                        {statusLabels[inv.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewInvoice(inv)}
                          className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setViewInvoice(inv); setShowPayment(true); }}
                          className="p-2 text-slate-500 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                        >
                          <FiDollarSign className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(inv._id)}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowCreate(false)} />
          <div className="relative bg-slate-800 rounded-2xl border border-slate-700/50 w-full max-w-3xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Create Invoice</h2>
              <button onClick={() => setShowCreate(false)} className="text-slate-500 hover:text-white">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Customer */}
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Customer *</label>
                <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="input-modern">
                  <option value="">Select customer</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>{c.name} ({c.mobile})</option>
                  ))}
                </select>
              </div>

              {/* Barcode scan: only adds items to the draft; stock changes after invoice save. */}
              <div className="rounded-xl bg-white/5 border border-slate-700/60 p-4"><BarcodeScanner label="Scan item into invoice" onScan={handleInvoiceBarcode} compact /></div>

              {/* Items */}
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Items</label>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <select
                        value={item.product}
                        onChange={(e) => handleItemChange(idx, 'product', e.target.value)}
                        className="input-modern col-span-4"
                      >
                        <option value="">Select product</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                      </select>
                      <input
                        value={item.name}
                        onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                        placeholder="Name"
                        className="input-modern col-span-3"
                      />
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        placeholder="Qty"
                        className="input-modern col-span-1"
                      />
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                        placeholder="Price"
                        className="input-modern col-span-2"
                      />
                      <input
                        type="number"
                        value={item.discount}
                        onChange={(e) => handleItemChange(idx, 'discount', e.target.value)}
                        placeholder="Disc"
                        className="input-modern col-span-1"
                      />
                      <button onClick={() => removeItem(idx)} className="text-slate-500 hover:text-red-400 justify-self-end">
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={addItem} className="mt-2 text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                  <FiPlus className="w-4 h-4" /> Add item
                </button>
              </div>

              {/* Totals */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Tax %</label>
                  <input type="number" value={taxPercent} onChange={(e) => setTaxPercent(e.target.value)} className="input-modern" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Paid Amount</label>
                  <input type="number" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} className="input-modern" />
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Discount</span><span>-{formatCurrency(discountTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tax</span><span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-white font-semibold text-base pt-2 border-t border-slate-700/50">
                  <span>Grand Total</span><span>{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input-modern" rows={2} />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleCreateInvoice} disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Creating...' : 'Create Invoice'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {viewInvoice && !showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setViewInvoice(null)} />
          <div className={`invoice-printable relative bg-white rounded-2xl w-full ${settings?.printerType === 'thermal80mm' ? 'max-w-[80mm] p-4' : 'max-w-2xl p-8'} shadow-2xl text-slate-900 max-h-[92vh] overflow-y-auto`}>
            <div className="flex items-start justify-between mb-6 print:hidden">
              <div>
                <h2 className="text-xl font-bold">{settings?.shopName || 'Shop'}</h2>
                <p className="text-sm text-slate-500">{settings?.address || ''}</p>
                <p className="text-sm text-slate-500">GST: {settings?.gstNumber || '—'}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{viewInvoice.invoiceNumber}</p>
                <p className="text-sm text-slate-500">{formatDate(viewInvoice.invoiceDate)}</p>
                <span className={`inline-block mt-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${statusStyles[viewInvoice.status]} text-slate-900`}>
                  {statusLabels[viewInvoice.status]}
                </span>
              </div>
            </div>

            <div className="border-t border-b border-slate-200 py-4 my-4">
              <p className="text-sm font-semibold mb-1">Bill To:</p>
              <p className="font-medium">{viewInvoice.customer?.name}</p>
              <p className="text-sm text-slate-500">{viewInvoice.customer?.mobile}</p>
              {viewInvoice.customer?.address && (
                <p className="text-sm text-slate-500">{viewInvoice.customer.address}</p>
              )}
            </div>

            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="py-2">Item</th>
                  <th className="py-2 text-right">Qty</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(viewInvoice.items || []).map((it, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-2">{it.name}</td>
                    <td className="py-2 text-right">{it.quantity}</td>
                    <td className="py-2 text-right">{formatCurrency(it.price)}</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(it.price * it.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end">
              <div className="w-64 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{formatCurrency(viewInvoice.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Tax</span><span>{formatCurrency(viewInvoice.taxAmount)}</span></div>
                <div className="flex justify-between font-semibold text-base pt-1 border-t border-slate-200"><span>Total</span><span>{formatCurrency(viewInvoice.grandTotal)}</span></div>
                <div className="flex justify-between text-green-600"><span>Paid</span><span>{formatCurrency(viewInvoice.paidAmount)}</span></div>
                <div className="flex justify-between text-orange-600 font-medium"><span>Due</span><span>{formatCurrency(viewInvoice.pendingAmount)}</span></div>
              </div>
            </div>

            {viewInvoice.notes && (
              <p className="mt-4 text-sm text-slate-500">Notes: {viewInvoice.notes}</p>
            )}

            <div className="flex gap-3 mt-6 print:hidden">
              <button onClick={() => setViewInvoice(null)} className="btn-secondary flex-1">Close</button>
              <button onClick={() => { setShowPayment(true); }} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <FiDollarSign className="w-4 h-4" /> Record Payment
              </button>
              <button onClick={handlePrint} className="btn-secondary flex items-center justify-center gap-2">
                <FiPrinter className="w-4 h-4" /> Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && viewInvoice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowPayment(false)} />
          <div className="relative bg-slate-800 rounded-2xl border border-slate-700/50 w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Record Payment</h2>
              <button onClick={() => setShowPayment(false)} className="text-slate-500 hover:text-white">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-400 mb-4">
              Invoice <span className="text-indigo-400 font-medium">{viewInvoice.invoiceNumber}</span>
              {' '}· Due: <span className="text-orange-400 font-medium">{formatCurrency(viewInvoice.pendingAmount)}</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Amount</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="input-modern"
                  placeholder="0.00"
                  max={viewInvoice.pendingAmount}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Method</label>
                <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} className="input-modern">
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowPayment(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleRecordPayment} className="btn-primary flex-1">Record Payment</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
