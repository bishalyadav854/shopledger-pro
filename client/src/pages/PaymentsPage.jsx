import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiDollarSign, FiSearch } from 'react-icons/fi';
import { paymentService } from '../services/paymentService';
import { formatCurrency, formatDateTime, methodLabels } from '../utils/format';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentService.getAll({ limit: 200 });
      setPayments(res.data.payments || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  useEffect(() => {
    if (!search) {
      setFiltered(payments);
    } else {
      const q = search.toLowerCase();
      setFiltered(
        payments.filter(
          (p) =>
            p.customer?.name?.toLowerCase().includes(q) ||
            p.invoice?.invoiceNumber?.toLowerCase().includes(q) ||
            p.method?.toLowerCase().includes(q)
        )
      );
    }
  }, [search, payments]);

  const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FiDollarSign className="text-indigo-400" />
            Payments
          </h1>
          <p className="text-slate-500 mt-1">Track all payments received from customers.</p>
        </div>
        <div className="glass rounded-xl px-5 py-3">
          <p className="text-xs text-slate-500">Total Collected</p>
          <p className="text-xl font-bold text-green-400">{formatCurrency(totalCollected)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search payments..."
          className="input-modern pl-11"
        />
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50 text-left text-slate-500">
                <th className="px-6 py-4 font-medium">Invoice</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Method</th>
                <th className="px-6 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No payments found.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-indigo-400">{p.invoice?.invoiceNumber || '—'}</td>
                    <td className="px-6 py-4 text-white">{p.customer?.name || '—'}</td>
                    <td className="px-6 py-4 text-green-400 font-medium">{formatCurrency(p.amount)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-medium">
                        {methodLabels[p.method] || p.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{formatDateTime(p.paymentDate)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
