import { Router } from 'express';
import { db } from '../db';
import { Review } from '../../src/types/index';

const router = Router();

// GET reviews (optional ?providerId=...)
router.get('/', (req, res) => {
  const { providerId } = req.query;
  const reviews = db.getReviews(providerId as string);
  res.json(reviews);
});

// POST submit review (Strict check: MUST have completed booking)
router.post('/', (req, res) => {
  const { bookingId, customerId, rating, title, comment } = req.body;

  if (!bookingId || !customerId || !rating || !title || !comment) {
    return res.status(400).json({ error: 'Missing required review fields (booking, rating, title, comment)' });
  }

  // 1. Verify booking exists
  const booking = db.getBookingById(bookingId);
  if (!booking) {
    return res.status(404).json({ error: 'Valid booking record not found.' });
  }

  // 2. Verify booking customer
  if (booking.customerId !== customerId) {
    return res.status(403).json({ error: 'Unauthorized: you can only review bookings made from your own account.' });
  }

  // 3. Verify booking is completed (Strict Trust Principle!)
  if (booking.status !== 'completed') {
    return res.status(400).json({ 
      error: `Reviews can only be submitted after a service is marked completed. Current status: ${booking.status}.` 
    });
  }

  // 4. Check for duplicate review
  const existingReviews = db.getReviews(booking.providerId);
  const alreadyReviewed = existingReviews.some(r => r.bookingId === bookingId);
  if (alreadyReviewed || booking.isReviewed) {
    return res.status(409).json({ error: 'A review has already been submitted for this completed booking.' });
  }

  const customer = db.getUserById(customerId);
  const provider = db.getProviderById(booking.providerId);

  const newReview: Review = {
    id: `rev-${Date.now()}`,
    bookingId: booking.id,
    providerId: booking.providerId,
    customerId: customer?.id || customerId,
    customerName: customer?.fullName || 'Verified Customer',
    rating: Number(rating),
    title,
    comment,
    serviceCategory: booking.categoryId,
    createdAt: new Date().toISOString()
  };

  db.addReview(newReview);

  // Notify provider
  if (provider) {
    db.addNotification({
      id: `notif-${Date.now()}`,
      userId: provider.userId,
      title: 'New Customer Review',
      message: `${customer?.fullName} left a ${rating}-star review on "${booking.serviceTitle}".`,
      type: 'review',
      link: '/provider/dashboard',
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  res.status(201).json(newReview);
});

// POST provider response
router.post('/:id/respond', (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Response text is required' });
  }

  const updated = db.updateReview(id, {
    providerResponse: {
      text,
      respondedAt: new Date().toISOString()
    }
  });

  if (!updated) {
    return res.status(404).json({ error: 'Review not found' });
  }

  res.json(updated);
});

// POST report review for moderation
router.post('/:id/report', (req, res) => {
  const { id } = req.params;
  const updated = db.updateReview(id, { isReported: true });
  if (!updated) {
    return res.status(404).json({ error: 'Review not found' });
  }

  db.addAuditLog({
    id: `audit-${Date.now()}`,
    adminId: 'system',
    adminName: 'Automated Moderation Queue',
    action: 'FLAG_REVIEW',
    targetType: 'review',
    targetId: id,
    details: 'Customer or provider flagged review for moderation investigation.',
    timestamp: new Date().toISOString()
  });

  res.json({ message: 'Review reported for administrative moderation.', review: updated });
});

export default router;
