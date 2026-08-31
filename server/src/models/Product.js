import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', index: true },
    sku: { type: String, trim: true },
    barcode: { type: String, trim: true },
    sellingPrice: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, default: 0, min: 0 },
    quantity: { type: Number, default: 0, min: 0 },
    unit: { type: String, default: 'pcs', trim: true },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ shop: 1, sku: 1 }, { unique: true, sparse: true });
productSchema.index({ name: 'text', sku: 'text', barcode: 'text' });

export default mongoose.model('Product', productSchema);
