import { Currency, MetalType, Product, SpotPrices } from '../types';

// Standard 1 Troy Ounce = 31.1034768 grams
export const TROY_OUNCE_IN_GRAMS = 31.1034768;

export const INITIAL_SPOT_PRICES: SpotPrices = {
  gold: 2742.80,
  silver: 32.15,
  platinum: 988.40,
  palladium: 1018.60,
  change24h: {
    gold: 1.18,
    silver: -0.42,
    platinum: 0.65,
    palladium: -1.05,
  },
  high24h: {
    gold: 2754.20,
    silver: 32.60,
  },
  low24h: {
    gold: 2728.50,
    silver: 31.80,
  },
  lastUpdated: Date.now(),
  nextRefreshSeconds: 600, // 10 minutes = 600 seconds
};

export const CURRENCY_RATES: Record<Currency, { rate: number; symbol: string; prefix: string; name: string }> = {
  USD: { rate: 1.0, symbol: '$', prefix: 'US$', name: 'US Dollar' },
  EUR: { rate: 0.925, symbol: '€', prefix: '€', name: 'Euro' },
  GBP: { rate: 0.792, symbol: '£', prefix: '£', name: 'British Pound' },
  SGD: { rate: 1.324, symbol: 'S$', prefix: 'S$', name: 'Singapore Dollar' },
  AUD: { rate: 1.542, symbol: 'A$', prefix: 'A$', name: 'Australian Dollar' },
  CAD: { rate: 1.395, symbol: 'C$', prefix: 'C$', name: 'Canadian Dollar' },
};

/**
 * Calculates melt value in USD for a product based on current spot prices
 */
export function calculateMeltValueUSD(product: Product, spotPrices: SpotPrices): number {
  const spotRatePerOz = spotPrices[product.metal] || spotPrices.gold;
  return spotRatePerOz * product.weightOz * product.purityFactor;
}

/**
 * Calculates minting premium in USD
 */
export function calculatePremiumUSD(product: Product, spotPrices: SpotPrices, quantity: number = 1): number {
  const meltValue = calculateMeltValueUSD(product, spotPrices);
  
  // Apply volume discount if applicable
  let effectiveDiscount = 0;
  if (product.volumeDiscounts && product.volumeDiscounts.length > 0) {
    const sorted = [...product.volumeDiscounts].sort((a, b) => b.minQty - a.minQty);
    const applicable = sorted.find(d => quantity >= d.minQty);
    if (applicable) {
      effectiveDiscount = applicable.discountPercent;
    }
  }

  const effectivePremiumPercent = Math.max(0.5, product.premiumPercent - effectiveDiscount);
  const percentagePremium = meltValue * (effectivePremiumPercent / 100);
  return percentagePremium + product.fixedPremiumUSD;
}

/**
 * Calculates unit total price in USD
 */
export function calculateUnitPriceUSD(product: Product, spotPrices: SpotPrices, quantity: number = 1): number {
  const melt = calculateMeltValueUSD(product, spotPrices);
  const premium = calculatePremiumUSD(product, spotPrices, quantity);
  return melt + premium;
}

/**
 * Converts USD price to targeted currency
 */
export function convertCurrency(amountInUSD: number, currency: Currency): number {
  const info = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
  return amountInUSD * info.rate;
}

/**
 * Format currency nicely
 */
export function formatCurrency(amountInUSD: number, currency: Currency, showPrefix: boolean = false): string {
  const info = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
  const converted = amountInUSD * info.rate;
  
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(converted);

  if (showPrefix) {
    return `${info.prefix} ${formatted}`;
  }
  return `${info.symbol}${formatted}`;
}

/**
 * Format rate per gram
 */
export function getSpotPricePerGram(spotOzUSD: number): number {
  return spotOzUSD / TROY_OUNCE_IN_GRAMS;
}

/**
 * Simulates micro market fluctuation on 10-minute refresh
 */
export function fluctuateSpotPrices(current: SpotPrices): SpotPrices {
  const goldDelta = (Math.random() * 5.8 - 2.6); // slight +/- fluctuation
  const silverDelta = (Math.random() * 0.22 - 0.10);
  const platDelta = (Math.random() * 3.5 - 1.7);
  const pallDelta = (Math.random() * 4.0 - 2.0);

  const newGold = Math.max(1000, Number((current.gold + goldDelta).toFixed(2)));
  const newSilver = Math.max(10, Number((current.silver + silverDelta).toFixed(2)));
  const newPlat = Math.max(500, Number((current.platinum + platDelta).toFixed(2)));
  const newPall = Math.max(500, Number((current.palladium + pallDelta).toFixed(2)));

  const goldPctChange = Number((current.change24h.gold + (goldDelta / current.gold) * 100).toFixed(2));
  const silverPctChange = Number((current.change24h.silver + (silverDelta / current.silver) * 100).toFixed(2));

  return {
    gold: newGold,
    silver: newSilver,
    platinum: newPlat,
    palladium: newPall,
    change24h: {
      gold: goldPctChange,
      silver: silverPctChange,
      platinum: Number((current.change24h.platinum + 0.05).toFixed(2)),
      palladium: Number((current.change24h.palladium - 0.08).toFixed(2)),
    },
    high24h: {
      gold: Math.max(current.high24h.gold, newGold),
      silver: Math.max(current.high24h.silver, newSilver),
    },
    low24h: {
      gold: Math.min(current.low24h.gold, newGold),
      silver: Math.min(current.low24h.silver, newSilver),
    },
    lastUpdated: Date.now(),
    nextRefreshSeconds: 600,
  };
}
