import React, { useState } from 'react';
import { Currency, Product, SpotPrices } from '../types';
import {
  calculateMeltValueUSD,
  calculatePremiumUSD,
  calculateUnitPriceUSD,
  formatCurrency,
} from '../utils/pricing';
import { ProductArtwork } from './ProductArtwork';
import {
  X,
  ShieldCheck,
  Award,
  Layers,
  CheckCircle2,
  ShoppingCart,
  RotateCcw,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  spotPrices: SpotPrices;
  currency: Currency;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  spotPrices,
  currency,
  onClose,
  onAddToCart,
  onBuyNow,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [activeSide, setActiveSide] = useState<'obverse' | 'reverse'>('obverse');

  if (!product) return null;

  const isGold = product.metal === 'gold';
  const unitPriceUSD = calculateUnitPriceUSD(product, spotPrices, quantity);
  const meltValueUSD = calculateMeltValueUSD(product, spotPrices);
  const premiumUSD = calculatePremiumUSD(product, spotPrices, quantity);
  const totalPriceUSD = unitPriceUSD * quantity;

  // Buyback estimate (LBMA spot - 1%)
  const buybackPerUnitUSD = meltValueUSD * 0.99;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div
        id="product-modal-container"
        className="relative w-full max-w-4xl bg-[#11141D] rounded-3xl border border-white/10 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-[#141824]/80">
          <div className="flex items-center space-x-3">
            <span
              className={`text-xs font-mono font-bold tracking-wider px-2.5 py-1 rounded-lg border ${
                isGold
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-slate-400/15 text-slate-200 border-slate-400/30'
              }`}
            >
              {isGold ? '24 KARAT GOLD' : 'FINE SILVER'}
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              LBMA Accredited Refiner • {product.origin}
            </span>
          </div>

          <button
            id="close-product-modal"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two columns on desktop */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Left Column: Interactive Visual Ingot / Coin Viewer (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-between bg-[#0B0D13] p-6 rounded-2xl border border-white/5">
            
            {/* Obverse / Reverse Toggle */}
            <div className="flex items-center space-x-2 bg-[#161B26] p-1 rounded-xl border border-white/10 text-xs font-mono mb-4">
              <button
                id="btn-inspect-obverse"
                onClick={() => setActiveSide('obverse')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeSide === 'obverse'
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Obverse (Front)
              </button>
              <button
                id="btn-inspect-reverse"
                onClick={() => setActiveSide('reverse')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeSide === 'reverse'
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Reverse (Back)
              </button>
            </div>

            {/* Artwork Render */}
            <div className="my-2 transform hover:scale-105 transition-transform duration-300">
              <ProductArtwork product={product} size="lg" showAssayCard={product.assay} interactiveFlip={true} />
            </div>

            {/* Side Description */}
            <div className="text-center text-xs text-neutral-400 font-mono mt-4 max-w-xs bg-white/5 p-2.5 rounded-xl border border-white/5">
              <span className="text-amber-300 font-bold">
                {activeSide === 'obverse' ? 'Obverse Design: ' : 'Reverse Design: '}
              </span>
              <span>
                {activeSide === 'obverse' ? product.obverseDescription : product.reverseDescription}
              </span>
            </div>

            {/* Buyback Guarantee Notice */}
            <div className="w-full mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-neutral-300">BullionPoint Buyback:</span>
              </div>
              <span className="font-mono font-bold text-emerald-300">
                {formatCurrency(buybackPerUnitUSD, currency)} / unit
              </span>
            </div>

          </div>

          {/* Right Column: Information, Live Pricing, Discounts & Action (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
            
            <div>
              <div className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
                {product.mint}
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
                {product.name}
              </h1>
              <p className="text-sm text-neutral-300 mt-2 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Transparent Live Pricing Breakdown */}
            <div className="bg-[#141824] p-4 rounded-2xl border border-white/10 space-y-2.5">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-mono text-neutral-400">Live Price (Locked for 10m):</span>
                  <div className="text-2xl sm:text-3xl font-mono font-extrabold text-amber-300 tracking-tight">
                    {formatCurrency(unitPriceUSD, currency)}
                    <span className="text-xs font-normal text-neutral-400 ml-1">/ unit</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-neutral-400">Total ({quantity} pcs):</span>
                  <div className="text-xl font-mono font-bold text-white">
                    {formatCurrency(totalPriceUSD, currency)}
                  </div>
                </div>
              </div>

              {/* Exact Formula Breakdown */}
              <div className="bg-[#0A0C11] p-3 rounded-xl border border-white/5 font-mono text-xs space-y-1.5">
                <div className="flex justify-between text-neutral-400">
                  <span>Pure Melt Value ({product.weightDisplay}):</span>
                  <span className="text-neutral-200">{formatCurrency(meltValueUSD, currency)}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Minting & Fabrication Premium:</span>
                  <span className="text-amber-300">
                    +{formatCurrency(premiumUSD, currency)} (+{((premiumUSD / meltValueUSD) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="border-t border-white/10 pt-1 flex justify-between text-neutral-300 font-semibold">
                  <span>Unit Price:</span>
                  <span className="text-white">{formatCurrency(unitPriceUSD, currency)}</span>
                </div>
              </div>
            </div>

            {/* Volume Tiered Discount Table */}
            {product.volumeDiscounts && product.volumeDiscounts.length > 0 && (
              <div className="bg-[#141824] p-3.5 rounded-xl border border-white/10">
                <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tiered Volume Discounts</span>
                </div>
                <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                  <div className="p-2 rounded-lg bg-black/40 border border-white/5 text-center">
                    <div className="text-neutral-400 text-[10px]">1 - 4 pcs</div>
                    <div className="font-bold text-white mt-0.5">Standard</div>
                  </div>
                  {product.volumeDiscounts.map((disc, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg border text-center transition-colors ${
                        quantity >= disc.minQty
                          ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                          : 'bg-black/40 border-white/5 text-neutral-300'
                      }`}
                    >
                      <div className="text-neutral-400 text-[10px]">{disc.minQty}+ pcs</div>
                      <div className="font-bold text-emerald-400 mt-0.5">-{disc.discountPercent}% Off</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specifications Grid */}
            <div className="bg-[#141824] p-4 rounded-2xl border border-white/10">
              <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-3">
                Certified Bullion Specifications
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                <div className="bg-black/30 p-2 rounded-lg">
                  <div className="text-neutral-500 text-[10px]">PURITY</div>
                  <div className="font-semibold text-white mt-0.5">{product.purity}</div>
                </div>
                <div className="bg-black/30 p-2 rounded-lg">
                  <div className="text-neutral-500 text-[10px]">FINE WEIGHT</div>
                  <div className="font-semibold text-white mt-0.5">{product.weightGrams} g ({product.weightDisplay})</div>
                </div>
                <div className="bg-black/30 p-2 rounded-lg">
                  <div className="text-neutral-500 text-[10px]">DIMENSIONS</div>
                  <div className="font-semibold text-white mt-0.5">{product.dimensions}</div>
                </div>
                <div className="bg-black/30 p-2 rounded-lg">
                  <div className="text-neutral-500 text-[10px]">THICKNESS</div>
                  <div className="font-semibold text-white mt-0.5">{product.thickness}</div>
                </div>
                <div className="bg-black/30 p-2 rounded-lg">
                  <div className="text-neutral-500 text-[10px]">SERIALIZATION</div>
                  <div className="font-semibold text-emerald-400 mt-0.5">
                    {product.serialized ? 'Individual Serial' : 'Mint Mark Verified'}
                  </div>
                </div>
                <div className="bg-black/30 p-2 rounded-lg">
                  <div className="text-neutral-500 text-[10px]">ASSAY CARD</div>
                  <div className="font-semibold text-amber-300 mt-0.5">
                    {product.assay ? 'Sealed Blister Cert' : 'Government Tube/Capsule'}
                  </div>
                </div>
              </div>
            </div>

            {/* Quantity Selector & Action CTA */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              
              {/* Quantity Picker */}
              <div className="flex items-center bg-[#141824] rounded-xl border border-white/10 p-1">
                <button
                  id="decrease-qty"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 flex items-center justify-center text-neutral-300 hover:text-white rounded-lg hover:bg-white/5 font-bold cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.inStock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.inStock, parseInt(e.target.value) || 1)))}
                  className="w-12 text-center font-mono font-bold text-white bg-transparent focus:outline-none"
                />
                <button
                  id="increase-qty"
                  onClick={() => setQuantity(Math.min(product.inStock, quantity + 1))}
                  className="w-9 h-9 flex items-center justify-center text-neutral-300 hover:text-white rounded-lg hover:bg-white/5 font-bold cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                id="modal-add-to-cart"
                onClick={() => {
                  onAddToCart(product, quantity);
                  onClose();
                }}
                className="flex-1 w-full sm:w-auto flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 transition-all cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add {quantity} to Cart</span>
              </button>

              {/* Buy Now (Direct Checkout) */}
              <button
                id="modal-buy-now"
                onClick={() => {
                  onBuyNow(product, quantity);
                  onClose();
                }}
                className="flex-1 w-full sm:w-auto flex items-center justify-center space-x-2 py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-sm shadow-xl shadow-amber-500/25 transition-all cursor-pointer"
              >
                <span>Instant Lock &amp; Buy</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
