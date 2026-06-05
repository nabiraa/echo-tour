const mongoose = require('mongoose');

// ─── STAFF COLLECTION ─────────────────────────────────────────────────────────
const staffSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    role: {
      type: String,
      required: true,
      enum: ['Stage Manager', 'Security', 'Sound Engineer', 'Lighting Tech', 'Merchandising', 'Medical', 'Transport', 'Backstage Crew', 'PR Manager'],
    },
    phone: String,
    country: String,
    experienceYears: { type: Number, default: 0, min: 0 },
    isAvailable: { type: Boolean, default: true, index: true },
    // Which concerts this staff member has worked
    concertsWorked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Concert' }],
    salary: {
      amount: Number,
      currency: { type: String, default: 'USD' },
      per: { type: String, enum: ['Hour', 'Day', 'Event'], default: 'Event' },
    },
  },
  { timestamps: true, collection: 'staff' }
);

staffSchema.index({ role: 1, isAvailable: 1 });

module.exports = mongoose.model('Staff', staffSchema);
