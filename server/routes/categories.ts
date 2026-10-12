import { Router } from 'express';
import { db } from '../db';
import { ServiceCategory } from '../../src/types/index';

const router = Router();

router.get('/', (req, res) => {
  const categories = db.getCategories();
  res.json(categories);
});

router.post('/', (req, res) => {
  const { name, description, iconName, requiresSpecialLicense } = req.body;
  if (!name || !description) {
    return res.status(400).json({ error: 'Name and description are required' });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const newCat: ServiceCategory = {
    id: `cat-${Date.now()}`,
    slug,
    name,
    description,
    iconName: iconName || 'Wrench',
    requiresSpecialLicense: Boolean(requiresSpecialLicense),
    activeListingCount: 0
  };

  db.addCategory(newCat);
  res.status(201).json(newCat);
});

router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const updated = db.updateCategory(id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Category not found' });
  }
  res.json(updated);
});

export default router;
