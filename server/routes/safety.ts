import { Router } from 'express';
import { db } from '../db';
import { SafetyReport } from '../../src/types/index';

const router = Router();

router.get('/guidelines', (req, res) => {
  res.json({
    emergencyNotice: 'HumanHelp is not an emergency response service. If you are experiencing an immediate threat or physical danger, please contact local emergency authorities (e.g. 911 or 112) immediately.',
    safetyPillars: [
      {
        title: 'Clear Identity & Verified Evidence',
        description: 'We do not display empty marketing badges. Verification badges specify exactly what license or ID has been reviewed by our compliance team.'
      },
      {
        title: 'In-Platform Communication',
        description: 'Keep all project details and scheduling within HumanHelp messages. Never accept off-platform cash requests to avoid losing dispute protection.'
      },
      {
        title: 'Transparent Pricing Agreement',
        description: 'Fixed and hourly quotes are established upfront. Providers cannot unilaterally impose additional surprise charges without customer sign-off.'
      },
      {
        title: 'Fair Dispute Arbitration',
        description: 'Human administrators, not automated bots, independently review disputed service claims, inspect evidence, and enforce fair resolution.'
      }
    ]
  });
});

router.post('/report', (req, res) => {
  const { reporterId, reportedUserId, bookingId, reason, description } = req.body;
  if (!reporterId || !reportedUserId || !reason || !description) {
    return res.status(400).json({ error: 'Reporter ID, reported user ID, reason, and description are required.' });
  }

  const reporter = db.getUserById(reporterId);
  const reportedUser = db.getUserById(reportedUserId);

  const report: SafetyReport = {
    id: `rep-${Date.now()}`,
    reporterId,
    reporterRole: reporter?.role || 'customer',
    reportedUserId,
    reportedUserName: reportedUser?.fullName || 'User',
    bookingId,
    reason,
    description,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  db.addAuditLog({
    id: `audit-${Date.now()}`,
    adminId: 'system',
    adminName: 'Safety Hotline',
    action: 'SAFETY_REPORT_SUBMITTED',
    targetType: 'user',
    targetId: reportedUserId,
    details: `Reported for ${reason}: "${description}". Filed by ${reporter?.fullName}.`,
    timestamp: new Date().toISOString()
  });

  res.status(201).json({
    message: 'Safety report submitted. Our compliance team will investigate within 12 hours.',
    report
  });
});

export default router;
