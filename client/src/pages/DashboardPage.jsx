import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FiDollarSign, FiUsers, FiFileText, FiTrendingUp, FiArrowUp, FiArrowDown, FiCalendar, FiShoppingCart, FiAlertCircle, FiClock, FiPlus } from 'react-icons/fi';
import { dashboardService } from '../services/dashboardService';
import { formatCurrency, formatDate, statusStyles, statusLabels } from '../utils/format';

const quickActions = [
  { label: 'New Invoice', path: '/invoices', icon: FiFileText, color: 'from-indigo-500 to-purple-600' },
  { label: 'Add Customer', path: '/customers', icon: FiUsers, color: 'from-green-500 to-emerald-600' },
  { label: 'Add Product', path: '/products', icon: FiShoppingCart, color: 'from-blue-500 to-cyan-600' },
  { label: 'View Reports', path: '/reports', icon: FiTrendingUp, color: 'from-orange-500 to-red-600' },
];

export default function DashboardPage() {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await dashboardService.getStats();
        setStats(res.data.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards = [
    {
      title: "Today's Sales",
      value: formatCurrency(stats?.todayRevenue),
      change: 'today',
      isPositive: true,
      icon: FiDollarSign,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Active Customers',
      value: String(stats?.customerCount ?? 0),
      change: 'total',
      isPositive: true,
      icon: FiUsers,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Pending Dues',
      value: formatCurrency(stats?.totalDues),
      change: 'due',
      isPositive: false,
      icon: FiFileText,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue),
      change: 'all time',
      isPositive: true,
      icon: FiTrendingUp,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            Welcome back, <span className="gradient-text">{user?.name || 'Shopkeeper'}</span>
          </h1>
          <p className="text-slate-500 mt-1">
            Here's what's happening with your shop today.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm">
          <FiCalendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              to={action.path}
              className="glass rounded-2xl p-4 card-hover text-left group"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-medium text-white">{action.label}</h3>
              <p className="text-xs text-slate-500 mt-1">Click to open</p>
            </Link>
          );
        })}
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="stat-card group">
              <div className="flex items-start justify-between mb-4">
                <div className={`stat-icon ${card.bgColor}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                    card.isPositive
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}
                >
                  {card.change}
                </div>
              </div>
              <h3 className="text-sm text-slate-500 mb-1">{card.title}</h3>
              <p className="text-2xl font-bold text-white">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Recent Invoices</h2>
            <Link to="/invoices" className="text-xs text-indigo-400 hover:text-indigo-300">View all</Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            ) : (stats?.recentInvoices || []).length === 0 ? (
              <div className="text-center py-8">
                <FiClock className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No recent invoices yet.</p>
                <Link to="/invoices" className="inline-flex items-center gap-1 text-indigo-400 text-sm mt-2 hover:text-indigo-300">
                  <FiPlus className="w-3.5 h-3.5" /> Create your first invoice
                </Link>
              </div>
            ) : (
              stats.recentInvoices.map((inv) => (
                <div key={inv._id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                      <FiFileText className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{inv.invoiceNumber}</p>
                      <p className="text-xs text-slate-500">{inv.customer?.name} · {formatDate(inv.invoiceDate)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{formatCurrency(inv.grandTotal)}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${statusStyles[inv.status]}`}>
                      {statusLabels[inv.status]}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Overview */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Quick Overview</h2>
            <span className="text-xs text-slate-500">Shop summary</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <div className="flex items-center gap-3">
                <FiDollarSign className="w-5 h-5 text-green-400" />
                <span className="text-sm text-slate-300">Collected</span>
              </div>
              <span className="text-sm font-semibold text-green-400">{formatCurrency((stats?.totalRevenue || 0) - (stats?.totalDues || 0))}</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <div className="flex items-center gap-3">
                <FiAlertCircle className="w-5 h-5 text-orange-400" />
                <span className="text-sm text-slate-300">Total Dues</span>
              </div>
              <span className="text-sm font-semibold text-orange-400">{formatCurrency(stats?.totalDues)}</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <div className="flex items-center gap-3">
                <FiShoppingCart className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-slate-300">Products</span>
              </div>
              <span className="text-sm font-semibold text-white">{stats?.productCount || 0}</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <div className="flex items-center gap-3">
                <FiUsers className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-slate-300">Customers</span>
              </div>
              <span className="text-sm font-semibold text-white">{stats?.customerCount || 0}</span>
            </div>

            {Number(stats?.lowStockCount) > 0 && (
              <button className="w-full flex items-center justify-between p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-colors">
                <div className="flex items-center gap-3">
                  <FiAlertCircle className="w-5 h-5 text-orange-400" />
                  <span className="text-sm text-orange-300">Low stock items</span>
                </div>
                <span className="text-sm font-semibold text-orange-400">{stats.lowStockCount}</span>
              </button>
            )}
          </div>

          {/* Shop Info */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
            <p className="text-xs text-indigo-400 mb-1">Shop Name</p>
            <p className="text-sm font-medium text-white">{user?.shopName || 'Your Shop'}</p>
            <p className="text-xs text-slate-500 mt-2">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
