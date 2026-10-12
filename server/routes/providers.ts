import { Router } from 'express';
import { db } from '../db';
import { ProviderProfile, ProviderService } from '../../src/types/index';

const router = Router();

router.get('/', (req, res) => {
  const {
    q,
    category,
    priceMin,
    priceMax,
    verifiedOnly,
    minRating,
    serviceType,
    sort
  } = req.query;

  let providers = db.getProviders();

  // Search query
  if (q && typeof q === 'string') {
    const query = q.toLowerCase();
    providers = providers.filter(p => {
      const matchBusiness = p.businessName.toLowerCase().includes(query);
      const matchTagline = p.tagline.toLowerCase().includes(query);
      const matchBio = p.bio.toLowerCase().includes(query);
      const matchSkills = p.skills.some(s => s.toLowerCase().includes(query));
      const matchServices = (p.services || []).some(s => 
        s.title.toLowerCase().includes(query) || s.description.toLowerCase().includes(query)
      );
      return matchBusiness || matchTagline || matchBio || matchSkills || matchServices;
    });
  }

  // Category filter
  if (category && typeof category === 'string' && category !== 'all') {
    providers = providers.filter(p => p.categories.includes(category));
  }

  // Verification status
  if (verifiedOnly === 'true') {
    providers = providers.filter(p => 
      p.verificationStatus === 'credentials_checked' || 
      p.verificationStatus === 'category_verified' ||
      p.verificationStatus === 'identity_checked'
    );
  }

  // Minimum rating
  if (minRating) {
    const min = parseFloat(minRating as string);
    if (!isNaN(min)) {
      providers = providers.filter(p => p.rating >= min);
    }
  }

  // Price range
  if (priceMin) {
    const minP = parseFloat(priceMin as string);
    if (!isNaN(minP)) {
      providers = providers.filter(p => p.startingRate >= minP);
    }
  }
  if (priceMax) {
    const maxP = parseFloat(priceMax as string);
    if (!isNaN(maxP)) {
      providers = providers.filter(p => p.startingRate <= maxP);
    }
  }

  // Service type (remote vs in-person)
  if (serviceType && serviceType !== 'all') {
    if (serviceType === 'remote') {
      providers = providers.filter(p => 
        (p.services || []).some(s => s.remoteAvailable)
      );
    } else if (serviceType === 'in_person') {
      providers = providers.filter(p => 
        (p.services || []).some(s => s.inPersonAvailable)
      );
    }
  }

  // Sorting
  if (sort === 'rating') {
    providers.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'price_asc') {
    providers.sort((a, b) => a.startingRate - b.startingRate);
  } else if (sort === 'price_desc') {
    providers.sort((a, b) => b.startingRate - a.startingRate);
  } else if (sort === 'reviews') {
    providers.sort((a, b) => b.reviewCount - a.reviewCount);
  }

  res.json(providers);
});

router.get('/:id', (req, res) => {
  const provider = db.getProviderById(req.params.id);
  if (!provider) {
    return res.status(404).json({ error: 'Provider not found' });
  }

  const reviews = db.getReviews(provider.id);
  res.json({
    ...provider,
    reviews
  });
});

router.patch('/:id', (req, res) => {
  const updated = db.updateProvider(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Provider not found' });
  }
  res.json(updated);
});

router.post('/:id/services', (req, res) => {
  const provider = db.getProviderById(req.params.id);
  if (!provider) {
    return res.status(404).json({ error: 'Provider not found' });
  }

  const { title, description, categoryId, pricingModel, basePrice, durationMinutes, cancellationPolicy } = req.body;
  if (!title || !description || !categoryId || !basePrice) {
    return res.status(400).json({ error: 'Title, description, category, and price are required' });
  }

  const newService: ProviderService = {
    id: `srv-${Date.now()}`,
    providerId: provider.id,
    categoryId,
    title,
    description,
    pricingModel: pricingModel || 'hourly',
    basePrice: Number(basePrice),
    durationMinutes: durationMinutes ? Number(durationMinutes) : 60,
    serviceRadiusKm: provider.serviceRadiusKm || 25,
    remoteAvailable: Boolean(req.body.remoteAvailable),
    inPersonAvailable: req.body.inPersonAvailable !== undefined ? Boolean(req.body.inPersonAvailable) : true,
    cancellationPolicy: cancellationPolicy || 'Free cancellation up to 24 hours prior.',
    isActive: true
  };

  db.addService(newService);
  res.status(201).json(newService);
});

router.patch('/services/:serviceId', (req, res) => {
  const updated = db.updateService(req.params.serviceId, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Service not found' });
  }
  res.json(updated);
});

export default router;
