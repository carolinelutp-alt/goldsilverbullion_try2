import React, { useState } from 'react';
import { Product } from '../types';
import { ShieldCheck, QrCode, Sparkles, Award } from 'lucide-react';

interface ProductArtworkProps {
  product: Product;
  size?: 'sm' | 'md' | 'lg';
  showAssayCard?: boolean;
  interactiveFlip?: boolean;
}

export const ProductArtwork: React.FC<ProductArtworkProps> = ({
  product,
  size = 'md',
  showAssayCard = true,
  interactiveFlip = false,
}) => {
  const [isReverse, setIsReverse] = useState(false);
  const isGold = product.metal === 'gold';
  const isBar = product.itemType === 'bar';

  // Sizing styles
  const sizeClasses = {
    sm: 'w-24 h-32 text-xs',
    md: 'w-48 h-64 text-sm',
    lg: 'w-64 h-84 text-base',
  }[size];

  // Gold vs Silver gradients
  const metalColors = isGold
    ? {
        surface: 'from-[#FFE898] via-[#E2B755] to-[#B88728]',
        border: 'border-[#F8D878]/60 shadow-[0_8px_30px_rgba(218,165,32,0.25)]',
        inset: 'shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),inset_0_-2px_4px_rgba(139,94,15,0.4)]',
        text: 'text-[#61410B]',
        engraving: 'text-[#4A3208] drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]',
        accent: '#D4AF37',
        highlight: 'rgba(255, 250, 210, 0.4)',
        cardBg: 'bg-gradient-to-b from-[#1C2029] to-[#12151B] border-amber-500/30',
        cardBorder: 'border-amber-500/40',
      }
    : {
        surface: 'from-[#FFFFFF] via-[#E2E8F0] to-[#94A3B8]',
        border: 'border-[#CBD5E1]/60 shadow-[0_8px_30px_rgba(148,163,184,0.22)]',
        inset: 'shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(71,85,105,0.4)]',
        text: 'text-[#1E293B]',
        engraving: 'text-[#0F172A] drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]',
        accent: '#E2E8F0',
        highlight: 'rgba(255, 255, 255, 0.5)',
        cardBg: 'bg-gradient-to-b from-[#1E2430] to-[#111622] border-slate-400/30',
        cardBorder: 'border-slate-400/40',
      };

  return (
    <div className="flex flex-col items-center justify-center select-none">
      {/* Assay Card / Frame Wrapper */}
      {showAssayCard && product.assay ? (
        <div
          id={`assay-card-${product.id}`}
          onClick={() => interactiveFlip && setIsReverse(!isReverse)}
          className={`relative rounded-2xl p-3 sm:p-4 transition-all duration-300 ${
            interactiveFlip ? 'cursor-pointer hover:scale-[1.02]' : ''
          } ${metalColors.cardBg} border ${metalColors.cardBorder} shadow-2xl flex flex-col items-center justify-between w-full max-w-[260px] min-h-[310px] overflow-hidden`}
        >
          {/* Holographic Security Overlay Pattern */}
          <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
          
          {/* Header of Assay Card */}
          <div className="w-full flex items-center justify-between border-b border-white/10 pb-2 z-10">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className={`w-4 h-4 ${isGold ? 'text-amber-400' : 'text-slate-300'}`} />
              <span className="text-[10px] tracking-wider uppercase font-semibold text-neutral-300">
                {product.mint}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-400">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              <span>CERTIPAMP™</span>
            </div>
          </div>

          {/* Central Blister Cavity containing the metal Bar or Coin */}
          <div className="relative my-3.5 p-3 rounded-xl bg-black/40 border border-white/10 shadow-inner flex items-center justify-center w-full min-h-[160px]">
            {/* Specular sheen on plastic bubble */}
            <div className="absolute top-1 left-2 right-2 h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-lg pointer-events-none" />

            {/* Actual Minted Metal Ingot */}
            <div
              className={`relative rounded-lg bg-gradient-to-br ${metalColors.surface} ${metalColors.border} ${metalColors.inset} flex flex-col items-center justify-between p-2.5 transition-transform duration-500 shadow-xl ${
                size === 'sm' ? 'w-20 h-28' : size === 'lg' ? 'w-36 h-48' : 'w-28 h-38'
              }`}
            >
              {/* Metallic surface shimmer */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent rounded-lg pointer-events-none" />

              {!isReverse ? (
                // Obverse (Front)
                <div className="relative z-10 flex flex-col items-center justify-between h-full w-full py-0.5 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold tracking-widest uppercase font-serif text-black/80">
                      {product.mint.split(' ')[0]}
                    </span>
                    <div className="w-5 h-5 rounded-full border border-black/30 flex items-center justify-center my-1 bg-black/5 shadow-inner">
                      <Award className="w-3 h-3 text-black/75" />
                    </div>
                  </div>

                  {/* Motif representation */}
                  <div className="flex flex-col items-center my-0.5">
                    <span className="text-[11px] font-extrabold font-serif tracking-wide text-black/90 uppercase">
                      {product.weightDisplay}
                    </span>
                    <span className="text-[8px] tracking-widest font-mono text-black/70 uppercase">
                      {isGold ? 'FINE GOLD' : 'FINE SILVER'}
                    </span>
                    <span className="text-[9px] font-black font-mono text-black/90">
                      {product.purity.includes('999.9') ? '999.9' : '.999'}
                    </span>
                  </div>

                  {/* Assayer Stamp */}
                  <div className="w-full flex items-center justify-between border-t border-black/20 pt-1 text-[7px] font-mono font-bold text-black/70">
                    <span>ESSAYEUR</span>
                    <span>FONDEUR</span>
                  </div>
                </div>
              ) : (
                // Reverse (Back)
                <div className="relative z-10 flex flex-col items-center justify-between h-full w-full py-0.5 text-center">
                  <div className="text-[8px] font-mono tracking-widest text-black/70 uppercase pt-1">
                    SWISS CRAFTED
                  </div>
                  <div className="p-1 rounded bg-black/10 border border-black/20">
                    <QrCode className="w-7 h-7 text-black/80" />
                  </div>
                  <div className="border border-black/40 px-1 py-0.5 rounded font-mono text-[8px] font-bold tracking-widest text-black/90">
                    NO. 842917
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assay Card Footer */}
          <div className="w-full text-center border-t border-white/10 pt-2 z-10 flex items-center justify-between text-[10px] text-neutral-400">
            <div className="text-left font-mono leading-tight">
              <div className="text-[9px] text-neutral-500">ASSAY CERT NO.</div>
              <div className="font-semibold text-neutral-200">#CH-842917</div>
            </div>
            <div className="text-right leading-tight">
              <div className="text-[9px] text-neutral-500">PURITY</div>
              <div className="font-mono font-semibold text-amber-300">
                {product.purity.includes('999.9') ? '99.99%' : '99.9%'}
              </div>
            </div>
          </div>

          {interactiveFlip && (
            <div className="text-[9px] text-neutral-400/80 mt-1 italic">
              Click card to inspect {isReverse ? 'Obverse' : 'Reverse'}
            </div>
          )}
        </div>
      ) : (
        // Standard Coin or Bar without Assay Card (e.g. Royal Mint Britannia or Silver Eagle)
        <div
          id={`product-piece-${product.id}`}
          onClick={() => interactiveFlip && setIsReverse(!isReverse)}
          className={`relative flex items-center justify-center p-3 rounded-2xl bg-[#141720] border border-white/10 shadow-2xl ${
            interactiveFlip ? 'cursor-pointer hover:scale-[1.03]' : ''
          }`}
        >
          {isBar ? (
            // Bar representation
            <div
              className={`relative rounded-xl bg-gradient-to-br ${metalColors.surface} ${metalColors.border} ${metalColors.inset} flex flex-col items-center justify-between p-3.5 shadow-2xl ${sizeClasses}`}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent rounded-xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col items-center w-full">
                <span className="text-[10px] font-serif font-black tracking-widest text-black/85 uppercase">
                  {product.mint}
                </span>
                <span className="text-[8px] font-mono tracking-wider text-black/60 uppercase">
                  {product.origin}
                </span>
              </div>

              <div className="relative z-10 flex flex-col items-center text-center my-2">
                <div className="w-8 h-8 rounded-full border border-black/30 bg-black/5 flex items-center justify-center mb-1">
                  <Award className="w-5 h-5 text-black/80" />
                </div>
                <div className="font-serif font-black text-sm text-black/90">
                  {product.weightDisplay}
                </div>
                <div className="font-mono font-bold text-[9px] tracking-widest text-black/70">
                  {isGold ? 'FINE GOLD 999.9' : 'FINE SILVER .999'}
                </div>
              </div>

              <div className="relative z-10 w-full flex items-center justify-between border-t border-black/20 pt-1.5 text-[8px] font-mono font-bold text-black/75">
                <span>SERIAL</span>
                <span>{product.serialized ? 'CH-934812' : 'VERIFIED'}</span>
              </div>
            </div>
          ) : (
            // Coin representation with circular reeded rim and proof cameo
            <div
              className={`relative rounded-full bg-gradient-to-br ${metalColors.surface} ${metalColors.border} ${metalColors.inset} flex items-center justify-center p-2 shadow-2xl ${
                size === 'sm' ? 'w-24 h-24' : size === 'lg' ? 'w-52 h-52' : 'w-36 h-36'
              }`}
            >
              {/* Concentric Reeded Coin Edge */}
              <div className="absolute inset-1 rounded-full border-2 border-black/20 border-dashed pointer-events-none opacity-60" />
              <div className="absolute inset-2.5 rounded-full border border-black/30 pointer-events-none" />

              {/* Light reflection ray */}
              <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,white_40deg,transparent_80deg,transparent_180deg,white_220deg,transparent_260deg)] opacity-20 pointer-events-none" />

              {/* Coin Field Relief Content */}
              <div className="relative z-10 flex flex-col items-center justify-center text-center p-2">
                <span className="text-[8px] font-serif font-black tracking-widest text-black/80 uppercase">
                  {product.origin}
                </span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/10 border border-black/30 flex items-center justify-center my-0.5 shadow-inner">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-black/85" />
                </div>
                <span className="text-[10px] sm:text-xs font-serif font-black text-black/95 leading-tight">
                  {product.weightDisplay}
                </span>
                <span className="text-[7px] sm:text-[8px] font-mono font-bold tracking-wider text-black/75 uppercase">
                  {isGold ? '999.9 GOLD' : 'FINE SILVER'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
