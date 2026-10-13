import { 
  UserProfile, 
  ServiceCategory, 
  ProviderProfile, 
  ProviderService, 
  Booking, 
  Review, 
  Conversation, 
  Message, 
  Dispute, 
  VerificationEvidence, 
  AuditLogItem, 
  UserRole,
  VerificationStatus,
  BookingStatus,
  NotificationItem
} from '../types';

import {
  initialUsers,
  initialCategories,
  initialProviderProfiles,
  initialProviderServices,
  initialBookings,
  initialReviews,
  initialConversations,
  initialMessages,
  initialVerificationQueue,
  initialDisputes,
  initialAuditLogs,
  initialNotifications
} from '../../server/data/initialData';

const STORAGE_KEY = 'humanhelp_client_db';
const USER_KEY = 'humanhelp_active_user_id';

interface ClientDatabaseSchema {
  users: UserProfile[];
  categories: ServiceCategory[];
  providers: ProviderProfile[];
  services: ProviderService[];
  bookings: Booking[];
  reviews: Review[];
  conversations: Conversation[];
  messages: Message[];
  verificationQueue: VerificationEvidence[];
  disputes: Dispute[];
  auditLogs: AuditLogItem[];
  notifications: NotificationItem[];
}

function loadData(): ClientDatabaseSchema {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed loading client db from localStorage', e);
  }
  return resetData();
}

function saveData(data: ClientDatabaseSchema) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed saving to localStorage', e);
  }
}

function resetData(): ClientDatabaseSchema {
  const fresh: ClientDatabaseSchema = {
    users: [...initialUsers],
    categories: [...initialCategories],
    providers: [...initialProviderProfiles],
    services: [...initialProviderServices],
    bookings: [...initialBookings],
    reviews: [...initialReviews],
    conversations: [...initialConversations],
    messages: [...initialMessages],
    verificationQueue: [...initialVerificationQueue],
    disputes: [...initialDisputes],
    auditLogs: [...initialAuditLogs],
    notifications: [...initialNotifications],
  };
  saveData(fresh);
  return fresh;
}

let db = loadData();

export const clientStorage = {
  reset: () => {
    db = resetData();
  },

  auth: {
    getMe: () => {
      const activeId = localStorage.getItem(USER_KEY) || 'user-cust-1';
      const user = db.users.find(u => u.id === activeId) || db.users[0];
      const providerProfile = user.role === 'provider' 
        ? db.providers.find(p => p.userId === user.id) || null 
        : null;
      return { user, providerProfile };
    },
    switchPersona: (role: UserRole) => {
      let targetId = 'user-cust-1';
      if (role === 'provider') targetId = 'user-prov-1';
      else if (role === 'admin') targetId = 'user-admin-1';
      
      const user = db.users.find(u => u.id === targetId) || db.users[0];
      localStorage.setItem(USER_KEY, user.id);
      const providerProfile = user.role === 'provider' 
        ? db.providers.find(p => p.userId === user.id) || null 
        : null;
      return { user, providerProfile, message: `Switched persona to ${user.fullName} (${user.role})` };
    },
    login: (email: string) => {
      const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) throw new Error('User not found');
      localStorage.setItem(USER_KEY, user.id);
      const providerProfile = user.role === 'provider' 
        ? db.providers.find(p => p.userId === user.id) || null 
        : null;
      return { user, providerProfile };
    },
    register: (data: { fullName: string; email: string; role: UserRole; phone?: string; location?: string }) => {
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        phone: data.phone || '',
        location: data.location || 'Metropolitan Area',
        createdAt: new Date().toISOString()
      };
      db.users.push(newUser);
      saveData(db);
      localStorage.setItem(USER_KEY, newUser.id);
      return { user: newUser };
    },
    logout: () => {
      localStorage.setItem(USER_KEY, 'user-cust-1');
      return { message: 'Signed out' };
    }
  },

  categories: {
    getAll: () => db.categories,
    create: (cat: Partial<ServiceCategory>) => {
      const newCat: ServiceCategory = {
        id: `cat-${Date.now()}`,
        slug: (cat.name || 'category').toLowerCase().replace(/\s+/g, '-'),
        name: cat.name || 'New Category',
        description: cat.description || '',
        iconName: cat.iconName || 'Wrench',
        requiresSpecialLicense: !!cat.requiresSpecialLicense,
        subcategories: cat.subcategories || [],
        allowedDeliveryModes: cat.allowedDeliveryModes || ['in_person'],
        activeListingCount: 0,
        isActive: true,
      };
      db.categories.push(newCat);
      saveData(db);
      return newCat;
    },
    update: (id: string, updates: Partial<ServiceCategory>) => {
      const idx = db.categories.findIndex(c => c.id === id);
      if (idx !== -1) {
        db.categories[idx] = { ...db.categories[idx], ...updates };
        saveData(db);
        return db.categories[idx];
      }
      throw new Error('Category not found');
    }
  },

  providers: {
    search: (filters?: any) => {
      let results = db.providers.map(p => {
        const services = db.services.filter(s => s.providerId === p.id && s.isActive);
        const evidence = db.verificationQueue.filter(e => e.providerId === p.id);
        return { ...p, services, evidence };
      });

      if (filters?.q) {
        const query = filters.q.toLowerCase();
        results = results.filter(p => 
          p.businessName.toLowerCase().includes(query) ||
          p.tagline.toLowerCase().includes(query) ||
          p.skills.some(s => s.toLowerCase().includes(query)) ||
          p.services?.some(s => s.title.toLowerCase().includes(query))
        );
      }

      if (filters?.category) {
        results = results.filter(p => p.categories.includes(filters.category));
      }

      if (filters?.priceMax) {
        const max = Number(filters.priceMax);
        results = results.filter(p => p.startingRate <= max);
      }

      if (filters?.minRating) {
        const min = Number(filters.minRating);
        results = results.filter(p => p.rating >= min);
      }

      if (filters?.verifiedOnly) {
        results = results.filter(p => p.verificationStatus !== 'not_verified' && p.verificationStatus !== 'verification_rejected');
      }

      return results;
    },
    getById: (id: string) => {
      const p = db.providers.find(prov => prov.id === id);
      if (!p) throw new Error('Provider not found');
      const services = db.services.filter(s => s.providerId === p.id && s.isActive);
      const evidence = db.verificationQueue.filter(e => e.providerId === p.id);
      const reviews = db.reviews.filter(r => r.providerId === id);
      return { ...p, services, evidence, reviews };
    },
    update: (id: string, updates: Partial<ProviderProfile>) => {
      const idx = db.providers.findIndex(p => p.id === id);
      if (idx !== -1) {
        db.providers[idx] = { ...db.providers[idx], ...updates };
        saveData(db);
        return db.providers[idx];
      }
      throw new Error('Provider not found');
    },
    addService: (providerId: string, data: Partial<ProviderService>) => {
      const s: ProviderService = {
        id: `srv-${Date.now()}`,
        providerId,
        categoryId: data.categoryId || 'cat-home',
        title: data.title || 'New Service',
        description: data.description || '',
        pricingModel: data.pricingModel || 'hourly',
        basePrice: data.basePrice || 50,
        serviceRadiusKm: data.serviceRadiusKm || 25,
        deliveryMode: data.deliveryMode || 'in_person',
        remoteAvailable: !!data.remoteAvailable,
        inPersonAvailable: !!data.inPersonAvailable,
        cancellationPolicy: data.cancellationPolicy || 'Free cancellation up to 24 hours prior.',
        isActive: true,
      };
      db.services.push(s);
      saveData(db);
      return s;
    },
    updateService: (serviceId: string, updates: Partial<ProviderService>) => {
      const idx = db.services.findIndex(s => s.id === serviceId);
      if (idx !== -1) {
        db.services[idx] = { ...db.services[idx], ...updates };
        saveData(db);
        return db.services[idx];
      }
      throw new Error('Service not found');
    }
  },

  bookings: {
    getAll: (params?: { customerId?: string; providerId?: string; status?: string }) => {
      let bks = [...db.bookings];
      if (params?.customerId) bks = bks.filter(b => b.customerId === params.customerId);
      if (params?.providerId) bks = bks.filter(b => b.providerId === params.providerId);
      if (params?.status) bks = bks.filter(b => b.status === params.status);
      return bks;
    },
    getById: (id: string) => {
      const b = db.bookings.find(item => item.id === id);
      if (!b) throw new Error('Booking not found');
      return b;
    },
    create: (data: any) => {
      const customer = db.users.find(u => u.id === data.customerId);
      const provider = db.providers.find(p => p.id === data.providerId);
      const service = db.services.find(s => s.id === data.serviceId);

      const basePrice = service ? service.basePrice : provider?.startingRate || 75;
      const platformFee = Math.round(basePrice * 0.1);
      const totalAmount = basePrice + platformFee;

      const newBooking: Booking = {
        id: `bk-${Date.now()}`,
        customerId: data.customerId,
        customerName: customer ? customer.fullName : 'Alex Rivera',
        customerEmail: customer ? customer.email : 'alex@example.com',
        providerId: data.providerId,
        providerName: provider ? provider.businessName : 'Service Provider',
        providerAvatar: provider ? provider.avatarUrl : '',
        serviceId: data.serviceId,
        serviceTitle: service ? service.title : 'General Consultation',
        categoryId: service?.categoryId || 'cat-home',
        deliveryMode: service?.deliveryMode || 'in_person',
        date: data.date,
        timeSlot: data.timeSlot,
        locationType: data.locationType || 'in_person',
        serviceAddress: data.serviceAddress || 'Client Provided Address',
        problemDescription: data.problemDescription,
        requirements: data.requirements,
        pricingModel: service?.pricingModel || 'hourly',
        agreedPrice: basePrice,
        platformFee,
        totalAmount,
        status: 'requested',
        statusNotes: 'Booking request dispatched to service provider.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.bookings.unshift(newBooking);
      saveData(db);
      return newBooking;
    },
    updateStatus: (id: string, payload: {
      status: BookingStatus;
      notes?: string;
      cancellationReason?: string;
      alternateProposedDate?: string;
      alternateProposedSlot?: string;
    }) => {
      const idx = db.bookings.findIndex(b => b.id === id);
      if (idx !== -1) {
        db.bookings[idx] = {
          ...db.bookings[idx],
          ...payload,
          updatedAt: new Date().toISOString()
        };
        saveData(db);
        return db.bookings[idx];
      }
      throw new Error('Booking not found');
    }
  },

  reviews: {
    getForProvider: (providerId: string) => db.reviews.filter(r => r.providerId === providerId),
    create: (data: { bookingId: string; customerId: string; rating: number; title: string; comment: string }) => {
      const booking = db.bookings.find(b => b.id === data.bookingId);
      const customer = db.users.find(u => u.id === data.customerId);
      const newReview: Review = {
        id: `rev-${Date.now()}`,
        bookingId: data.bookingId,
        providerId: booking?.providerId || 'prov-profile-1',
        customerId: data.customerId,
        customerName: customer?.fullName || 'Verified Customer',
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        serviceCategory: booking?.categoryId || 'cat-home',
        createdAt: new Date().toISOString()
      };
      db.reviews.unshift(newReview);
      if (booking) booking.isReviewed = true;
      saveData(db);
      return newReview;
    },
    respond: (reviewId: string, text: string) => {
      const r = db.reviews.find(rev => rev.id === reviewId);
      if (r) {
        r.providerResponse = { text, respondedAt: new Date().toISOString() };
        saveData(db);
        return r;
      }
      throw new Error('Review not found');
    },
    report: (reviewId: string) => {
      const r = db.reviews.find(rev => rev.id === reviewId);
      if (r) {
        r.isReported = true;
        saveData(db);
        return { message: 'Review reported', review: r };
      }
      throw new Error('Review not found');
    }
  },

  verifications: {
    getQueue: () => {
      return db.verificationQueue.map(v => {
        const p = db.providers.find(prov => prov.id === v.providerId);
        return {
          ...v,
          providerName: p ? p.businessName : 'Unknown Provider',
          providerAvatar: p ? p.avatarUrl : '',
          providerRating: p ? p.rating : 5.0,
        };
      });
    },
    submit: (data: any) => {
      const evidence: VerificationEvidence = {
        id: `ev-${Date.now()}`,
        providerId: data.providerId,
        documentType: data.documentType,
        documentName: data.documentName,
        licenseNumber: data.licenseNumber,
        issuingAuthority: data.issuingAuthority,
        submittedAt: new Date().toISOString(),
        status: 'pending'
      };
      db.verificationQueue.unshift(evidence);
      saveData(db);
      return evidence;
    },
    review: (id: string, payload: {
      status: 'approved' | 'rejected';
      adminNotes: string;
      badgeType?: VerificationStatus;
      adminId?: string;
      adminName?: string;
    }) => {
      const idx = db.verificationQueue.findIndex(v => v.id === id);
      if (idx !== -1) {
        db.verificationQueue[idx].status = payload.status;
        db.verificationQueue[idx].adminNotes = payload.adminNotes;
        
        const provIdx = db.providers.findIndex(p => p.id === db.verificationQueue[idx].providerId);
        if (provIdx !== -1) {
          if (payload.status === 'approved') {
            db.providers[provIdx].verificationStatus = payload.badgeType || 'credentials_checked';
            db.providers[provIdx].verificationBadgeLabel = payload.badgeType === 'category_verified'
              ? 'Category Board Certified'
              : 'Verified License Holder';
          } else {
            db.providers[provIdx].verificationStatus = 'verification_rejected';
          }
        }
        saveData(db);
        return db.verificationQueue[idx];
      }
      throw new Error('Evidence not found');
    }
  },

  messages: {
    getConversations: (userId?: string) => {
      if (!userId) return db.conversations;
      const prov = db.providers.find(p => p.userId === userId);
      return db.conversations.filter(c => c.customerId === userId || (prov && c.providerId === prov.id));
    },
    getThread: (conversationId: string) => {
      return db.messages
        .filter(m => m.conversationId === conversationId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    },
    sendMessage: (data: { conversationId: string; senderId: string; text: string }) => {
      const user = db.users.find(u => u.id === data.senderId);
      const msg: Message = {
        id: `msg-${Date.now()}`,
        conversationId: data.conversationId,
        senderId: data.senderId,
        senderName: user ? user.fullName : 'You',
        senderRole: user ? user.role : 'customer',
        text: data.text,
        timestamp: new Date().toISOString(),
        isRead: false
      };
      db.messages.push(msg);
      const conv = db.conversations.find(c => c.id === data.conversationId);
      if (conv) {
        conv.lastMessage = data.text;
        conv.lastMessageTimestamp = msg.timestamp;
      }
      saveData(db);
      return msg;
    }
  },

  disputes: {
    getAll: (params?: { customerId?: string; providerId?: string }) => {
      let disp = [...db.disputes];
      if (params?.customerId) disp = disp.filter(d => d.customerId === params.customerId);
      if (params?.providerId) disp = disp.filter(d => d.providerId === params.providerId);
      return disp;
    },
    create: (data: any) => {
      const b = db.bookings.find(bk => bk.id === data.bookingId);
      const customer = db.users.find(u => u.id === data.customerId);
      const newDispute: Dispute = {
        id: `disp-${Date.now()}`,
        bookingId: data.bookingId,
        customerId: data.customerId,
        customerName: customer ? customer.fullName : 'Customer',
        providerId: b ? b.providerId : 'prov-profile-1',
        providerName: b ? b.providerName : 'Provider',
        issueCategory: data.issueCategory,
        description: data.description,
        evidenceNotes: data.evidenceNotes,
        requestedResolution: data.requestedResolution,
        status: 'submitted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.disputes.unshift(newDispute);
      if (b) b.status = 'disputed';
      saveData(db);
      return newDispute;
    },
    resolve: (id: string, payload: { status: string; adminDecision: string }) => {
      const d = db.disputes.find(disp => disp.id === id);
      if (d) {
        d.status = payload.status as any;
        d.adminDecision = payload.adminDecision;
        d.updatedAt = new Date().toISOString();
        saveData(db);
        return d;
      }
      throw new Error('Dispute not found');
    }
  },

  safety: {
    getGuidelines: () => ({
      emergencyNotice: 'HumanHelp connects users with independent service providers. In the event of imminent threat, severe medical distress, or urgent life safety danger, call 911 / emergency dispatch immediately.',
      safetyPillars: [
        { title: 'Credential Audits', description: 'Trade and clinical professionals submit documented credentials before receiving trust badges.' },
        { title: 'Transparent Pricing', description: 'All fees and terms are agreed upon prior to dispatch.' },
        { title: 'Fair Human Arbitration', description: 'Real compliance officers investigate and resolve disputes.' },
      ]
    }),
    report: (data: any) => {
      return { message: 'Incident report received by safety compliance team.' };
    }
  },

  ai: {
    chat: (message: string) => {
      const q = message.toLowerCase();
      let matched = db.providers.filter(p => 
        p.businessName.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.skills.some(s => q.includes(s.toLowerCase())) ||
        (q.includes('electric') && p.categories.includes('cat-home')) ||
        (q.includes('plumb') && p.categories.includes('cat-home')) ||
        (q.includes('doctor') && p.categories.includes('cat-health')) ||
        (q.includes('tutor') && p.categories.includes('cat-edu')) ||
        (q.includes('tech') && p.categories.includes('cat-tech'))
      );

      if (matched.length === 0) {
        matched = db.providers.slice(0, 3);
      }

      const top = matched.slice(0, 3).map(p => ({
        id: p.id,
        businessName: p.businessName,
        tagline: p.tagline,
        rating: p.rating,
        reviewCount: p.reviewCount,
        startingRate: p.startingRate,
        verificationBadgeLabel: p.verificationBadgeLabel,
        categoryMatch: p.categories[0],
        avatarUrl: p.avatarUrl,
        matchReason: `Verified specialist • Credential: ${p.verificationBadgeLabel}`,
      }));

      const reply = `I verified our active database and matched ${top.length} authenticated professional(s):\n\n` +
        top.map((p, i) => `${i + 1}. **${p.businessName}** — ${p.tagline} (Starting at **$${p.startingRate}**, Rating: **${p.rating}★**). Credential: *${p.verificationBadgeLabel}*`).join('\n\n') +
        `\n\nWould you like to review availability or request an appointment?`;

      return {
        reply,
        matchedProviders: top,
        suggestedAction: top[0] ? { type: 'prefill_booking', data: { providerId: top[0].id, providerName: top[0].businessName } } : undefined,
      };
    }
  },

  admin: {
    getMetrics: () => {
      return {
        totalUsers: db.users.length,
        totalProviders: db.providers.length,
        verifiedProviders: db.providers.filter(p => p.verificationStatus !== 'not_verified').length,
        pendingVerifications: db.verificationQueue.filter(v => v.status === 'pending').length,
        totalBookings: db.bookings.length,
        completedBookings: db.bookings.filter(b => b.status === 'completed').length,
        activeBookings: db.bookings.filter(b => b.status === 'requested' || b.status === 'accepted' || b.status === 'confirmed').length,
        openDisputes: db.disputes.filter(d => d.status !== 'resolved' && d.status !== 'rejected').length,
        totalGrossVolume: db.bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
        trustScoreAverage: 4.92,
      };
    },
    getAuditLogs: () => db.auditLogs,
    resetDemo: () => {
      clientStorage.reset();
      return { message: 'Demonstration dataset reset successfully' };
    }
  }
};
