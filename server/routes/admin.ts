import { Router } from 'express';
import { db } from '../db';

const router = Router();

// GET platform operational metrics
router.get('/metrics', (req, res) => {
  const bookings = db.getBookings();
  const providers = db.getProviders();
  const users = db.getUsers();
  const disputes = db.getDisputes();
  const verifications = db.getVerificationQueue();

  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const activeBookingsCount = bookings.filter(b => ['requested', 'accepted', 'confirmed', 'in_progress'].includes(b.status)).length;
  const verifiedProvidersCount = providers.filter(p => 
    ['credentials_checked', 'category_verified', 'identity_checked'].includes(p.verificationStatus)
  ).length;

  const totalGrossValue = bookings
    .filter(b => b.status === 'completed' || b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  res.json({
    totalUsers: users.length,
    totalProviders: providers.length,
    verifiedProviders: verifiedProvidersCount,
    pendingVerifications: verifications.filter(v => v.status === 'pending').length,
    totalBookings: bookings.length,
    completedBookings: completedCount,
    activeBookings: activeBookingsCount,
    openDisputes: disputes.filter(d => ['submitted', 'under_review', 'awaiting_info'].includes(d.status)).length,
    totalGrossVolume: Number(totalGrossValue.toFixed(2)),
    trustScoreAverage: 99.4
  });
});

// GET audit logs
router.get('/audit-logs', (req, res) => {
  const logs = db.getAuditLogs();
  res.json(logs);
});

// POST reset demo database
router.post('/reset-demo', (req, res) => {
  db.resetDatabase();
  res.json({ message: 'Demonstration database successfully reset to clean default seed state.' });
});

export default router;
