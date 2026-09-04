import React, { useState } from 'react';
import { Currency, SpotPrices, WeightUnit } from '../types';
import { formatCurrency, TROY_OUNCE_IN_GRAMS } from '../utils/pricing';
import { Calculator, TrendingUp, Sparkles, DollarSign, ArrowRight, Shield } from 'lucide-react';

interface BullionCalculatorProps {
  spotPrices: SpotPrices;
  currency: Currency;
  onExploreProducts: () => void;
}

export const BullionCalculator: React.FC<BullionCalculatorProps> = ({
  spotPrices,
  currency,
  onExploreProducts,
}) => {
  const [goldOz, setGoldOz] = useState<number>(2);
  const [silverOz, setSilverOz] = useState<number>(50);
  
  // Future projection sliders
  const [projectedGoldUSD, setProjectedGoldUSD] = useState<number>(Math.round(spotPrices.gold * 1.25));
  const [projectedSilverUSD, setProjectedSilverUSD] = useState<number>(Math.round(spotPrices.silver * 1.35));

  // Current values
  const currentGoldValueUSD = goldOz * spotPrices.gold;
  const currentSilverValueUSD = silverOz * spotPrices.silver;
  const currentTotalValueUSD = currentGoldValueUSD + currentSilverValueUSD;

  // Projected values
  const projectedGoldValueUSD = goldOz * projectedGoldUSD;
  const projectedSilverValueUSD = silverOz * projectedSilverUSD;
  const projectedTotalValueUSD = projectedGoldValueUSD + projectedSilverValueUSD;

  const valueGainUSD = projectedTotalValueUSD - currentTotalValueUSD;
  const percentageGain = currentTotalValueUSD > 0 ? (valueGainUSD / currentTotalValueUSD) * 100 : 0;

  return (
    <section id="calculator-section" className="w-full py-12 bg-[#0C0F16] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 text-amber-400 text-xs font-mono font-semibold uppercase tracking-widest mb-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive Bullion Valuation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight">
            Precious Metals Portfolio &amp; Growth Simulator
          </h2>
          <p className="text-sm text-neutral-400 mt-2">
            Calculate your tangible metal valuation based on current live spot prices, or test forward market projections to model wealth preservation against inflation.
          </p>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls & Inputs (7 cols) */}
          <div className="lg:col-span-7 bg-[#131722] rounded-3xl border border-white/10 p-6 sm:p-8 shadow-xl space-y-6">
            
            <h3 className="font-serif font-bold text-lg text-white flex items-center space-x-2">
              <span>Step 1: Input Your Metal Allocation</span>
            </h3>

            {/* Gold Input */}
            <div className="bg-[#0B0D13] p-4 rounded-2xl border border-white/5 space-y-3">
              <div className="flex justify-between items-center">
                <label htmlFor="gold-weight-input" className="text-xs font-mono text-amber-400 uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span className="font-bold">Gold Holdings (Fine Troy Ounces):</span>
                </label>
                <span className="text-xs font-mono text-neutral-400">
                  ~{(goldOz * TROY_OUNCE_IN_GRAMS).toFixed(1)} grams
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  id="gold-weight-input"
                  type="number"
                  min="0"
                  step="0.5"
                  value={goldOz}
                  onChange={(e) => setGoldOz(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-28 bg-[#1A1F2D] text-lg font-mono font-bold text-white px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-amber-500/60"
                />
                <input
                  id="gold-range-slider"
                  aria-label="Gold Weight Range Slider"
                  type="range"
                  min="0"
                  max="20"
                  step="0.5"
                  value={goldOz}
                  onChange={(e) => setGoldOz(parseFloat(e.target.value))}
                  className="flex-1 accent-amber-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Silver Input */}
            <div className="bg-[#0B0D13] p-4 rounded-2xl border border-white/5 space-y-3">
              <div className="flex justify-between items-center">
                <label htmlFor="silver-weight-input" className="text-xs font-mono text-slate-300 uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                  <span className="font-bold">Silver Holdings (Fine Troy Ounces):</span>
                </label>
                <span className="text-xs font-mono text-neutral-400">
                  ~{(silverOz * TROY_OUNCE_IN_GRAMS).toFixed(1)} grams
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  id="silver-weight-input"
                  type="number"
                  min="0"
                  step="5"
                  value={silverOz}
                  onChange={(e) => setSilverOz(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-28 bg-[#1A1F2D] text-lg font-mono font-bold text-white px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-slate-400/60"
                />
                <input
                  id="silver-range-slider"
                  aria-label="Silver Weight Range Slider"
                  type="range"
                  min="0"
                  max="500"
                  step="10"
                  value={silverOz}
                  onChange={(e) => setSilverOz(parseFloat(e.target.value))}
                  className="flex-1 accent-slate-300 cursor-pointer"
                />
              </div>
            </div>

            {/* Step 2: Spot Growth Projection Sliders */}
            <div className="pt-2 border-t border-white/5 space-y-4">
              <h3 className="font-serif font-bold text-lg text-white flex items-center space-x-2">
                <span>Step 2: Simulate Future Market Scenarios</span>
              </h3>

              {/* Target Gold Spot */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <label htmlFor="target-gold-slider" className="text-neutral-400 cursor-pointer">Target Gold Spot (USD / oz):</label>
                  <span className="text-amber-300 font-bold">${projectedGoldUSD.toLocaleString()}</span>
                </div>
                <input
                  id="target-gold-slider"
                  aria-label="Target Gold Spot Price Range Slider"
                  type="range"
                  min={Math.round(spotPrices.gold * 0.8)}
                  max={5000}
                  step="50"
                  value={projectedGoldUSD}
                  onChange={(e) => setProjectedGoldUSD(parseInt(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Target Silver Spot */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <label htmlFor="target-silver-slider" className="text-neutral-400 cursor-pointer">Target Silver Spot (USD / oz):</label>
                  <span className="text-slate-300 font-bold">${projectedSilverUSD.toLocaleString()}</span>
                </div>
                <input
                  id="target-silver-slider"
                  aria-label="Target Silver Spot Price Range Slider"
                  type="range"
                  min={Math.round(spotPrices.silver * 0.8)}
                  max={100}
                  step="1"
                  value={projectedSilverUSD}
                  onChange={(e) => setProjectedSilverUSD(parseInt(e.target.value))}
                  className="w-full accent-slate-300 cursor-pointer"
                />
              </div>
            </div>

          </div>

          {/* Results & Simulation Output (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#161B26] to-[#0E121B] rounded-3xl border border-amber-500/30 p-6 sm:p-8 shadow-2xl space-y-6 flex flex-col justify-between">
            
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                  Valuation Summary
                </span>
                <span className="text-xs font-mono text-amber-400 font-semibold">
                  Live Spot Based
                </span>
              </div>

              {/* Current Value */}
              <div className="mt-4">
                <div className="text-xs text-neutral-400 font-mono">Current Pure Melt Value:</div>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-white mt-1">
                  {formatCurrency(currentTotalValueUSD, currency)}
                </div>
                <div className="flex items-center space-x-4 text-xs font-mono text-neutral-400 mt-2">
                  <span>Gold: {formatCurrency(currentGoldValueUSD, currency)}</span>
                  <span>•</span>
                  <span>Silver: {formatCurrency(currentSilverValueUSD, currency)}</span>
                </div>
              </div>

              {/* Projected Value Banner */}
              <div className="mt-6 p-4 rounded-2xl bg-[#090C12] border border-amber-500/30 space-y-3">
                <div className="text-xs text-amber-300 font-mono flex items-center space-x-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Simulated Valuation at Target:</span>
                </div>
                <div className="text-3xl font-mono font-extrabold text-white">
                  {formatCurrency(projectedTotalValueUSD, currency)}
                </div>

                <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-white/10">
                  <span className="text-neutral-400">Projected Gain:</span>
                  <span className={`font-bold ${valueGainUSD >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {valueGainUSD >= 0 ? '+' : ''}{formatCurrency(valueGainUSD, currency)} ({percentageGain.toFixed(1)}%)
                  </span>
                </div>
              </div>

              {/* Physical Delivery / Vaulting Benefit */}
              <div className="mt-4 space-y-2 text-xs text-neutral-400">
                <div className="flex items-center space-x-2">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Direct title ownership with allocated serial numbers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Exempt from GST/VAT as Investment Precious Metals (IPM)</span>
                </div>
              </div>
            </div>

            {/* CTA to Explore Recommended Products */}
            <button
              id="calculator-explore-btn"
              onClick={onExploreProducts}
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-sm shadow-xl shadow-amber-500/20 transition-all cursor-pointer"
            >
              <span>Explore Minted Bars &amp; Coins</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>

        </div>

      </div>
    </section>
  );
};
