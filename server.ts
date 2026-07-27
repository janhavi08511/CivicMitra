import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { connectDatabase } from './server/config/database.ts';
import healthRoutes from './server/routes/health.ts';
import authRoutes from './server/routes/auth.ts';
import contentRoutes from './server/routes/content.ts';
import eventRoutes from './server/routes/events.ts';
import adminRoutes from './server/routes/admin.ts';
import { seedStarterData } from './server/services/seedService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function listenWithFallback(app: express.Express, port: number, host = '0.0.0.0') {
  const server = app.listen(port, host, () => {
    const address = server.address();
    const actualPort = typeof address === 'object' && address ? address.port : port;
    console.log(`Server running on http://localhost:${actualPort}`);
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.warn(`Port ${port} is already in use. Trying ${port + 1}...`);
      server.close(() => listenWithFallback(app, port + 1, host));
    } else {
      console.error('Server failed to start', error);
      process.exit(1);
    }
  });
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

  app.use(express.json({ limit: '10mb' }));

  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  app.use('/api', healthRoutes);
  app.use('/api', authRoutes);
  app.use('/api', contentRoutes);
  app.use('/api', eventRoutes);
  app.use('/api', adminRoutes);

  try {
    await connectDatabase();
    console.log('MongoDB connected');
    await seedStarterData();
    console.log('Starter data seeded');
  } catch (error) {
    console.error('MongoDB connection failed', error);
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  listenWithFallback(app, PORT);
}

startServer();
