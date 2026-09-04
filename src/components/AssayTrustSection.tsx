import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  RefreshCw,
  Award,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Lock,
  Globe2,
} from 'lucide-react';

export const AssayTrustSection: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How is live spot pricing calculated and refreshed?',
      answer:
        'BullionPoint pulls institutional bid/ask spot prices directly from global bullion exchanges (LBMA and COMEX). Spot rates are updated live every 10 minutes. Every product dynamically computes its exact price as: [Fine Weight in Troy Ounces × Live Spot Rate × Purity] + [Stated Minting Premium]. There are no hidden markups.',
    },
    {
      question: 'What is an Assay Certificate and why is it important?',
      answer:
        'An Assay Certificate is an official document and tamper-evident packaging (such as PAMP CertiPAMP or Valcambi CertiCard) signed by a certified assayer (Essayeur Fondeur). It verifies the exact purity (e.g. 999.9 pure gold) and exact weight of the bar, paired with an individualized laser-etched serial number matching the official refinery registry.',
    },
    {
      question: 'Are precious metals purchases subject to VAT or Sales Tax?',
      answer:
        'In major financial jurisdictions including Singapore, Switzerland, the United Kingdom, and many US states, Investment Precious Metals (IPM) meeting minimum purity thresholds (99.5% for gold, 99.9% for silver) are fully exempt from Goods and Services Tax (GST) or VAT.',
    },
    {
      question: 'How does the Allocated Vault Storage program work?',
      answer:
        'When selecting Allocated Vault Storage, your physical bars and coins are held in your legal name as segregated bailment in high-security non-bank depositories (such as Le Freeport in Singapore or Malca-Amit in Zurich). Your holdings never appear on a corporate balance sheet, and full physical inspection or collection is available at any time.',
    },
    {
      question: 'What is the BullionPoint Guaranteed Buyback policy?',
      answer:
        'BullionPoint guarantees liquidity by offering to buy back any bullion product purchased through our platform at 99% of the prevailing spot metal value, providing immediate liquidity for investors looking to realize gains.',
    },
  ];

  return (
    <section id="assay-section" className="w-full py-16 bg-[#0E1118] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 text-amber-400 text-xs font-mono font-semibold uppercase tracking-widest mb-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Assay &amp; Custody Integrity</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight">
            Institutional Standards for Discerning Accumulators
          </h2>
          <p className="text-sm text-neutral-400 mt-2">
            Every bar and coin distributed by BullionPoint originates exclusively from LBMA-accredited sovereign and private mints, verified with tamper-evident serials and transparent spot tracking.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          
          {/* Pillar 1 */}
          <div className="bg-[#131722] p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mb-4">
                <Award className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="font-serif font-bold text-base text-white">
                LBMA Good Delivery Sourcing
              </h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Direct procurement from certified refiners including PAMP Suisse, The Royal Mint, Perth Mint, and Valcambi Suisse.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-amber-300 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% Guaranteed Purity</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-[#131722] p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-4">
                <RefreshCw className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-serif font-bold text-base text-white">
                10-Minute Transparent Spot
              </h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Pricing is connected in real-time to COMEX &amp; London wholesale spot markets. Transparent melt value and minting premium breakdown on every piece.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-emerald-300 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Zero Hidden Markups</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-[#131722] p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5 text-sky-400" />
              </div>
              <h3 className="font-serif font-bold text-base text-white">
                Allocated Vault Depositories
              </h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Segregated bailment storage options in Singapore Le Freeport, Zurich, and Delaware. 100% underwritten by Lloyd&apos;s of London insurance.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-sky-300 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Direct Title Ownership</span>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="bg-[#131722] p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center mb-4">
                <Globe2 className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="font-serif font-bold text-base text-white">
                Guaranteed Liquidity Buyback
              </h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Liquidate your physical holdings anytime at 99% of live spot price with same-day wire settlement or vault account transfer.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-purple-300 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Same-Day Wire Liquidity</span>
            </div>
          </div>

        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto bg-[#131722] rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl">
          <h3 className="font-serif font-bold text-xl text-white mb-6 text-center">
            Frequently Asked Questions
          </h3>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-white/5 bg-[#0C0F16] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-4 text-left flex items-center justify-between font-serif font-bold text-sm text-white hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-amber-400 flex-shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-400 flex-shrink-0 ml-2" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-neutral-300 leading-relaxed border-t border-white/5 mt-1 font-sans">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
