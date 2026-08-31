import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiSave, FiSettings, FiHome } from 'react-icons/fi';
import { settingsService } from '../services/settingsService';

const emptySettings = {
  shopName: '',
  gstNumber: '',
  invoicePrefix: 'INV',
  taxPercentDefault: 0,
  currency: 'INR',
  printerType: 'a4',
  address: '',
  phone: '',
};

export default function SettingsPage() {
  const [formData, setFormData] = useState(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await settingsService.get();
        const s = res.data.data || {};
        setFormData({
          shopName: s.shopName || '',
          gstNumber: s.gstNumber || '',
          invoicePrefix: s.invoicePrefix || 'INV',
          taxPercentDefault: s.taxPercentDefault || 0,
          currency: s.currency || 'INR',
          printerType: s.printerType || 'a4',
          address: s.address || '',
          phone: s.phone || '',
        });
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsService.update(formData);
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <FiSettings className="text-indigo-400" />
          Settings
        </h1>
        <p className="text-slate-500 mt-1">Configure your shop details and invoice preferences.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-6">
        {/* Shop Details */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
<FiHome className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Shop Details</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Shop Name</label>
              <input name="shopName" value={formData.shopName} onChange={handleChange} className="input-modern" placeholder="Your shop name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">GST Number</label>
                <input name="gstNumber" value={formData.gstNumber} onChange={handleChange} className="input-modern" placeholder="GST No" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Phone</label>
                <input name="phone" value={formData.phone} onChange={handleChange} className="input-modern" placeholder="Phone" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} className="input-modern" rows={3} placeholder="Shop address" />
            </div>
          </div>
        </div>

        {/* Invoice Preferences */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <FiSettings className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Invoice Preferences</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Invoice Prefix</label>
                <input name="invoicePrefix" value={formData.invoicePrefix} onChange={handleChange} className="input-modern" placeholder="INV" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Default Tax %</label>
                <input name="taxPercentDefault" type="number" value={formData.taxPercentDefault} onChange={handleChange} className="input-modern" placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Currency</label>
                <select name="currency" value={formData.currency} onChange={handleChange} className="input-modern">
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Printer Type</label>
                <select name="printerType" value={formData.printerType} onChange={handleChange} className="input-modern">
                  <option value="a4">A4</option>
                  <option value="thermal80mm">Thermal 80mm</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="lg:col-span-2">
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            <FiSave className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
