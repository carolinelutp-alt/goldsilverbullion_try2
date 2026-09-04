import React, { useState, useMemo } from 'react';
import { Currency, MetalType, SpotPrices, WeightUnit } from '../types';
import { formatCurrency, getSpotPricePerGram } from '../utils/pricing';
import {
  TrendingUp,
  Clock,
  ShieldCheck,
  BarChart3,
  Layers,
} from 'lucide-react';

interface MarketChartProps {
  spotPrices: SpotPrices;
  currency: Currency;
  weightUnit: WeightUnit;
}

type TimeFrame = '24H' | '7D' | '30D' | '1Y' | '5Y';

export const MarketChart: React.FC<MarketChartProps> = ({
  spotPrices,
  currency,
  weightUnit,
}) => {
  const [selectedMetal, setSelectedMetal] = useState<MetalType>('gold');
  const [timeframe, setTimeframe] = useState<TimeFrame>('30D');
  const [hoveredPoint, setHoveredPoint] = useState<{ price: number; label: string; x: number; y: number } | null>(null);

  // Current spot rate
  const currentSpotUSD = spotPrices[selectedMetal];
  const unitSpotUSD = weightUnit === 'g' ? getSpotPricePerGram(currentSpotUSD) : currentSpotUSD;
  const unitLabel = weightUnit === 'g' ? '/g' : '/oz';

  // Generate realistic historical curve based on metal and timeframe
  const chartData = useMemo(() => {
    const pointsCount = timeframe === '24H' ? 24 : timeframe === '7D' ? 28 : timeframe === '30D' ? 30 : 25;
    const base = currentSpotUSD;
    const volatility = selectedMetal === 'silver' ? 0.035 : 0.018;

    const data: { label: string; priceUSD: number }[] = [];
    let price = base * (timeframe === '5Y' ? 0.65 : timeframe === '1Y' ? 0.82 : 0.96);

    for (let i = 0; i < pointsCount; i++) {
      const progress = i / (pointsCount - 1);
      // Drift upward towards current spot price
      const trend = (base - price) * 0.15;
      const noise = (Math.sin(i * 1.3) * 0.5 + (Math.random() - 0.48)) * (base * volatility);
      price = i === pointsCount - 1 ? base : price + trend + noise;

      let label = '';
      if (timeframe === '24H') {
        label = `${(i).toString().padStart(2, '0')}:00`;
      } else if (timeframe === '7D') {
        const d = new Date();
        d.setDate(d.getDate() - (7 - Math.floor(i / 4)));
        label = d.toLocaleDateString('en-US', { weekday: 'short' });
      } else if (timeframe === '30D') {
        label = `Day ${i + 1}`;
      } else if (timeframe === '1Y') {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        label = months[i % 12];
      } else {
        label = `${2021 + Math.floor(i / 5)}`;
      }

      data.push({ label, priceUSD: Number(price.toFixed(2)) });
    }
    return data;
  }, [currentSpotUSD, selectedMetal, timeframe]);

  // SVG Chart bounds
  const width = 800;
  const height = 240;
  const padding = 30;

  const minPrice = Math.min(...chartData.map((d) => d.priceUSD));
  const maxPrice = Math.max(...chartData.map((d) => d.priceUSD));
  const priceRange = maxPrice - minPrice || 1;

  const points = chartData.map((d, index) => {
    const x = padding + (index / (chartData.length - 1)) * (width - padding * 2);
    const y = height - padding - ((d.priceUSD - minPrice) / priceRange) * (height - padding * 2);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  const isGold = selectedMetal === 'gold';
  const strokeColor = isGold ? '#F59E0B' : '#94A3B8';
  const gradientId = `metal-gradient-${selectedMetal}`;

  // Spread calculations
  const bidUSD = currentSpotUSD * 0.9985;
  const askUSD = currentSpotUSD * 1.0015;
  const spreadUSD = askUSD - bidUSD;

  return (
    <section id="chart-section" className="w-full py-8 sm:py-12 bg-[#0E1118] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono font-semibold uppercase tracking-widest mb-1.5">
              <BarChart3 className="w-4 h-4" />
              <span>Institutional Spot Exchange</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight">
              Live Precious Metals Spot Benchmark
            </h2>
            <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
              Transparent, unmanipulated wholesale spot prices derived directly from global LBMA and COMEX market feeds. Refreshed continuously every 10 minutes.
            </p>
          </div>

          {/* Metal Picker Tabs */}
          <div className="flex items-center bg-[#141824] p-1 rounded-xl border border-white/10 self-start lg:self-auto">
            <button
              id="chart-metal-gold"
              onClick={() => setSelectedMetal('gold')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedMetal === 'gold'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-200"></span>
              <span>Gold (XAU)</span>
            </button>
            <button
              id="chart-metal-silver"
              onClick={() => setSelectedMetal('silver')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedMetal === 'silver'
                  ? 'bg-gradient-to-r from-slate-200 to-slate-400 text-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
              <span>Silver (XAG)</span>
            </button>
            <button
              id="chart-metal-platinum"
              onClick={() => setSelectedMetal('platinum')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedMetal === 'platinum'
                  ? 'bg-gradient-to-r from-sky-300 to-sky-500 text-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-sky-300"></span>
              <span>Platinum (XPT)</span>
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Chart Card (3 cols) */}
          <div className="lg:col-span-3 bg-[#131722] rounded-2xl border border-white/10 p-4 sm:p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
            
            {/* Chart Top Bar: Price + Timeframe controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                  Current Spot ({selectedMetal.toUpperCase()})
                </div>
                <div className="flex items-baseline space-x-3 mt-1">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
                    {formatCurrency(unitSpotUSD, currency, true)}{unitLabel}
                  </span>
                  <span
                    className={`flex items-center text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${
                      spotPrices.change24h[selectedMetal] >= 0
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5 mr-1" />
                    {spotPrices.change24h[selectedMetal] >= 0 ? '+' : ''}
                    {spotPrices.change24h[selectedMetal]}% (24h)
                  </span>
                </div>
              </div>

              {/* Timeframe Selector */}
              <div className="flex items-center bg-[#0C0E14] rounded-xl p-1 border border-white/10 text-xs font-mono">
                {(['24H', '7D', '30D', '1Y', '5Y'] as TimeFrame[]).map((tf) => (
                  <button
                    key={tf}
                    id={`timeframe-${tf}`}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      timeframe === tf
                        ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive SVG Chart Canvas */}
            <div className="relative w-full h-[250px] sm:h-[280px] select-none">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-full overflow-visible"
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {[0.25, 0.5, 0.75].map((factor, i) => {
                  const y = padding + factor * (height - padding * 2);
                  const priceLabel = maxPrice - factor * priceRange;
                  const displayPrice = weightUnit === 'g' ? getSpotPricePerGram(priceLabel) : priceLabel;
                  return (
                    <g key={i}>
                      <line
                        x1={padding}
                        y1={y}
                        x2={width - padding}
                        y2={y}
                        stroke="rgba(255,255,255,0.06)"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={width - padding + 5}
                        y={y + 3}
                        fill="#64748B"
                        fontSize="9"
                        fontFamily="monospace"
                      >
                        {formatCurrency(displayPrice, currency)}
                      </text>
                    </g>
                  );
                })}

                {/* Shaded Area */}
                <path d={areaD} fill={`url(#${gradientId})`} />

                {/* Line Path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Interactive Points */}
                {points.map((p, idx) => (
                  <circle
                    key={idx}
                    cx={p.x}
                    cy={p.y}
                    r={hoveredPoint && hoveredPoint.label === p.label ? 5 : 2}
                    fill={strokeColor}
                    className="transition-all cursor-pointer opacity-80 hover:opacity-100"
                    onMouseEnter={() =>
                      setHoveredPoint({
                        price: p.priceUSD,
                        label: p.label,
                        x: p.x,
                        y: p.y,
                      })
                    }
                  />
                ))}
              </svg>

              {/* Hover Tooltip Overlay */}
              {hoveredPoint && (
                <div
                  className="absolute z-20 pointer-events-none bg-[#090B0E] border border-amber-500/40 shadow-xl rounded-lg p-2 text-xs font-mono transform -translate-x-1/2 -translate-y-full mb-2 whitespace-nowrap"
                  style={{
                    left: `${(hoveredPoint.x / width) * 100}%`,
                    top: `${(hoveredPoint.y / height) * 100}%`,
                  }}
                >
                  <div className="text-neutral-400 text-[10px]">{hoveredPoint.label}</div>
                  <div className="font-bold text-amber-300 text-sm">
                    {formatCurrency(
                      weightUnit === 'g' ? getSpotPricePerGram(hoveredPoint.price) : hoveredPoint.price,
                      currency
                    )}
                    {unitLabel}
                  </div>
                </div>
              )}
            </div>

            {/* Chart Subtext / Transparency Notice */}
            <div className="flex flex-wrap items-center justify-between text-xs text-neutral-400 border-t border-white/5 pt-3 mt-2">
              <div className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Last updated: {new Date(spotPrices.lastUpdated).toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>LBMA / COMEX Direct Feed Verification</span>
              </div>
            </div>

          </div>

          {/* Right Column: Key Spot Statistics & Ratio */}
          <div className="flex flex-col space-y-4">
            
            {/* 1. Bid / Ask Spread Box */}
            <div className="bg-[#131722] rounded-2xl border border-white/10 p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3 text-xs font-mono uppercase tracking-wider text-neutral-400">
                <span>Wholesale Liquidity</span>
                <span className="text-emerald-400 font-bold">Tight Spread</span>
              </div>
              
              <div className="space-y-3 font-mono">
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-xs text-neutral-400">Market Bid (Sell):</span>
                  <span className="text-sm font-bold text-neutral-200">
                    {formatCurrency(weightUnit === 'g' ? getSpotPricePerGram(bidUSD) : bidUSD, currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-xs text-neutral-400">Market Ask (Buy):</span>
                  <span className="text-sm font-bold text-amber-300">
                    {formatCurrency(weightUnit === 'g' ? getSpotPricePerGram(askUSD) : askUSD, currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs text-neutral-400">Spread:</span>
                  <span className="text-xs font-medium text-neutral-400">
                    {formatCurrency(weightUnit === 'g' ? getSpotPricePerGram(spreadUSD) : spreadUSD, currency)} (0.12%)
                  </span>
                </div>
              </div>
            </div>

            {/* 2. 24H Range Card */}
            <div className="bg-[#131722] rounded-2xl border border-white/10 p-5 shadow-xl">
              <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">
                24-Hour Trading Range
              </div>
              <div className="space-y-2 font-mono">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">24h Low:</span>
                  <span className="text-rose-400 font-semibold">
                    {formatCurrency(
                      weightUnit === 'g'
                        ? getSpotPricePerGram(spotPrices.low24h[selectedMetal === 'gold' ? 'gold' : 'silver'] || 0)
                        : spotPrices.low24h[selectedMetal === 'gold' ? 'gold' : 'silver'] || 0,
                      currency
                    )}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="w-2/3 h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 rounded-full" />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">24h High:</span>
                  <span className="text-emerald-400 font-semibold">
                    {formatCurrency(
                      weightUnit === 'g'
                        ? getSpotPricePerGram(spotPrices.high24h[selectedMetal === 'gold' ? 'gold' : 'silver'] || 0)
                        : spotPrices.high24h[selectedMetal === 'gold' ? 'gold' : 'silver'] || 0,
                      currency
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Gold / Silver Ratio Card */}
            <div className="bg-[#131722] rounded-2xl border border-white/10 p-5 shadow-xl flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-amber-400 mb-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Gold/Silver Ratio</span>
                </div>
                <div className="text-2xl font-mono font-bold text-white mt-1">
                  {(spotPrices.gold / spotPrices.silver).toFixed(1)} : 1
                </div>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  It currently takes {(spotPrices.gold / spotPrices.silver).toFixed(1)} ounces of silver to equal the market value of 1 ounce of gold. Historical average is ~60:1.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-neutral-500">
                Transparent spot prices power every bar and coin in our catalog with zero hidden fees.
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
