import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { FiMenu, FiX, FiHome, FiUsers, FiPackage, FiFileText, FiDollarSign, FiBarChart2, FiSettings, FiLogOut, FiBell, FiUser, FiChevronDown, FiGrid, FiShoppingCart, FiAlertTriangle, FiClock } from 'react-icons/fi';
import { productService } from '../services/productService';
import { invoiceService } from '../services/invoiceService';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: FiHome },
  { path: '/pos', label: 'Quick POS', icon: FiShoppingCart },
  { path: '/customers', label: 'Customers', icon: FiUsers },
  { path: '/products', label: 'Products', icon: FiPackage },
  { path: '/invoices', label: 'Invoices', icon: FiFileText },
  { path: '/payments', label: 'Payments', icon: FiDollarSign },
  { path: '/reports', label: 'Reports', icon: FiBarChart2 },
  { path: '/settings', label: 'Settings', icon: FiSettings },
];

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const loadNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    try {
      const [productsRes, invoicesRes] = await Promise.all([productService.getAll({ limit: 200, lowStock: 'true' }), invoiceService.getAll({ limit: 200 })]);
      const lowStock = (productsRes.data.products || []).map((p) => ({ id: `stock-${p._id}`, title: 'Low stock', message: `${p.name}: ${p.quantity} ${p.unit || 'pcs'} left`, path: '/products', icon: 'stock' }));
      const dues = (invoicesRes.data.invoices || []).filter((i) => ['pending', 'partial'].includes(i.status) && Number(i.pendingAmount) > 0).map((i) => ({ id: `due-${i._id}`, title: 'Payment due', message: `${i.invoiceNumber} · ${i.customer?.name || 'Customer'} · ₹${Number(i.pendingAmount).toFixed(2)}`, path: '/invoices', icon: 'due' }));
      setNotifications([...lowStock, ...dues].slice(0, 20));
    } catch (error) { toastNotificationError(error); }
    finally { setNotificationsLoading(false); }
  }, []);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const toastNotificationError = () => { /* Keep the global shell quiet when notifications cannot load. */ };

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-800/50 border-r border-slate-700/50 backdrop-blur-xl transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-700/50">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                SL
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">ShopLedger</h1>
                <p className="text-xs text-slate-500">Pro</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-slate-700/50">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                {user?.avatarUrl ? <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" /> : (user?.name?.charAt(0)?.toUpperCase() || 'U')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.shopName || 'Shop'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                title="Logout"
              >
                <FiLogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:pl-72">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
              >
                <FiMenu className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg text-xs text-slate-500">
                  <FiGrid className="w-3.5 h-3.5" />
                  <span>Billing Module</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative">
                <button aria-label="Business notifications" aria-expanded={notificationsOpen} onClick={() => { const next = !notificationsOpen; setNotificationsOpen(next); if (next) loadNotifications(); }} className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                  <FiBell className="w-5 h-5" />
                  {notifications.length > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">{notifications.length > 9 ? '9+' : notifications.length}</span>}
                </button>
                {notificationsOpen && <><button aria-label="Close notifications" className="fixed inset-0 z-10 cursor-default" onClick={() => setNotificationsOpen(false)} /><div className="absolute right-0 top-full mt-2 w-[min(90vw,380px)] bg-slate-800 rounded-xl border border-slate-700 shadow-2xl z-20 overflow-hidden"><div className="flex items-center justify-between p-4 border-b border-slate-700"><div><h3 className="text-sm font-semibold text-white">Business notifications</h3><p className="text-xs text-slate-400 mt-1">Low stock and unpaid invoices</p></div><button onClick={loadNotifications} className="text-xs text-indigo-400">Refresh</button></div><div className="max-h-96 overflow-y-auto">{notificationsLoading ? <p className="p-6 text-sm text-slate-400 text-center">Checking your shop…</p> : notifications.length ? notifications.map((n) => <Link key={n.id} to={n.path} onClick={() => setNotificationsOpen(false)} className="flex gap-3 p-4 border-b border-slate-700/60 hover:bg-white/5"><span className="mt-0.5 text-amber-400">{n.icon === 'stock' ? <FiAlertTriangle /> : <FiClock />}</span><span><span className="block text-sm font-medium text-white">{n.title}</span><span className="block text-xs text-slate-400 mt-1">{n.message}</span></span></Link>) : <p className="p-6 text-sm text-slate-400 text-center">You're all caught up. No alerts right now.</p>}</div></div></>}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  {user?.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" /> : <FiUser className="w-5 h-5" />}
                  <FiChevronDown className="w-4 h-4" />
                </button>

                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setProfileOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 rounded-xl border border-slate-700/50 shadow-xl z-20 overflow-hidden">
                      <div className="p-3 border-b border-slate-700/50">
                        <p className="text-sm font-medium text-white">{user?.name}</p>
                        <p className="text-xs text-slate-500">{user?.email}</p>
                      </div>
                      <Link
                        to="/settings"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setProfileOpen(false)}
                      >
                        <FiSettings className="w-4 h-4" />
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <FiLogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

