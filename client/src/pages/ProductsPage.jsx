import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiPackage, FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiAlertTriangle } from 'react-icons/fi';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { formatCurrency } from '../utils/format';

const emptyForm = {
  name: '',
  category: '',
  sku: '',
  sellingPrice: '',
  costPrice: '',
  quantity: '',
  unit: 'pcs',
  lowStockThreshold: 5,
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search, lowStock: lowStockOnly ? 'true' : '' };
      if (categoryFilter) params.category = categoryFilter;
      const res = await productService.getAll(params);
      setProducts(res.data.products || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, lowStockOnly]);

  const loadCategories = useCallback(async () => {
    try {
      const res = await categoryService.getAll();
      setCategories(res.data.data || []);
    } catch (err) {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    const t = setTimeout(loadProducts, 300);
    return () => clearTimeout(t);
  }, [loadProducts]);

  const openAdd = () => {
    setEditing(null);
    setFormData({ ...emptyForm, category: categoryFilter || '' });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p._id);
    setFormData({
      name: p.name || '',
      category: p.category?._id || p.category || '',
      sku: p.sku || '',
      sellingPrice: p.sellingPrice || '',
      costPrice: p.costPrice || '',
      quantity: p.quantity || '',
      unit: p.unit || 'pcs',
      lowStockThreshold: p.lowStockThreshold ?? 5,
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.sellingPrice) {
      toast.error('Name and selling price are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...formData,
        sellingPrice: Number(formData.sellingPrice),
        costPrice: Number(formData.costPrice) || 0,
        quantity: Number(formData.quantity) || 0,
        lowStockThreshold: Number(formData.lowStockThreshold) || 0,
        category: formData.category || undefined,
      };
      if (editing) {
        await productService.update(editing, payload);
        toast.success('Product updated');
      } else {
        await productService.create(payload);
        toast.success('Product added');
      }
      setShowModal(false);
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await productService.delete(id);
      toast.success('Product deleted');
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      await categoryService.create({ name: newCatName.trim() });
      toast.success('Category added');
      setNewCatName('');
      setShowCatModal(false);
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add category');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FiPackage className="text-indigo-400" />
            Products
          </h1>
          <p className="text-slate-500 mt-1">Manage your inventory and product pricing.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCatModal(true)} className="btn-secondary flex items-center gap-2">
            <FiPlus className="w-4 h-4" />
            Category
          </button>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <FiPlus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="input-modern pl-11"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input-modern sm:w-48"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-800 border-slate-700"
          />
          Low stock only
        </label>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50 text-left text-slate-500">
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">SKU</th>
                <th className="px-6 py-4 font-medium">Cost</th>
                <th className="px-6 py-4 font-medium">Selling</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No products found. Add your first product.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isLow = Number(p.quantity) <= Number(p.lowStockThreshold);
                  return (
                    <tr key={p._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-white">{p.name}</p>
                        {p.barcode && <p className="text-xs text-slate-600">{p.barcode}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs">
                          {p.category?.name || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{p.sku || '—'}</td>
                      <td className="px-6 py-4 text-slate-400">{formatCurrency(p.costPrice)}</td>
                      <td className="px-6 py-4 text-white font-medium">{formatCurrency(p.sellingPrice)}</td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1.5 ${isLow ? 'text-orange-400' : 'text-slate-300'}`}>
                          {isLow && <FiAlertTriangle className="w-3.5 h-3.5" />}
                          {p.quantity} {p.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} />
          <div className="relative bg-slate-800 rounded-2xl border border-slate-700/50 w-full max-w-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">
                {editing ? 'Edit Product' : 'Add Product'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Name *</label>
                <input name="name" value={formData.name} onChange={handleChange} className="input-modern" placeholder="Product name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Category</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="input-modern">
                    <option value="">None</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">SKU</label>
                  <input name="sku" value={formData.sku} onChange={handleChange} className="input-modern" placeholder="SKU code" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Selling Price *</label>
                  <input name="sellingPrice" type="number" value={formData.sellingPrice} onChange={handleChange} className="input-modern" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Cost Price</label>
                  <input name="costPrice" type="number" value={formData.costPrice} onChange={handleChange} className="input-modern" placeholder="0.00" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Quantity</label>
                  <input name="quantity" type="number" value={formData.quantity} onChange={handleChange} className="input-modern" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Unit</label>
                  <input name="unit" value={formData.unit} onChange={handleChange} className="input-modern" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Low Stock</label>
                  <input name="lowStockThreshold" type="number" value={formData.lowStockThreshold} onChange={handleChange} className="input-modern" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving...' : editing ? 'Update' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowCatModal(false)} />
          <div className="relative bg-slate-800 rounded-2xl border border-slate-700/50 w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Categories</h2>
              <button onClick={() => setShowCatModal(false)} className="text-slate-500 hover:text-white">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                className="input-modern"
                placeholder="New category name"
              />
              <button onClick={handleAddCategory} className="btn-primary px-4">
                <FiPlus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {categories.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">No categories yet</p>
              ) : (
                categories.map((c) => (
                  <div key={c._id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <span className="text-sm text-white">{c.name}</span>
                    <button
                      onClick={async () => {
                        if (!window.confirm(`Delete category "${c.name}"?`)) return;
                        try {
                          await categoryService.delete(c._id);
                          toast.success('Category deleted');
                          loadCategories();
                        } catch (err) {
                          toast.error(err.response?.data?.message || 'Failed to delete');
                        }
                      }}
                      className="text-slate-500 hover:text-red-400"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
