
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  FiSave,
  FiSettings,
  FiHome,
  FiUser,
  FiCamera,
} from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { authService } from '../services/authService';
import { setUser } from '../store/slices/authSlice';
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

const getProfileFromUser = (user = {}) => ({
  name: user.name || '',
  phone: user.phone || '',
  shopName: user.shopName || '',
  avatarUrl: user.avatarUrl || '',
});

const getSettingsFromResponse = (settings = {}) => ({
  shopName: settings.shopName || '',
  gstNumber: settings.gstNumber || '',
  invoicePrefix: settings.invoicePrefix || 'INV',
  taxPercentDefault: settings.taxPercentDefault ?? 0,
  currency: settings.currency || 'INR',
  printerType: settings.printerType || 'a4',
  address: settings.address || '',
  phone: settings.phone || '',
});

export default function SettingsPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [profile, setProfile] = useState(() =>
    getProfileFromUser(user)
  );

  const [profileSaving, setProfileSaving] = useState(false);
  const [formData, setFormData] = useState(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Keep the form synchronized with the authenticated user.
  useEffect(() => {
    if (user) {
      setProfile(getProfileFromUser(user));
    }
  }, [
    user?.id,
    user?._id,
    user?.name,
    user?.phone,
    user?.shopName,
    user?.avatarUrl,
  ]);

  // Load shop settings from the backend.
  useEffect(() => {
    let active = true;

    const loadSettings = async () => {
      try {
        const res = await settingsService.get();

        if (!active) return;

        const settings = res?.data?.data ?? res?.data ?? {};
        setFormData(getSettingsFromResponse(settings));
      } catch (err) {
        if (active) {
          toast.error(
            err.response?.data?.message ||
              'Failed to load settings'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      active = false;
    };
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // Preview the selected profile picture.
  const handleAvatar = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Choose a valid image file');
      e.target.value = '';
      return;
    }

    if (file.size > 1.5 * 1024 * 1024) {
      toast.error('Profile image must be 1.5 MB or smaller');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        toast.error('Could not read the selected image');
        return;
      }

      setProfile((current) => ({
        ...current,
        avatarUrl: reader.result,
      }));
    };

    reader.onerror = () => {
      toast.error('Could not read the selected image');
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Save profile changes and preserve other authenticated user fields.
  const saveProfile = async (e) => {
    e.preventDefault();

    const name = profile.name.trim();

    if (!name) {
      toast.error('Your name is required');
      return;
    }

    setProfileSaving(true);

    try {
      const payload = {
        ...profile,
        name,
        phone: profile.phone.trim(),
        shopName: profile.shopName.trim(),
      };

      const res = await authService.updateProfile(payload);

      const responseUser =
        res?.data?.data?.user ??
        res?.data?.data ??
        res?.data?.user;

      if (
        !responseUser ||
        typeof responseUser !== 'object' ||
        Array.isArray(responseUser)
      ) {
        throw new Error(
          'The server did not return the updated profile'
        );
      }

      // Merge instead of replacing the complete user object.
      const updatedUser = {
        ...(user || {}),
        ...responseUser,
      };

      // Keep the saved form values if the API returns only a partial user.
      const finalUser = {
        ...updatedUser,
        name: responseUser.name ?? payload.name,
        phone: responseUser.phone ?? payload.phone,
        shopName: responseUser.shopName ?? payload.shopName,
        avatarUrl:
          responseUser.avatarUrl ?? payload.avatarUrl,
      };

      // Update the current application state.
      dispatch(setUser(finalUser));

      // Cache the merged user without removing unrelated fields.
      try {
        const cachedUser = JSON.parse(
          localStorage.getItem('user') || '{}'
        );

        localStorage.setItem(
          'user',
          JSON.stringify({
            ...cachedUser,
            ...finalUser,
          })
        );
      } catch {
        localStorage.setItem(
          'user',
          JSON.stringify(finalUser)
        );
      }

      setProfile(getProfileFromUser(finalUser));

      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          'Failed to update profile'
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]:
        name === 'taxPercentDefault'
          ? value
          : value,
    }));
  };

  // Save shop and invoice settings.
  const handleSubmit = async (e) => {
    e.preventDefault();

    const tax = Number(formData.taxPercentDefault);

    if (!Number.isFinite(tax) || tax < 0 || tax > 100) {
      toast.error('Tax percentage must be between 0 and 100');
      return;
    }

    if (!formData.invoicePrefix.trim()) {
      toast.error('Invoice prefix is required');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...formData,
        shopName: formData.shopName.trim(),
        invoicePrefix: formData.invoicePrefix.trim(),
        taxPercentDefault: tax,
        gstNumber: formData.gstNumber.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
      };

      await settingsService.update(payload);

      setFormData(payload);
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Failed to save settings'
      );
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
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <FiSettings className="text-indigo-400" />
          Settings
        </h1>

        <p className="text-slate-500 mt-1">
          Configure your profile, shop details and invoice preferences.
        </p>
      </div>

      {/* Shopkeeper profile */}
      <form
        onSubmit={saveProfile}
        className="glass rounded-2xl p-6 space-y-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <FiUser className="text-indigo-400" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">
              Shopkeeper Profile
            </h2>
            <p className="text-sm text-slate-500">
              Update your name, phone and profile photo.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shrink-0">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="Shopkeeper profile"
                className="w-full h-full object-cover"
              />
            ) : (
              (profile.name?.[0] || 'U').toUpperCase()
            )}
          </div>

          <div className="space-y-2">
            <label className="btn-secondary inline-flex items-center gap-2 cursor-pointer">
              <FiCamera />
              Choose photo
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatar}
              />
            </label>

            <p className="text-xs text-slate-500">
              JPG, PNG, WebP or GIF · maximum 1.5 MB
            </p>

            {profile.avatarUrl && (
              <button
                type="button"
                onClick={() =>
                  setProfile((current) => ({
                    ...current,
                    avatarUrl: '',
                  }))
                }
                className="block text-xs text-red-400 hover:text-red-300"
              >
                Remove photo
              </button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="profile-name"
              className="block text-sm text-slate-400 mb-1.5"
            >
              Shopkeeper name *
            </label>

            <input
              id="profile-name"
              name="name"
              value={profile.name}
              onChange={handleProfileChange}
              className="input-modern"
              placeholder="Enter your name"
              required
              maxLength={80}
            />
          </div>

          <div>
            <label
              htmlFor="profile-phone"
              className="block text-sm text-slate-400 mb-1.5"
            >
              Profile phone
            </label>

            <input
              id="profile-phone"
              name="phone"
              type="tel"
              value={profile.phone}
              onChange={handleProfileChange}
              className="input-modern"
              placeholder="Enter phone number"
              maxLength={30}
            />
          </div>

          <div>
            <label
              htmlFor="profile-shop-name"
              className="block text-sm text-slate-400 mb-1.5"
            >
              Shop display name
            </label>

            <input
              id="profile-shop-name"
              name="shopName"
              value={profile.shopName}
              onChange={handleProfileChange}
              className="input-modern"
              placeholder="Enter shop name"
              maxLength={100}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={profileSaving}
          className="btn-primary inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <FiSave />
          {profileSaving ? 'Saving profile...' : 'Save Profile'}
        </button>
      </form>

      {/* Shop settings and invoice preferences */}
      <form
        onSubmit={handleSubmit}
        className="grid lg:grid-cols-2 gap-6"
      >
        {/* Shop details */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <FiHome className="w-5 h-5 text-indigo-400" />
            </div>

            <h2 className="text-lg font-semibold text-white">
              Shop Details
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="settings-shop-name"
                className="block text-sm text-slate-400 mb-1.5"
              >
                Shop Name
              </label>

              <input
                id="settings-shop-name"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                className="input-modern"
                placeholder="Your shop name"
                maxLength={100}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="settings-gst"
                  className="block text-sm text-slate-400 mb-1.5"
                >
                  GST Number
                </label>

                <input
                  id="settings-gst"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  className="input-modern"
                  placeholder="GST number"
                  maxLength={30}
                />
              </div>

              <div>
                <label
                  htmlFor="settings-phone"
                  className="block text-sm text-slate-400 mb-1.5"
                >
                  Phone
                </label>

                <input
                  id="settings-phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-modern"
                  placeholder="Shop phone"
                  maxLength={30}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="settings-address"
                className="block text-sm text-slate-400 mb-1.5"
              >
                Address
              </label>

              <textarea
                id="settings-address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input-modern"
                rows={3}
                placeholder="Shop address"
                maxLength={300}
              />
            </div>
          </div>
        </div>

        {/* Invoice preferences */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <FiSettings className="w-5 h-5 text-indigo-400" />
            </div>

            <h2 className="text-lg font-semibold text-white">
              Invoice Preferences
            </h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="settings-invoice-prefix"
                  className="block text-sm text-slate-400 mb-1.5"
                >
                  Invoice Prefix
                </label>

                <input
                  id="settings-invoice-prefix"
                  name="invoicePrefix"
                  value={formData.invoicePrefix}
                  onChange={handleChange}
                  className="input-modern"
                  placeholder="INV"
                  maxLength={15}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="settings-tax"
                  className="block text-sm text-slate-400 mb-1.5"
                >
                  Default Tax %
                </label>

                <input
                  id="settings-tax"
                  name="taxPercentDefault"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.taxPercentDefault}
                  onChange={handleChange}
                  className="input-modern"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="settings-currency"
                  className="block text-sm text-slate-400 mb-1.5"
                >
                  Currency
                </label>

                <select
                  id="settings-currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="input-modern"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="NPR">NPR (रू)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="settings-printer"
                  className="block text-sm text-slate-400 mb-1.5"
                >
                  Printer Type
                </label>

                <select
                  id="settings-printer"
                  name="printerType"
                  value={formData.printerType}
                  onChange={handleChange}
                  className="input-modern"
                >
                  <option value="a4">A4</option>
                  <option value="thermal80mm">
                    Thermal 80mm
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Save settings */}
        <div className="lg:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FiSave className="w-4 h-4" />
            {saving ? 'Saving settings...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
