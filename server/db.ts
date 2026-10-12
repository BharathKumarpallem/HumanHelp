import fs from 'fs';
import path from 'path';
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
  NotificationItem
} from '../src/types/index';

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
} from './data/initialData';

interface DatabaseSchema {
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

const DB_FILE = path.join(process.cwd(), 'server', 'data', 'db.json');

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('[DB] Failed reading db.json, initializing fresh data...', err);
    }
    return this.createInitialData();
  }

  private createInitialData(): DatabaseSchema {
    const data: DatabaseSchema = {
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
    this.saveDatabase(data);
    return data;
  }

  private saveDatabase(dataToSave?: DatabaseSchema) {
    try {
      const data = dataToSave || this.data;
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Failed writing to db.json:', err);
    }
  }

  public resetDatabase(): void {
    this.data = this.createInitialData();
  }

  // Users
  public getUsers(): UserProfile[] {
    return this.data.users;
  }

  public getUserById(id: string): UserProfile | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): UserProfile | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public addUser(user: UserProfile): UserProfile {
    this.data.users.push(user);
    this.saveDatabase();
    return user;
  }

  public updateUser(id: string, updates: Partial<UserProfile>): UserProfile | null {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.saveDatabase();
    return this.data.users[idx];
  }

  // Categories
  public getCategories(): ServiceCategory[] {
    return this.data.categories;
  }

  public addCategory(cat: ServiceCategory): ServiceCategory {
    this.data.categories.push(cat);
    this.saveDatabase();
    return cat;
  }

  public updateCategory(id: string, updates: Partial<ServiceCategory>): ServiceCategory | null {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
    this.saveDatabase();
    return this.data.categories[idx];
  }

  // Providers
  public getProviders(): ProviderProfile[] {
    return this.data.providers.map(p => {
      const services = this.data.services.filter(s => s.providerId === p.id && s.isActive);
      const evidence = this.data.verificationQueue.filter(e => e.providerId === p.id);
      return { ...p, services, evidence };
    });
  }

  public getProviderById(id: string): ProviderProfile | undefined {
    const p = this.data.providers.find(prov => prov.id === id);
    if (!p) return undefined;
    const services = this.data.services.filter(s => s.providerId === p.id && s.isActive);
    const evidence = this.data.verificationQueue.filter(e => e.providerId === p.id);
    return { ...p, services, evidence };
  }

  public getProviderByUserId(userId: string): ProviderProfile | undefined {
    const p = this.data.providers.find(prov => prov.userId === userId);
    if (!p) return undefined;
    const services = this.data.services.filter(s => s.providerId === p.id && s.isActive);
    const evidence = this.data.verificationQueue.filter(e => e.providerId === p.id);
    return { ...p, services, evidence };
  }

  public updateProvider(id: string, updates: Partial<ProviderProfile>): ProviderProfile | null {
    const idx = this.data.providers.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.providers[idx] = { ...this.data.providers[idx], ...updates };
    this.saveDatabase();
    return this.getProviderById(id) || null;
  }

  // Services
  public getServices(): ProviderService[] {
    return this.data.services;
  }

  public addService(service: ProviderService): ProviderService {
    this.data.services.push(service);
    this.saveDatabase();
    return service;
  }

  public updateService(id: string, updates: Partial<ProviderService>): ProviderService | null {
    const idx = this.data.services.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.data.services[idx] = { ...this.data.services[idx], ...updates };
    this.saveDatabase();
    return this.data.services[idx];
  }

  // Bookings
  public getBookings(): Booking[] {
    return this.data.bookings;
  }

  public getBookingById(id: string): Booking | undefined {
    return this.data.bookings.find(b => b.id === id);
  }

  public addBooking(booking: Booking): Booking {
    this.data.bookings.unshift(booking);
    this.saveDatabase();
    return booking;
  }

  public updateBooking(id: string, updates: Partial<Booking>): Booking | null {
    const idx = this.data.bookings.findIndex(b => b.id === id);
    if (idx === -1) return null;
    this.data.bookings[idx] = { 
      ...this.data.bookings[idx], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    this.saveDatabase();
    return this.data.bookings[idx];
  }

  // Reviews
  public getReviews(providerId?: string): Review[] {
    if (providerId) {
      return this.data.reviews.filter(r => r.providerId === providerId);
    }
    return this.data.reviews;
  }

  public addReview(review: Review): Review {
    this.data.reviews.unshift(review);
    
    // Recalculate provider average rating and reviewCount
    const providerReviews = this.data.reviews.filter(r => r.providerId === review.providerId);
    const avg = providerReviews.reduce((sum, r) => sum + r.rating, 0) / providerReviews.length;
    
    const provIdx = this.data.providers.findIndex(p => p.id === review.providerId);
    if (provIdx !== -1) {
      this.data.providers[provIdx].rating = Number(avg.toFixed(2));
      this.data.providers[provIdx].reviewCount = providerReviews.length;
    }

    // Mark booking as reviewed
    const bkIdx = this.data.bookings.findIndex(b => b.id === review.bookingId);
    if (bkIdx !== -1) {
      this.data.bookings[bkIdx].isReviewed = true;
    }

    this.saveDatabase();
    return review;
  }

  public updateReview(id: string, updates: Partial<Review>): Review | null {
    const idx = this.data.reviews.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.data.reviews[idx] = { ...this.data.reviews[idx], ...updates };
    this.saveDatabase();
    return this.data.reviews[idx];
  }

  // Conversations & Messages
  public getConversations(userId?: string): Conversation[] {
    if (!userId) return this.data.conversations;
    // Find providers linked to this user
    const prov = this.data.providers.find(p => p.userId === userId);
    return this.data.conversations.filter(c => 
      c.customerId === userId || (prov && c.providerId === prov.id)
    );
  }

  public getMessages(conversationId: string): Message[] {
    return this.data.messages
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  public addMessage(msg: Message): Message {
    this.data.messages.push(msg);
    // Update conversation last message
    const convIdx = this.data.conversations.findIndex(c => c.id === msg.conversationId);
    if (convIdx !== -1) {
      this.data.conversations[convIdx].lastMessage = msg.text;
      this.data.conversations[convIdx].lastMessageTimestamp = msg.timestamp;
    }
    this.saveDatabase();
    return msg;
  }

  // Verifications
  public getVerificationQueue(): VerificationEvidence[] {
    return this.data.verificationQueue;
  }

  public addVerificationEvidence(evidence: VerificationEvidence): VerificationEvidence {
    this.data.verificationQueue.push(evidence);
    this.saveDatabase();
    return evidence;
  }

  public updateVerificationEvidence(id: string, updates: Partial<VerificationEvidence>): VerificationEvidence | null {
    const idx = this.data.verificationQueue.findIndex(v => v.id === id);
    if (idx === -1) return null;
    this.data.verificationQueue[idx] = { ...this.data.verificationQueue[idx], ...updates };
    this.saveDatabase();
    return this.data.verificationQueue[idx];
  }

  // Disputes
  public getDisputes(): Dispute[] {
    return this.data.disputes;
  }

  public addDispute(dispute: Dispute): Dispute {
    this.data.disputes.unshift(dispute);
    this.saveDatabase();
    return dispute;
  }

  public updateDispute(id: string, updates: Partial<Dispute>): Dispute | null {
    const idx = this.data.disputes.findIndex(d => d.id === id);
    if (idx === -1) return null;
    this.data.disputes[idx] = { ...this.data.disputes[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveDatabase();
    return this.data.disputes[idx];
  }

  // Audit Logs
  public getAuditLogs(): AuditLogItem[] {
    return this.data.auditLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public addAuditLog(item: AuditLogItem): AuditLogItem {
    this.data.auditLogs.unshift(item);
    this.saveDatabase();
    return item;
  }

  // Notifications
  public getNotifications(userId: string): NotificationItem[] {
    return this.data.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addNotification(notif: NotificationItem): NotificationItem {
    this.data.notifications.unshift(notif);
    this.saveDatabase();
    return notif;
  }

  public markNotificationAsRead(id: string): void {
    const notif = this.data.notifications.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.saveDatabase();
    }
  }
}

export const db = new DatabaseService();
