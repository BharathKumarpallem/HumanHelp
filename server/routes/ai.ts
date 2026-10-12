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

  // Keyword intent mapping
  const categoryKeywords: Record<string, string[]> = {
    'cat-home': ['electrician', 'electrical', 'wire', 'circuit', 'breaker', 'fan', 'outlet', 'plumber', 'pipe', 'leak', 'water heater', 'drain', 'home repair', 'sink', 'faucet'],
    'cat-edu': ['tutor', 'math', 'calculus', 'algebra', 'physics', 'teacher', 'sat', 'stem', 'exam', 'homework', 'learning'],
    'cat-tech': ['laptop', 'pc', 'computer', 'network', 'wi-fi', 'wifi', 'internet', 'virus', 'malware', 'router', 'tech support', 'backup', 'windows', 'mac'],
    'cat-care': ['senior', 'elder', 'companion', 'cna', 'grandma', 'grandpa', 'caregiver', 'assisted living', 'daily care', 'errand for elder'],
    'cat-assist': ['moving', 'furniture', 'assembly', 'heavy lifting', 'boxes', 'errands', 'organizing']
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

  // Service mode constraint (online/remote vs in-person)
  const prefersRemote = query.includes('online') || query.includes('remote') || query.includes('zoom');
  const prefersInPerson = query.includes('in person') || query.includes('at home') || query.includes('on site') || query.includes('house call');

  // Language constraint extraction
  const languagesDetected: string[] = [];
  ['mandarin', 'spanish', 'hindi', 'arabic', 'french'].forEach(lang => {
    if (query.includes(lang)) {
      languagesDetected.push(lang);
    }
  });

  // Score real providers from database
  const scoredProviders: MatchResult[] = allProviders.map(provider => {
    let score = 0;
    const reasons: string[] = [];

    // Category match
    const sharesCategory = provider.categories.some(c => matchedCategoryIds.includes(c));
    if (sharesCategory) {
      score += 40;
      const cat = allCategories.find(c => provider.categories.includes(c.id));
      reasons.push(`Specializes in ${cat?.name || 'requested category'}`);
    }

    // Direct skill or service keyword match
    const matchingSkills = provider.skills.filter(s => query.includes(s.toLowerCase()));
    if (matchingSkills.length > 0) {
      score += matchingSkills.length * 15;
      reasons.push(`Verified skills: ${matchingSkills.join(', ')}`);
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
        reasons.push(`Rate $${provider.startingRate}/hr is within your budget of $${maxBudget}`);
      } else {
        score -= 30; // penalize over budget
      }
    }

    // Remote preference
    if (prefersRemote) {
      const hasRemote = (provider.services || []).some(s => s.remoteAvailable);
      if (hasRemote) {
        score += 20;
        reasons.push('Offers verified remote / online service sessions');
      }
    }

    // Language match
    if (languagesDetected.length > 0) {
      const speaks = provider.languages.some(l => 
        languagesDetected.some(req => l.toLowerCase().includes(req))
      );
      if (speaks) {
        score += 25;
        reasons.push(`Speaks ${provider.languages.join(', ')}`);
      }
    }

    // Verification boost
    if (provider.verificationStatus === 'credentials_checked' || provider.verificationStatus === 'category_verified') {
      score += 15;
      reasons.push(`Holds ${provider.verificationBadgeLabel}`);
    }

    return {
      provider,
      relevanceScore: score,
      matchReasons: reasons
    };
  });

  // Filter for positive score and sort descending
  const topMatches = scoredProviders
    .filter(m => m.relevanceScore > 20)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 3);

  let responseText = '';
  let formattedProviders: any[] = [];

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
    responseText = `I analyzed our verified provider network and found **${topMatches.length}** verified professional${topMatches.length > 1 ? 's' : ''} matching your criteria:\n\n` +
      topMatches.map((m, idx) => 
        `${idx + 1}. **${m.provider.businessName}** — ${m.provider.tagline} (Starting at **$${m.provider.startingRate}/hr**, Rating: **${m.provider.rating}★** with ${m.provider.reviewCount} reviews). Verification: *${m.provider.verificationBadgeLabel}*.`
      ).join('\n\n') +
      `\n\nWould you like me to open a booking request with **${top.businessName}**, or would you like to narrow down specific time slots or location requirements?`;
  } else {
    // Honest negative response (Rule 21: Never invent providers)
    responseText = `I searched our active verified provider network, but did not find an exact match for "${message}".\n\n` +
      `Here is how we can refine the search:\n` +
      `• Browse our primary categories: **Home Services** (Electrical, Plumbing), **Education & Skills** (Math, STEM), **Technology Support** (Networking, PC repair), or **Care Services**.\n` +
      `• If you have a specific hourly rate or location, let me know and I will adjust the search filters.`;
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
