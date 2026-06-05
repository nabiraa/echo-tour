const mongoose = require('mongoose');

// ─── VENUE COLLECTION ─────────────────────────────────────────────────────────
// Demonstrates: geospatial indexing, nested objects
const venueSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, index: true },
    country: { type: String, required: true, index: true },
    address: { type: String },
    // GeoJSON Point — enables geospatial queries ($near, $geoWithin)
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    capacity: {
      type: Number,
      required: true,
      min: [100, 'Venue must hold at least 100 people'],
    },
    venueType: {
      type: String,
      enum: ['Stadium', 'Arena', 'Concert Hall', 'Outdoor Park', 'Theater'],
      required: true,
    },
    facilities: {
      parking: { type: Boolean, default: false },
      accessibility: { type: Boolean, default: true },
      vipLounge: { type: Boolean, default: false },
      medicalStation: { type: Boolean, default: true },
    },
    contactEmail: String,
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'venues' }
);

// Geospatial index — required for $near and $geoWithin queries
venueSchema.index({ location: '2dsphere' });
venueSchema.index({ country: 1, city: 1 });
venueSchema.index({ capacity: -1 }); // Descending — useful for "find largest venues"

module.exports = mongoose.model('Venue', venueSchema);
