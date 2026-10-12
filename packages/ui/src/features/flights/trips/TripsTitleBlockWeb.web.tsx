import React from 'react';
import { ChevronRight, Search } from 'lucide-react';

// Web Dev Desktop-25..31 title block (y 65–241 at 1440): breadcrumb, "My trips"
// with its subtitle, and the trips search on the right. Trip details adds a
// third crumb and its own heading at the bottom edge.
export const TripsTitleBlockWeb: React.FC<{
  onHome: () => void;
  // Trip details: "Bookings" becomes a link and the page's own crumb follows.
  onBookings?: () => void;
  current?: string;
  heading?: string;
  search?: string;
  onSearch?: (value: string) => void;
}> = ({ onHome, onBookings, current, heading, search, onSearch }) => (
  <div className="mt-px bg-white">
    <div className="relative max-w-[1440px] mx-auto h-[176px]">
      <nav className="absolute left-10 top-[11px] flex items-center gap-[2px] text-[13px] leading-4 font-medium text-[#182339]">
        <button type="button" onClick={onHome} className="underline underline-offset-[3px]">
          Home
        </button>
        <ChevronRight size={18} strokeWidth={1.67} className="text-[#ADB8CD]" />
        {onBookings ? (
          <button type="button" onClick={onBookings} className="underline underline-offset-[3px]">
            Bookings
          </button>
        ) : (
          <span>Bookings</span>
        )}
        {current && (
          <>
            <ChevronRight size={18} strokeWidth={1.67} className="text-[#ADB8CD]" />
            <span>{current}</span>
          </>
        )}
      </nav>
      <div className="absolute left-[45px] top-[57.6px]">
        <h1 className="text-[28px] leading-[34px] font-bold text-[#182339]">My trips</h1>
        <p className="text-[15px] leading-5 text-[#697691]">Manage every journey in one place.</p>
      </div>
      <label className="absolute right-[44px] top-[65px] w-[386px] h-12 flex items-center gap-[11px] pl-[17px] pr-4 rounded-[12px] bg-white border border-[#7C8CAD]">
        <Search size={20} strokeWidth={1.67} className="text-[#182339] shrink-0" />
        <input
          className="flex-1 min-w-0 text-[15px] leading-5 text-[#182339] placeholder:text-[#697691] outline-none bg-transparent"
          value={search ?? ''}
          onChange={(e) => onSearch?.(e.target.value)}
          readOnly={!onSearch}
          onFocus={() => !onSearch && onBookings?.()}
          placeholder="Search trips, booking ID or destination"
        />
      </label>
      {heading && (
        <h2 className="absolute left-[45px] top-[153.7px] text-[28px] leading-[34px] font-bold text-[#182339]">{heading}</h2>
      )}
    </div>
  </div>
);
