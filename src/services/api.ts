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
    getMe: () => request<{ user: UserProfile; providerProfile: ProviderProfile | null }>('/auth/me'),
    switchPersona: (role: UserRole) => request<{ user: UserProfile; providerProfile: ProviderProfile | null; message: string }>('/auth/switch-persona', {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),
    login: (email: string) => request<{ user: UserProfile; providerProfile: ProviderProfile | null }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
    register: (data: { fullName: string; email: string; role: UserRole; phone?: string; location?: string }) => 
      request<{ user: UserProfile }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),
  },

  categories: {
    getAll: () => request<ServiceCategory[]>('/categories'),
    create: (data: Partial<ServiceCategory>) => request<ServiceCategory>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: Partial<ServiceCategory>) => request<ServiceCategory>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  },

  providers: {
    search: (filters?: {
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
      return request<ProviderProfile[]>(`/providers${queryStr}`);
    },
    getById: (id: string) => request<ProviderProfile & { reviews: Review[] }>(`/providers/${id}`),
    update: (id: string, updates: Partial<ProviderProfile>) => request<ProviderProfile>(`/providers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
    addService: (providerId: string, data: Partial<ProviderService>) => request<ProviderService>(`/providers/${providerId}/services`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    updateService: (serviceId: string, updates: Partial<ProviderService>) => request<ProviderService>(`/providers/services/${serviceId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  },

  bookings: {
    getAll: (params?: { customerId?: string; providerId?: string; status?: string }) => {
      const q = new URLSearchParams();
      if (params?.customerId) q.set('customerId', params.customerId);
      if (params?.providerId) q.set('providerId', params.providerId);
      if (params?.status) q.set('status', params.status);
      const str = q.toString() ? `?${q.toString()}` : '';
      return request<Booking[]>(`/bookings${str}`);
    },
    getById: (id: string) => request<Booking>(`/bookings/${id}`),
    create: (data: {
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
    }) => request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    updateStatus: (id: string, payload: {
      status: BookingStatus;
      notes?: string;
      cancellationReason?: string;
      alternateProposedDate?: string;
      alternateProposedSlot?: string;
    }) => request<Booking>(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  },

  reviews: {
    getForProvider: (providerId: string) => request<Review[]>(`/reviews?providerId=${providerId}`),
    create: (data: {
      bookingId: string;
      customerId: string;
      rating: number;
      title: string;
      comment: string;
    }) => request<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    respond: (reviewId: string, text: string) => request<Review>(`/reviews/${reviewId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),
    report: (reviewId: string) => request<{ message: string; review: Review }>(`/reviews/${reviewId}/report`, {
      method: 'POST',
    }),
  },

  verifications: {
    getQueue: () => request<Array<VerificationEvidence & { providerName: string; providerAvatar: string; providerRating: number }>>('/verifications'),
    submit: (data: {
      providerId: string;
      documentType: string;
      documentName: string;
      licenseNumber?: string;
      issuingAuthority?: string;
    }) => request<VerificationEvidence>('/verifications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    review: (id: string, payload: {
      status: 'approved' | 'rejected';
      adminNotes: string;
      badgeType?: VerificationStatus;
      adminId?: string;
      adminName?: string;
    }) => request<VerificationEvidence>(`/verifications/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  },

  messages: {
    getConversations: (userId?: string) => {
      const q = userId ? `?userId=${userId}` : '';
      return request<Conversation[]>(`/messages/conversations${q}`);
    },
    getThread: (conversationId: string) => request<Message[]>(`/messages/thread/${conversationId}`),
    sendMessage: (data: { conversationId: string; senderId: string; text: string }) => request<Message>('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },

  disputes: {
    getAll: (params?: { customerId?: string; providerId?: string }) => {
      const q = new URLSearchParams();
      if (params?.customerId) q.set('customerId', params.customerId);
      if (params?.providerId) q.set('providerId', params.providerId);
      const str = q.toString() ? `?${q.toString()}` : '';
      return request<Dispute[]>(`/disputes${str}`);
    },
    create: (data: {
      bookingId: string;
      customerId: string;
      issueCategory: string;
      description: string;
      evidenceNotes?: string;
      requestedResolution: string;
    }) => request<Dispute>('/disputes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    resolve: (id: string, payload: {
      status: string;
      adminDecision: string;
      adminId?: string;
      adminName?: string;
    }) => request<Dispute>(`/disputes/${id}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  },

  safety: {
    getGuidelines: () => request<{ emergencyNotice: string; safetyPillars: Array<{ title: string; description: string }> }>('/safety/guidelines'),
    report: (data: {
      reporterId: string;
      reportedUserId: string;
      bookingId?: string;
      reason: string;
      description: string;
    }) => request<{ message: string }>('/safety/report', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },

  ai: {
    chat: (message: string, conversationHistory?: any[]) => request<{
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
    }),
  },

  admin: {
    getMetrics: () => request<{
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
    }>('/admin/metrics'),
    getAuditLogs: () => request<AuditLogItem[]>('/admin/audit-logs'),
    resetDemo: () => request<{ message: string }>('/admin/reset-demo', { method: 'POST' }),
  },
};
