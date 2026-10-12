import { Router } from 'express';
import { db } from '../db';
import { Booking, BookingStatus } from '../../src/types/index';

const router = Router();

router.get('/', (req, res) => {
  const { customerId, providerId, status } = req.query;
  let bookings = db.getBookings();

  if (customerId && typeof customerId === 'string') {
    bookings = bookings.filter(b => b.customerId === customerId);
  }

  if (providerId && typeof providerId === 'string') {
    bookings = bookings.filter(b => b.providerId === providerId);
  }

  if (status && typeof status === 'string' && status !== 'all') {
    bookings = bookings.filter(b => b.status === status);
  }

  res.json(bookings);
});

router.get('/:id', (req, res) => {
  const booking = db.getBookingById(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  res.json(booking);
});

router.post('/', (req, res) => {
  const {
    customerId,
    providerId,
    serviceId,
    date,
    timeSlot,
    locationType,
    serviceAddress,
    problemDescription,
    requirements
  } = req.body;

  if (!customerId || !providerId || !serviceId || !date || !timeSlot || !problemDescription) {
    return res.status(400).json({ error: 'Missing required booking fields (service, date, slot, description)' });
  }

  const customer = db.getUserById(customerId);
  const provider = db.getProviderById(providerId);
  const service = db.getServices().find(s => s.id === serviceId);

  if (!customer || !provider || !service) {
    return res.status(404).json({ error: 'Customer, provider, or service could not be found' });
  }

  // Conflict check: check if provider already has a confirmed or in_progress booking for this slot
  const existingConfirmed = db.getBookings().find(b => 
    b.providerId === providerId &&
    b.date === date &&
    b.timeSlot === timeSlot &&
    (b.status === 'confirmed' || b.status === 'in_progress')
  );

  if (existingConfirmed) {
    return res.status(409).json({
      error: 'This provider is already booked for that specific date and time slot. Please choose another available slot.'
    });
  }

  const agreedPrice = service.basePrice;
  const platformFee = Number((agreedPrice * 0.05).toFixed(2)); // Transparent 5% trust fee
  const totalAmount = Number((agreedPrice + platformFee).toFixed(2));

  const newBooking: Booking = {
    id: `bk-${Date.now()}`,
    customerId: customer.id,
    customerName: customer.fullName,
    customerEmail: customer.email,
    providerId: provider.id,
    providerName: provider.businessName,
    providerAvatar: provider.avatarUrl,
    serviceId: service.id,
    serviceTitle: service.title,
    categoryId: service.categoryId,
    date,
    timeSlot,
    locationType: locationType || 'in_person',
    serviceAddress: serviceAddress || customer.location,
    problemDescription,
    requirements,
    pricingModel: service.pricingModel,
    agreedPrice,
    platformFee,
    totalAmount,
    status: 'requested',
    statusNotes: 'Awaiting provider review and acceptance.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.addBooking(newBooking);

  // Notify provider
  db.addNotification({
    id: `notif-${Date.now()}`,
    userId: provider.userId,
    title: 'New Service Booking Request',
    message: `${customer.fullName} requested ${service.title} for ${date} (${timeSlot}).`,
    type: 'booking',
    link: '/provider/dashboard',
    isRead: false,
    createdAt: new Date().toISOString()
  });

  res.status(201).json(newBooking);
});

router.patch('/:id/status', (req, res) => {
  const { id } = req.params;
  const { 
    status, 
    notes, 
    cancellationReason, 
    alternateProposedDate, 
    alternateProposedSlot 
  } = req.body as { 
    status: BookingStatus; 
    notes?: string; 
    cancellationReason?: string;
    alternateProposedDate?: string;
    alternateProposedSlot?: string;
  };

  const booking = db.getBookingById(id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const updates: Partial<Booking> = {
    status,
    statusNotes: notes || booking.statusNotes,
  };

  if (cancellationReason) {
    updates.cancellationReason = cancellationReason;
  }
  if (alternateProposedDate) {
    updates.alternateProposedDate = alternateProposedDate;
  }
  if (alternateProposedSlot) {
    updates.alternateProposedSlot = alternateProposedSlot;
  }

  // If customer confirms alternate time
  if (status === 'confirmed' && booking.alternateProposedDate && booking.alternateProposedSlot) {
    updates.date = booking.alternateProposedDate;
    updates.timeSlot = booking.alternateProposedSlot;
    updates.alternateProposedDate = undefined;
    updates.alternateProposedSlot = undefined;
  }

  // If completing booking, increment provider's completed booking counter
  if (status === 'completed' && booking.status !== 'completed') {
    const prov = db.getProviderById(booking.providerId);
    if (prov) {
      db.updateProvider(prov.id, {
        completedBookingsCount: (prov.completedBookingsCount || 0) + 1
      });
    }
  }

  const updated = db.updateBooking(id, updates);

  // Generate appropriate notification
  const provider = db.getProviderById(booking.providerId);
  if (provider) {
    let notifyUserId = booking.customerId;
    let notifTitle = `Booking Status: ${status.replace(/_/g, ' ')}`;
    let notifMsg = `Your booking for ${booking.serviceTitle} is now ${status.replace(/_/g, ' ')}.`;

    if (status === 'accepted') {
      notifMsg = `${booking.providerName} accepted your booking for ${booking.date}!`;
    } else if (status === 'awaiting_customer_confirmation') {
      notifMsg = `${booking.providerName} proposed an alternate time: ${alternateProposedDate} at ${alternateProposedSlot}.`;
    } else if (status === 'completed') {
      notifMsg = `Service marked complete! You are now eligible to leave a verified review.`;
    }

    db.addNotification({
      id: `notif-${Date.now()}`,
      userId: notifyUserId,
      title: notifTitle,
      message: notifMsg,
      type: 'booking',
      link: '/bookings',
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  res.json(updated);
});

export default router;
