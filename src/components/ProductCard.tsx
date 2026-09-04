import React from 'react';
import { Currency, Product, SpotPrices } from '../types';
import { calculateMeltValueUSD, calculatePremiumUSD, calculateUnitPriceUSD, formatCurrency } from '../utils/pricing';
import { ProductArtwork } from './ProductArtwork';
import { Shield, Sparkles, CheckCircle2, ShoppingCart, Eye, ArrowUpRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  spotPrices: SpotPrices;
  currency: Currency;
  onAddToCart: (product: Product, quantity?: number) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  spotPrices,
  currency,
  onAddToCart,
  onSelectProduct,
}) => {
  const isGold = product.metal === 'gold';
  const unitPriceUSD = calculateUnitPriceUSD(product, spotPrices, 1);
  const meltValueUSD = calculateMeltValueUSD(product, spotPrices);
  const premiumUSD = calculatePremiumUSD(product, spotPrices, 1);
  const effectivePremiumPct = ((premiumUSD / meltValueUSD) * 100).toFixed(1);

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative bg-[#131620] hover:bg-[#161B27] rounded-2xl border border-white/10 hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-amber-500/10"
    >
      {/* Top Badges */}
      <div className="p-4 pb-0 flex items-start justify-between z-10">
        <div className="flex flex-wrap gap-1.5">
          <span
            className={`text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-md border ${
              isGold
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-slate-400/15 text-slate-200 border-slate-400/30'
            }`}
          >
            {isGold ? '24K GOLD' : 'FINE SILVER'}
          </span>
          {product.assay && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
              <Shield className="w-2.5 h-2.5" />
              <span>ASSAY CERT</span>
            </span>
          )}
        </div>

        {product.featured && (
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 flex items-center space-x-1">
            <Sparkles className="w-2.5 h-2.5" />
            <span>BESTSELLER</span>
          </span>
        )}
      </div>

      {/* Product Artwork Preview (Interactive on hover/click) */}
      <div
        onClick={() => onSelectProduct(product)}
        className="p-4 flex items-center justify-center cursor-pointer relative group-hover:scale-105 transition-transform duration-300"
      >
        <ProductArtwork product={product} size="md" showAssayCard={product.assay} />
      </div>

      {/* Product Details & Live Transparent Pricing */}
      <div className="p-4 pt-2 border-t border-white/5 flex flex-col flex-1 justify-between bg-[#10131B]/60">
        <div>
          {/* Mint & Origin */}
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span className="font-semibold text-neutral-300">{product.mint}</span>
            <span className="text-neutral-500">{product.origin}</span>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onSelectProduct(product)}
            className="font-serif font-bold text-base text-white hover:text-amber-300 transition-colors line-clamp-2 cursor-pointer"
          >
            {product.name}
          </h3>

          {/* Specification Tagline */}
          <div className="text-xs text-neutral-400 font-mono mt-1 flex items-center space-x-2">
            <span>{product.weightDisplay}</span>
            <span>•</span>
            <span className="text-neutral-300">{product.purity}</span>
          </div>
        </div>

        {/* Transparent Spot Breakdown Box */}
        <div className="mt-3.5 pt-3 border-t border-white/5 space-y-2">
          
          {/* Total Live Price */}
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-mono text-neutral-400">Total Price:</span>
            <span className="font-mono text-xl font-bold text-white tracking-tight">
              {formatCurrency(unitPriceUSD, currency)}
            </span>
          </div>

          {/* Transparent Formula Display */}
          <div className="bg-[#090B0F] p-2 rounded-lg border border-white/5 text-[11px] font-mono space-y-1">
            <div className="flex justify-between text-neutral-400">
              <span>Pure Melt Value:</span>
              <span className="text-neutral-200">{formatCurrency(meltValueUSD, currency)}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Minting Premium:</span>
              <span className="text-amber-300">
                +{formatCurrency(premiumUSD, currency)} (+{effectivePremiumPct}%)
              </span>
            </div>
          </div>

          {/* Volume Discount Teaser */}
          {product.volumeDiscounts && product.volumeDiscounts.length > 0 && (
            <div className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Volume discounts available up to {product.volumeDiscounts[product.volumeDiscounts.length - 1].discountPercent}% off</span>
            </div>
          )}

          {/* Stock Indicator */}
          <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
            <span className="flex items-center space-x-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
              <span>Vault Ready ({product.inStock} left)</span>
            </span>
            <span className="text-neutral-500 font-mono">LBMA Accredited</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          <button
            id={`view-details-${product.id}`}
            onClick={() => onSelectProduct(product)}
            title="Inspect bar specifications and obverse/reverse"
            className="col-span-1 flex items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            id={`add-to-cart-${product.id}`}
            onClick={() => onAddToCart(product, 1)}
            className="col-span-3 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 transition-all cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4 text-black" />
            <span>Add to Cart</span>
          </button>
        </div>

      </div>
    </div>
  );
};
