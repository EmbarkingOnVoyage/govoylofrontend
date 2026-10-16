import React from 'react';
import { Sparkles } from 'lucide-react';
import { MenuBar } from '../../components/layout/MenuBar';
import iconHotels from '../../assets/images/icon-hotels.png';
import iconFlightsHotels from '../../assets/images/icon-flights-hotels.png';
import type { ComingSoonFeature } from './comingSoonPage.web';

// Same hero colours as the flight search page (Web Dev Desktop-7).
const HERO_GRADIENT =
  'linear-gradient(169.5deg, rgba(11,19,237,0.8) -271px, rgba(211,178,250,0.3) 448.4px)';
const CARD_SHADOW = '0 8px 24px -5px rgba(79,94,113,0.1), 0 5px 16px -3px rgba(79,94,113,0.12), 0 1px 4px rgba(79,94,113,0.12)';

const MESSAGES: Record<ComingSoonFeature, string> = {
  Hotels: 'Hotel stays are on their way. Soon you will be able to search and book hotels right here.',
  'Flights + Hotels': 'Flight and hotel packages are on their way. Soon you will be able to book both together and save.',
  'Voylo AI': 'Voylo AI, your smarter way to travel, is on its way. It will help you plan and book trips just by asking.',
};

// A page for a product that isn't built yet (Hotels, Flights + Hotels, Voylo AI):
// the site header, then a card saying it's coming soon with a way back to flights.
export const ComingSoonPageWeb: React.FC<{
  feature: ComingSoonFeature;
  onNavigate?: (rule: string) => void;
  onSearchFlights: () => void;
}> = ({ feature, onNavigate, onSearchFlights }) => (
  <div className="min-h-screen bg-white font-['Inter',sans-serif]">
    <MenuBar onNavigate={onNavigate} activeProduct={feature} />
    <div className="min-h-[calc(100vh-64px)] px-4 pt-16 pb-24" style={{ background: HERO_GRADIENT }}>
      <div
        className="max-w-[560px] mx-auto bg-white rounded-[18px] px-8 py-12 flex flex-col items-center text-center gap-5"
        style={{ boxShadow: CARD_SHADOW }}
        role="status"
      >
        {feature === 'Voylo AI' ? (
          <span className="w-[88px] h-[88px] rounded-full flex items-center justify-center bg-gradient-to-br from-[#9335FF] to-[#5731FF]">
            <Sparkles size={44} className="text-white" strokeWidth={1.75} />
          </span>
        ) : (
          <img
            src={feature === 'Hotels' ? iconHotels : iconFlightsHotels}
            alt=""
            className="w-[88px] h-[88px] rounded-full"
          />
        )}
        <span className="px-3 py-1 rounded-full bg-[#F1E8FE] text-[13px] leading-4 font-semibold text-[#7C1AEE]">
          {feature}
        </span>
        <h1 className="text-[28px] leading-9 font-bold text-[#182339]">Coming soon</h1>
        <p className="max-w-[420px] text-[16px] leading-6 text-[#3E4B64]">{MESSAGES[feature]}</p>
        <p className="text-[15px] leading-5 text-[#697691]">Meanwhile, you can book flights with goVoylo.</p>
        <button
          type="button"
          onClick={onSearchFlights}
          className="mt-2 h-11 px-8 rounded-xl bg-[#7C1AEE] text-[15px] leading-5 font-medium text-white hover:opacity-90"
        >
          Search flights
        </button>
      </div>
    </div>
  </div>
);
