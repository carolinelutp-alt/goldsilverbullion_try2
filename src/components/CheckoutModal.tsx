import React, { useState } from 'react';
import { CartItem, Currency, DeliveryMethod, OrderDetails, SpotPrices, VaultLocation } from '../types';
import { formatCurrency } from '../utils/pricing';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Building2,
  CreditCard,
  QrCode,
  Printer,
  Download,
  Lock,
  ArrowRight,
  BadgePercent,
  Check,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: Currency;
  spotPrices: SpotPrices;
  deliveryMethod: DeliveryMethod;
  vaultLocation: VaultLocation;
  onOrderCompleted: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  spotPrices,
  deliveryMethod,
  vaultLocation,
  onOrderCompleted,
}) => {
  const [step, setStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  
  // Form fields
  const [fullName, setFullName] = useState('Alexander Vance');
  const [email, setEmail] = useState('a.vance@sovereign-holdings.ch');
  const [phone, setPhone] = useState('+41 22 819 9200');
  const [address, setAddress] = useState('14 Rue du Rhône, Private Suite 4');
  const [city, setCity] = useState('Geneva');
  const [country, setCountry] = useState('Switzerland');
  const [postalCode, setPostalCode] = useState('1204');
  const [paymentMethod, setPaymentMethod] = useState<'wire-transfer' | 'credit-card' | 'crypto-usdc'>('wire-transfer');

  const [confirmedOrder, setConfirmedOrder] = useState<OrderDetails | null>(null);

  if (!isOpen) return null;

  const subtotalUSD = items.reduce((sum, item) => sum + item.lockedPricePerUnit * item.quantity, 0);
  const insuranceShippingUSD = deliveryMethod === 'allocated-vault' ? 0 : subtotalUSD >= 1000 ? 0 : 35.0;
  
  // 1.5% discount on bank wire
  const paymentDiscountUSD = paymentMethod === 'wire-transfer' ? subtotalUSD * 0.015 : 0;
  const totalUSD = subtotalUSD + insuranceShippingUSD - paymentDiscountUSD;

  const handlePlaceOrder = () => {
    const order: OrderDetails = {
      orderId: `BP-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      items,
      subtotal: subtotalUSD,
      insuranceShipping: insuranceShippingUSD,
      paymentDiscount: paymentDiscountUSD,
      total: totalUSD,
      currency,
      deliveryMethod,
      vaultLocation,
      customer: {
        fullName,
        email,
        phone,
        address,
        city,
        country,
        postalCode,
      },
      paymentMethod,
      spotLockedGoldUSD: spotPrices.gold,
      spotLockedSilverUSD: spotPrices.silver,
    };

    setConfirmedOrder(order);
    setStep('confirmation');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div
        id="checkout-modal-container"
        className="relative w-full max-w-3xl bg-[#11141D] rounded-3xl border border-white/10 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-[#141824]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-white">
                {step === 'confirmation' ? 'Official Bullion Trade Confirmation' : 'Secure Bullion Acquisition'}
              </h2>
              <div className="text-xs font-mono text-neutral-400">
                {step === 'details' && 'Step 1 of 2: Custody & Delivery Verification'}
                {step === 'payment' && 'Step 2 of 2: Settlement & Payment Method'}
                {step === 'confirmation' && `Trade Executed • Order ${confirmedOrder?.orderId}`}
              </div>
            </div>
          </div>

          <button
            id="close-checkout-modal"
            onClick={() => {
              if (step === 'confirmation') {
                onOrderCompleted();
              }
              onClose();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* STEP 1: Details */}
          {step === 'details' && (
            <div className="space-y-6">
              
              {/* Delivery / Vault Notice */}
              <div className="p-4 rounded-2xl bg-[#161B26] border border-white/10 flex items-start space-x-3">
                <Building2 className="w-5 h-5 text-amber-400 mt-0.5" />
                <div className="text-xs text-neutral-300">
                  <div className="font-bold text-white text-sm">
                    {deliveryMethod === 'allocated-vault' ? 'Allocated Vault Custody' : 'Armored Courier Delivery'}
                  </div>
                  <div className="text-neutral-400 mt-1">
                    {deliveryMethod === 'allocated-vault'
                      ? `Allocated title storage selected in ${vaultLocation.replace('-', ' ').toUpperCase()}. You will receive a verified deposit certificate with serial numbers.`
                      : 'Discrete, armored delivery with signature confirmation and Lloyd’s of London transit insurance included.'}
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="space-y-1.5">
                  <label htmlFor="checkout-fullname" className="text-neutral-400 block cursor-pointer">Beneficial Owner Full Name:</label>
                  <input
                    id="checkout-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#141824] p-2.5 rounded-xl border border-white/10 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="checkout-email" className="text-neutral-400 block cursor-pointer">Official Confirmation Email:</label>
                  <input
                    id="checkout-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#141824] p-2.5 rounded-xl border border-white/10 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="checkout-phone" className="text-neutral-400 block cursor-pointer">Direct Phone / Verification:</label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#141824] p-2.5 rounded-xl border border-white/10 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="checkout-country" className="text-neutral-400 block cursor-pointer">Country of Residence / Tax Jurisdiction:</label>
                  <input
                    id="checkout-country"
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-[#141824] p-2.5 rounded-xl border border-white/10 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {deliveryMethod === 'insured-courier' && (
                  <>
                    <div className="sm:col-span-2 space-y-1.5">
                      <label htmlFor="checkout-address" className="text-neutral-400 block cursor-pointer">Insured Armored Delivery Address:</label>
                      <input
                        id="checkout-address"
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-[#141824] p-2.5 rounded-xl border border-white/10 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="checkout-city" className="text-neutral-400 block cursor-pointer">City:</label>
                      <input
                        id="checkout-city"
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-[#141824] p-2.5 rounded-xl border border-white/10 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="checkout-postal" className="text-neutral-400 block cursor-pointer">Postal / Zip Code:</label>
                      <input
                        id="checkout-postal"
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full bg-[#141824] p-2.5 rounded-xl border border-white/10 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Order Mini Breakdown */}
              <div className="p-4 rounded-2xl bg-[#141824] border border-white/5 space-y-2 text-xs font-mono">
                <div className="text-neutral-400 uppercase tracking-wider text-[11px] mb-2 font-bold">
                  Order Summary ({items.length} Items)
                </div>
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-neutral-300">
                    <span className="truncate pr-4">
                      {item.quantity}x {item.product.name}
                    </span>
                    <span className="text-white font-semibold">
                      {formatCurrency(item.lockedPricePerUnit * item.quantity, currency)}
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-sm text-white">
                  <span>Subtotal:</span>
                  <span className="text-amber-300">{formatCurrency(subtotalUSD, currency)}</span>
                </div>
              </div>

              <button
                id="next-to-payment-btn"
                onClick={() => setStep('payment')}
                className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-sm shadow-xl shadow-amber-500/25 transition-all cursor-pointer"
              >
                <span>Continue to Settlement Method</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Payment */}
          {step === 'payment' && (
            <div className="space-y-6">
              <div className="text-sm font-serif font-bold text-white">
                Choose Institutional Settlement Method
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                {/* Bank Wire */}
                <div
                  id="payment-wire-option"
                  onClick={() => setPaymentMethod('wire-transfer')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between ${
                    paymentMethod === 'wire-transfer'
                      ? 'bg-amber-500/15 border-amber-500/60 text-white'
                      : 'bg-[#141824] border-white/10 text-neutral-300 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Building2 className={`w-5 h-5 mt-0.5 ${paymentMethod === 'wire-transfer' ? 'text-amber-400' : 'text-neutral-400'}`} />
                    <div>
                      <div className="font-bold text-sm flex items-center space-x-2">
                        <span>Bank Wire Transfer (SWIFT / Fedwire)</span>
                        <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center space-x-1">
                          <BadgePercent className="w-3 h-3" />
                          <span>1.5% Bullion Cash Discount</span>
                        </span>
                      </div>
                      <div className="text-xs text-neutral-400 mt-1">
                        Preferred institutional settlement method. Wire details provided immediately on order lock.
                      </div>
                    </div>
                  </div>
                  {paymentMethod === 'wire-transfer' && <Check className="w-5 h-5 text-amber-400" />}
                </div>

                {/* Credit Card */}
                <div
                  id="payment-card-option"
                  onClick={() => setPaymentMethod('credit-card')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between ${
                    paymentMethod === 'credit-card'
                      ? 'bg-amber-500/15 border-amber-500/60 text-white'
                      : 'bg-[#141824] border-white/10 text-neutral-300 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <CreditCard className={`w-5 h-5 mt-0.5 ${paymentMethod === 'credit-card' ? 'text-amber-400' : 'text-neutral-400'}`} />
                    <div>
                      <div className="font-bold text-sm">Credit / Debit Card (Visa, Mastercard, Amex)</div>
                      <div className="text-xs text-neutral-400 mt-1">
                        Instant trade authorization with 3D-Secure 2.0 biometric fraud screening.
                      </div>
                    </div>
                  </div>
                  {paymentMethod === 'credit-card' && <Check className="w-5 h-5 text-amber-400" />}
                </div>

                {/* Crypto */}
                <div
                  id="payment-crypto-option"
                  onClick={() => setPaymentMethod('crypto-usdc')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between ${
                    paymentMethod === 'crypto-usdc'
                      ? 'bg-amber-500/15 border-amber-500/60 text-white'
                      : 'bg-[#141824] border-white/10 text-neutral-300 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <QrCode className={`w-5 h-5 mt-0.5 ${paymentMethod === 'crypto-usdc' ? 'text-amber-400' : 'text-neutral-400'}`} />
                    <div>
                      <div className="font-bold text-sm">USDC / USDT / Bitcoin (Web3 Direct Settlement)</div>
                      <div className="text-xs text-neutral-400 mt-1">
                        On-chain settlement with zero chargeback risk.
                      </div>
                    </div>
                  </div>
                  {paymentMethod === 'crypto-usdc' && <Check className="w-5 h-5 text-amber-400" />}
                </div>
              </div>

              {/* Total Calculation Table */}
              <div className="p-4 rounded-2xl bg-[#0B0D13] border border-white/5 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal:</span>
                  <span className="text-white">{formatCurrency(subtotalUSD, currency)}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Transit Insurance &amp; Courier:</span>
                  <span className="text-emerald-400">
                    {insuranceShippingUSD === 0 ? 'Complimentary' : formatCurrency(insuranceShippingUSD, currency)}
                  </span>
                </div>
                {paymentDiscountUSD > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Wire Settlement Discount (1.5%):</span>
                    <span>-{formatCurrency(paymentDiscountUSD, currency)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-base text-white">
                  <span>Total Amount Due:</span>
                  <span className="text-amber-300 text-xl font-bold">{formatCurrency(totalUSD, currency)}</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setStep('details')}
                  className="px-4 py-3.5 rounded-xl border border-white/10 hover:bg-white/5 text-neutral-300 text-xs font-bold font-mono cursor-pointer"
                >
                  Back
                </button>
                <button
                  id="confirm-place-order-btn"
                  onClick={handlePlaceOrder}
                  className="flex-1 flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-sm shadow-xl shadow-amber-500/25 transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Execute Trade &amp; Lock Price ({formatCurrency(totalUSD, currency)})</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Confirmation / Official Trade Invoice */}
          {step === 'confirmation' && confirmedOrder && (
            <div id="printable-invoice" className="space-y-6">
              
              {/* Success Badge */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-3 text-emerald-300">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-white text-sm">
                    Trade Order Successfully Executed and Reserved
                  </div>
                  <div className="text-emerald-300/90 mt-0.5">
                    Your spot price and metal inventory have been locked. An official trade contract has been generated.
                  </div>
                </div>
              </div>

              {/* Official Invoice Certificate Document */}
              <div className="bg-[#141824] rounded-2xl border border-white/10 p-6 space-y-6 font-mono text-xs shadow-inner">
                
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <div className="font-serif font-bold text-xl text-white">BULLIONPOINT AG</div>
                    <div className="text-neutral-400 text-[10px]">
                      PRECIOUS METALS VAULTING &amp; TRADING DESK
                    </div>
                    <div className="text-neutral-500 text-[10px]">
                      ZURICH (CH) • SINGAPORE (SG) • LONDON (UK)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-amber-400 font-bold text-sm">{confirmedOrder.orderId}</div>
                    <div className="text-neutral-400 text-[11px]">{confirmedOrder.date}</div>
                    <div className="text-emerald-400 text-[10px] font-semibold">STATUS: CONFIRMED &amp; ALLOCATED</div>
                  </div>
                </div>

                {/* Buyer & Custody Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-white/10 pb-4">
                  <div>
                    <div className="text-neutral-500 text-[10px] uppercase font-bold">CLIENT BENEFICIAL OWNER</div>
                    <div className="font-bold text-white text-sm mt-0.5">{confirmedOrder.customer.fullName}</div>
                    <div className="text-neutral-300 text-[11px]">{confirmedOrder.customer.email}</div>
                    <div className="text-neutral-400 text-[11px]">{confirmedOrder.customer.phone}</div>
                    <div className="text-neutral-400 text-[11px]">{confirmedOrder.customer.country}</div>
                  </div>
                  <div>
                    <div className="text-neutral-500 text-[10px] uppercase font-bold">CUSTODY / FULFILLMENT</div>
                    <div className="font-bold text-amber-300 text-sm mt-0.5">
                      {confirmedOrder.deliveryMethod === 'allocated-vault'
                        ? 'Allocated High-Security Vault Storage'
                        : 'Insured Armored Courier Delivery'}
                    </div>
                    <div className="text-neutral-300 text-[11px] mt-0.5">
                      {confirmedOrder.deliveryMethod === 'allocated-vault'
                        ? `Depository: ${confirmedOrder.vaultLocation?.replace('-', ' ').toUpperCase()}`
                        : `Address: ${confirmedOrder.customer.address}, ${confirmedOrder.customer.city}`}
                    </div>
                    <div className="text-neutral-400 text-[10px]">
                      Settlement: {confirmedOrder.paymentMethod.replace('-', ' ').toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Locked Spot Rates */}
                <div className="bg-[#0B0D13] p-3 rounded-xl border border-white/5 flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400">Locked Spot Price Benchmarks:</span>
                  <div className="space-x-4">
                    <span className="text-amber-300 font-bold">
                      Gold: ${confirmedOrder.spotLockedGoldUSD.toFixed(2)}/oz
                    </span>
                    <span className="text-slate-300 font-bold">
                      Silver: ${confirmedOrder.spotLockedSilverUSD.toFixed(2)}/oz
                    </span>
                  </div>
                </div>

                {/* Itemized Table */}
                <div className="space-y-2">
                  <div className="text-neutral-400 text-[11px] uppercase font-bold">Allocated Precious Metals</div>
                  <div className="space-y-1.5">
                    {confirmedOrder.items.map((it) => (
                      <div
                        key={it.product.id}
                        className="flex justify-between items-center py-1.5 border-b border-white/5 text-neutral-300"
                      >
                        <div>
                          <span className="font-semibold text-white">{it.quantity}x </span>
                          <span>{it.product.name} ({it.product.weightDisplay}, {it.product.purity})</span>
                        </div>
                        <span className="font-mono text-white font-bold">
                          {formatCurrency(it.lockedPricePerUnit * it.quantity, confirmedOrder.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total Summary */}
                <div className="border-t border-white/10 pt-3 space-y-1 text-right">
                  <div className="text-neutral-400 text-xs">
                    Subtotal: {formatCurrency(confirmedOrder.subtotal, confirmedOrder.currency)}
                  </div>
                  {confirmedOrder.paymentDiscount > 0 && (
                    <div className="text-emerald-400 text-xs">
                      Wire Transfer Discount: -{formatCurrency(confirmedOrder.paymentDiscount, confirmedOrder.currency)}
                    </div>
                  )}
                  <div className="text-neutral-400 text-xs">
                    Courier &amp; Insurance: {confirmedOrder.insuranceShipping === 0 ? 'Complimentary' : formatCurrency(confirmedOrder.insuranceShipping, confirmedOrder.currency)}
                  </div>
                  <div className="text-lg font-bold text-white pt-1">
                    Total Settled: <span className="text-amber-300">{formatCurrency(confirmedOrder.total, confirmedOrder.currency)}</span>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center space-x-2">
                  <button
                    id="print-invoice-btn"
                    onClick={handlePrint}
                    className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Invoice</span>
                  </button>
                  <button
                    id="download-receipt-btn"
                    onClick={handlePrint}
                    className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Save PDF</span>
                  </button>
                </div>

                <button
                  id="done-order-btn"
                  onClick={() => {
                    onOrderCompleted();
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  Complete &amp; Return to Store
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
