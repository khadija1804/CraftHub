const cron = require('node-cron');
const Booking = require('../models/booking');
const Workshop = require('../models/workshop');

// Toutes les 10 secondes (test). Pour la prod: '* * * * *'
cron.schedule('*/10 * * * * *', async () => {
  try {
    const now = new Date();
    const toExpire = await Booking.find({
      status: 'pending',
      expiresAt: { $lte: now }
    }).lean();

    console.log(`[expireBookings] ${now.toISOString()} -> ${toExpire.length} booking(s) à expirer`);

    for (const b of toExpire) {
      const ws = await Workshop.findById(b.workshopId).select('places');
      if (ws) {
        ws.places += b.quantity;
        await ws.save();
      }
      await Booking.updateOne({ _id: b._id }, { $set: { status: 'expired' } });
      console.log(`[expireBookings] -> expired ${b._id}, rendu ${b.quantity} place(s)`);
    }
  } catch (err) {
    console.error('[expireBookings] error:', err.message);
  }
});