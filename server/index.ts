import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import categoriesRouter from './routes/categories';
import providersRouter from './routes/providers';
import bookingsRouter from './routes/bookings';
import verificationsRouter from './routes/verifications';
import reviewsRouter from './routes/reviews';
import messagesRouter from './routes/messages';
import disputesRouter from './routes/disputes';
import safetyRouter from './routes/safety';
import aiRouter from './routes/ai';
import adminRouter from './routes/admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[API] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'HumanHelp API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/providers', providersRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/verifications', verificationsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/disputes', disputesRouter);
app.use('/api/safety', safetyRouter);
app.use('/api/ai', aiRouter);
app.use('/api/admin', adminRouter);

// 404 handler for unmatched routes
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
  }
  res.status(404).send('Not Found');
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 HumanHelp Backend Server is running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🛡️  Ready to serve verified human services.`);
  console.log(`===============================================`);
});

export default app;
