import { Router } from 'express';
import { db } from '../db';
import { UserProfile } from '../../src/types/index';

const router = Router();

// Track current authenticated user in memory for demo convenience
let currentUserId = 'user-cust-1';

router.get('/me', (req, res) => {
  const user = db.getUserById(currentUserId);
  if (!user) {
    return res.status(404).json({ error: 'User session not found' });
  }

  let providerProfile = null;
  if (user.role === 'provider') {
    providerProfile = db.getProviderByUserId(user.id);
  }

  res.json({
    user,
    providerProfile,
  });
});

router.post('/switch-persona', (req, res) => {
  const { role } = req.body;
  let targetId = 'user-cust-1';
  
  if (role === 'provider') targetId = 'user-prov-1';
  else if (role === 'admin') targetId = 'user-admin-1';
  else targetId = 'user-cust-1';

  const user = db.getUserById(targetId);
  if (!user) {
    return res.status(404).json({ error: 'Persona not found' });
  }

  currentUserId = targetId;

  let providerProfile = null;
  if (user.role === 'provider') {
    providerProfile = db.getProviderByUserId(user.id);
  }

  res.json({
    message: `Switched active persona to ${user.fullName} (${user.role})`,
    user,
    providerProfile,
  });
});

router.post('/login', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials or user does not exist in demo registry.' });
  }

  currentUserId = user.id;

  let providerProfile = null;
  if (user.role === 'provider') {
    providerProfile = db.getProviderByUserId(user.id);
  }

  res.json({
    message: 'Login successful',
    user,
    providerProfile,
  });
});

router.post('/register', (req, res) => {
  const { fullName, email, role, phone, location } = req.body;
  if (!fullName || !email || !role) {
    return res.status(400).json({ error: 'Full name, email, and role are required' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'A user with this email already exists' });
  }

  const newUser: UserProfile = {
    id: `user-${Date.now()}`,
    email,
    fullName,
    role: role as any,
    phone: phone || '',
    location: location || 'Metropolitan Area',
    createdAt: new Date().toISOString()
  };

  db.addUser(newUser);
  currentUserId = newUser.id;

  res.status(201).json({
    message: 'User registered successfully',
    user: newUser
  });
});

router.post('/logout', (req, res) => {
  // Reset back to customer default
  currentUserId = 'user-cust-1';
  res.json({ message: 'Signed out successfully' });
});

export default router;
