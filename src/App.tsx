import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Currency,
  DeliveryMethod,
  Product,
  ProductCategory,
  SpotPrices,
  VaultLocation,
  WeightUnit,
  CartItem,
} from './types';
import {
  INITIAL_SPOT_PRICES,
  fluctuateSpotPrices,
  calculateUnitPriceUSD,
  calculatePremiumUSD,
  calculateMeltValueUSD,
} from './utils/pricing';
import { PRODUCTS } from './data/products';
import { Header } from './components/Header';
import { MarketChart } from './components/MarketChart';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { BullionCalculator } from './components/BullionCalculator';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AssayTrustSection } from './components/AssayTrustSection';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Filter,
  ArrowUpDown,
  Lock,
  Building2,
  Coins,
  Gem,
  Award,
} from 'lucide-react';

export default function App() {
  // Spot rates state
  const [spotPrices, setSpotPrices] = useState<SpotPrices>(INITIAL_SPOT_PRICES);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Preference state
  const [currency, setCurrency] = useState<Currency>('USD');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('oz');
  const [searchQuery, setSearchQuery] = useState('');

  // Catalog filtering & sorting
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'weight-desc' | 'premium-asc'>('featured');
  const [assayOnly, setAssayOnly] = useState(false);

  // Cart & Modals
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Delivery / Vaulting
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('insured-courier');
  const [vaultLocation, setVaultLocation] = useState<VaultLocation>('singapore-freeport');

  // Trigger brief toast
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Spot price refresh handler
  const handleRefreshSpot = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setSpotPrices((prev) => fluctuateSpotPrices(prev));
      setIsRefreshing(false);
      showToast('Live Spot Prices Refreshed (LBMA / COMEX Benchmark)');
    }, 600);
  }, [showToast]);

  // Cart Management
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    const lockedPricePerUnit = calculateUnitPriceUSD(product, spotPrices, quantity);

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity,
          lockedPricePerUnit,
          currency,
        },
      ];
    });

    showToast(`Added ${quantity}x ${product.name} to cart`);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleBuyNow = (product: Product, quantity: number = 1) => {
    handleAddToCart(product, quantity);
    setIsCheckoutOpen(true);
  };

  const handleOrderCompleted = () => {
    setCart([]);
    showToast('Order confirmed! Official Bullion Receipt Issued.');
  };

  // Scroll to anchor sections smoothly
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'gold-bars' && (p.category !== 'gold-bars')) return false;
        if (selectedCategory === 'gold-coins' && (p.category !== 'gold-coins')) return false;
        if (selectedCategory === 'silver-bars' && (p.category !== 'silver-bars')) return false;
        if (selectedCategory === 'silver-coins' && (p.category !== 'silver-coins')) return false;
      }

      // Assay only filter
      if (assayOnly && !p.assay) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesMint = p.mint.toLowerCase().includes(query);
        const matchesOrigin = p.origin.toLowerCase().includes(query);
        const matchesWeight = p.weightDisplay.toLowerCase().includes(query);
        const matchesMetal = p.metal.toLowerCase().includes(query);
        if (!matchesName && !matchesMint && !matchesOrigin && !matchesWeight && !matchesMetal) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const priceA = calculateUnitPriceUSD(a, spotPrices, 1);
      const priceB = calculateUnitPriceUSD(b, spotPrices, 1);
      const premPctA = a.premiumPercent;
      const premPctB = b.premiumPercent;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'weight-desc') return b.weightGrams - a.weightGrams;
      if (sortBy === 'premium-asc') return premPctA - premPctB;
      // Default: featured first
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [selectedCategory, assayOnly, searchQuery, sortBy, spotPrices]);

  const totalCartItemsCount = cart.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <div className="min-h-screen bg-[#0A0C10] text-neutral-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161B26] text-amber-300 border border-amber-500/40 px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2.5 font-mono text-xs animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with Live Spot Ticker */}
      <Header
        spotPrices={spotPrices}
        onRefreshSpot={handleRefreshSpot}
        isRefreshing={isRefreshing}
        currency={currency}
        onCurrencyChange={setCurrency}
        weightUnit={weightUnit}
        onWeightUnitChange={setWeightUnit}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={totalCartItemsCount}
        onOpenCart={() => setIsCartOpen(true)}
        onScrollToSection={scrollToSection}
      />

      {/* HERO BANNER */}
      <section className="relative w-full py-12 sm:py-16 bg-gradient-to-b from-[#11141D] via-[#0D1017] to-[#0A0C10] border-b border-white/10 overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          
          {/* Trust Badge */}
          <div className="inline-flex items-center space-x-2 text-amber-300 text-xs font-mono font-bold tracking-widest uppercase px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 shadow-inner mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>LBMA Good Delivery Refiners • Direct Mint Provenance</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
            Acquire Minted Gold &amp; Silver Bars with Transparent Live Spot Pricing
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto mt-4 leading-relaxed">
            Institutional-grade physical bullion from PAMP Suisse, The Royal Mint, Perth Mint, and Valcambi. Every bar and coin is priced dynamically from live market spot with transparent mint premiums, refreshed continuously every 10 minutes.
          </p>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mt-8">
            <button
              id="hero-shop-gold-btn"
              onClick={() => {
                setSelectedCategory('gold-bars');
                scrollToSection('catalog-section');
              }}
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 transition-all cursor-pointer"
            >
              <Coins className="w-4 h-4 text-black" />
              <span>Explore Minted Gold Bars</span>
            </button>

            <button
              id="hero-shop-silver-btn"
              onClick={() => {
                setSelectedCategory('silver-bars');
                scrollToSection('catalog-section');
              }}
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
            >
              <Gem className="w-4 h-4 text-slate-300" />
              <span>Explore Minted Silver Bars</span>
            </button>

            <button
              id="hero-calc-btn"
              onClick={() => scrollToSection('calculator-section')}
              className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-[#141824] hover:bg-[#1A2030] text-amber-300 font-mono text-xs border border-amber-500/30 transition-all cursor-pointer"
            >
              <span>Portfolio Calculator</span>
            </button>
          </div>

          {/* Value Props Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12 pt-8 border-t border-white/5 text-xs font-mono text-neutral-400">
            <div className="flex flex-col items-center">
              <span className="font-bold text-white text-sm">10-Min Spot Lock</span>
              <span className="text-[11px] text-neutral-500 mt-0.5">Zero volatility slippage</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-white text-sm">Veriscan Assayed</span>
              <span className="text-[11px] text-neutral-500 mt-0.5">Tamper-evident sealed blister</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-white text-sm">Lloyd&apos;s Insured</span>
              <span className="text-[11px] text-neutral-500 mt-0.5">Armored courier or vault storage</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-white text-sm">99% Buyback</span>
              <span className="text-[11px] text-neutral-500 mt-0.5">Immediate liquidity guarantee</span>
            </div>
          </div>

        </div>
      </section>

      {/* INTERACTIVE SPOT CHART SECTION */}
      <MarketChart spotPrices={spotPrices} currency={currency} weightUnit={weightUnit} />

      {/* CATALOG SECTION */}
      <section id="catalog-section" className="w-full py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 flex-1">
        
        {/* Catalog Filter & Sort Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          
          {/* Category Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs font-mono font-medium">
            <button
              id="cat-all"
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/50'
                  : 'bg-[#141824] text-neutral-400 hover:text-white border border-white/5'
              }`}
            >
              All Minted ({PRODUCTS.length})
            </button>
            <button
              id="cat-gold-bars"
              onClick={() => setSelectedCategory('gold-bars')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === 'gold-bars'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/50'
                  : 'bg-[#141824] text-neutral-400 hover:text-white border border-white/5'
              }`}
            >
              Minted Gold Bars
            </button>
            <button
              id="cat-gold-coins"
              onClick={() => setSelectedCategory('gold-coins')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === 'gold-coins'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/50'
                  : 'bg-[#141824] text-neutral-400 hover:text-white border border-white/5'
              }`}
            >
              Gold Coins
            </button>
            <button
              id="cat-silver-bars"
              onClick={() => setSelectedCategory('silver-bars')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === 'silver-bars'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/50'
                  : 'bg-[#141824] text-neutral-400 hover:text-white border border-white/5'
              }`}
            >
              Minted Silver Bars
            </button>
            <button
              id="cat-silver-coins"
              onClick={() => setSelectedCategory('silver-coins')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === 'silver-coins'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/50'
                  : 'bg-[#141824] text-neutral-400 hover:text-white border border-white/5'
              }`}
            >
              Silver Coins
            </button>
          </div>

          {/* Quick Filters & Sorting */}
          <div className="flex items-center space-x-3 self-start md:self-auto text-xs font-mono">
            {/* Assay Only Toggle */}
            <label className="flex items-center space-x-2 cursor-pointer bg-[#141824] px-3 py-2 rounded-xl border border-white/10 hover:border-white/20">
              <input
                id="assay-only-checkbox"
                type="checkbox"
                checked={assayOnly}
                onChange={(e) => setAssayOnly(e.target.checked)}
                className="accent-amber-400 w-3.5 h-3.5 rounded"
              />
              <span className="text-neutral-300">Assay Cert Only</span>
            </label>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-1.5 bg-[#141824] px-3 py-1.5 rounded-xl border border-white/10">
              <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
              <select
                id="sort-select"
                aria-label="Sort products by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                <option value="featured" className="bg-[#141824]">Sort: Featured</option>
                <option value="price-asc" className="bg-[#141824]">Price: Low to High</option>
                <option value="price-desc" className="bg-[#141824]">Price: High to Low</option>
                <option value="premium-asc" className="bg-[#141824]">Lowest Premium over Spot</option>
                <option value="weight-desc" className="bg-[#141824]">Heaviest Weight</option>
              </select>
            </div>
          </div>

        </div>

        {/* Results Counter */}
        <div className="py-4 text-xs font-mono text-neutral-400 flex items-center justify-between">
          <span>Showing {filteredProducts.length} authenticated bullion products</span>
          <span className="text-amber-400/80">Prices include dynamic 10-minute spot refresh</span>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-[#131620] rounded-3xl border border-white/10 p-12 text-center my-8">
            <Filter className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
            <h3 className="font-serif text-lg text-white">No bullion items match your current filter</h3>
            <p className="text-xs text-neutral-400 mt-1">Try resetting the search keywords or selecting all categories.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setAssayOnly(false);
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/40"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                spotPrices={spotPrices}
                currency={currency}
                onAddToCart={(prod, qty) => handleAddToCart(prod, qty || 1)}
                onSelectProduct={(prod) => setSelectedProduct(prod)}
              />
            ))}
          </div>
        )}

      </section>

      {/* PORTFOLIO CALCULATOR & GROWTH SIMULATOR */}
      <BullionCalculator
        spotPrices={spotPrices}
        currency={currency}
        onExploreProducts={() => scrollToSection('catalog-section')}
      />

      {/* ASSAY ACCREDITATION & VAULTING TRUST SECTION */}
      <AssayTrustSection />

      {/* FOOTER */}
      <footer className="w-full bg-[#080A0E] border-t border-white/10 py-12 px-4 sm:px-6 text-xs text-neutral-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <span className="font-serif font-black text-xs text-amber-400">BP</span>
              </div>
              <span className="font-serif font-bold text-base text-white">BULLIONPOINT</span>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Wholesale and retail precious metals trading desk offering authenticated minted gold and silver bullion with transparent live spot pricing.
            </p>
            <div className="text-[11px] font-mono text-amber-300">
              Singapore • Zurich • London • New York
            </div>
          </div>

          {/* Col 2: Accredited Refiners */}
          <div>
            <h4 className="font-serif font-bold text-white text-sm mb-3">Accredited Refiners</h4>
            <ul className="space-y-1.5 text-xs text-neutral-400">
              <li>PAMP Suisse (Ticino, Switzerland)</li>
              <li>The Royal Mint (Llantrisant, Wales, UK)</li>
              <li>The Perth Mint (Western Australia)</li>
              <li>Valcambi Suisse (Balerna, Switzerland)</li>
              <li>Royal Canadian Mint (Ottawa, Canada)</li>
              <li>United States Mint (West Point, USA)</li>
            </ul>
          </div>

          {/* Col 3: Custody & Vaults */}
          <div>
            <h4 className="font-serif font-bold text-white text-sm mb-3">Custody &amp; Depositories</h4>
            <ul className="space-y-1.5 text-xs text-neutral-400">
              <li>Singapore Le Freeport (Maximum Discretion)</li>
              <li>Zurich Malca-Amit High-Security Vaults</li>
              <li>Delaware Depository (Wilmington, USA)</li>
              <li>Lloyd&apos;s of London Underwritten Transit Insurance</li>
              <li>100% Segregated &amp; Allocated Bailment Title</li>
            </ul>
          </div>

          {/* Col 4: Compliance & Disclaimer */}
          <div>
            <h4 className="font-serif font-bold text-white text-sm mb-3">Regulatory &amp; Compliance</h4>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Investment Precious Metals (IPM) meeting qualifying fineness standards are GST/VAT exempt in Singapore, Switzerland, and the UK. BullionPoint does not provide investment or tax advisory.
            </p>
            <div className="mt-3 flex items-center space-x-2 text-[10px] font-mono text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Full AML/KYC &amp; LBMA Compliance</span>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-neutral-400 font-mono">
          <div>
            © {new Date().getFullYear()} BullionPoint Precious Metals AG. All rights reserved.
          </div>
          <div className="flex items-center space-x-4">
            <span>Spot Feeds: LBMA / COMEX</span>
            <span>•</span>
            <span>Refreshed Every 10 Minutes</span>
          </div>
        </div>
      </footer>

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        spotPrices={spotPrices}
        currency={currency}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p, qty) => handleAddToCart(p, qty)}
        onBuyNow={(p, qty) => handleBuyNow(p, qty)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        currency={currency}
        spotPrices={spotPrices}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        deliveryMethod={deliveryMethod}
        onDeliveryMethodChange={setDeliveryMethod}
        vaultLocation={vaultLocation}
        onVaultLocationChange={setVaultLocation}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        currency={currency}
        spotPrices={spotPrices}
        deliveryMethod={deliveryMethod}
        vaultLocation={vaultLocation}
        onOrderCompleted={handleOrderCompleted}
      />

    </div>
  );
}
