export interface GoldApiResponse {
  currency: string;
  currencySymbol: string;
  exchangeRate: number;
  name: string;
  price: number;
  symbol: string;
  updatedAt: string;
  updatedAtReadable: string;
}

const GOLD_API_URL = 'https://api.gold-api.com/price/XAU/USD';
const SILVER_API_URL = 'https://api.gold-api.com/price/XAG/USD';

/**
 * Directly calls gold-api (https://api.gold-api.com/price/XAU/USD)
 * Supports client-side or server-side calls since CORS is enabled (Access-Control-Allow-Origin: *).
 */
export async function fetchGoldPriceDirect(): Promise<GoldApiResponse> {
  const response = await fetch(GOLD_API_URL, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch gold price from gold-api: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Directly calls silver price from gold-api (https://api.gold-api.com/price/XAG/USD)
 */
export async function fetchSilverPriceDirect(): Promise<GoldApiResponse> {
  const response = await fetch(SILVER_API_URL, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch silver price from gold-api: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetches both gold and silver directly from gold-api in parallel
 */
export async function fetchDirectSpotPrices() {
  const [gold, silver] = await Promise.allSettled([
    fetchGoldPriceDirect(),
    fetchSilverPriceDirect(),
  ]);

  return {
    gold: gold.status === 'fulfilled' ? gold.value : null,
    silver: silver.status === 'fulfilled' ? silver.value : null,
    timestamp: Date.now(),
  };
}
