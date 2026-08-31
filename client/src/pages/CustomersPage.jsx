import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiUsers, FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiPhone, FiMapPin } from 'react-icons/fi';
import { customerService } from '../services/customerService';
import { formatCurrency, formatDate } from '../utils/format';

const emptyForm = {
  name: '',
  mobile: '',
  email: '',
  address: '',
  gstNumber: '',
  notes: '',
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customerService.getAll({ search });
      setCustomers(res.data.customers || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(loadCustomers, 300);
    return () => clearTimeout(t);
  }, [loadCustomers]);

  const openAdd = () => {
    setEditing(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditing(c._id);
    setFormData({
      name: c.name || '',
      mobile: c.mobile || '',
      email: c.email || '',
      address: c.address || '',
      gstNumber: c.gstNumber || '',
      notes: c.notes || '',
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile) {
      toast.error('Name and mobile are required');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await customerService.update(editing, formData);
        toast.success('Customer updated');
      } else {
        await customerService.create(formData);
        toast.success('Customer added');
      }
      setShowModal(false);
      loadCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save customer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    try {
      await customerService.delete(id);
      toast.success('Customer deleted');
      loadCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete customer');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FiUsers className="text-indigo-400" />
            Customers
          </h1>
          <p className="text-slate-500 mt-1">Manage your shop customers and track their dues.</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <FiPlus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, mobile or email..."
          className="input-modern pl-11"
        />
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50 text-left text-slate-500">
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Purchased</th>
                <th className="px-6 py-4 font-medium">Paid</th>
                <th className="px-6 py-4 font-medium">Due</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No customers found. Add your first customer to get started.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                          {c.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white">{c.name}</p>
                          {c.email && <p className="text-xs text-slate-500">{c.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      <p className="flex items-center gap-2">
                        <FiPhone className="w-3.5 h-3.5" /> {c.mobile}
                      </p>
                      {c.address && (
                        <p className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                          <FiMapPin className="w-3 h-3" /> {c.address}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-300">{formatCurrency(c.totalPurchased)}</td>
                    <td className="px-6 py-4 text-green-400">{formatCurrency(c.totalPaid)}</td>
                    <td className="px-6 py-4">
                      {Number(c.totalDue) > 0 ? (
                        <span className="text-orange-400 font-medium">{formatCurrency(c.totalDue)}</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(c.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c._id)}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} />
          <div className="relative bg-slate-800 rounded-2xl border border-slate-700/50 w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">
                {editing ? 'Edit Customer' : 'Add Customer'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Name *</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-modern"
                  placeholder="Customer name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Mobile *</label>
                  <input
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="input-modern"
                    placeholder="Mobile number"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Email</label>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-modern"
                    placeholder="Email"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Address</label>
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input-modern"
                  placeholder="Address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">GST Number</label>
                  <input
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    className="input-modern"
                    placeholder="GST No"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Notes</label>
                  <input
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="input-modern"
                    placeholder="Notes"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving...' : editing ? 'Update' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
