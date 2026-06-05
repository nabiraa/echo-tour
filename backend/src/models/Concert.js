const mongoose = require('mongoose');

// ─── CONCERT COLLECTION ───────────────────────────────────────────────────────
// Demonstrates: embedded docs (setlist), references, mixed schema
const concertSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    tourName: { type: String, required: true, index: true },

    // References (normalized — artist/venue data changes independently)
    artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true, index: true },
    venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },

    date: { type: Date, required: true, index: true },
    doors: { type: Date }, // Doors open time

    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled', 'Postponed'],
      default: 'Upcoming',
      index: true,
    },

    // ── EMBEDDED SETLIST ────────────────────────────────────────────────────
    // Embedded because setlist belongs to THIS concert, rarely queried alone
    setlist: [
      {
        order: { type: Number, required: true },
        songTitle: { type: String, required: true },
        duration: { type: Number }, // in seconds
        isEncore: { type: Boolean, default: false },
        specialNote: String, // e.g. "Fan chant", "Choreography unit stage"
      },
    ],

    // ── TICKET TIERS ────────────────────────────────────────────────────────
    ticketTiers: [
      {
        tierName: {
          type: String,
          enum: ['VIP', 'SVIP', 'Floor', 'Category A', 'Category B', 'Category C'],
        },
        price: { type: Number, required: true, min: 0 },
        totalSeats: { type: Number, required: true, min: 1 },
        // availableSeats is modified atomically — see Ticket routes
        availableSeats: { type: Number, required: true, min: 0 },
        currency: { type: String, default: 'USD' },
      },
    ],

    // ── STAFF ────────────────────────────────────────────────────────────────
    staffAssigned: [
      {
        staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
        role: String,
        confirmed: { type: Boolean, default: false },
      },
    ],

    // ── ANALYTICS ────────────────────────────────────────────────────────────
    analytics: {
      totalRevenue: { type: Number, default: 0 },
      ticketsSold: { type: Number, default: 0 },
      attendance: { type: Number, default: 0 },
    },

    notes: String,
  },
  { timestamps: true, collection: 'concerts' }
);

// ── INDEXES ──────────────────────────────────────────────────────────────────
concertSchema.index({ date: 1, status: 1 });
concertSchema.index({ artist: 1, date: -1 });
concertSchema.index({ tourName: 'text', title: 'text' });

// ── VALIDATION: availableSeats cannot exceed totalSeats ──────────────────────
concertSchema.pre('save', function (next) {
  for (const tier of this.ticketTiers) {
    if (tier.availableSeats > tier.totalSeats) {
      return next(new Error(`Available seats cannot exceed total seats for tier: ${tier.tierName}`));
    }
  }
  next();
});

module.exports = mongoose.model('Concert', concertSchema);
