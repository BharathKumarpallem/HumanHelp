export type UserRole = 'customer' | 'provider' | 'admin';

export type VerificationStatus = 
  | 'not_verified'
  | 'verification_pending'
  | 'identity_checked'
  | 'credentials_checked'
  | 'category_verified'
  | 'verification_rejected';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  location?: string;
  bio?: string;
  createdAt: string;
}

export interface ServiceCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  iconName: string;
  requiresSpecialLicense: boolean;
  activeListingCount: number;
}

export type PricingModel = 'fixed' | 'hourly' | 'quote_required';

export interface ProviderService {
  id: string;
  providerId: string;
  categoryId: string;
  title: string;
  description: string;
  pricingModel: PricingModel;
  basePrice: number;
  durationMinutes?: number;
  serviceRadiusKm: number;
  remoteAvailable: boolean;
  inPersonAvailable: boolean;
  requirements?: string;
  cancellationPolicy: string;
  isActive: boolean;
}

export interface VerificationEvidence {
  id: string;
  providerId: string;
  documentType: 'government_id' | 'trade_license' | 'insurance' | 'certification';
  documentName: string;
  licenseNumber?: string;
  issuingAuthority?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  businessName: string;
  tagline: string;
  bio: string;
  avatarUrl: string;
  categories: string[]; // category IDs or slugs
  serviceArea: string;
  serviceRadiusKm: number;
  languages: string[];
  skills: string[];
  verificationStatus: VerificationStatus;
  verificationBadgeLabel: string;
  verificationDetails?: string;
  rating: number;
  reviewCount: number;
  completedBookingsCount: number;
  isAcceptingBookings: boolean;
  startingRate: number;
  pricingType: 'hourly' | 'fixed';
  responseTimeMinutes: number;
  workingDays: number[]; // 0 = Sun, 1 = Mon ...
  workingHoursStart: string; // "08:00"
  workingHoursEnd: string; // "18:00"
  services?: ProviderService[];
  evidence?: VerificationEvidence[];
}

export type BookingStatus = 
  | 'requested'
  | 'accepted'
  | 'awaiting_customer_confirmation'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'declined'
  | 'disputed';

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  serviceId: string;
  serviceTitle: string;
  categoryId: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:00 AM - 12:00 PM"
  locationType: 'in_person' | 'remote';
  serviceAddress?: string;
  problemDescription: string;
  requirements?: string;
  pricingModel: PricingModel;
  agreedPrice: number;
  platformFee: number;
  totalAmount: number;
  status: BookingStatus;
  statusNotes?: string;
  cancellationReason?: string;
  alternateProposedDate?: string;
  alternateProposedSlot?: string;
  isReviewed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  providerId: string;
  customerId: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  serviceCategory: string;
  createdAt: string;
  providerResponse?: {
    text: string;
    respondedAt: string;
  };
  isReported?: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  bookingId?: string;
  serviceTitle?: string;
  customerId: string;
  customerName: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  lastMessage: string;
  lastMessageTimestamp: string;
  unreadCount: number;
}

export interface Dispute {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  providerId: string;
  providerName: string;
  issueCategory: 'no_show' | 'poor_quality' | 'unauthorized_fee' | 'property_damage' | 'harassment' | 'other';
  description: string;
  evidenceNotes?: string;
  requestedResolution: 'full_refund' | 'partial_refund' | 'service_redo' | 'formal_warning';
  status: 'submitted' | 'under_review' | 'awaiting_info' | 'resolution_proposed' | 'resolved' | 'rejected' | 'escalated';
  adminDecision?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SafetyReport {
  id: string;
  reporterId: string;
  reporterRole: UserRole;
  reportedUserId: string;
  reportedUserName: string;
  bookingId?: string;
  reason: 'safety_violation' | 'harassment' | 'fraud' | 'misrepresentation' | 'other';
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'message' | 'verification' | 'review' | 'dispute' | 'system';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AIAssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  matchedProviders?: Array<{
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
  suggestedAction?: {
    type: 'filter_search' | 'prefill_booking';
    data: any;
  };
}

export interface AuditLogItem {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: 'provider' | 'booking' | 'dispute' | 'review' | 'user';
  targetId: string;
  details: string;
  timestamp: string;
}
