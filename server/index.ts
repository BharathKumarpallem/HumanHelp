import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
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
const PORT = parseInt(process.env.PORT || '5173', 10);

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test' && req.originalUrl.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'HumanHelp Unified Platform',
    version: '1.0.0',
    mode: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Mount Backend API Routes
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

// 404 handler for unmatched API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
  }
  next();
});

async function startUnifiedServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const distPath = path.resolve(process.cwd(), 'dist');

  // Unified frontend integration
  if (!isProduction && fs.existsSync(path.resolve(process.cwd(), 'vite.config.ts'))) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('⚡ Vite HMR & SPA dev middleware integrated directly into Express server');
    } catch (err) {
      console.warn('Vite dev middleware initialization warning, falling back to static build:', err);
      if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));
        app.use((_req, res) => {
          res.sendFile(path.resolve(distPath, 'index.html'));
        });
      }
    }
  } else if (fs.existsSync(distPath)) {
    console.log(`📦 Serving pre-built production bundle from ${distPath}`);
    app.use(express.static(distPath));
    app.use((_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`=============================================================`);
    console.log(`🚀 HumanHelp UNIFIED Full-Stack Platform is running!`);
    console.log(`🌐 Combined URL (Frontend + Backend + DB): http://localhost:${PORT}`);
    console.log(`📡 Backend API: http://localhost:${PORT}/api/health`);
    console.log(`🛡️  All services, UI, and database connected in ONE place.`);
    console.log(`=============================================================`);
  });
}

startUnifiedServer();

export default app;
