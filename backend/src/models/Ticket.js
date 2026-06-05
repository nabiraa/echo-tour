const mongoose = require('mongoose');

// ─── TICKET COLLECTION ────────────────────────────────────────────────────────
// Demonstrates: transactions, concurrency control, atomic ops
const ticketSchema = new mongoose.Schema(
  {
    concert: { type: mongoose.Schema.Types.ObjectId, ref: 'Concert', required: true, index: true },
    tierName: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'USD' },

    // Buyer info (embedded — no separate Users collection needed for this scope)
    buyer: {
      name: { type: String, required: true, trim: true },
      email: {
        type: String,
        required: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
      },
      phone: String,
      country: String,
    },

    status: {
      type: String,
      enum: ['Reserved', 'Confirmed', 'Cancelled', 'Refunded', 'Used'],
      default: 'Reserved',
      index: true,
    },

    bookingRef: {
      type: String,
      unique: true,
      sparse:true // Auto-generated in pre-save hook
    },

    seatNumber: String, // Optional — for assigned seating venues
    paymentMethod: { type: String, enum: ['Card', 'PayPal', 'Bank Transfer', 'Crypto'] },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },

    purchasedAt: { type: Date, default: Date.now },
    checkedInAt: Date,
  },
  { timestamps: true, collection: 'tickets' }
);

// ── INDEXES ──────────────────────────────────────────────────────────────────
ticketSchema.index({ concert: 1, status: 1 });
ticketSchema.index({ 'buyer.email': 1 });
// ticketSchema.index({ bookingRef: 1 }, { unique: true });

// ── AUTO-GENERATE BOOKING REFERENCE ──────────────────────────────────────────
ticketSchema.pre('save', function (next) {
  if (!this.bookingRef) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.bookingRef = `ECHO-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);
