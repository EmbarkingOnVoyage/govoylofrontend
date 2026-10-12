import React, { useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Download,
  FileText,
  Headphones,
  Loader2,
  Luggage,
  Plane,
  ShieldCheck,
  Armchair,
  Star,
  X,
} from 'lucide-react';
import { useMyTripsMobile, type TripBooking } from '../useMyTripsMobile';
import {
  eTicketUnavailableReason,
  formatCurrency,
  formatDate,
  formatTime12,
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
import { TripsTitleBlockWeb } from './TripsTitleBlockWeb.web';

const TABS: TripTab[] = ['Upcoming', 'Completed', 'Cancelled'];
// The design's chips; only flights can be booked today.
const CATEGORIES = ['All', 'Flights', 'Hotels', 'Trains'] as const;
type Category = (typeof CATEGORIES)[number];
type SortOrder = 'newest' | 'oldest' | 'travelDate';

const SORT_OPTIONS: { id: SortOrder; label: string; short: string }[] = [
  { id: 'newest', label: 'Newest booking first', short: 'Newest first' },
  { id: 'oldest', label: 'Oldest booking first', short: 'Oldest first' },
  { id: 'travelDate', label: 'Travel date: earliest', short: 'Travel date' },
];

const firstTravelTime = (trip: TripBooking) =>
  Math.min(...trip.legs.map((leg) => new Date(leg.travelDate).getTime()).filter((t) => !isNaN(t)), Infinity);

const SECTION_TITLE: Record<TripTab, string> = {
  Upcoming: 'Upcoming trips',
  Completed: 'Past trips',
  Cancelled: 'Cancelled trips',
};

const EMPTY_COPY: Record<TripTab, { title: string; text: string }> = {
  Upcoming: { title: 'No upcoming trips', text: 'Your next adventure is waiting. Start planning your journey with GoVoylo.' },
  Completed: { title: 'No past trips', text: 'Trips you have completed will show up here.' },
  Cancelled: { title: 'No cancelled trips', text: 'Bookings you cancel will show up here.' },
};

// Status chip colours from the design (Confirmed / Completed / Cancelled);
// other states (on hold, ticketing...) keep the shared status colours.
const STATUS_CHIP: Record<string, { color: string; background: string }> = {
  Confirmed: { color: '#007F20', background: '#E8FFEE' },
  Completed: { color: '#114BFF', background: '#E8EEFF' },
  Cancelled: { color: '#C5001F', background: '#FFE8EC' },
};

const ADD_ONS = [
  { icon: Luggage, title: 'Add baggage', text: 'Add baggage beyond included allowance.' },
  { icon: Armchair, title: 'Select Seat', text: 'Choose your preferred seat' },
  { icon: ShieldCheck, title: 'Travel insurance', text: 'Cover for lost bags and delays' },
];

// My Trips (Web Dev Desktop-31 upcoming, -25 past, -26 cancelled, -27 empty),
// laid out for 1440: white title block, tab bar across its bottom edge,
// category chips + sort, a 993px column of booking cards and a 370px side
// column. No-action placeholders as before: Book again, Rate your trip, the
// add-on row, the refund-help and e-Visa cards.
export const MyTripsPageWeb: React.FC<{
  onOpenTrip: (tripBookingId: string) => void;
  onExploreTrips: () => void;
}> = ({ onOpenTrip, onExploreTrips }) => {
  const { data: trips, isLoading, isError, refetch } = useMyTripsMobile();
  const [activeTab, setActiveTab] = useState<TripTab>('Upcoming');
  const [category, setCategory] = useState<Category>('All');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [sortOpen, setSortOpen] = useState(false);
  const [pendingSort, setPendingSort] = useState<SortOrder>('newest');
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
      .sort((a, b) =>
        sortOrder === 'travelDate'
          ? firstTravelTime(a) - firstTravelTime(b)
          : sign * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      );
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

  const tabIsEmpty = byTab[activeTab].length === 0;
  const nextTrip = byTab.Upcoming[0];
  const nextCity = nextTrip ? [...nextTrip.legs].sort((a, b) => a.legIndex - b.legIndex)[0]?.destination : undefined;

  const label = 'text-[12px] leading-4 font-semibold tracking-[1px] text-[#697691]';

  const renderTripCard = (trip: TripBooking) => {
    const status = statusDisplay(trip);
    const chip = STATUS_CHIP[status.label] ?? { color: status.color, background: status.background };
    const tab = tripTab(trip);
    const firstLeg = [...trip.legs].sort((a, b) => a.legIndex - b.legIndex)[0];
    const time = firstLeg ? formatTime12(firstLeg.travelDate) : '';
    const pax = passengerCount(trip);
    const cancelledWithRefund = tab === 'Cancelled' && trip.localStatus === 'Cancelled';

    return (
      <div className="bg-white rounded-[12px] border border-[#98A5BF] px-4 pt-[17px] pb-[17px]">
        <div className="flex items-center justify-between px-px">
          <span className="h-6 flex items-center gap-[6px] px-[10px] rounded-[12px] bg-[#F3E8FF] text-[12.5px] leading-4 font-semibold text-[#7C1AEE]">
            <Plane size={13} strokeWidth={1.33} /> Flight
          </span>
          <span
            className="h-6 flex items-center gap-[4.5px] px-2 rounded-[12px] text-[13px] leading-4 font-semibold"
            style={{ color: chip.color, backgroundColor: chip.background }}
          >
            <span className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: chip.color }} />
            {status.label}
          </span>
        </div>

        <div className="mt-3 flex items-start gap-3 pl-px">
          <span className="w-10 h-10 shrink-0 rounded-[12px] bg-[#F3E8FF] flex items-center justify-center text-[#7C1AEE]">
            <Plane size={18} strokeWidth={1.67} />
          </span>
          <div className="min-w-0">
            <div className="text-[18px] leading-[22px] font-bold text-[#182339] truncate">{routeTitle(trip)}</div>
            {firstLeg && (
              <div className="mt-px text-[13px] leading-4 text-[#697691]">
                {formatDate(firstLeg.travelDate)}
                {time ? ` · ${time}` : ''}
              </div>
            )}
          </div>
        </div>

        {firstLeg && (
          <div className="mt-3 flex items-center gap-[10px] pl-px text-[13px] leading-4 font-medium">
            <span className="text-[#182339]">
              {firstLeg.airlineName} · {firstLeg.airlineCode} {firstLeg.flightNumber}
            </span>
            <span className="w-[2px] h-[2px] rounded-full bg-[#697691]" />
            <span className="text-[#697691]">
              {pax} {pax === 1 ? 'Passenger' : 'Passengers'}
            </span>
          </div>
        )}

        <div className="mt-3 mx-px h-[1.5px] bg-[#98A5BF]" />

        <div className="mt-[17.5px] flex items-start justify-between pl-px">
          <div>
            <div className={label}>BOOKING ID</div>
            <div className="mt-[4.5px] text-[13px] leading-4 font-bold text-[#182339]">{trip.bookingRefNo}</div>
          </div>
          {tab === 'Cancelled' ? (
            <div className="text-right -mt-[2px]">
              <div className={label}>REFUND STATUS</div>
              <div className="mt-[2px] text-[16px] leading-5 font-bold">
                {trip.refundAmount != null ? (
                  <span className="text-[#007F20]">{formatCurrency(trip.refundAmount, trip.currencyCode)} refunded</span>
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
            <div className="text-right -mt-[2px]">
              <div className={label}>TOTAL</div>
              <div className="mt-[2px] text-[16px] leading-5 font-bold text-[#182339]">
                {formatCurrency(trip.totalPaid || trip.totalAmount, trip.currencyCode)}
              </div>
            </div>
          )}
        </div>

        <div className="mt-[13px] flex gap-[6px]">
          <button
            type="button"
            onClick={() => onOpenTrip(trip.id)}
            className={`${tab === 'Cancelled' ? 'w-[481.5px] max-w-full' : 'flex-1'} h-11 rounded-[8px] bg-[#7C1AEE] text-white text-[16px] leading-5 font-semibold hover:opacity-90`}
          >
            {cancelledWithRefund ? 'View cancellation details' : 'View details'}
          </button>
          {tab === 'Upcoming' && (
            <button
              type="button"
              onClick={() => handleDownload(trip)}
              disabled={downloadingId === trip.id}
              className="flex-1 h-11 flex items-center justify-center gap-[10px] rounded-[8px] border border-[#7C1AEE] bg-white text-[#7C1AEE] text-[16px] leading-5 font-semibold hover:bg-[#F5F0FF] disabled:opacity-60"
            >
              {downloadingId === trip.id ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} strokeWidth={1.67} />}
              Download ticket
            </button>
          )}
          {tab === 'Completed' && (
            <button
              type="button"
              className="flex-1 h-11 rounded-[8px] border border-[#7C1AEE] bg-white text-[#7C1AEE] text-[16px] leading-5 font-semibold"
            >
              Book again
            </button>
          )}
        </div>

        {tab === 'Completed' && (
          <>
            <div className="mt-[8px] h-[2px] bg-[#98A5BF]" />
            <button type="button" className="w-full h-[33px] flex items-center gap-[10px] pl-[2px] pr-[7px] text-[13px] leading-4 font-medium text-[#7C1AEE]">
              <Star size={18} strokeWidth={1.67} />
              <span className="flex-1 text-left">Rate your trip</span>
              <ChevronRight size={18} strokeWidth={1.67} />
            </button>
          </>
        )}
      </div>
    );
  };

  // Upcoming trips: the card plus the add-ons row, inside a 2px frame.
  const renderUpcoming = (trip: TripBooking) => (
    <div key={trip.id} className="mx-px rounded-[8px] border-2 border-[#5913AA] p-[11px]">
      {renderTripCard(trip)}
      <div className="mt-[6px] h-[61px] flex rounded-[8.5px] border border-[#E2C9FF] bg-[#F3E8FF]">
        {ADD_ONS.map(({ icon: Icon, title, text }, index) => (
          <div
            key={title}
            className={`flex items-center gap-3 pl-4 ${index < 2 ? 'w-[345.6px] pr-[18px] border-r border-[#CCD3E0]' : 'flex-1 pr-[6px]'}`}
          >
            <span className="w-8 h-8 shrink-0 rounded-[8px] bg-[#F3E8FF] flex items-center justify-center text-[#7C1AEE]">
              <Icon size={18} strokeWidth={1.67} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] leading-4 font-semibold text-[#182339]">{title}</div>
              <div className="mt-px text-[12px] leading-4 text-[#697691] truncate">{text}</div>
            </div>
            {index < 2 ? (
              <ChevronRight size={18} strokeWidth={1.67} className="text-[#182339] shrink-0" />
            ) : (
              <span className="w-[30px] h-[30px] shrink-0 rounded-full bg-white border border-[#D9D9D9] flex items-center justify-center text-[#7C1AEE]">
                <ChevronRight size={14} strokeWidth={1} />
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderList = () => {
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
      // Desktop-27: 635px card, 96px icon, two 297px buttons.
      return (
        <div className="mt-[3px] flex">
          {/* x=374.5 on the page, as in the design. */}
          <div className="ml-[340.5px] w-[635px] bg-white rounded-[12px] border border-[#98A5BF] p-[15px]">
            <div className="flex items-start gap-4">
              <span className="w-24 h-24 shrink-0 rounded-full bg-[#F3E8FF] flex items-center justify-center text-[#7C1AEE]">
                <Luggage size={40} strokeWidth={2.5} />
              </span>
              <div className="pt-[25px]">
                <h2 className="text-[18px] leading-[22px] font-bold text-[#182339]">{EMPTY_COPY[activeTab].title}</h2>
                <p className="mt-[4px] text-[13px] leading-4 text-[#697691]">{EMPTY_COPY[activeTab].text}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-[9px]">
              <button
                type="button"
                onClick={onExploreTrips}
                className="w-[297px] h-[39px] rounded-[8px] bg-[#7C1AEE] text-white text-[16px] leading-5 font-semibold"
              >
                Explore trips
              </button>
              {activeTab === 'Upcoming' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('Completed')}
                  className="w-[297px] h-[39px] rounded-[8px] border border-[#7C1AEE] bg-white text-[#7C1AEE] text-[16px] leading-5 font-semibold"
                >
                  View past trips
                </button>
              )}
            </div>
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
      <div className={`flex flex-col ${activeTab === 'Upcoming' ? 'gap-[18px]' : 'gap-[14px]'}`}>
        {visibleTrips.map((trip) =>
          activeTab === 'Upcoming' ? renderUpcoming(trip) : <div key={trip.id}>{renderTripCard(trip)}</div>
        )}
      </div>
    );
  };

  const count = (tab: TripTab) => (isLoading ? '–' : byTab[tab].length);

  return (
    <div className="pb-16 font-['Inter',sans-serif]">
      <TripsTitleBlockWeb onHome={onExploreTrips} search={search} onSearch={setSearch} />

      <div className="max-w-[1440px] mx-auto">
        {/* Tab bar across the bottom of the title block. */}
        <div className="relative -mt-9 ml-[47px] mr-[31px] h-[54px] flex items-stretch gap-12 pl-[37px] bg-white border border-[#98A5BF] rounded-[12px]">
          {TABS.map((tab) => {
            const active = tab === activeTab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`relative flex items-center gap-[10px] text-[15px] leading-5 ${active ? 'font-semibold text-[#7C1AEE]' : 'font-medium text-[#697691]'}`}
              >
                {tab}
                <span
                  className={`w-5 h-5 rounded-full bg-[#ECEEF3] flex items-center justify-center text-[12px] leading-4 font-semibold ${
                    active ? 'text-[#7C1AEE]' : 'text-[#697691]'
                  }`}
                >
                  {count(tab)}
                </span>
                {active && <span className="absolute left-0 right-0 bottom-[-1px] h-[2px] bg-[#7C1AEE]" />}
              </button>
            );
          })}
        </div>

        {/* Category chips and sort. */}
        <div className="mt-4 ml-[34px] mr-[46px] h-9 flex items-center justify-between">
          <div className="flex items-center gap-[6px]">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`h-9 px-[18px] rounded-full border text-[13px] leading-4 font-medium ${
                  c === category ? 'bg-[#7C1AEE] border-[#7C1AEE] text-white' : 'bg-white border-[#7C8CAD] text-[#3E4B64]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setPendingSort(sortOrder);
                setSortOpen((open) => !open);
              }}
              aria-expanded={sortOpen}
              className="w-[184px] h-9 flex items-center gap-[9px] pl-3 pr-3 rounded-[8px] bg-white text-[13px] leading-4 text-left"
            >
              <span className="text-[#697691]">Sort by</span>
              <span className="flex-1 font-bold text-[#182339]">{SORT_OPTIONS.find((o) => o.id === sortOrder)?.short}</span>
              <ChevronDown size={20} strokeWidth={1.67} className="text-[#182339]" />
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setSortOpen(false)} />
                {/* Web Dev "Sort trips" popover: 307 x 224, 12px radius. */}
                <div
                  role="dialog"
                  aria-label="Sort trips"
                  className="absolute right-0 top-full mt-2 z-40 w-[307px] rounded-[12px] border border-[#98A5BF] bg-white px-4 pt-4 pb-4"
                >
                  <div className="h-[42px] flex items-center justify-between">
                    <h3 className="pl-px text-[16.5px] leading-5 font-semibold text-[#182339]">Sort trips</h3>
                    <button
                      type="button"
                      onClick={() => setSortOpen(false)}
                      aria-label="Close"
                      className="-mr-[0.84px] w-[42px] h-[42px] rounded-full border border-[#98A5BF] flex items-center justify-center text-[#182339]"
                    >
                      <X size={18} strokeWidth={1.67} />
                    </button>
                  </div>
                  <div className="mt-[9.4px] flex flex-col gap-3">
                    {SORT_OPTIONS.map((option) => {
                      const checked = pendingSort === option.id;
                      return (
                        <label key={option.id} className="h-5 flex items-center gap-[7px] cursor-pointer">
                          <input
                            type="radio"
                            name="trip-sort"
                            className="sr-only"
                            checked={checked}
                            onChange={() => setPendingSort(option.id)}
                          />
                          <span
                            className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center ${
                              checked ? 'bg-[#7C1AEE]' : 'border border-[#7C8CAD] scale-90'
                            }`}
                          />
                          <span className="text-[15px] leading-5 font-medium text-[#182339]">{option.label}</span>
                        </label>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSortOrder(pendingSort);
                      setSortOpen(false);
                    }}
                    className="mt-[11px] w-full h-11 rounded-xl bg-[#7C1AEE] text-[16px] leading-5 font-bold text-white"
                  >
                    Apply sort
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 ml-[34px] mr-[34px] flex items-start gap-[9px]">
          <div className="w-[993px] min-w-0">
            <div className="pl-px">
              <h2 className="text-[18px] leading-6 font-bold text-[#182339]">{SECTION_TITLE[activeTab]}</h2>
              {!isLoading && !isError && (
                <p className="text-[13px] leading-4 text-[#697691]">
                  {visibleTrips.length} {visibleTrips.length === 1 ? 'booking' : 'bookings'}
                </p>
              )}
            </div>
            <div className="mt-[13px]">{renderList()}</div>
          </div>

          {/* Side column (370px): refund help, and add-on ideas for upcoming trips. */}
          <div className="w-[370px] shrink-0 mt-[49.5px] flex flex-col gap-[14px]">
            <div className="h-[88px] flex items-start gap-3 pl-[17px] pr-[18px] pt-[18px] rounded-[12px] border border-[#98A5BF] bg-[#E8EEFF]">
              <span className="mt-[6px] w-10 h-10 shrink-0 rounded-[12px] bg-white flex items-center justify-center text-[#114BFF]">
                <Headphones size={18} strokeWidth={1.67} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] leading-5 font-bold text-[#182339]">Need help with a refund?</div>
                <div className="mt-[2px] max-w-[240px] text-[13px] leading-4 text-[#697691]">
                  Our travel experts are available around the clock.
                </div>
              </div>
              <ChevronRight size={18} strokeWidth={1.67} className="mt-[16.5px] text-[#182339] shrink-0" />
            </div>

            {activeTab === 'Upcoming' && !tabIsEmpty && (
              <div className="h-[157px] rounded-[12px] border border-[#98A5BF] bg-white pl-[17px] pr-[40px] pt-[19.5px]">
                <div className="text-[16px] leading-5 font-bold text-[#182339]">More with GoVoylo</div>
                <div className="mt-[13px] text-[13px] leading-4 text-[#697691]">Add-ons for your upcoming trips</div>
                <div className="mt-[25px] flex items-center gap-3">
                  <span className="w-8 h-8 shrink-0 rounded-[8px] bg-[#F3E8FF] flex items-center justify-center text-[#7C1AEE]">
                    <FileText size={18} strokeWidth={1.67} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] leading-4 font-bold text-[#182339]">Apply for e-Visa</div>
                    <div className="mt-px text-[12px] leading-4 text-[#697691]">
                      {nextCity ? `Travelling to ${nextCity}? Apply online` : 'Apply online before you travel'}
                    </div>
                  </div>
                  <ChevronRight size={18} strokeWidth={1.67} className="text-[#182339] shrink-0" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {notice && <NoticeDialogWeb title={notice.title} text={notice.text} onClose={() => setNotice(null)} />}
    </div>
  );
};
