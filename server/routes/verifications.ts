import { Router } from 'express';
import { db } from '../db';
import { VerificationEvidence, VerificationStatus } from '../../src/types/index';

const router = Router();

// GET all submissions in verification queue (for admin)
router.get('/', (req, res) => {
  const queue = db.getVerificationQueue();
  // Enrich with provider and user info
  const enriched = queue.map(item => {
    const provider = db.getProviderById(item.providerId);
    return {
      ...item,
      providerName: provider?.businessName || 'Unknown Provider',
      providerAvatar: provider?.avatarUrl || '',
      providerRating: provider?.rating || 0
    };
  });
  res.json(enriched);
});

// POST submit evidence for verification
router.post('/', (req, res) => {
  const { providerId, documentType, documentName, licenseNumber, issuingAuthority } = req.body;
  if (!providerId || !documentType || !documentName) {
    return res.status(400).json({ error: 'Provider ID, document type, and file name are required' });
  }

  const provider = db.getProviderById(providerId);
  if (!provider) {
    return res.status(404).json({ error: 'Provider not found' });
  }

  const newEvidence: VerificationEvidence = {
    id: `ev-${Date.now()}`,
    providerId,
    documentType,
    documentName,
    licenseNumber: licenseNumber || '',
    issuingAuthority: issuingAuthority || '',
    submittedAt: new Date().toISOString(),
    status: 'pending',
    adminNotes: 'Submitted for administrative compliance review.'
  };

  db.addVerificationEvidence(newEvidence);

  // Update provider verification status to pending if not already checked
  if (provider.verificationStatus === 'not_verified' || provider.verificationStatus === 'verification_rejected') {
    db.updateProvider(providerId, {
      verificationStatus: 'verification_pending',
      verificationBadgeLabel: 'Verification In Progress'
    });
  }

  res.status(201).json(newEvidence);
});

// PATCH admin review decision (Approve / Reject)
router.patch('/:id/review', (req, res) => {
  const { id } = req.params;
  const { status, adminNotes, badgeType, adminId, adminName } = req.body as {
    status: 'approved' | 'rejected';
    adminNotes: string;
    badgeType?: VerificationStatus;
    adminId?: string;
    adminName?: string;
  };

  const queue = db.getVerificationQueue();
  const item = queue.find(e => e.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Verification submission not found' });
  }

  const updatedEvidence = db.updateVerificationEvidence(id, {
    status,
    adminNotes: adminNotes || (status === 'approved' ? 'Verified by platform administrator.' : 'Rejected.')
  });

  const provider = db.getProviderById(item.providerId);
  if (provider) {
    if (status === 'approved') {
      const assignedBadge: VerificationStatus = badgeType || 'credentials_checked';
      let label = 'Verified Credentials';
      if (item.licenseNumber) {
        label = `Verified License #${item.licenseNumber}`;
      } else if (item.documentType === 'government_id') {
        label = 'Identity Checked';
      }

      db.updateProvider(provider.id, {
        verificationStatus: assignedBadge,
        verificationBadgeLabel: label,
        verificationDetails: `${item.issuingAuthority || 'Registry'} verified on ${new Date().toLocaleDateString()}. Notes: ${adminNotes || 'Compliant'}`
      });

      // Audit Log
      db.addAuditLog({
        id: `audit-${Date.now()}`,
        adminId: adminId || 'user-admin-1',
        adminName: adminName || 'Marcus Vance',
        action: 'APPROVE_VERIFICATION',
        targetType: 'provider',
        targetId: provider.id,
        details: `Approved ${item.documentType} (${item.documentName}) for ${provider.businessName}. Assigned badge: ${label}`,
        timestamp: new Date().toISOString()
      });

      // Notify provider
      db.addNotification({
        id: `notif-${Date.now()}`,
        userId: provider.userId,
        title: 'Verification Approved!',
        message: `Your credentials have been verified by compliance. Your profile now features the ${label} badge.`,
        type: 'verification',
        link: '/provider/dashboard',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    } else {
      db.updateProvider(provider.id, {
        verificationStatus: 'verification_rejected',
        verificationBadgeLabel: 'Verification Unsuccessful',
        verificationDetails: adminNotes || 'Documentation did not meet verification standards.'
      });

      // Audit Log
      db.addAuditLog({
        id: `audit-${Date.now()}`,
        adminId: adminId || 'user-admin-1',
        adminName: adminName || 'Marcus Vance',
        action: 'REJECT_VERIFICATION',
        targetType: 'provider',
        targetId: provider.id,
        details: `Rejected submission for ${provider.businessName}. Reason: ${adminNotes}`,
        timestamp: new Date().toISOString()
      });

      // Notify provider
      db.addNotification({
        id: `notif-${Date.now()}`,
        userId: provider.userId,
        title: 'Verification Feedback',
        message: `Your verification submission requires revisions: ${adminNotes}`,
        type: 'verification',
        link: '/provider/dashboard',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }
  }

  res.json(updatedEvidence);
});

export default router;
