import React, { useMemo, useState } from 'react';
import { ChevronRight, Download, Headset, Loader2, Luggage, Plane, Search, Star } from 'lucide-react';
import { useMyTripsMobile, type TripBooking } from '../useMyTripsMobile';
import { useCustomerProfileMobile } from '../../profile/useCustomerProfileMobile';
import {
  eTicketUnavailableReason,
  formatCurrency,
  formatDate,
  formatTime12,
  greeting,
  isExpiredHold,
  matchesSearch,
  passengerCount,
  routeTitle,
  statusDisplay,
  tripTab,
  type TripTab,
} from '../logic/myTrips';
import { downloadETicketWeb } from './downloadETicket.web';
import { NoticeDialogWeb } from './NoticeDialogWeb.web';

const TABS: TripTab[] = ['Upcoming', 'Completed', 'Cancelled'];
// Every vertical gets a chip; only flights can be booked today.
const CATEGORIES = ['All', 'Flights', 'Hotels', 'Buses', 'Cabs', 'Holidays'] as const;
type Category = (typeof CATEGORIES)[number];
type SortOrder = 'newest' | 'oldest';

const EMPTY_COPY: Record<TripTab, { title: string; text: string }> = {
  Upcoming: { title: 'No upcoming trips', text: 'Your next adventure is waiting. Start planning your journey with GoVoylo.' },
  Completed: { title: 'No past trips', text: 'Trips you have completed will show up here.' },
  Cancelled: { title: 'No cancelled trips', text: 'Bookings you cancel will show up here.' },
};

// My Trips for the web, adapted from the mobile screen (there are no Web Dev
// frames for it): tabs, search, category chips, booking cards, e-ticket
// download. Same placeholders as mobile: Book Again, Rate your trip and the
// refund-help banner have no action yet.
export const MyTripsPageWeb: React.FC<{
  onOpenTrip: (tripBookingId: string) => void;
  onExploreTrips: () => void;
}> = ({ onOpenTrip, onExploreTrips }) => {
  const { data: trips, isLoading, isError, refetch } = useMyTripsMobile();
  const { data: profile } = useCustomerProfileMobile();
  const [activeTab, setActiveTab] = useState<TripTab>('Upcoming');
  const [category, setCategory] = useState<Category>('All');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ title: string; text: string } | null>(null);

  const byTab = useMemo(() => {
    const groups: Record<TripTab, TripBooking[]> = { Upcoming: [], Completed: [], Cancelled: [] };
    (trips ?? []).forEach((trip) => groups[tripTab(trip)].push(trip));
    return groups;
  }, [trips]);

  const visibleTrips = useMemo(() => {
    if (category !== 'All' && category !== 'Flights') return [];
    const sign = sortOrder === 'newest' ? -1 : 1;
    return byTab[activeTab]
      .filter((trip) => matchesSearch(trip, search))
      .sort((a, b) => sign * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
  }, [byTab, activeTab, category, search, sortOrder]);

  const handleDownload = async (trip: TripBooking) => {
    const reason = eTicketUnavailableReason(trip);
    if (reason) return setNotice({ title: 'E-ticket not ready', text: reason });
    setDownloadingId(trip.id);
    try {
      await downloadETicketWeb(trip.id, trip.bookingRefNo);
    } catch (err) {
      setNotice({ title: 'Could not download the e-ticket', text: (err as Error)?.message || 'Please try again.' });
    } finally {
      setDownloadingId(null);
    }
  };

  const firstName = profile?.firstName?.trim();
  const tabIsEmpty = byTab[activeTab].length === 0;

  const renderCard = (trip: TripBooking) => {
    const status = statusDisplay(trip);
    const tab = tripTab(trip);
    const firstLeg = [...trip.legs].sort((a, b) => a.legIndex - b.legIndex)[0];
    const time = firstLeg ? formatTime12(firstLeg.travelDate) : '';
    const pax = passengerCount(trip);

    return (
      <div key={trip.id} className="bg-white rounded-xl border border-[#E4E7EC] p-5 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#F5F0FF] text-xs font-medium text-[#7C1AEE]">
            <Plane size={14} /> Flight
          </span>
          <span
            className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold"
            style={{ color: status.color, backgroundColor: status.background }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status.color }} />
            {status.label}
          </span>
        </div>
        <div className="text-lg font-semibold text-[#182339] truncate">{routeTitle(trip)}</div>
        {firstLeg && (
          <>
            <div className="text-sm text-[#4C5973]">
              {formatDate(firstLeg.travelDate)}
              {time ? ` · ${time}` : ''}
            </div>
            <div className="text-xs text-[#697691] mt-1">
              {firstLeg.airlineName} · {firstLeg.airlineCode} {firstLeg.flightNumber} · {pax} {pax === 1 ? 'Passenger' : 'Passengers'}
            </div>
          </>
        )}
        <div className="flex items-end justify-between border-t border-dashed border-[#E4E7EC] mt-4 pt-3">
          <div>
            <div className="text-[10px] font-semibold text-[#697691]">BOOKING ID</div>
            <div className="text-sm font-semibold text-[#182339]">{trip.bookingRefNo}</div>
          </div>
          {tab === 'Cancelled' ? (
            <div className="text-right">
              <div className="text-[10px] font-semibold text-[#697691]">REFUND STATUS</div>
              <div className="text-sm font-semibold">
                {trip.refundAmount != null ? (
                  <span className="text-[#15803D]">{formatCurrency(trip.refundAmount, trip.currencyCode)} refunded</span>
                ) : trip.localStatus === 'Cancelled' ? (
                  <span className="text-[#B45309]">Being processed</span>
                ) : (
                  <span className="text-[#697691]">
                    {trip.localStatus === 'Released' ? 'Hold released' : isExpiredHold(trip) ? 'Hold expired' : 'Not ticketed'}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-right">
              <div className="text-[10px] font-semibold text-[#697691]">TOTAL</div>
              <div className="text-sm font-bold text-[#182339]">{formatCurrency(trip.totalPaid || trip.totalAmount, trip.currencyCode)}</div>
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={() => onOpenTrip(trip.id)}
            className="flex-1 py-2 rounded-lg bg-[#7C1AEE] text-white text-sm font-medium hover:opacity-90"
          >
            {tab === 'Cancelled' && trip.localStatus === 'Cancelled' ? 'View Cancellation Details' : 'View Details'}
          </button>
          {tab === 'Upcoming' && (
            <button
              type="button"
              onClick={() => handleDownload(trip)}
              disabled={downloadingId === trip.id}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#7C1AEE] text-[#7C1AEE] text-sm font-medium hover:bg-[#F5F0FF] disabled:opacity-60"
            >
              {downloadingId === trip.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              Download Ticket
            </button>
          )}
          {tab === 'Completed' && (
            <button type="button" className="flex-1 py-2 rounded-lg border border-[#7C1AEE] text-[#7C1AEE] text-sm font-medium">
              Book Again
            </button>
          )}
        </div>
        {tab === 'Completed' && (
          <button type="button" className="flex items-center justify-center gap-1.5 mt-3 text-sm font-medium text-[#7C1AEE]">
            <Star size={16} /> Rate your trip <ChevronRight size={16} />
          </button>
        )}
      </div>
    );
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-[#7C1AEE]" />
        </div>
      );
    }
    if (isError) {
      return (
        <div className="text-center py-16 text-[#4C5973]">
          We couldn't load your trips.{' '}
          <button type="button" onClick={() => refetch()} className="text-[#7C1AEE] font-medium hover:underline">
            Try again
          </button>
        </div>
      );
    }
    if (tabIsEmpty && (category === 'All' || category === 'Flights') && !search.trim()) {
      return (
        <div className="bg-white rounded-xl border border-[#E4E7EC] py-16 text-center">
          <div className="w-24 h-24 rounded-full bg-[#F5F0FF] flex items-center justify-center mx-auto mb-4">
            <Luggage size={44} className="text-[#7C1AEE]" />
          </div>
          <h2 className="text-lg font-semibold text-[#182339]">{EMPTY_COPY[activeTab].title}</h2>
          <p className="text-sm text-[#4C5973] mt-1 mb-6">{EMPTY_COPY[activeTab].text}</p>
          <div className="flex justify-center gap-3">
            <button type="button" onClick={onExploreTrips} className="px-6 py-2.5 rounded-lg bg-[#7C1AEE] text-white text-sm font-medium">
              Explore Trips
            </button>
            {activeTab === 'Upcoming' && (
              <button
                type="button"
                onClick={() => setActiveTab('Completed')}
                className="px-6 py-2.5 rounded-lg border border-[#7C1AEE] text-[#7C1AEE] text-sm font-medium"
              >
                View Past Trips
              </button>
            )}
          </div>
        </div>
      );
    }
    if (visibleTrips.length === 0) {
      return (
        <p className="text-center py-16 text-[#4C5973]">
          {category !== 'All' && category !== 'Flights' ? `No ${category.toLowerCase()} bookings yet.` : 'No trips match your search.'}
        </p>
      );
    }
    return (
      <>
        <div className="grid grid-cols-2 gap-4">{visibleTrips.map(renderCard)}</div>
        {activeTab === 'Cancelled' && (
          <div className="flex items-center gap-3 mt-4 rounded-xl bg-[#EEF3FF] px-5 py-4 text-[#1E3A8A]">
            <Headset size={22} />
            <div className="flex-1">
              <div className="text-sm font-semibold">Need help with a refund?</div>
              <div className="text-xs">Our travel experts are available around the clock.</div>
            </div>
            <ChevronRight size={18} />
          </div>
        )}
      </>
    );
  };

  return (
    <div className="max-w-[1080px] mx-auto px-6 py-8 space-y-5">
      <div>
        {firstName && (
          <p className="text-sm text-[#4C5973]">
            {greeting()}, {firstName}
          </p>
        )}
        <h1 className="text-2xl font-semibold text-[#182339]">My Trips</h1>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E4E7EC]">
          <Search size={18} className="text-[#697691]" />
          <input
            className="flex-1 text-sm outline-none bg-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trips, booking ID or destination"
          />
        </label>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as SortOrder)}
          className="px-3 py-2.5 rounded-xl bg-white border border-[#E4E7EC] text-sm text-[#182339]"
          aria-label="Sort trips"
        >
          <option value="newest">Newest booking first</option>
          <option value="oldest">Oldest booking first</option>
        </select>
      </div>

      <div className="flex gap-8 border-b border-[#E4E7EC]">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium border-b-2 -mb-px ${
              tab === activeTab ? 'border-[#7C1AEE] text-[#7C1AEE]' : 'border-transparent text-[#4C5973]'
            }`}
          >
            {tab}
            {!isLoading && <span className="ml-1.5 text-xs text-[#697691]">({byTab[tab].length})</span>}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`px-4 py-1.5 rounded-full text-sm border ${
              c === category ? 'bg-[#7C1AEE] border-[#7C1AEE] text-white' : 'bg-white border-[#D5DAE3] text-[#4C5973]'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {renderBody()}

      {notice && <NoticeDialogWeb title={notice.title} text={notice.text} onClose={() => setNotice(null)} />}
    </div>
  );
};
