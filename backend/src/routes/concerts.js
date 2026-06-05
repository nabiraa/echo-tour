const express = require('express');
const router = express.Router();
const Concert = require('../models/Concert');
const Venue = require('../models/Venue');

// ── GET ALL CONCERTS ──────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { status, artist, tourName, from, to, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (artist) query.artist = artist;
    if (tourName) query.tourName = new RegExp(tourName, 'i');
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [concerts, total] = await Promise.all([
      Concert.find(query)
        .populate('artist', 'stageName agency profileImage')
        .populate('venue', 'name city country capacity')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ date: 1 }),
      Concert.countDocuments(query),
    ]);

    res.json({ success: true, data: concerts, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET SINGLE CONCERT ────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const concert = await Concert.findById(req.params.id)
      .populate('artist')
      .populate('venue')
      .populate('staffAssigned.staffId', 'name role email');
    if (!concert) return res.status(404).json({ success: false, error: 'Concert not found' });
    res.json({ success: true, data: concert });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── CREATE CONCERT ────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const concert = await Concert.create(req.body);
    res.status(201).json({ success: true, data: concert });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ── UPDATE CONCERT ────────────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const concert = await Concert.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!concert) return res.status(404).json({ success: false, error: 'Concert not found' });
    res.json({ success: true, data: concert });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ── DELETE CONCERT ────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const concert = await Concert.findByIdAndDelete(req.params.id);
    if (!concert) return res.status(404).json({ success: false, error: 'Concert not found' });
    res.json({ success: true, message: 'Concert deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ── AGGREGATION PIPELINE: Revenue per Tour ────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
router.get('/analytics/revenue-per-tour', async (req, res) => {
  try {
    const result = await Concert.aggregate([
      // Stage 1: Only completed concerts
      { $match: { status: 'Completed' } },

      // Stage 2: Lookup artist details
      {
        $lookup: {
          from: 'artists',
          localField: 'artist',
          foreignField: '_id',
          as: 'artistInfo',
        },
      },
      { $unwind: '$artistInfo' },

      // Stage 3: Group by tour name and calculate totals
      {
        $group: {
          _id: '$tourName',
          artistName: { $first: '$artistInfo.stageName' },
          totalRevenue: { $sum: '$analytics.totalRevenue' },
          totalTicketsSold: { $sum: '$analytics.ticketsSold' },
          totalAttendance: { $sum: '$analytics.attendance' },
          concertCount: { $sum: 1 },
          avgRevenuePerConcert: { $avg: '$analytics.totalRevenue' },
        },
      },

      // Stage 4: Sort by revenue descending
      { $sort: { totalRevenue: -1 } },

      // Stage 5: Project clean output
      {
        $project: {
          tourName: '$_id',
          artistName: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] },
          totalTicketsSold: 1,
          totalAttendance: 1,
          concertCount: 1,
          avgRevenuePerConcert: { $round: ['$avgRevenuePerConcert', 2] },
          _id: 0,
        },
      },
    ]);

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── AGGREGATION: Attendance by Country ────────────────────────────────────────
router.get('/analytics/attendance-by-country', async (req, res) => {
  try {
    const result = await Concert.aggregate([
      { $match: { status: { $in: ['Completed', 'Ongoing'] } } },
      {
        $lookup: {
          from: 'venues',
          localField: 'venue',
          foreignField: '_id',
          as: 'venueInfo',
        },
      },
      { $unwind: '$venueInfo' },
      {
        $group: {
          _id: '$venueInfo.country',
          totalAttendance: { $sum: '$analytics.attendance' },
          concertCount: { $sum: 1 },
          totalRevenue: { $sum: '$analytics.totalRevenue' },
        },
      },
      { $sort: { totalAttendance: -1 } },
      {
        $project: {
          country: '$_id',
          totalAttendance: 1,
          concertCount: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] },
          _id: 0,
        },
      },
    ]);

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── AGGREGATION: Monthly Revenue Trend ────────────────────────────────────────
router.get('/analytics/monthly-revenue', async (req, res) => {
  try {
    const result = await Concert.aggregate([
      { $match: { status: 'Completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          revenue: { $sum: '$analytics.totalRevenue' },
          concerts: { $sum: 1 },
          tickets: { $sum: '$analytics.ticketsSold' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          period: {
            $concat: [
              { $toString: '$_id.year' }, '-',
              { $cond: [{ $lt: ['$_id.month', 10] }, { $concat: ['0', { $toString: '$_id.month' }] }, { $toString: '$_id.month' }] },
            ],
          },
          revenue: { $round: ['$revenue', 2] },
          concerts: 1,
          tickets: 1,
          _id: 0,
        },
      },
    ]);

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
