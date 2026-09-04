import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint: /api/data proxying https://open.er-api.com/v6/latest/USD
  app.all('/api/data', async (req, res) => {
    try {
      const accountKey =
        process.env.ACCOUNT_KEY ||
        process.env.ACCOUNTKEY ||
        (req.headers['accountkey'] as string) ||
        '';

      const headers: Record<string, string> = {
        Accept: 'application/json',
        AccountKey: accountKey,
      };

      const response = await fetch('https://open.er-api.com/v6/latest/USD', {
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({
          error: `Failed to fetch exchange rates: ${response.statusText}`,
          details: errorText,
        });
      }

      const data = await response.json();
      return res.json(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching exchange rate data:', error);
      return res.status(500).json({
        error: 'Internal server error fetching exchange rate data',
        message,
      });
    }
  });

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
