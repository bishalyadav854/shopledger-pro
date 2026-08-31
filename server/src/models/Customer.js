import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true, index: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    gstNumber: { type: String, trim: true },
    notes: { type: String, trim: true },
    loyaltyPoints: { type: Number, default: 0 },
    totalPurchased: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    totalDue: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

customerSchema.index({ shop: 1, mobile: 1 }, { unique: true });
customerSchema.index({ name: 'text', mobile: 'text', email: 'text' });

export default mongoose.model('Customer', customerSchema);
