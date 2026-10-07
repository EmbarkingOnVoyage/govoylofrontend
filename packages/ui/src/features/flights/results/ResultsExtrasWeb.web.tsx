import React, { useRef } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import flightProtection from '../../../assets/images/promo/flight-protection.png';
import peaceOfMind from '../../../assets/images/promo/peace-of-mind.png';

// Bank offer chips from the Web Dev design. Static marketing content until
// there's an offers source; they have no action.
const OFFERS = [
  { emoji: '🏦', text: 'Get up to 7,500 Off with HDFC Bank Credit Card EMI' },
  { emoji: '💳', text: 'Flat 10% Off with HSBC Credit Cards EMI' },
  { emoji: '🎁', text: 'Flat 12% Off with ICICI Bank Credit Card EMI' },
  { emoji: '🎁', text: 'Flat 12% Off with ICICI Bank Credit Card EMI' },
];

const RoundArrow: React.FC<{ dir: 'left' | 'right'; onClick: () => void }> = ({ dir, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={dir === 'left' ? 'Previous offers' : 'More offers'}
    className="w-7 h-7 shrink-0 rounded-full bg-white border border-[#CCD3E0] flex items-center justify-center"
  >
    {dir === 'left' ? <ChevronLeft size={16} color="#182339" /> : <ChevronRight size={16} color="#182339" />}
  </button>
);

// Desktop-15 offers strip: 64px #ECEEF3 band under the header.
export const OffersStripWeb: React.FC = () => {
  const scroller = useRef<HTMLDivElement>(null);
  const scroll = (by: number) => scroller.current?.scrollBy({ left: by, behavior: 'smooth' });
  return (
    <div className="bg-[#ECEEF3] border-b border-[#CCD3E0]">
      <div className="max-w-[1440px] mx-auto h-16 px-5 flex items-center gap-2.5">
        <RoundArrow dir="left" onClick={() => scroll(-360)} />
        <div ref={scroller} className="flex-1 min-w-0 flex items-center gap-2.5 overflow-x-auto [scrollbar-width:none]">
          {OFFERS.map((offer, index) => (
            <div
              key={index}
              className="shrink-0 h-[43px] flex items-center gap-2 px-3.5 py-[7px] bg-white border border-[#CCD3E0] rounded-lg"
            >
              <span className="text-[18px] leading-[27px]">{offer.emoji}</span>
              <span className="text-[12.5px] leading-[19px] font-bold text-[#182339] whitespace-nowrap">{offer.text}</span>
            </div>
          ))}
        </div>
        <RoundArrow dir="right" onClick={() => scroll(360)} />
      </div>
    </div>
  );
};

interface PromoCardProps {
  eyebrow: string;
  eyebrowColor: string;
  title: string;
  titleColor: string;
  image: string;
  imageRadius: string;
  benefits: string[];
  benefitColor: string;
  checkColor: string;
  priceLabel: string;
  price: string;
  priceColor: string;
  lineColor: string;
  cta: string;
  ctaClass: string;
  cardClass: string;
}

const PromoCard: React.FC<PromoCardProps> = (p) => (
  <div className={`w-[339px] h-[277px] flex flex-col justify-between p-4 ${p.cardClass}`}>
    <div className="flex justify-between items-start">
      <div className="w-[200px] flex flex-col gap-2">
        <span className="text-[13px] leading-4 font-medium" style={{ color: p.eyebrowColor }}>
          {p.eyebrow}
        </span>
        <span className="text-[18px] leading-[22px] font-bold" style={{ color: p.titleColor }}>
          {p.title}
        </span>
      </div>
      <img src={p.image} alt="" className="w-[72px] h-[72px] object-cover" style={{ borderRadius: p.imageRadius }} />
    </div>
    <ul className="flex flex-col gap-1.5">
      {p.benefits.map((b) => (
        <li key={b} className="flex items-center gap-2 text-[13px] leading-4 font-medium" style={{ color: p.benefitColor }}>
          <span className="w-4 h-4 flex items-center justify-center">
            <CheckCircle2 size={12} style={{ color: p.checkColor }} />
          </span>
          {b}
        </li>
      ))}
    </ul>
    <div className="border-t" style={{ borderColor: p.lineColor }} />
    <div className="flex justify-between items-center">
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] leading-[13px] font-medium uppercase" style={{ color: p.benefitColor }}>
          {p.priceLabel}
        </span>
        <span className="text-[18px] leading-[22px] font-bold" style={{ color: p.priceColor }}>
          {p.price}
          <span className="text-[13px] font-medium"> / trip</span>
        </span>
      </div>
      <button type="button" className={`text-[13px] leading-4 font-medium ${p.ctaClass}`}>
        {p.cta}
      </button>
    </div>
  </div>
);

// Desktop-15 right column ("Frame 421"): travel-protection promos. Static,
// no action yet — GoVoylo doesn't sell protection plans.
export const PromoColumnWeb: React.FC = () => (
  <div className="w-[355px] shrink-0 flex flex-col items-center gap-4">
    <div className="p-2">
      <PromoCard
        eyebrow="Flight Protection"
        eyebrowColor="#0284C7"
        title="Fly with total confidence"
        titleColor="#0F172A"
        image={flightProtection}
        imageRadius="8px"
        benefits={['Up to $500K emergency coverage', 'Instant flight delay claims', '24/7 Global assistance hotline']}
        benefitColor="#1E293B"
        checkColor="#0284C7"
        priceLabel="Add from"
        price="$17"
        priceColor="#0F172A"
        lineColor="#E2E8F0"
        cta="Get Covered"
        ctaClass="px-4 py-2.5 rounded bg-[#0F172A] text-white"
        cardClass="bg-white border border-[#E2E8F0] rounded"
      />
    </div>
    <PromoCard
      eyebrow="Peace of Mind"
      eyebrowColor="#E15B50"
      title="Protect your next great adventure"
      titleColor="#3C1F1F"
      image={peaceOfMind}
      imageRadius="16px"
      benefits={['$500K protection for peace of mind', 'Instant claim approval on your phone', 'Help is always a message away, 24/7']}
      benefitColor="#705656"
      checkColor="#E15B50"
      priceLabel="From just"
      price="$19"
      priceColor="#3C1F1F"
      lineColor="#FFEAE2"
      cta="Protect Trip"
      ctaClass="px-5 py-3 rounded-3xl bg-[#E15B50] text-white"
      cardClass="bg-[linear-gradient(90deg,#FFF5F0_0%,#FFF1E6_100%)] border border-[#FFDDD3] rounded-2xl"
    />
  </div>
);
