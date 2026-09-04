import React from 'react';
import { CartItem, Currency, DeliveryMethod, SpotPrices, VaultLocation } from '../types';
import { formatCurrency } from '../utils/pricing';
import {
  X,
  Trash2,
  Lock,
  Truck,
  Building2,
  ShieldCheck,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: Currency;
  spotPrices: SpotPrices;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  deliveryMethod: DeliveryMethod;
  onDeliveryMethodChange: (m: DeliveryMethod) => void;
  vaultLocation: VaultLocation;
  onVaultLocationChange: (v: VaultLocation) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  spotPrices,
  onUpdateQuantity,
  onRemoveItem,
  deliveryMethod,
  onDeliveryMethodChange,
  vaultLocation,
  onVaultLocationChange,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const subtotalUSD = items.reduce((sum, item) => sum + item.lockedPricePerUnit * item.quantity, 0);
  const insuranceShippingUSD = deliveryMethod === 'allocated-vault' ? 0 : subtotalUSD >= 1000 ? 0 : 35.0;
  const totalUSD = subtotalUSD + insuranceShippingUSD;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        id="cart-backdrop"
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          id="cart-drawer-container"
          className="w-screen max-w-md bg-[#11141D] border-l border-white/10 shadow-2xl flex flex-col justify-between"
        >
          {/* Cart Header */}
          <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-[#141824]">
            <div className="flex items-center space-x-2.5">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h2 className="font-serif font-bold text-lg text-white">Your Bullion Order</h2>
              <span className="bg-white/10 font-mono text-xs text-amber-300 px-2 py-0.5 rounded-full">
                {items.length} items
              </span>
            </div>
            <button
              id="close-cart-drawer"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Price Lock Banner */}
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2 text-amber-300">
              <Lock className="w-3.5 h-3.5" />
              <span>Spot Price Locked</span>
            </div>
            <span className="text-neutral-400">Guaranteed for 10 min</span>
          </div>

          {/* Cart Items List */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center space-y-3 text-neutral-400">
                <ShoppingBag className="w-12 h-12 text-neutral-600 stroke-[1.5]" />
                <p className="font-serif text-lg text-neutral-300">Your cart is empty</p>
                <p className="text-xs max-w-xs text-neutral-500">
                  Select certified gold and silver minted bars or sovereign coins to lock in live spot pricing.
                </p>
                <button
                  id="browse-catalog-empty"
                  onClick={onClose}
                  className="mt-2 text-xs font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                >
                  Browse Minted Catalog
                </button>
              </div>
            ) : (
              items.map((item) => {
                const itemTotalUSD = item.lockedPricePerUnit * item.quantity;
                return (
                  <div
                    key={item.product.id}
                    id={`cart-item-${item.product.id}`}
                    className="bg-[#141824] p-3.5 rounded-2xl border border-white/10 flex items-center justify-between gap-3 shadow-md"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-mono text-neutral-400 uppercase">
                        {item.product.mint}
                      </div>
                      <h4 className="font-serif font-bold text-sm text-white truncate">
                        {item.product.name}
                      </h4>
                      <div className="text-xs font-mono text-amber-400 mt-0.5">
                        {formatCurrency(item.lockedPricePerUnit, currency)} each
                      </div>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center bg-black/40 rounded-lg border border-white/10">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                          className="w-6 h-6 flex items-center justify-center text-neutral-400 hover:text-white cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-7 text-center font-mono text-xs font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, Math.min(item.product.inStock, item.quantity + 1))}
                          className="w-6 h-6 flex items-center justify-center text-neutral-400 hover:text-white cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <button
                        id={`remove-item-${item.product.id}`}
                        onClick={() => onRemoveItem(item.product.id)}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Remove from cart"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            {/* Delivery Method Option */}
            {items.length > 0 && (
              <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
                <div className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                  Fulfillment &amp; Custody
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="delivery-courier-btn"
                    onClick={() => onDeliveryMethodChange('insured-courier')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      deliveryMethod === 'insured-courier'
                        ? 'bg-amber-500/15 border-amber-500/50 text-white'
                        : 'bg-[#141824] border-white/10 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <Truck className={`w-4 h-4 ${deliveryMethod === 'insured-courier' ? 'text-amber-400' : 'text-neutral-500'}`} />
                    <div className="mt-2">
                      <div className="font-bold text-xs">Insured Armored Courier</div>
                      <div className="text-[10px] text-neutral-400">Direct to door</div>
                    </div>
                  </button>

                  <button
                    id="delivery-vault-btn"
                    onClick={() => onDeliveryMethodChange('allocated-vault')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      deliveryMethod === 'allocated-vault'
                        ? 'bg-amber-500/15 border-amber-500/50 text-white'
                        : 'bg-[#141824] border-white/10 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <Building2 className={`w-4 h-4 ${deliveryMethod === 'allocated-vault' ? 'text-amber-400' : 'text-neutral-500'}`} />
                    <div className="mt-2">
                      <div className="font-bold text-xs">Allocated Vault Storage</div>
                      <div className="text-[10px] text-neutral-400">Segregated title</div>
                    </div>
                  </button>
                </div>

                {/* Vault Selection if Allocated Vault selected */}
                {deliveryMethod === 'allocated-vault' && (
                  <div className="bg-[#0A0C11] p-3 rounded-xl border border-white/10 space-y-1.5 font-mono text-xs">
                    <label htmlFor="vault-location-select" className="text-neutral-400 text-[11px] block cursor-pointer">Select Depository Deposition Vault:</label>
                    <select
                      id="vault-location-select"
                      aria-label="Select Depository Deposition Vault"
                      value={vaultLocation}
                      onChange={(e) => onVaultLocationChange(e.target.value as VaultLocation)}
                      className="w-full bg-[#141824] text-amber-300 text-xs p-2 rounded-lg border border-white/10 focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="singapore-freeport">Singapore Le Freeport (Maximum Discretion)</option>
                      <option value="zurich-malca-amit">Zurich Malca-Amit (Switzerland)</option>
                      <option value="delaware-depository">Delaware Depository (USA)</option>
                      <option value="london-vaults">London LBMA Vaults (United Kingdom)</option>
                    </select>
                    <div className="text-[10px] text-emerald-400 flex items-center space-x-1 pt-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>100% Insured through Lloyd&apos;s of London</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart Footer / Checkout CTA */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-white/10 bg-[#141824] space-y-3">
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal:</span>
                  <span className="text-white font-semibold">{formatCurrency(subtotalUSD, currency)}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Armored Courier &amp; Insurance:</span>
                  <span className={insuranceShippingUSD === 0 ? 'text-emerald-400 font-bold' : 'text-white'}>
                    {insuranceShippingUSD === 0 ? 'Complimentary (Over $1k)' : formatCurrency(insuranceShippingUSD, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/10">
                  <span>Total Due:</span>
                  <span className="text-amber-300 text-xl">{formatCurrency(totalUSD, currency)}</span>
                </div>
                <div className="text-[10px] text-neutral-500 text-right">
                  Pay with Bank Wire to receive an extra 1.5% bullion cash discount
                </div>
              </div>

              <button
                id="checkout-button"
                onClick={onProceedToCheckout}
                className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-sm shadow-xl shadow-amber-500/25 transition-all cursor-pointer"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
