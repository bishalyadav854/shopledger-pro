import mongoose from 'mongoose';

// Used to generate sequential invoice numbers per shop, e.g. INV-0001, INV-0002...
const counterSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g. `invoice_${shopId}`
  seq: { type: Number, default: 0 },
});

counterSchema.statics.getNextSequence = async function getNextSequence(key) {
  const doc = await this.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return doc.seq;
};

export default mongoose.model('Counter', counterSchema);
