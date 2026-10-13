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
  BookingStatus
} from '../types';
import { clientStorage } from './clientStorage';

const isStaticHosting = typeof window !== 'undefined' && (
  window.location.hostname.includes('github.io') ||
  window.location.protocol === 'file:'
);

const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errorMsg = `API request failed with status ${res.status}`;
    try {
      const errorJson = await res.json();
      if (errorJson.error) errorMsg = errorJson.error;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  auth: {
    getMe: async () => {
      if (isStaticHosting) return clientStorage.auth.getMe();
      try {
        return await request<{ user: UserProfile; providerProfile: ProviderProfile | null }>('/auth/me');
      } catch {
        return clientStorage.auth.getMe();
      }
    },
    switchPersona: async (role: UserRole) => {
      if (isStaticHosting) return clientStorage.auth.switchPersona(role);
      try {
        return await request<{ user: UserProfile; providerProfile: ProviderProfile | null; message: string }>('/auth/switch-persona', {
          method: 'POST',
          body: JSON.stringify({ role }),
        });
      } catch {
        return clientStorage.auth.switchPersona(role);
      }
    },
    login: async (email: string) => {
      if (isStaticHosting) return clientStorage.auth.login(email);
      try {
        return await request<{ user: UserProfile; providerProfile: ProviderProfile | null }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email }),
        });
      } catch {
        return clientStorage.auth.login(email);
      }
    },
    register: async (data: { fullName: string; email: string; role: UserRole; phone?: string; location?: string }) => {
      if (isStaticHosting) return clientStorage.auth.register(data);
      try {
        return await request<{ user: UserProfile }>('/auth/register', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } catch {
        return clientStorage.auth.register(data);
      }
    },
    logout: async () => {
      if (isStaticHosting) return clientStorage.auth.logout();
      try {
        return await request<{ message: string }>('/auth/logout', { method: 'POST' });
      } catch {
        return clientStorage.auth.logout();
      }
    },
  },

  categories: {
    getAll: async () => {
      if (isStaticHosting) return clientStorage.categories.getAll();
      try {
        return await request<ServiceCategory[]>('/categories');
      } catch {
        return clientStorage.categories.getAll();
      }
    },
    create: async (data: Partial<ServiceCategory>) => {
      if (isStaticHosting) return clientStorage.categories.create(data);
      try {
        return await request<ServiceCategory>('/categories', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } catch {
        return clientStorage.categories.create(data);
      }
    },
    update: async (id: string, data: Partial<ServiceCategory>) => {
      if (isStaticHosting) return clientStorage.categories.update(id, data);
      try {
        return await request<ServiceCategory>(`/categories/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        });
      } catch {
        return clientStorage.categories.update(id, data);
      }
    },
  },

  providers: {
    search: async (filters?: {
      q?: string;
      category?: string;
      subcategory?: string;
      priceMin?: number;
      priceMax?: number;
      verifiedOnly?: boolean;
      minRating?: number;
      serviceType?: string;
      deliveryMode?: string;
      isMedicalOnly?: boolean;
      sort?: string;
    }) => {
      if (isStaticHosting) return clientStorage.providers.search(filters);
      try {
        const params = new URLSearchParams();
        if (filters?.q) params.set('q', filters.q);
        if (filters?.category) params.set('category', filters.category);
        if (filters?.subcategory) params.set('subcategory', filters.subcategory);
        if (filters?.priceMin) params.set('priceMin', filters.priceMin.toString());
        if (filters?.priceMax) params.set('priceMax', filters.priceMax.toString());
        if (filters?.verifiedOnly) params.set('verifiedOnly', 'true');
        if (filters?.minRating) params.set('minRating', filters.minRating.toString());
        if (filters?.serviceType) params.set('serviceType', filters.serviceType);
        if (filters?.deliveryMode) params.set('deliveryMode', filters.deliveryMode);
        if (filters?.isMedicalOnly) params.set('isMedicalOnly', 'true');
        if (filters?.sort) params.set('sort', filters.sort);
        
        const queryStr = params.toString() ? `?${params.toString()}` : '';
        return await request<ProviderProfile[]>(`/providers${queryStr}`);
      } catch {
        return clientStorage.providers.search(filters);
      }
    },
    getById: async (id: string) => {
      if (isStaticHosting) return clientStorage.providers.getById(id);
      try {
        return await request<ProviderProfile & { reviews: Review[] }>(`/providers/${id}`);
      } catch {
        return clientStorage.providers.getById(id);
      }
    },
    update: async (id: string, updates: Partial<ProviderProfile>) => {
      if (isStaticHosting) return clientStorage.providers.update(id, updates);
      try {
        return await request<ProviderProfile>(`/providers/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(updates),
        });
      } catch {
        return clientStorage.providers.update(id, updates);
      }
    },
    addService: async (providerId: string, data: Partial<ProviderService>) => {
      if (isStaticHosting) return clientStorage.providers.addService(providerId, data);
      try {
        return await request<ProviderService>(`/providers/${providerId}/services`, {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } catch {
        return clientStorage.providers.addService(providerId, data);
      }
    },
    updateService: async (serviceId: string, updates: Partial<ProviderService>) => {
      if (isStaticHosting) return clientStorage.providers.updateService(serviceId, updates);
      try {
        return await request<ProviderService>(`/providers/services/${serviceId}`, {
          method: 'PATCH',
          body: JSON.stringify(updates),
        });
      } catch {
        return clientStorage.providers.updateService(serviceId, updates);
      }
    },
  },

  bookings: {
    getAll: async (params?: { customerId?: string; providerId?: string; status?: string }) => {
      if (isStaticHosting) return clientStorage.bookings.getAll(params);
      try {
        const q = new URLSearchParams();
        if (params?.customerId) q.set('customerId', params.customerId);
        if (params?.providerId) q.set('providerId', params.providerId);
        if (params?.status) q.set('status', params.status);
        const str = q.toString() ? `?${q.toString()}` : '';
        return await request<Booking[]>(`/bookings${str}`);
      } catch {
        return clientStorage.bookings.getAll(params);
      }
    },
    getById: async (id: string) => {
      if (isStaticHosting) return clientStorage.bookings.getById(id);
      try {
        return await request<Booking>(`/bookings/${id}`);
      } catch {
        return clientStorage.bookings.getById(id);
      }
    },
    create: async (data: {
      customerId: string;
      providerId: string;
      serviceId: string;
      date: string;
      timeSlot: string;
      locationType: 'in_person' | 'remote' | 'delivery';
      serviceAddress?: string;
      problemDescription: string;
      requirements?: string;
      prescriptionNote?: string;
    }) => {
      if (isStaticHosting) return clientStorage.bookings.create(data);
      try {
        return await request<Booking>('/bookings', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } catch {
        return clientStorage.bookings.create(data);
      }
    },
    updateStatus: async (id: string, payload: {
      status: BookingStatus;
      notes?: string;
      cancellationReason?: string;
      alternateProposedDate?: string;
      alternateProposedSlot?: string;
    }) => {
      if (isStaticHosting) return clientStorage.bookings.updateStatus(id, payload);
      try {
        return await request<Booking>(`/bookings/${id}/status`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } catch {
        return clientStorage.bookings.updateStatus(id, payload);
      }
    },
  },

  reviews: {
    getForProvider: async (providerId: string) => {
      if (isStaticHosting) return clientStorage.reviews.getForProvider(providerId);
      try {
        return await request<Review[]>(`/reviews?providerId=${providerId}`);
      } catch {
        return clientStorage.reviews.getForProvider(providerId);
      }
    },
    create: async (data: {
      bookingId: string;
      customerId: string;
      rating: number;
      title: string;
      comment: string;
    }) => {
      if (isStaticHosting) return clientStorage.reviews.create(data);
      try {
        return await request<Review>('/reviews', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } catch {
        return clientStorage.reviews.create(data);
      }
    },
    respond: async (reviewId: string, text: string) => {
      if (isStaticHosting) return clientStorage.reviews.respond(reviewId, text);
      try {
        return await request<Review>(`/reviews/${reviewId}/respond`, {
          method: 'POST',
          body: JSON.stringify({ text }),
        });
      } catch {
        return clientStorage.reviews.respond(reviewId, text);
      }
    },
    report: async (reviewId: string) => {
      if (isStaticHosting) return clientStorage.reviews.report(reviewId);
      try {
        return await request<{ message: string; review: Review }>(`/reviews/${reviewId}/report`, {
          method: 'POST',
        });
      } catch {
        return clientStorage.reviews.report(reviewId);
      }
    },
  },

  verifications: {
    getQueue: async () => {
      if (isStaticHosting) return clientStorage.verifications.getQueue();
      try {
        return await request<Array<VerificationEvidence & { providerName: string; providerAvatar: string; providerRating: number }>>('/verifications');
      } catch {
        return clientStorage.verifications.getQueue();
      }
    },
    submit: async (data: {
      providerId: string;
      documentType: string;
      documentName: string;
      licenseNumber?: string;
      issuingAuthority?: string;
    }) => {
      if (isStaticHosting) return clientStorage.verifications.submit(data);
      try {
        return await request<VerificationEvidence>('/verifications', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } catch {
        return clientStorage.verifications.submit(data);
      }
    },
    review: async (id: string, payload: {
      status: 'approved' | 'rejected';
      adminNotes: string;
      badgeType?: VerificationStatus;
      adminId?: string;
      adminName?: string;
    }) => {
      if (isStaticHosting) return clientStorage.verifications.review(id, payload);
      try {
        return await request<VerificationEvidence>(`/verifications/${id}/review`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } catch {
        return clientStorage.verifications.review(id, payload);
      }
    },
  },

  messages: {
    getConversations: async (userId?: string) => {
      if (isStaticHosting) return clientStorage.messages.getConversations(userId);
      try {
        const q = userId ? `?userId=${userId}` : '';
        return await request<Conversation[]>(`/messages/conversations${q}`);
      } catch {
        return clientStorage.messages.getConversations(userId);
      }
    },
    getThread: async (conversationId: string) => {
      if (isStaticHosting) return clientStorage.messages.getThread(conversationId);
      try {
        return await request<Message[]>(`/messages/thread/${conversationId}`);
      } catch {
        return clientStorage.messages.getThread(conversationId);
      }
    },
    sendMessage: async (data: { conversationId: string; senderId: string; text: string }) => {
      if (isStaticHosting) return clientStorage.messages.sendMessage(data);
      try {
        return await request<Message>('/messages', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } catch {
        return clientStorage.messages.sendMessage(data);
      }
    },
  },

  disputes: {
    getAll: async (params?: { customerId?: string; providerId?: string }) => {
      if (isStaticHosting) return clientStorage.disputes.getAll(params);
      try {
        const q = new URLSearchParams();
        if (params?.customerId) q.set('customerId', params.customerId);
        if (params?.providerId) q.set('providerId', params.providerId);
        const str = q.toString() ? `?${q.toString()}` : '';
        return await request<Dispute[]>(`/disputes${str}`);
      } catch {
        return clientStorage.disputes.getAll(params);
      }
    },
    create: async (data: {
      bookingId: string;
      customerId: string;
      issueCategory: string;
      description: string;
      evidenceNotes?: string;
      requestedResolution: string;
    }) => {
      if (isStaticHosting) return clientStorage.disputes.create(data);
      try {
        return await request<Dispute>('/disputes', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } catch {
        return clientStorage.disputes.create(data);
      }
    },
    resolve: async (id: string, payload: {
      status: string;
      adminDecision: string;
      adminId?: string;
      adminName?: string;
    }) => {
      if (isStaticHosting) return clientStorage.disputes.resolve(id, payload);
      try {
        return await request<Dispute>(`/disputes/${id}/resolve`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } catch {
        return clientStorage.disputes.resolve(id, payload);
      }
    },
  },

  safety: {
    getGuidelines: async () => {
      if (isStaticHosting) return clientStorage.safety.getGuidelines();
      try {
        return await request<{ emergencyNotice: string; safetyPillars: Array<{ title: string; description: string }> }>('/safety/guidelines');
      } catch {
        return clientStorage.safety.getGuidelines();
      }
    },
    report: async (data: {
      reporterId: string;
      reportedUserId: string;
      bookingId?: string;
      reason: string;
      description: string;
    }) => {
      if (isStaticHosting) return clientStorage.safety.report(data);
      try {
        return await request<{ message: string }>('/safety/report', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } catch {
        return clientStorage.safety.report(data);
      }
    },
  },

  ai: {
    chat: async (message: string, conversationHistory?: any[]) => {
      if (isStaticHosting) return clientStorage.ai.chat(message);
      try {
        return await request<{
          reply: string;
          matchedProviders: Array<{
            id: string;
            businessName: string;
            tagline: string;
            rating: number;
            reviewCount: number;
            startingRate: number;
            verificationBadgeLabel: string;
            categoryMatch: string;
            avatarUrl: string;
            matchReason: string;
          }>;
          suggestedAction?: any;
        }>('/ai/assistant', {
          method: 'POST',
          body: JSON.stringify({ message, conversationHistory }),
        });
      } catch {
        return clientStorage.ai.chat(message);
      }
    },
  },

  admin: {
    getMetrics: async () => {
      if (isStaticHosting) return clientStorage.admin.getMetrics();
      try {
        return await request<{
          totalUsers: number;
          totalProviders: number;
          verifiedProviders: number;
          pendingVerifications: number;
          totalBookings: number;
          completedBookings: number;
          activeBookings: number;
          openDisputes: number;
          totalGrossVolume: number;
          trustScoreAverage: number;
        }>('/admin/metrics');
      } catch {
        return clientStorage.admin.getMetrics();
      }
    },
    getAuditLogs: async () => {
      if (isStaticHosting) return clientStorage.admin.getAuditLogs();
      try {
        return await request<AuditLogItem[]>('/admin/audit-logs');
      } catch {
        return clientStorage.admin.getAuditLogs();
      }
    },
    resetDemo: async () => {
      if (isStaticHosting) return clientStorage.admin.resetDemo();
      try {
        return await request<{ message: string }>('/admin/reset-demo', { method: 'POST' });
      } catch {
        return clientStorage.admin.resetDemo();
      }
    },
  },
};
