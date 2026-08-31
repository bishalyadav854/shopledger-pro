import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    shopName: { type: String, trim: true },
    logoUrl: { type: String, trim: true },
    gstNumber: { type: String, trim: true },
    invoicePrefix: { type: String, default: 'INV', trim: true },
    taxPercentDefault: { type: Number, default: 0, min: 0, max: 100 },
    currency: { type: String, default: 'INR', trim: true },
    printerType: { type: String, enum: ['a4', 'thermal80mm'], default: 'a4' },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model('Settings', settingsSchema);
