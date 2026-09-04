import React, { useEffect, useState } from 'react';
import { Currency, SpotPrices, WeightUnit } from '../types';
import { formatCurrency, getSpotPricePerGram, CURRENCY_RATES } from '../utils/pricing';
import {
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Search,
  Scale,
  Lock,
} from 'lucide-react';

interface HeaderProps {
  spotPrices: SpotPrices;
  onRefreshSpot: () => void;
  isRefreshing: boolean;
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  weightUnit: WeightUnit;
  onWeightUnitChange: (u: WeightUnit) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  spotPrices,
  onRefreshSpot,
  isRefreshing,
  currency,
  onCurrencyChange,
  weightUnit,
  onWeightUnitChange,
  searchQuery,
  onSearchChange,
  cartCount,
  onOpenCart,
  onScrollToSection,
}) => {
  // Countdown timer for 10-minute refresh
  const [secondsRemaining, setSecondsRemaining] = useState(spotPrices.nextRefreshSeconds);

  useEffect(() => {
    setSecondsRemaining(spotPrices.nextRefreshSeconds);
  }, [spotPrices.nextRefreshSeconds]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          onRefreshSpot();
          return 600;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onRefreshSpot]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Unit-adjusted spot rates
  const goldUnitFactor = weightUnit === 'g' ? getSpotPricePerGram(spotPrices.gold) : spotPrices.gold;
  const silverUnitFactor = weightUnit === 'g' ? getSpotPricePerGram(spotPrices.silver) : spotPrices.silver;
  const platUnitFactor = weightUnit === 'g' ? getSpotPricePerGram(spotPrices.platinum) : spotPrices.platinum;
  const unitLabel = weightUnit === 'g' ? '/g' : '/oz';

  const goldSilverRatio = (spotPrices.gold / spotPrices.silver).toFixed(1);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B0D12]/95 backdrop-blur-md border-b border-white/10 shadow-2xl">
      {/* 1. TOP LIVE SPOT TICKER BAR */}
      <div className="bg-[#121620] border-b border-white/5 py-2 px-3 sm:px-6 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          
          {/* Market Status & Timer */}
          <div className="flex items-center space-x-3 text-neutral-300">
            <div className="flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-semibold text-emerald-300 tracking-wide">
                LIVE SPOT MARKET
              </span>
            </div>

            <div className="hidden sm:flex items-center space-x-1.5 text-neutral-400 font-mono text-[11px]">
              <Lock className="w-3 h-3 text-amber-400/80" />
              <span>Refresh in:</span>
              <span className="font-semibold text-amber-300 bg-black/40 px-1.5 py-0.5 rounded border border-white/10">
                {formatTime(secondsRemaining)}
              </span>
            </div>

            <button
              id="refresh-spot-button"
              onClick={onRefreshSpot}
              disabled={isRefreshing}
              title="Force instantaneous spot price sync"
              className="flex items-center space-x-1 text-neutral-400 hover:text-amber-300 transition-colors cursor-pointer text-[11px] px-1.5 py-0.5 rounded hover:bg-white/5"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden md:inline">Sync Now</span>
            </button>
          </div>

          {/* Precious Metals Live Quotes */}
          <div className="flex items-center space-x-4 sm:space-x-6 font-mono text-xs overflow-x-auto py-0.5">
            {/* Gold */}
            <div className="flex items-center space-x-1.5 whitespace-nowrap">
              <span className="text-amber-400 font-bold flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                <span>GOLD:</span>
              </span>
              <span className="font-semibold text-white">
                {formatCurrency(goldUnitFactor, currency)}{unitLabel}
              </span>
              <span
                className={`flex items-center text-[11px] ${
                  spotPrices.change24h.gold >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {spotPrices.change24h.gold >= 0 ? (
                  <TrendingUp className="w-3 h-3 mr-0.5 inline" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-0.5 inline" />
                )}
                {spotPrices.change24h.gold >= 0 ? '+' : ''}
                {spotPrices.change24h.gold}%
              </span>
            </div>

            {/* Silver */}
            <div className="flex items-center space-x-1.5 whitespace-nowrap">
              <span className="text-slate-300 font-bold flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-slate-300 inline-block"></span>
                <span>SILVER:</span>
              </span>
              <span className="font-semibold text-white">
                {formatCurrency(silverUnitFactor, currency)}{unitLabel}
              </span>
              <span
                className={`flex items-center text-[11px] ${
                  spotPrices.change24h.silver >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {spotPrices.change24h.silver >= 0 ? (
                  <TrendingUp className="w-3 h-3 mr-0.5 inline" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-0.5 inline" />
                )}
                {spotPrices.change24h.silver >= 0 ? '+' : ''}
                {spotPrices.change24h.silver}%
              </span>
            </div>

            {/* Platinum */}
            <div className="hidden lg:flex items-center space-x-1.5 whitespace-nowrap text-neutral-400">
              <span className="text-sky-300 font-medium">PLAT:</span>
              <span>{formatCurrency(platUnitFactor, currency)}{unitLabel}</span>
            </div>

            {/* Gold/Silver Ratio */}
            <div className="hidden xl:flex items-center space-x-1 text-neutral-400 border-l border-white/10 pl-4 whitespace-nowrap">
              <Scale className="w-3 h-3 text-amber-400/80" />
              <span>Au/Ag Ratio:</span>
              <span className="text-amber-200 font-semibold">{goldSilverRatio}:1</span>
            </div>
          </div>

          {/* Unit Switcher: oz vs g */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/10 text-[11px]">
              <button
                id="unit-toggle-oz"
                onClick={() => onWeightUnitChange('oz')}
                className={`px-2 py-0.5 rounded font-mono font-medium transition-all ${
                  weightUnit === 'oz'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Troy oz
              </button>
              <button
                id="unit-toggle-g"
                onClick={() => onWeightUnitChange('g')}
                className={`px-2 py-0.5 rounded font-mono font-medium transition-all ${
                  weightUnit === 'g'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Grams (g)
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 2. PRIMARY NAVBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div
          id="brand-logo-button"
          onClick={() => onScrollToSection('catalog-section')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          {/* Gold Ingot Emblem Icon */}
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0F1117] rounded-[10px] flex items-center justify-center">
              <span className="font-serif font-black text-lg bg-gradient-to-br from-amber-200 to-amber-500 bg-clip-text text-transparent">
                BP
              </span>
            </div>
          </div>

          <div>
            <div className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center">
              <span>BULLION</span>
              <span className="text-amber-400">POINT</span>
            </div>
            <div className="text-[9px] font-mono tracking-widest text-neutral-400 uppercase -mt-0.5">
              Minted Gold & Silver • LBMA Assayed
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-sm relative mx-4">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 pointer-events-none" />
          <input
            id="search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search 1 oz bars, Britannia, PAMP, Maple..."
            className="w-full bg-[#131722] text-sm text-neutral-200 pl-9 pr-4 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 placeholder:text-neutral-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 text-xs text-neutral-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Right Navigation & Utility Actions */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          {/* Quick Section Nav (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-1 text-xs text-neutral-300 font-medium">
            <button
              id="nav-catalog"
              onClick={() => onScrollToSection('catalog-section')}
              className="px-3 py-1.5 rounded-lg hover:text-amber-300 hover:bg-white/5 transition-colors cursor-pointer"
            >
              Minted Catalog
            </button>
            <button
              id="nav-chart"
              onClick={() => onScrollToSection('chart-section')}
              className="px-3 py-1.5 rounded-lg hover:text-amber-300 hover:bg-white/5 transition-colors cursor-pointer"
            >
              Spot Chart
            </button>
            <button
              id="nav-calculator"
              onClick={() => onScrollToSection('calculator-section')}
              className="px-3 py-1.5 rounded-lg hover:text-amber-300 hover:bg-white/5 transition-colors cursor-pointer"
            >
              Portfolio Calculator
            </button>
            <button
              id="nav-assay"
              onClick={() => onScrollToSection('assay-section')}
              className="px-3 py-1.5 rounded-lg hover:text-amber-300 hover:bg-white/5 transition-colors cursor-pointer"
            >
              Assay & Vaults
            </button>
          </nav>

          {/* Currency Selector */}
          <div className="relative">
            <select
              id="currency-select"
              aria-label="Select Currency"
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value as Currency)}
              className="bg-[#141824] text-xs font-mono font-bold text-amber-300 border border-white/10 rounded-xl px-2.5 py-2 cursor-pointer focus:outline-none focus:border-amber-500/50 hover:bg-[#1A2030] transition-colors"
            >
              {(Object.keys(CURRENCY_RATES) as Currency[]).map((c) => (
                <option key={c} value={c} className="bg-[#121620] text-neutral-200">
                  {CURRENCY_RATES[c].symbol} {c}
                </option>
              ))}
            </select>
          </div>

          {/* Shopping Cart Button */}
          <button
            id="open-cart-button"
            onClick={onOpenCart}
            className="relative flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs px-3.5 py-2 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4 text-black" />
            <span className="hidden sm:inline font-bold">Cart</span>
            {cartCount > 0 && (
              <span className="bg-black text-amber-300 text-[10px] font-mono font-extrabold w-5 h-5 rounded-full flex items-center justify-center ml-1 border border-amber-300/40">
                {cartCount}
              </span>
            )}
          </button>

        </div>
      </div>
    </header>
  );
};
