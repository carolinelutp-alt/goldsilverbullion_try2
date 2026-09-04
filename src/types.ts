export type MetalType = 'gold' | 'silver' | 'platinum' | 'palladium';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'SGD' | 'AUD' | 'CAD';

export type WeightUnit = 'oz' | 'g' | 'kg';

export type ProductCategory = 'all' | 'gold-bars' | 'gold-coins' | 'silver-bars' | 'silver-coins';

export interface SpotPrices {
  gold: number;      // Price per Troy Ounce in USD
  silver: number;    // Price per Troy Ounce in USD
  platinum: number;  // Price per Troy Ounce in USD
  palladium: number; // Price per Troy Ounce in USD
  change24h: {
    gold: number;
    silver: number;
    platinum: number;
    palladium: number;
  };
  high24h: {
    gold: number;
    silver: number;
  };
  low24h: {
    gold: number;
    silver: number;
  };
  lastUpdated: number; // epoch timestamp
  nextRefreshSeconds: number; // countdown
}

export interface VolumeDiscount {
  minQty: number;
  discountPercent: number; // e.g. 1.0 = 1% off premium
}

export interface Product {
  id: string;
  name: string;
  category: 'gold-bars' | 'gold-coins' | 'silver-bars' | 'silver-coins';
  metal: MetalType;
  purity: string;              // e.g. "999.9 Fine Gold (24K)"
  purityFactor: number;        // e.g. 0.9999
  weightOz: number;            // weight in Troy ounces
  weightGrams: number;         // weight in Grams
  weightDisplay: string;       // e.g. "1 oz", "100 g", "1 kg"
  mint: string;                // e.g. "PAMP Suisse", "The Royal Mint"
  origin: string;              // e.g. "Switzerland", "United Kingdom"
  assay: boolean;              // comes with sealed assay certificate
  serialized: boolean;         // has unique serial number
  premiumPercent: number;      // markup percentage over spot
  fixedPremiumUSD: number;     // fixed minting fee (especially for fractional weights)
  inStock: number;
  dimensions: string;
  thickness: string;
  featured?: boolean;
  itemType: 'bar' | 'coin';
  themeColor: 'gold' | 'silver';
  description: string;
  obverseDescription: string;
  reverseDescription: string;
  volumeDiscounts: VolumeDiscount[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  lockedPricePerUnit: number;
  currency: Currency;
}

export type DeliveryMethod = 'insured-courier' | 'allocated-vault';

export type VaultLocation = 'singapore-freeport' | 'zurich-malca-amit' | 'delaware-depository' | 'london-vaults';

export interface OrderDetails {
  orderId: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  insuranceShipping: number;
  paymentDiscount: number;
  total: number;
  currency: Currency;
  deliveryMethod: DeliveryMethod;
  vaultLocation?: VaultLocation;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    country?: string;
    postalCode?: string;
  };
  paymentMethod: 'wire-transfer' | 'credit-card' | 'crypto-usdc' | 'ach-direct';
  spotLockedGoldUSD: number;
  spotLockedSilverUSD: number;
}
