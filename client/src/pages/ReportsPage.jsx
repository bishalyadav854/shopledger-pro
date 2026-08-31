import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiBarChart2, FiTrendingUp, FiUsers, FiDollarSign, FiClock, FiAlertCircle } from 'react-icons/fi';
import { reportService } from '../services/reportService';
import { formatCurrency, formatDate, statusStyles, statusLabels } from '../utils/format';

export default function ReportsPage() {
  const [sales, setSales] = useState(null);
  const [dues, setDues] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const [salesRes, duesRes, topRes, collRes] = await Promise.all([
        reportService.sales(),
        reportService.customerDues(),
        reportService.topProducts(5),
        reportService.collection(),
      ]);
      setSales(salesRes.data.data);
      setDues(duesRes.data);
      setTopProducts(topRes.data.data || []);
      setCollection(collRes.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const summary = sales?.summary || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <FiBarChart2 className="text-indigo-400" />
          Reports & Analytics
        </h1>
        <p className="text-slate-500 mt-1">Business performance insights and summaries.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Sales Summary Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="stat-card">
              <FiTrendingUp className="text-indigo-400 mb-3" />
              <h3 className="text-sm text-slate-500 mb-1">Total Revenue</h3>
              <p className="text-2xl font-bold text-white">{formatCurrency(summary.totalRevenue)}</p>
            </div>
            <div className="stat-card">
              <FiUsers className="text-green-400 mb-3" />
              <h3 className="text-sm text-slate-500 mb-1">Total Invoices</h3>
              <p className="text-2xl font-bold text-white">{summary.totalInvoices || 0}</p>
            </div>
            <div className="stat-card">
              <FiDollarSign className="text-blue-400 mb-3" />
              <h3 className="text-sm text-slate-500 mb-1">Collected</h3>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(summary.totalCollected)}</p>
            </div>
            <div className="stat-card">
              <FiAlertCircle className="text-orange-400 mb-3" />
              <h3 className="text-sm text-slate-500 mb-1">Pending</h3>
              <p className="text-2xl font-bold text-orange-400">{formatCurrency(summary.totalPending)}</p>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Sales by Status */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Sales by Status</h2>
              <div className="space-y-3">
                {(sales?.byStatus || []).map((s) => (
                  <div key={s._id} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${statusStyles[s._id]}`}>
                      {statusLabels[s._id]}
                    </span>
                    <div className="text-right">
                      <p className="text-white font-medium">{formatCurrency(s.amount)}</p>
                      <p className="text-xs text-slate-500">{s.count} invoice{s.count !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                ))}
                {(sales?.byStatus || []).length === 0 && (
                  <p className="text-slate-500 text-sm text-center py-4">No sales data yet</p>
                )}
              </div>
            </div>

            {/* Top Products */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Top Products</h2>
              <div className="space-y-3">
                {topProducts.map((p, idx) => (
                  <div key={p._id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{p._id}</p>
                      <p className="text-xs text-slate-500">{p.totalQuantity} units sold</p>
                    </div>
                    <p className="text-sm font-medium text-white">{formatCurrency(p.totalRevenue)}</p>
                  </div>
                ))}
                {topProducts.length === 0 && (
                  <p className="text-slate-500 text-sm text-center py-4">No products sold yet</p>
                )}
              </div>
            </div>

            {/* Customer Dues */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Customer Dues</h2>
                <span className="px-3 py-1 rounded-lg bg-orange-500/10 text-orange-400 text-sm font-medium">
                  {formatCurrency(dues?.totalDues)}
                </span>
              </div>
              <div className="space-y-3">
                {(dues?.customers || []).map((c) => (
                  <div key={c._id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div>
                      <p className="text-sm font-medium text-white">{c.name}</p>
                      <p className="text-xs text-slate-500">{c.mobile}</p>
                    </div>
                    <p className="text-sm font-medium text-orange-400">{formatCurrency(c.totalDue)}</p>
                  </div>
                ))}
                {(dues?.customers || []).length === 0 && (
                  <p className="text-slate-500 text-sm text-center py-4">No outstanding dues</p>
                )}
              </div>
            </div>

            {/* Collection Summary */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Collection Summary</h2>
              <div className="space-y-3">
                {(collection?.byMethod || []).map((m) => (
                  <div key={m._id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <span className="capitalize text-sm text-slate-300">{m._id.replace('_', ' ')}</span>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">{formatCurrency(m.total)}</p>
                      <p className="text-xs text-slate-500">{m.count} payments</p>
                    </div>
                  </div>
                ))}
                {(collection?.byMethod || []).length === 0 && (
                  <p className="text-slate-500 text-sm text-center py-4">No collections yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Recent Invoices</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50 text-left text-slate-500">
                    <th className="px-4 py-3 font-medium">Invoice #</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {(sales?.recent || []).map((inv) => (
                    <tr key={inv._id} className="hover:bg-white/5">
                      <td className="px-4 py-3 font-medium text-indigo-400">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3 text-white">{inv.customer?.name || '—'}</td>
                      <td className="px-4 py-3 text-slate-400">{formatDate(inv.invoiceDate)}</td>
                      <td className="px-4 py-3 text-white">{formatCurrency(inv.grandTotal)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${statusStyles[inv.status]}`}>
                          {statusLabels[inv.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(sales?.recent || []).length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        <FiClock className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                        No invoices yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
