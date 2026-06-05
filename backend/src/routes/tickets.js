const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const Concert = require('../models/Concert');

// ── GET ALL TICKETS (with filters) ───────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { concert, status, email, page = 1, limit = 20 } = req.query;
    const query = {};
    if (concert) query.concert = concert;
    if (status) query.status = status;
    if (email) query['buyer.email'] = email.toLowerCase();

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [tickets, total] = await Promise.all([
      Ticket.find(query)
        .populate('concert', 'title date tourName')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ purchasedAt: -1 }),
      Ticket.countDocuments(query),
    ]);

    res.json({ success: true, data: tickets, total });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── LOOKUP BY BOOKING REF ─────────────────────────────────────────────────────
router.get('/ref/:bookingRef', async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ bookingRef: req.params.bookingRef }).populate('concert');
    if (!ticket) return res.status(404).json({ success: false, error: 'Booking not found' });
    res.json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ── BOOK TICKET — ATOMIC CONCURRENCY CONTROL + TRANSACTION ────────────────────
// ══════════════════════════════════════════════════════════════════════════════
// This is the most critical route — it prevents overselling using:
// 1. findOneAndUpdate with $inc (atomic — happens in one DB operation)
// 2. Multi-document transaction for ticket creation + seat decrement
// 3. $gte: 1 condition ensures we only decrement if seats are available

router.post('/book', async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { concertId, tierName, buyer, paymentMethod } = req.body;

    // ── STEP 1: Atomically decrement available seats ──────────────────────────
    // The $gte: 1 condition is the concurrency lock — only succeeds if seats > 0
    // This is equivalent to an optimistic lock: no seat can be double-booked
    const updatedConcert = await Concert.findOneAndUpdate(
      {
        _id: concertId,
        'ticketTiers.tierName': tierName,
        'ticketTiers.availableSeats': { $gte: 1 }, // ATOMIC CHECK — prevents overselling
      },
      {
        $inc: { 'ticketTiers.$.availableSeats': -1 }, // Decrement atomically
      },
      {
        new: true,
        session, // Part of transaction
      }
    );

    if (!updatedConcert) {
      await session.abortTransaction();
      return res.status(409).json({
        success: false,
        error: 'No seats available for this tier. Please try another category.',
      });
    }

    // Find the tier to get the price
    const tier = updatedConcert.ticketTiers.find((t) => t.tierName === tierName);

    // ── STEP 2: Create ticket record ──────────────────────────────────────────
    const [ticket] = await Ticket.create(
      [
        {
          concert: concertId,
          tierName,
          price: tier.price,
          currency: tier.currency,
          buyer,
          paymentMethod,
          status: 'Confirmed',
          paymentStatus: 'Paid',
        },
      ],
      { session }
    );

    // ── STEP 3: Update concert analytics ─────────────────────────────────────
    await Concert.findByIdAndUpdate(
      concertId,
      {
        $inc: {
          'analytics.ticketsSold': 1,
          'analytics.totalRevenue': tier.price,
        },
      },
      { session }
    );

    // ── STEP 4: Commit transaction ────────────────────────────────────────────
    await session.commitTransaction();

    res.status(201).json({
      success: true,
      data: ticket,
      message: `Booking confirmed! Reference: ${ticket.bookingRef}`,
    });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ success: false, error: err.message });
  } finally {
    session.endSession();
  }
});

// ── CANCEL TICKET ─────────────────────────────────────────────────────────────
router.put('/:id/cancel', async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const ticket = await Ticket.findById(req.params.id).session(session);
    if (!ticket) { await session.abortTransaction(); return res.status(404).json({ success: false, error: 'Ticket not found' }); }
    if (ticket.status === 'Cancelled') { await session.abortTransaction(); return res.status(400).json({ success: false, error: 'Already cancelled' }); }

    // Mark ticket as cancelled
    ticket.status = 'Cancelled';
    ticket.paymentStatus = 'Refunded';
    await ticket.save({ session });

    // Restore the seat atomically
    await Concert.findOneAndUpdate(
      { _id: ticket.concert, 'ticketTiers.tierName': ticket.tierName },
      {
        $inc: {
          'ticketTiers.$.availableSeats': 1,
          'analytics.ticketsSold': -1,
          'analytics.totalRevenue': -ticket.price,
        },
      },
      { session }
    );

    await session.commitTransaction();
    res.json({ success: true, message: 'Ticket cancelled and seat restored', data: ticket });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ success: false, error: err.message });
  } finally {
    session.endSession();
  }
});

// ── CHECK-IN TICKET ───────────────────────────────────────────────────────────
router.put('/:id/checkin', async (req, res) => {
  try {
    const ticket = await Ticket.findOneAndUpdate(
      { _id: req.params.id, status: 'Confirmed' },
      { status: 'Used', checkedInAt: new Date() },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found or not confirmed' });

    // Update attendance
    await Concert.findByIdAndUpdate(ticket.concert, { $inc: { 'analytics.attendance': 1 } });

    res.json({ success: true, message: 'Check-in successful', data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
