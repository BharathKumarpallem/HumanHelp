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
} from '../../src/types/index';

export const initialUsers: UserProfile[] = [
  {
    id: 'user-cust-1',
    email: 'alex.rivera@example.com',
    fullName: 'Alex Rivera',
    role: 'customer',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 234-5678',
    location: 'Metropolitan Area, Downtown',
    bio: 'Homeowner seeking reliable, certified local professionals for residential maintenance and tutoring.',
    createdAt: '2025-01-15T08:00:00Z'
  },
  {
    id: 'user-prov-1',
    email: 'elena.chen@example.com',
    fullName: 'Elena Chen',
    role: 'provider',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 345-6789',
    location: 'North Metro & Citywide',
    bio: 'Licensed Master Electrician with 12+ years specializing in residential upgrades, EV chargers, and smart electrical panels.',
    createdAt: '2024-03-10T10:00:00Z'
  },
  {
    id: 'user-prov-2',
    email: 'david.miller@example.com',
    fullName: 'David Miller',
    role: 'provider',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 456-7890',
    location: 'Central & West Suburbs',
    bio: 'Certified Journeyman Plumber focused on pipe diagnostics, tankless water heater installations, and emergency leak isolation.',
    createdAt: '2024-05-18T11:30:00Z'
  },
  {
    id: 'user-prov-3',
    email: 'priya.sharma@example.com',
    fullName: 'Dr. Priya Sharma',
    role: 'provider',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 567-8901',
    location: 'Online / Academic District',
    bio: 'Ph.D. in Applied Mathematics. 8 years tutoring high school & university students in Calculus, Linear Algebra, and SAT Math prep.',
    createdAt: '2024-08-01T09:15:00Z'
  },
  {
    id: 'user-prov-4',
    email: 'tariq.mansoor@example.com',
    fullName: 'Tariq Al-Mansoor',
    role: 'provider',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 678-9012',
    location: 'East District & Remote',
    bio: 'CompTIA Network+ and Security+ Certified technician. Home mesh Wi-Fi optimization, malware removal, and desktop repairs.',
    createdAt: '2024-09-12T14:20:00Z'
  },
  {
    id: 'user-prov-5',
    email: 'sarah.jenkins@example.com',
    fullName: 'Sarah Jenkins',
    role: 'provider',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 789-0123',
    location: 'Southside & Greater Area',
    bio: 'Certified Nursing Assistant (CNA) providing non-medical companion care, mobility support, and daily living assistance for seniors.',
    createdAt: '2024-11-05T12:00:00Z'
  },
  {
    id: 'user-admin-1',
    email: 'marcus.vance@humanhelp.org',
    fullName: 'Marcus Vance',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 999-0000',
    location: 'HumanHelp Operations Center',
    bio: 'Senior Compliance & Trust Director overseeing provider credentials, platform dispute arbitration, and safety policies.',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

export const initialCategories: ServiceCategory[] = [
  {
    id: 'cat-home',
    slug: 'home-services',
    name: 'Home Services',
    description: 'Electricians, plumbers, carpenters, cleaning, and appliance repair specialists.',
    iconName: 'Wrench',
    requiresSpecialLicense: true,
    activeListingCount: 14
  },
  {
    id: 'cat-edu',
    slug: 'education-skills',
    name: 'Education & Skills',
    description: 'Academic tutors, language coaches, STEM instructors, and music teachers.',
    iconName: 'GraduationCap',
    requiresSpecialLicense: false,
    activeListingCount: 9
  },
  {
    id: 'cat-tech',
    slug: 'technology-support',
    name: 'Technology Support',
    description: 'Computer diagnosis, home networking, cybersecurity setup, and device repair.',
    iconName: 'Laptop',
    requiresSpecialLicense: false,
    activeListingCount: 8
  },
  {
    id: 'cat-assist',
    slug: 'everyday-assistance',
    name: 'Everyday Assistance',
    description: 'Furniture assembly, heavy moving help, local errands, and home organization.',
    iconName: 'Package',
    requiresSpecialLicense: false,
    activeListingCount: 6
  },
  {
    id: 'cat-care',
    slug: 'care-services',
    name: 'Care Services',
    description: 'Elder assistance, non-medical companionship, and daily living support.',
    iconName: 'HeartHandshake',
    requiresSpecialLicense: true,
    activeListingCount: 4
  }
];

export const initialProviderProfiles: ProviderProfile[] = [
  {
    id: 'prov-profile-1',
    userId: 'user-prov-1',
    businessName: 'Chen Precision Electrical LLC',
    tagline: 'Master Electrician with transparent pricing & safety-certified workmanship.',
    bio: 'Over a decade of hands-on experience covering modern electrical panels, EV charging circuits, rewiring, and safety inspections. Every project strictly follows National Electrical Code standards.',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    categories: ['cat-home'],
    serviceArea: 'Greater Metro & Suburbs (up to 30km)',
    serviceRadiusKm: 30,
    languages: ['English', 'Mandarin'],
    skills: ['Panel Upgrades', 'EV Charger Install', 'Rewiring', 'Code Compliance', 'Troubleshooting'],
    verificationStatus: 'credentials_checked',
    verificationBadgeLabel: 'Verified Master License #EL-894231',
    verificationDetails: 'State Master Electrician Board license verified, $2M general liability insurance on record.',
    rating: 4.95,
    reviewCount: 38,
    completedBookingsCount: 42,
    isAcceptingBookings: true,
    startingRate: 85,
    pricingType: 'hourly',
    responseTimeMinutes: 15,
    workingDays: [1, 2, 3, 4, 5],
    workingHoursStart: '08:00',
    workingHoursEnd: '18:00'
  },
  {
    id: 'prov-profile-2',
    userId: 'user-prov-2',
    businessName: 'Miller Flow Plumbing Solutions',
    tagline: 'Reliable, clean plumbing repair with zero hidden dispatch fees.',
    bio: 'Specialized in leak repairs, pipe inspections, water filtration systems, and water heater replacements. Transparent hourly rates with upfront estimate confirmation before turning a single wrench.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    categories: ['cat-home'],
    serviceArea: 'Central Metro & West Valley (up to 25km)',
    serviceRadiusKm: 25,
    languages: ['English', 'Spanish'],
    skills: ['Leak Detection', 'Pipe Repair', 'Water Heaters', 'Drain Snaking', 'Fixtures'],
    verificationStatus: 'credentials_checked',
    verificationBadgeLabel: 'Verified Trade License #PL-551029',
    verificationDetails: 'Journeyman Plumbing Certificate validated by municipal trade commission.',
    rating: 4.88,
    reviewCount: 29,
    completedBookingsCount: 34,
    isAcceptingBookings: true,
    startingRate: 90,
    pricingType: 'hourly',
    responseTimeMinutes: 20,
    workingDays: [1, 2, 3, 4, 5, 6],
    workingHoursStart: '07:30',
    workingHoursEnd: '17:30'
  },
  {
    id: 'prov-profile-3',
    userId: 'user-prov-3',
    businessName: 'Dr. Sharma STEM Academy',
    tagline: 'Patient, university-level mathematics & physics tutoring for all levels.',
    bio: 'I help students transform confusion into mastery. From high school algebra and AP Calculus to university-level differential equations and standardized test prep. Remote whiteboard sessions with interactive notes.',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    categories: ['cat-edu'],
    serviceArea: 'Worldwide (Online / Remote)',
    serviceRadiusKm: 100,
    languages: ['English', 'Hindi'],
    skills: ['Calculus BC', 'Linear Algebra', 'SAT Math', 'Physics', 'Problem Solving'],
    verificationStatus: 'identity_checked',
    verificationBadgeLabel: 'Verified Academic Degree & Identity',
    verificationDetails: 'Ph.D. credential from accredited University registry confirmed.',
    rating: 4.98,
    reviewCount: 47,
    completedBookingsCount: 55,
    isAcceptingBookings: true,
    startingRate: 60,
    pricingType: 'hourly',
    responseTimeMinutes: 10,
    workingDays: [1, 2, 3, 4, 6, 0],
    workingHoursStart: '09:00',
    workingHoursEnd: '20:00'
  },
  {
    id: 'prov-profile-4',
    userId: 'user-prov-4',
    businessName: 'Apex Tech & Network Defense',
    tagline: 'Home & small business networking, PC repair, and data security.',
    bio: 'Fix sluggish Wi-Fi, remove complex spyware, set up seamless automated cloud backups, or repair your custom PC. Clear diagnostic process with plain English explanations.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    categories: ['cat-tech'],
    serviceArea: 'Metro Citywide + Remote Support',
    serviceRadiusKm: 35,
    languages: ['English', 'Arabic'],
    skills: ['Mesh Wi-Fi', 'Data Recovery', 'Virus Removal', 'Hardware Diagnostics', 'Smart Home'],
    verificationStatus: 'credentials_checked',
    verificationBadgeLabel: 'CompTIA Security+ Certified',
    verificationDetails: 'CompTIA certificate ID #COMP00109923 confirmed active.',
    rating: 4.91,
    reviewCount: 22,
    completedBookingsCount: 26,
    isAcceptingBookings: true,
    startingRate: 75,
    pricingType: 'hourly',
    responseTimeMinutes: 30,
    workingDays: [1, 2, 3, 4, 5],
    workingHoursStart: '09:00',
    workingHoursEnd: '19:00'
  },
  {
    id: 'prov-profile-5',
    userId: 'user-prov-5',
    businessName: 'Gentle Harbor Senior Assistance',
    tagline: 'Compassionate, non-medical companionship and everyday living aid.',
    bio: 'Dedicated to helping older adults maintain independence, dignity, and joy in their own homes. Friendly conversation, grocery trips, medication reminders, and gentle exercise support.',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    categories: ['cat-care'],
    serviceArea: 'South Metro & Central (up to 20km)',
    serviceRadiusKm: 20,
    languages: ['English'],
    skills: ['Mobility Support', 'Companion Care', 'Meal Prep', 'Errand Assistance', 'Dementia Aware'],
    verificationStatus: 'category_verified',
    verificationBadgeLabel: 'Verified CNA & Background Checked',
    verificationDetails: 'Certified Nursing Assistant registration and 10-year criminal background clearance checked.',
    rating: 5.0,
    reviewCount: 19,
    completedBookingsCount: 23,
    isAcceptingBookings: true,
    startingRate: 40,
    pricingType: 'hourly',
    responseTimeMinutes: 25,
    workingDays: [1, 2, 3, 4, 5],
    workingHoursStart: '08:30',
    workingHoursEnd: '16:30'
  }
];

export const initialProviderServices: ProviderService[] = [
  {
    id: 'srv-101',
    providerId: 'prov-profile-1',
    categoryId: 'cat-home',
    title: 'Standard Electrical Diagnostic & Repair',
    description: 'Thorough inspection of flickering circuits, malfunctioning outlets, tripped breakers, or switch failures. Includes 1 full hour of troubleshooting and minor part fixes.',
    pricingModel: 'hourly',
    basePrice: 85,
    durationMinutes: 60,
    serviceRadiusKm: 30,
    remoteAvailable: false,
    inPersonAvailable: true,
    requirements: 'Customer must provide clear access to the main circuit breaker panel.',
    cancellationPolicy: 'Free cancellation up to 24 hours prior. 50% deposit applies thereafter.',
    isActive: true
  },
  {
    id: 'srv-102',
    providerId: 'prov-profile-1',
    categoryId: 'cat-home',
    title: 'Dedicated EV Charger Installation (Level 2)',
    description: 'Complete 240V 50-amp dedicated conduit installation, circuit breaker integration, wall unit mounting, and local code permit assistance.',
    pricingModel: 'fixed',
    basePrice: 580,
    durationMinutes: 180,
    serviceRadiusKm: 30,
    remoteAvailable: false,
    inPersonAvailable: true,
    requirements: '200-amp service recommended. Please share photo of current breaker panel.',
    cancellationPolicy: 'Free cancellation up to 48 hours before scheduled installation.',
    isActive: true
  },
  {
    id: 'srv-201',
    providerId: 'prov-profile-2',
    categoryId: 'cat-home',
    title: 'Emergency Leak Repair & Pipe Sealing',
    description: 'Rapid on-site isolation and repair of leaking copper, PEX, or PVC supply lines, faucet seals, or trap assemblies.',
    pricingModel: 'hourly',
    basePrice: 90,
    durationMinutes: 90,
    serviceRadiusKm: 25,
    remoteAvailable: false,
    inPersonAvailable: true,
    requirements: 'Locate main water shut-off valve prior to arrival if active flooding is taking place.',
    cancellationPolicy: 'Free cancellation up to 4 hours in advance.',
    isActive: true
  },
  {
    id: 'srv-301',
    providerId: 'prov-profile-3',
    categoryId: 'cat-edu',
    title: '1-on-1 Advanced Calculus & Linear Algebra Mastery',
    description: 'Interactive 60-minute virtual session focusing on deep conceptual comprehension, rigorous problem sets, exam preparation, and customized review worksheets.',
    pricingModel: 'hourly',
    basePrice: 60,
    durationMinutes: 60,
    serviceRadiusKm: 100,
    remoteAvailable: true,
    inPersonAvailable: false,
    requirements: 'A computer or tablet with microphone and camera. Digital stylus recommended.',
    cancellationPolicy: 'Free cancellation up to 12 hours before session.',
    isActive: true
  },
  {
    id: 'srv-401',
    providerId: 'prov-profile-4',
    categoryId: 'cat-tech',
    title: 'Whole-Home Mesh Wi-Fi Setup & Dead-Zone Elimination',
    description: 'On-site spectrum analysis, placement of mesh nodes, network security configuration, and parental controls setup.',
    pricingModel: 'fixed',
    basePrice: 150,
    durationMinutes: 120,
    serviceRadiusKm: 35,
    remoteAvailable: false,
    inPersonAvailable: true,
    requirements: 'Customer provides their mesh Wi-Fi system hardware or consults Tariq beforehand.',
    cancellationPolicy: 'Free cancellation up to 24 hours prior.',
    isActive: true
  },
  {
    id: 'srv-501',
    providerId: 'prov-profile-5',
    categoryId: 'cat-care',
    title: 'Companion Care & Daily Living Support (2-Hour Block)',
    description: 'Attentive companionship, meal preparation, accompaniment on doctor appointments or grocery runs, and light household organization.',
    pricingModel: 'fixed',
    basePrice: 80,
    durationMinutes: 120,
    serviceRadiusKm: 20,
    remoteAvailable: false,
    inPersonAvailable: true,
    requirements: 'Non-medical care only. Care recipient must be in stable condition.',
    cancellationPolicy: 'Free cancellation up to 24 hours prior.',
    isActive: true
  }
];

export const initialBookings: Booking[] = [
  {
    id: 'bk-1001',
    customerId: 'user-cust-1',
    customerName: 'Alex Rivera',
    customerEmail: 'alex.rivera@example.com',
    providerId: 'prov-profile-1',
    providerName: 'Elena Chen',
    providerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    serviceId: 'srv-101',
    serviceTitle: 'Standard Electrical Diagnostic & Repair',
    categoryId: 'cat-home',
    date: '2026-10-14',
    timeSlot: '10:00 AM - 11:30 AM',
    locationType: 'in_person',
    serviceAddress: '428 Elm Street, Apt 3B, Downtown',
    problemDescription: 'Living room wall outlets stopped providing power after a breaker tripped yesterday. Breaker stays in on position but sockets have zero voltage.',
    pricingModel: 'hourly',
    agreedPrice: 85,
    platformFee: 4.25,
    totalAmount: 89.25,
    status: 'confirmed',
    statusNotes: 'Confirmed by Elena Chen. Equipment packed and scheduled.',
    createdAt: '2026-10-11T14:22:00Z',
    updatedAt: '2026-10-11T16:05:00Z'
  },
  {
    id: 'bk-1002',
    customerId: 'user-cust-1',
    customerName: 'Alex Rivera',
    customerEmail: 'alex.rivera@example.com',
    providerId: 'prov-profile-3',
    providerName: 'Dr. Priya Sharma',
    providerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    serviceId: 'srv-301',
    serviceTitle: '1-on-1 Advanced Calculus & Linear Algebra Mastery',
    categoryId: 'cat-edu',
    date: '2026-10-08',
    timeSlot: '04:00 PM - 05:00 PM',
    locationType: 'remote',
    serviceAddress: 'Virtual Zoom Room #891-234-912',
    problemDescription: 'Need deep drill into Eigenvectors and Multivariable Integration for upcoming exam.',
    pricingModel: 'hourly',
    agreedPrice: 60,
    platformFee: 3.00,
    totalAmount: 63.00,
    status: 'completed',
    statusNotes: 'Completed successfully on Oct 8th. Session notes shared.',
    isReviewed: true,
    createdAt: '2026-10-06T10:15:00Z',
    updatedAt: '2026-10-08T17:05:00Z'
  },
  {
    id: 'bk-1003',
    customerId: 'user-cust-1',
    customerName: 'Alex Rivera',
    customerEmail: 'alex.rivera@example.com',
    providerId: 'prov-profile-4',
    providerName: 'Tariq Al-Mansoor',
    providerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    serviceId: 'srv-401',
    serviceTitle: 'Whole-Home Mesh Wi-Fi Setup & Dead-Zone Elimination',
    categoryId: 'cat-tech',
    date: '2026-10-16',
    timeSlot: '01:00 PM - 03:00 PM',
    locationType: 'in_person',
    serviceAddress: '428 Elm Street, Apt 3B, Downtown',
    problemDescription: 'Wi-Fi drops repeatedly in the home office and patio. Bought 3 Eero nodes but need expert placement and security isolation.',
    pricingModel: 'fixed',
    agreedPrice: 150,
    platformFee: 7.50,
    totalAmount: 157.50,
    status: 'requested',
    statusNotes: 'Awaiting provider review and slot confirmation.',
    createdAt: '2026-10-12T09:30:00Z',
    updatedAt: '2026-10-12T09:30:00Z'
  }
];

export const initialReviews: Review[] = [
  {
    id: 'rev-301',
    bookingId: 'bk-1002',
    providerId: 'prov-profile-3',
    customerId: 'user-cust-1',
    customerName: 'Alex Rivera',
    rating: 5,
    title: 'Outstanding clarity and deep mathematical insight!',
    comment: 'Dr. Sharma explained multidimensional change of variables and Jacobians in a way that clicked within 15 minutes. She provided annotated PDF notes right after. Highly recommend her for anyone doing STEM degrees!',
    serviceCategory: 'cat-edu',
    createdAt: '2026-10-08T18:20:00Z',
    providerResponse: {
      text: 'Thank you Alex! You grasped the matrix transformations very quickly. Best of luck on your upcoming midterms!',
      respondedAt: '2026-10-08T19:00:00Z'
    }
  },
  {
    id: 'rev-101',
    bookingId: 'bk-archived-99',
    providerId: 'prov-profile-1',
    customerId: 'user-cust-external',
    customerName: 'Samantha Brooke',
    rating: 5,
    title: 'Top tier professional electrician — clean and punctual.',
    comment: 'Elena inspected our entire breaker box and resolved a dangerous short in the kitchen sub-panel. Transparent pricing, no gimmicks, and wore shoe covers indoors.',
    serviceCategory: 'cat-home',
    createdAt: '2026-09-28T14:10:00Z',
    providerResponse: {
      text: 'Safety is always first. Pleasure working with you Samantha!',
      respondedAt: '2026-09-28T16:30:00Z'
    }
  }
];

export const initialConversations: Conversation[] = [
  {
    id: 'conv-101',
    bookingId: 'bk-1001',
    serviceTitle: 'Standard Electrical Diagnostic & Repair',
    customerId: 'user-cust-1',
    customerName: 'Alex Rivera',
    providerId: 'prov-profile-1',
    providerName: 'Elena Chen',
    providerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'Hi Alex! I reviewed your notes on the tripped breaker. Please leave the panel cabinet unlocked so I can inspect immediately upon arrival.',
    lastMessageTimestamp: '2026-10-11T16:15:00Z',
    unreadCount: 0
  },
  {
    id: 'conv-102',
    bookingId: 'bk-1003',
    serviceTitle: 'Whole-Home Mesh Wi-Fi Setup',
    customerId: 'user-cust-1',
    customerName: 'Alex Rivera',
    providerId: 'prov-profile-4',
    providerName: 'Tariq Al-Mansoor',
    providerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'I noticed your request for Friday afternoon. Could you let me know your ISP modem brand?',
    lastMessageTimestamp: '2026-10-12T10:05:00Z',
    unreadCount: 1
  }
];

export const initialMessages: Message[] = [
  {
    id: 'msg-1',
    conversationId: 'conv-101',
    senderId: 'user-cust-1',
    senderName: 'Alex Rivera',
    senderRole: 'customer',
    text: 'Hello Elena, thanks for accepting the booking. The breaker is in the hallway closet.',
    timestamp: '2026-10-11T16:10:00Z',
    isRead: true
  },
  {
    id: 'msg-2',
    conversationId: 'conv-101',
    senderId: 'user-prov-1',
    senderName: 'Elena Chen',
    senderRole: 'provider',
    text: 'Hi Alex! I reviewed your notes on the tripped breaker. Please leave the panel cabinet unlocked so I can inspect immediately upon arrival.',
    timestamp: '2026-10-11T16:15:00Z',
    isRead: true
  },
  {
    id: 'msg-3',
    conversationId: 'conv-102',
    senderId: 'user-prov-4',
    senderName: 'Tariq Al-Mansoor',
    senderRole: 'provider',
    text: 'I noticed your request for Friday afternoon. Could you let me know your ISP modem brand?',
    timestamp: '2026-10-12T10:05:00Z',
    isRead: false
  }
];

export const initialVerificationQueue: VerificationEvidence[] = [
  {
    id: 'ev-901',
    providerId: 'prov-profile-4',
    documentType: 'certification',
    documentName: 'CompTIA_SecurityPlus_Cert_2025.pdf',
    licenseNumber: 'COMP00109923',
    issuingAuthority: 'CompTIA Certification Operations',
    submittedAt: '2026-10-10T11:00:00Z',
    status: 'pending',
    adminNotes: 'Awaiting administrator verification against CompTIA certificate registry.'
  },
  {
    id: 'ev-902',
    providerId: 'prov-profile-1',
    documentType: 'trade_license',
    documentName: 'State_Master_Electrician_License.pdf',
    licenseNumber: 'EL-894231',
    issuingAuthority: 'Department of Labor & Electrical Standards',
    submittedAt: '2026-09-01T09:00:00Z',
    status: 'approved',
    adminNotes: 'License validated directly against State database. Status active with zero infractions.'
  }
];

export const initialDisputes: Dispute[] = [
  {
    id: 'disp-501',
    bookingId: 'bk-demo-dispute-1',
    customerId: 'user-cust-1',
    customerName: 'Alex Rivera',
    providerId: 'prov-profile-2',
    providerName: 'David Miller',
    issueCategory: 'unauthorized_fee',
    description: 'Invoice showed an unexpected $45 miscellaneous disposal surcharge that was not listed in the agreed quote or cancellation terms.',
    evidenceNotes: 'Attached screenshot of booking agreement showing fixed rate without surplus charges.',
    requestedResolution: 'partial_refund',
    status: 'under_review',
    adminDecision: 'Under investigation by Marcus Vance. Requested provider breakdown of disposal fee.',
    createdAt: '2026-10-09T14:00:00Z',
    updatedAt: '2026-10-10T09:30:00Z'
  }
];

export const initialAuditLogs: AuditLogItem[] = [
  {
    id: 'audit-1',
    adminId: 'user-admin-1',
    adminName: 'Marcus Vance',
    action: 'VERIFY_PROVIDER_LICENSE',
    targetType: 'provider',
    targetId: 'prov-profile-1',
    details: 'Approved Master Electrician License #EL-894231 after state registry check.',
    timestamp: '2026-09-02T10:14:00Z'
  },
  {
    id: 'audit-2',
    adminId: 'user-admin-1',
    adminName: 'Marcus Vance',
    action: 'INITIATE_DISPUTE_REVIEW',
    targetType: 'dispute',
    targetId: 'disp-501',
    details: 'Opened inquiry into unauthorized disposal charge on booking bk-demo-dispute-1.',
    timestamp: '2026-10-10T09:30:00Z'
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'user-cust-1',
    title: 'Booking Confirmed',
    message: 'Elena Chen confirmed your electrical repair for Oct 14, 10:00 AM.',
    type: 'booking',
    link: '/bookings',
    isRead: false,
    createdAt: '2026-10-11T16:05:00Z'
  },
  {
    id: 'notif-2',
    userId: 'user-cust-1',
    title: 'New Message',
    message: 'Tariq Al-Mansoor sent a message regarding your Wi-Fi setup inquiry.',
    type: 'message',
    link: '/messages',
    isRead: false,
    createdAt: '2026-10-12T10:05:00Z'
  },
  {
    id: 'notif-3',
    userId: 'user-prov-1',
    title: 'New Booking Request',
    message: 'Alex Rivera requested Electrical Diagnostic for Oct 14.',
    type: 'booking',
    link: '/provider/dashboard',
    isRead: true,
    createdAt: '2026-10-11T14:22:00Z'
  }
];
