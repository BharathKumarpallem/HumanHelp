import { Router } from 'express';
import { db } from '../db';
import { ProviderProfile } from '../../src/types/index';

const router = Router();

interface MatchResult {
  provider: ProviderProfile;
  relevanceScore: number;
  matchReasons: string[];
}

router.post('/assistant', async (req, res) => {
  const { message, conversationHistory } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message text is required.' });
  }

  const query = message.trim().toLowerCase();
  const allProviders = db.getProviders();
  const allCategories = db.getCategories();

  // EMERGENCY MEDICAL OVERRIDE SAFETY CHECK
  const emergencyKeywords = [
    'chest pain', 'heart attack', 'shortness of breath', 'can\'t breathe', 'stroke', 
    'severe bleeding', 'unconscious', 'overdose', 'seizure', 'suicidal', 'anaphylaxis'
  ];

  if (emergencyKeywords.some(kw => query.includes(kw))) {
    return res.json({
      reply: `🚨 **IMMEDIATE EMERGENCY WARNING:**\n\n` +
        `Your message describes symptoms that may indicate an acute, life-threatening medical emergency. **HumanHelp is NOT an emergency response service.**\n\n` +
        `**Please contact your local emergency services (e.g. 911 in North America, 112 in Europe, or 999 in the UK) immediately.** Do not wait for a scheduled home visit.`,
      matchedProviders: [],
      suggestedAction: null
    });
  }

  // MEDICAL DIAGNOSTIC / PRESCRIPTION SAFETY GUARD
  const diagnosticKeywords = ['diagnose', 'prescribe', 'what medication should i take', 'what illness do i have', 'antibiotic prescription'];
  const asksForDiagnosis = diagnosticKeywords.some(kw => query.includes(kw));

  // Keyword intent mapping
  const categoryKeywords: Record<string, string[]> = {
    'cat-home': ['electrician', 'electrical', 'wire', 'circuit', 'breaker', 'fan', 'outlet', 'plumber', 'pipe', 'leak', 'water heater', 'drain', 'home repair', 'sink', 'faucet', 'carpenter', 'ac repair', 'refrigerator', 'pest control', 'landscaping', 'gardening'],
    'cat-health': ['doctor', 'physician', 'gp', 'nurse', 'rn', 'nursing', 'medical visit', 'home doctor', 'wound', 'post-op', 'physiotherapy', 'vital check', 'phlebotomy', 'lab sample', 'clinic visit'],
    'cat-pharmacy': ['pharmacy', 'prescription delivery', 'medicine delivery', 'meds', 'medical equipment', 'wheelchair', 'nebulizer', 'first aid', 'crutches', 'mobility aid'],
    'cat-edu': ['tutor', 'math', 'calculus', 'algebra', 'physics', 'teacher', 'sat', 'stem', 'exam', 'homework', 'learning', 'coding', 'programming'],
    'cat-tech': ['laptop', 'pc', 'computer', 'network', 'wi-fi', 'wifi', 'internet', 'virus', 'malware', 'router', 'tech support', 'backup', 'windows', 'mac', 'printer', 'smart home'],
    'cat-assist': ['moving', 'furniture', 'assembly', 'heavy lifting', 'boxes', 'errands', 'organizing', 'groceries', 'household assistance', 'laundry'],
    'cat-auto': ['mechanic', 'car repair', 'auto repair', 'oil change', 'brakes', 'engine', 'check engine', 'obd2', 'battery', 'roadside', 'tire'],
    'cat-beauty': ['haircut', 'barber', 'hairdresser', 'makeup', 'beauty', 'massage', 'yoga', 'personal trainer', 'wellness'],
    'cat-pro': ['accountant', 'tax', 'legal', 'lawyer', 'web developer', 'graphic designer', 'consultant', 'translation'],
    'cat-pet': ['dog walking', 'pet sitting', 'cat', 'dog', 'pet grooming', 'veterinarian', 'vet'],
    'cat-child': ['babysitter', 'nanny', 'childcare', 'special needs support', 'family care']
  };

  // Identify category matches
  const matchedCategoryIds: string[] = [];
  for (const [catId, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(kw => query.includes(kw))) {
      matchedCategoryIds.push(catId);
    }
  }

  // Price constraint extraction
  let maxBudget: number | null = null;
  const budgetMatch = query.match(/(?:under|less than|max|budget of|\$)\s*(\d+)/i);
  if (budgetMatch && budgetMatch[1]) {
    maxBudget = parseInt(budgetMatch[1], 10);
  }

  // Service mode constraint
  const prefersRemote = query.includes('online') || query.includes('remote') || query.includes('zoom') || query.includes('video');
  const prefersDelivery = query.includes('deliver') || query.includes('drop off') || query.includes('shipping') || query.includes('courier');
  const prefersHomeVisit = query.includes('home visit') || query.includes('at home') || query.includes('house call') || query.includes('come over');

  // Score real providers from database
  const scoredProviders: MatchResult[] = allProviders.map(provider => {
    let score = 0;
    const reasons: string[] = [];

    // Category match
    const sharesCategory = provider.categories.some(c => matchedCategoryIds.includes(c));
    if (sharesCategory) {
      score += 45;
      const cat = allCategories.find(c => provider.categories.includes(c.id));
      reasons.push(`Verified specialist in ${cat?.name || 'requested category'}`);
    }

    // Direct skill or subcategory match
    const matchingSkills = provider.skills.filter(s => query.includes(s.toLowerCase()));
    if (matchingSkills.length > 0) {
      score += matchingSkills.length * 15;
      reasons.push(`Verified skills: ${matchingSkills.join(', ')}`);
    }

    const matchingSubcats = (provider.subcategories || []).filter(sub => query.includes(sub.toLowerCase()));
    if (matchingSubcats.length > 0) {
      score += 25;
      reasons.push(`Subcategory: ${matchingSubcats[0]}`);
    }

    // Services match
    const matchingServices = (provider.services || []).filter(srv => 
      query.split(' ').some(w => w.length > 3 && srv.title.toLowerCase().includes(w))
    );
    if (matchingServices.length > 0) {
      score += 20;
      reasons.push(`Offers: "${matchingServices[0].title}"`);
    }

    // Budget compliance
    if (maxBudget !== null) {
      if (provider.startingRate <= maxBudget) {
        score += 25;
        reasons.push(`Rate $${provider.startingRate} within your $${maxBudget} budget`);
      } else {
        score -= 30;
      }
    }

    // Delivery mode match
    if (prefersDelivery) {
      const hasDelivery = (provider.services || []).some(s => s.deliveryMode === 'delivery');
      if (hasDelivery) {
        score += 25;
        reasons.push('Authorized delivery service coverage');
      }
    }

    if (prefersHomeVisit) {
      const hasHomeVisit = (provider.services || []).some(s => s.deliveryMode === 'home_visit');
      if (hasHomeVisit) {
        score += 25;
        reasons.push('Offers on-site / in-home service visits');
      }
    }

    // Verification boost
    if (provider.verificationStatus === 'credentials_checked' || provider.verificationStatus === 'category_verified') {
      score += 20;
      reasons.push(`Verified: ${provider.verificationBadgeLabel}`);
    }

    return {
      provider,
      relevanceScore: score,
      matchReasons: reasons
    };
  });

  const topMatches = scoredProviders
    .filter(m => m.relevanceScore > 20)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 3);

  let responseText = '';
  let formattedProviders: any[] = [];

  // Medical Advisory Disclaimer if healthcare is touched
  let medicalDisclaimerPrefix = '';
  if (asksForDiagnosis || matchedCategoryIds.includes('cat-health')) {
    medicalDisclaimerPrefix = `> **Important Medical Notice**: As an AI assistant, I do not diagnose conditions or prescribe pharmaceuticals. All clinical consultations must be performed directly by licensed medical professionals. For medical emergencies, call 911 or 112.\n\n`;
  }

  if (topMatches.length > 0) {
    formattedProviders = topMatches.map(m => ({
      id: m.provider.id,
      businessName: m.provider.businessName,
      tagline: m.provider.tagline,
      rating: m.provider.rating,
      reviewCount: m.provider.reviewCount,
      startingRate: m.provider.startingRate,
      verificationBadgeLabel: m.provider.verificationBadgeLabel,
      categoryMatch: m.provider.categories[0],
      avatarUrl: m.provider.avatarUrl,
      matchReason: m.matchReasons.slice(0, 2).join(' • ')
    }));

    const top = topMatches[0].provider;
    responseText = medicalDisclaimerPrefix +
      `I cross-referenced our verified network and found **${topMatches.length}** authenticated professional${topMatches.length > 1 ? 's' : ''} matching your request:\n\n` +
      topMatches.map((m, idx) => 
        `${idx + 1}. **${m.provider.businessName}** — ${m.provider.tagline} (Starting at **$${m.provider.startingRate}**, Rating: **${m.provider.rating}★** with ${m.provider.reviewCount} verified reviews). Credential: *${m.provider.verificationBadgeLabel}*.`
      ).join('\n\n') +
      `\n\nWould you like to review availability and request an appointment with **${top.businessName}**?`;
  } else {
    responseText = medicalDisclaimerPrefix +
      `I searched our verified directory, but did not locate an exact match for "${message}".\n\n` +
      `You can browse our expanded service areas:\n` +
      `• **Home Services** (Electricians, Plumbers, AC Repair, Carpenters, Landscaping)\n` +
      `• **Healthcare Services 🏥** (Home Family Doctors, Registered Nurses, Post-Op Care)\n` +
      `• **Medical & Pharmacy Delivery 🚑** (Prescriptions, OTC, Mobility Aids)\n` +
      `• **Automotive Services** (Mobile Mechanics, Diagnostics)\n` +
      `• **Pet Care, Childcare, & Education**\n\n` +
      `Please let me know if you would like me to broaden the search criteria.`;
  }

  res.json({
    reply: responseText,
    matchedProviders: formattedProviders,
    suggestedAction: formattedProviders.length > 0 ? {
      type: 'prefill_booking',
      data: {
        providerId: formattedProviders[0].id,
        providerName: formattedProviders[0].businessName
      }
    } : null
  });
});

export default router;
