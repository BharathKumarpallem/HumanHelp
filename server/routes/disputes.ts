import { Router } from 'express';
import { db } from '../db';
import { Dispute } from '../../src/types/index';

const router = Router();

// GET all disputes (for admin or user)
router.get('/', (req, res) => {
  const { customerId, providerId } = req.query;
  let disputes = db.getDisputes();

  if (customerId && typeof customerId === 'string') {
    disputes = disputes.filter(d => d.customerId === customerId);
  }
  if (providerId && typeof providerId === 'string') {
    disputes = disputes.filter(d => d.providerId === providerId);
  }

  res.json(disputes);
});

// POST submit a new dispute
router.post('/', (req, res) => {
  const {
    bookingId,
    customerId,
    issueCategory,
    description,
    evidenceNotes,
    requestedResolution
  } = req.body;

  if (!bookingId || !customerId || !issueCategory || !description || !requestedResolution) {
    return res.status(400).json({ error: 'Missing required dispute details' });
  }

  const booking = db.getBookingById(bookingId);
  if (!booking) {
    return res.status(404).json({ error: 'Booking record not found' });
  }

  const customer = db.getUserById(customerId);

  const newDispute: Dispute = {
    id: `disp-${Date.now()}`,
    bookingId,
    customerId,
    customerName: customer?.fullName || 'Customer',
    providerId: booking.providerId,
    providerName: booking.providerName,
    issueCategory,
    description,
    evidenceNotes,
    requestedResolution,
    status: 'submitted',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.addDispute(newDispute);

  // Mark booking status as disputed
  db.updateBooking(bookingId, { status: 'disputed', statusNotes: `Dispute opened: ${issueCategory}` });

  // Add audit log
  db.addAuditLog({
    id: `audit-${Date.now()}`,
    adminId: 'system',
    adminName: 'Platform Intake',
    action: 'DISPUTE_FILED',
    targetType: 'dispute',
    targetId: newDispute.id,
    details: `Customer filed dispute (${issueCategory}) on booking ${bookingId}. Requested: ${requestedResolution}.`,
    timestamp: new Date().toISOString()
  });

  res.status(201).json(newDispute);
});

// PATCH resolve or update dispute (Admin human arbitration)
router.patch('/:id/resolve', (req, res) => {
  const { id } = req.params;
  const { status, adminDecision, adminId, adminName } = req.body;

  if (!status || !adminDecision) {
    return res.status(400).json({ error: 'Resolution status and administrative decision are required.' });
  }

  const updated = db.updateDispute(id, {
    status,
    adminDecision
  });

  if (!updated) {
    return res.status(404).json({ error: 'Dispute record not found' });
  }

  // Audit log
  db.addAuditLog({
    id: `audit-${Date.now()}`,
    adminId: adminId || 'user-admin-1',
    adminName: adminName || 'Marcus Vance',
    action: 'DISPUTE_RESOLVED',
    targetType: 'dispute',
    targetId: id,
    details: `Resolved dispute with status "${status}". Decision: ${adminDecision}`,
    timestamp: new Date().toISOString()
  });

  // Notify customer
  db.addNotification({
    id: `notif-${Date.now()}`,
    userId: updated.customerId,
    title: 'Dispute Case Update',
    message: `Your dispute on booking ${updated.bookingId} has been updated: ${adminDecision}`,
    type: 'dispute',
    link: '/safety',
    isRead: false,
    createdAt: new Date().toISOString()
  });

  res.json(updated);
});

export default router;
