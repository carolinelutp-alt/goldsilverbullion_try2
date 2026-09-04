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

  // GET /api/gold - Proxies gold spot price from https://api.gold-api.com/price/XAU/USD
  app.get('/api/gold', async (_req, res) => {
    try {
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (process.env.GOLD_API_KEY) {
        headers['x-access-token'] = process.env.GOLD_API_KEY;
      }
      const response = await fetch('https://api.gold-api.com/price/XAU/USD', { headers });
      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({
          error: `Failed to fetch gold price: ${response.statusText}`,
          details: errText,
        });
      }
      const data = await response.json();
      return res.json(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching gold spot price:', error);
      return res.status(500).json({ error: 'Failed to fetch gold spot price', message });
    }
  });

  // GET /api/silver - Proxies silver spot price from https://api.gold-api.com/price/XAG/USD
  app.get('/api/silver', async (_req, res) => {
    try {
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (process.env.GOLD_API_KEY) {
        headers['x-access-token'] = process.env.GOLD_API_KEY;
      }
      const response = await fetch('https://api.gold-api.com/price/XAG/USD', { headers });
      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({
          error: `Failed to fetch silver price: ${response.statusText}`,
          details: errText,
        });
      }
      const data = await response.json();
      return res.json(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching silver spot price:', error);
      return res.status(500).json({ error: 'Failed to fetch silver spot price', message });
    }
  });

  // GET /api/spot - Aggregated gold & silver spot endpoint
  app.get('/api/spot', async (_req, res) => {
    try {
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (process.env.GOLD_API_KEY) {
        headers['x-access-token'] = process.env.GOLD_API_KEY;
      }

      const [goldRes, silverRes] = await Promise.all([
        fetch('https://api.gold-api.com/price/XAU/USD', { headers }),
        fetch('https://api.gold-api.com/price/XAG/USD', { headers }),
      ]);

      const goldData = goldRes.ok ? await goldRes.json() : null;
      const silverData = silverRes.ok ? await silverRes.json() : null;

      return res.json({
        gold: goldData,
        silver: silverData,
        timestamp: Date.now(),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching aggregated spot prices:', error);
      return res.status(500).json({ error: 'Failed to fetch spot prices', message });
    }
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
