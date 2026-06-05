require('dotenv').config();
const mongoose = require('mongoose');
const Artist = require('../models/Artist');
const Venue = require('../models/Venue');
const Concert = require('../models/Concert');
const Staff = require('../models/Staff');
const Ticket = require('../models/Ticket');

const connectDB = require('../config/database');

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');

  // Clear existing data
  await Promise.all([
    Artist.deleteMany({}),
    Venue.deleteMany({}),
    Concert.deleteMany({}),
    Staff.deleteMany({}),
    Ticket.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // ── ARTISTS ──────────────────────────────────────────────────────────────────
  const artists = await Artist.insertMany([
    {
      stageName: 'BTS',
      realName: 'Bangtan Sonyeondan',
      nationality: 'South Korea',
      genre: ['K-Pop', 'Hip-Hop', 'R&B'],
      debutYear: 2013,
      agency: 'HYBE',
      members: [
        { name: 'RM', role: 'Leader', nationality: 'South Korea' },
        { name: 'Jin', role: 'Vocalist', nationality: 'South Korea' },
        { name: 'Suga', role: 'Rapper', nationality: 'South Korea' },
        { name: 'J-Hope', role: 'Dancer', nationality: 'South Korea' },
        { name: 'Jimin', role: 'Vocalist', nationality: 'South Korea' },
        { name: 'V', role: 'Visual', nationality: 'South Korea' },
        { name: 'Jungkook', role: 'Maknae', nationality: 'South Korea' },
      ],
      socialMedia: {
        instagram: { followers: 78000000, handle: '@bts.bighitofficial' },
        twitter: { followers: 45000000, handle: '@BTS_twt' },
        youtube: { subscribers: 75000000, channelId: 'UCLkAepWjdylmXSltofFvsYQ' },
      },
      isActive: true,
    },
    {
      stageName: 'BLACKPINK',
      realName: 'Blackpink',
      nationality: 'South Korea',
      genre: ['K-Pop', 'Dance-Pop', 'Hip-Hop'],
      debutYear: 2016,
      agency: 'YG Entertainment',
      members: [
        { name: 'Jisoo', role: 'Vocalist', nationality: 'South Korea' },
        { name: 'Jennie', role: 'All-rounder', nationality: 'South Korea' },
        { name: 'Rosé', role: 'Vocalist', nationality: 'Australia' },
        { name: 'Lisa', role: 'Dancer', nationality: 'Thailand' },
      ],
      socialMedia: {
        instagram: { followers: 95000000, handle: '@blackpinkofficial' },
        youtube: { subscribers: 92000000, channelId: 'UCOmHUn--16B90oW2L6FRR3A' },
      },
      isActive: true,
    },
    {
      stageName: 'TWICE',
      nationality: 'South Korea',
      genre: ['K-Pop', 'Pop', 'Dance-Pop'],
      debutYear: 2015,
      agency: 'JYP Entertainment',
      members: [
        { name: 'Nayeon', role: 'Vocalist' },
        { name: 'Jihyo', role: 'Leader' },
        { name: 'Tzuyu', role: 'Visual', nationality: 'Taiwan' },
        { name: 'Sana', role: 'Vocalist', nationality: 'Japan' },
      ],
      isActive: true,
    },
  ]);
  console.log(`✅ Created ${artists.length} artists`);

  // ── VENUES ────────────────────────────────────────────────────────────────────
  const venues = await Venue.insertMany([
    {
      name: 'SoFi Stadium',
      city: 'Los Angeles',
      country: 'USA',
      address: '1001 Stadium Dr, Inglewood, CA 90301',
      location: { type: 'Point', coordinates: [-118.3379, 33.9535] },
      capacity: 70000,
      venueType: 'Stadium',
      facilities: { parking: true, accessibility: true, vipLounge: true, medicalStation: true },
    },
    {
      name: 'Tokyo Dome',
      city: 'Tokyo',
      country: 'Japan',
      address: '1-3-61 Koraku, Bunkyo City, Tokyo',
      location: { type: 'Point', coordinates: [139.7516, 35.7056] },
      capacity: 55000,
      venueType: 'Stadium',
      facilities: { parking: true, accessibility: true, vipLounge: true, medicalStation: true },
    },
    {
      name: 'Wembley Stadium',
      city: 'London',
      country: 'UK',
      address: 'Wembley, London HA9 0WS',
      location: { type: 'Point', coordinates: [-0.2795, 51.5560] },
      capacity: 90000,
      venueType: 'Stadium',
      facilities: { parking: true, accessibility: true, vipLounge: true, medicalStation: true },
    },
    {
      name: 'Barclays Center',
      city: 'New York',
      country: 'USA',
      address: '620 Atlantic Ave, Brooklyn, NY 11217',
      location: { type: 'Point', coordinates: [-73.9754, 40.6826] },
      capacity: 19000,
      venueType: 'Arena',
      facilities: { parking: true, accessibility: true, vipLounge: true, medicalStation: true },
    },
    {
      name: 'Accor Arena',
      city: 'Paris',
      country: 'France',
      address: '8 Bd de Bercy, 75012 Paris',
      location: { type: 'Point', coordinates: [2.3789, 48.8393] },
      capacity: 20300,
      venueType: 'Arena',
      facilities: { parking: false, accessibility: true, vipLounge: true, medicalStation: true },
    },
  ]);
  console.log(`✅ Created ${venues.length} venues`);

  // ── STAFF ─────────────────────────────────────────────────────────────────────
  const staff = await Staff.insertMany([
    { name: 'James Park', email: 'james.park@echo.com', role: 'Stage Manager', country: 'USA', experienceYears: 8, isAvailable: true, salary: { amount: 5000, currency: 'USD', per: 'Event' } },
    { name: 'Mia Tanaka', email: 'mia.tanaka@echo.com', role: 'Sound Engineer', country: 'Japan', experienceYears: 12, isAvailable: true, salary: { amount: 4500, currency: 'USD', per: 'Event' } },
    { name: 'Carlos Ruiz', email: 'carlos.ruiz@echo.com', role: 'Security', country: 'USA', experienceYears: 5, isAvailable: true, salary: { amount: 200, currency: 'USD', per: 'Day' } },
    { name: 'Sophie Chen', email: 'sophie.chen@echo.com', role: 'PR Manager', country: 'UK', experienceYears: 7, isAvailable: true, salary: { amount: 6000, currency: 'USD', per: 'Event' } },
  ]);
  console.log(`✅ Created ${staff.length} staff`);

  // ── CONCERTS ──────────────────────────────────────────────────────────────────
  const concerts = await Concert.insertMany([
    {
      title: 'BTS World Tour: Permission to Dance - LA Night 1',
      tourName: 'Permission to Dance On Stage',
      artist: artists[0]._id,
      venue: venues[0]._id,
      date: new Date('2024-11-15T19:00:00Z'),
      status: 'Completed',
      setlist: [
        { order: 1, songTitle: 'ON', duration: 210, isEncore: false },
        { order: 2, songTitle: 'DNA', duration: 208, isEncore: false },
        { order: 3, songTitle: 'Dynamite', duration: 199, isEncore: false },
        { order: 4, songTitle: 'Boy With Luv', duration: 230, isEncore: false },
        { order: 5, songTitle: 'Butter', duration: 164, isEncore: true },
        { order: 6, songTitle: 'Permission to Dance', duration: 187, isEncore: true },
      ],
      ticketTiers: [
        { tierName: 'SVIP', price: 450, totalSeats: 500, availableSeats: 23, currency: 'USD' },
        { tierName: 'VIP', price: 280, totalSeats: 2000, availableSeats: 0, currency: 'USD' },
        { tierName: 'Floor', price: 180, totalSeats: 5000, availableSeats: 0, currency: 'USD' },
        { tierName: 'Category A', price: 120, totalSeats: 15000, availableSeats: 234, currency: 'USD' },
        { tierName: 'Category B', price: 80, totalSeats: 20000, availableSeats: 1200, currency: 'USD' },
        { tierName: 'Category C', price: 50, totalSeats: 27500, availableSeats: 3400, currency: 'USD' },
      ],
      staffAssigned: [
        { staffId: staff[0]._id, role: 'Stage Manager', confirmed: true },
        { staffId: staff[1]._id, role: 'Sound Engineer', confirmed: true },
      ],
      analytics: { totalRevenue: 8250000, ticketsSold: 65843, attendance: 64200 },
    },
    {
      title: 'BLACKPINK BORN PINK World Tour - Tokyo Night 1',
      tourName: 'BORN PINK World Tour',
      artist: artists[1]._id,
      venue: venues[1]._id,
      date: new Date('2024-12-10T18:30:00Z'),
      status: 'Completed',
      setlist: [
        { order: 1, songTitle: 'Pink Venom', duration: 196, isEncore: false },
        { order: 2, songTitle: 'Shut Down', duration: 176, isEncore: false },
        { order: 3, songTitle: 'How You Like That', duration: 193, isEncore: false },
        { order: 4, songTitle: 'DDU-DU DDU-DU', duration: 222, isEncore: false },
        { order: 5, songTitle: 'Kill This Love', duration: 196, isEncore: true },
      ],
      ticketTiers: [
        { tierName: 'SVIP', price: 600, totalSeats: 300, availableSeats: 0, currency: 'USD' },
        { tierName: 'VIP', price: 320, totalSeats: 1500, availableSeats: 0, currency: 'USD' },
        { tierName: 'Floor', price: 200, totalSeats: 4000, availableSeats: 0, currency: 'USD' },
        { tierName: 'Category A', price: 140, totalSeats: 12000, availableSeats: 0, currency: 'USD' },
        { tierName: 'Category B', price: 90, totalSeats: 20000, availableSeats: 0, currency: 'USD' },
        { tierName: 'Category C', price: 60, totalSeats: 17200, availableSeats: 0, currency: 'USD' },
      ],
      analytics: { totalRevenue: 6900000, ticketsSold: 55000, attendance: 54800 },
    },
    {
      title: 'BTS Permission to Dance - New York',
      tourName: 'Permission to Dance On Stage',
      artist: artists[0]._id,
      venue: venues[3]._id,
      date: new Date('2025-03-20T19:00:00Z'),
      status: 'Upcoming',
      setlist: [
        { order: 1, songTitle: 'ON', duration: 210 },
        { order: 2, songTitle: 'Butter', duration: 164 },
        { order: 3, songTitle: 'Dynamite', duration: 199 },
      ],
      ticketTiers: [
        { tierName: 'VIP', price: 350, totalSeats: 500, availableSeats: 120, currency: 'USD' },
        { tierName: 'Floor', price: 200, totalSeats: 3000, availableSeats: 1450, currency: 'USD' },
        { tierName: 'Category A', price: 130, totalSeats: 8000, availableSeats: 3200, currency: 'USD' },
        { tierName: 'Category B', price: 85, totalSeats: 7500, availableSeats: 4100, currency: 'USD' },
      ],
      analytics: { totalRevenue: 0, ticketsSold: 0, attendance: 0 },
    },
    {
      title: 'TWICE Ready to Be - London',
      tourName: 'Ready to Be World Tour',
      artist: artists[2]._id,
      venue: venues[2]._id,
      date: new Date('2025-04-05T18:00:00Z'),
      status: 'Upcoming',
      setlist: [
        { order: 1, songTitle: 'CHEER UP', duration: 215 },
        { order: 2, songTitle: 'TT', duration: 205 },
        { order: 3, songTitle: 'FANCY', duration: 211 },
      ],
      ticketTiers: [
        { tierName: 'VIP', price: 300, totalSeats: 800, availableSeats: 420, currency: 'GBP' },
        { tierName: 'Category A', price: 150, totalSeats: 20000, availableSeats: 12000, currency: 'GBP' },
        { tierName: 'Category B', price: 90, totalSeats: 40000, availableSeats: 28000, currency: 'GBP' },
        { tierName: 'Category C', price: 60, totalSeats: 29200, availableSeats: 20000, currency: 'GBP' },
      ],
      analytics: { totalRevenue: 0, ticketsSold: 0, attendance: 0 },
    },
  ]);
  console.log(`✅ Created ${concerts.length} concerts`);

  // ── SAMPLE TICKETS ────────────────────────────────────────────────────────────
  const sampleBuyers = [
    { name: 'Aisha Khan', email: 'aisha.khan@gmail.com', country: 'Pakistan', phone: '+92-300-1234567' },
    { name: 'Emily Johnson', email: 'emily.j@outlook.com', country: 'USA', phone: '+1-555-0101' },
    { name: 'Yuki Suzuki', email: 'yuki.s@yahoo.co.jp', country: 'Japan', phone: '+81-90-1234-5678' },
  ];

  const ticketData = sampleBuyers.map((buyer, i) => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return {
      bookingRef: `ECHO-${timestamp}-${random}`,
      concert: concerts[0]._id,
      tierName: ['VIP', 'Floor', 'Category A'][i],
      price: [280, 180, 120][i],
      currency: 'USD',
      buyer,
      status: 'Confirmed',
      paymentMethod: 'Card',
      paymentStatus: 'Paid',
    };
  });

  await Ticket.insertMany(ticketData);
  console.log(`✅ Created sample tickets`);

  console.log('\n🎉 Database seeded successfully!');
  console.log('📊 Summary:');
  console.log(`   Artists: ${artists.length}`);
  console.log(`   Venues: ${venues.length}`);
  console.log(`   Concerts: ${concerts.length}`);
  console.log(`   Staff: ${staff.length}`);

  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
