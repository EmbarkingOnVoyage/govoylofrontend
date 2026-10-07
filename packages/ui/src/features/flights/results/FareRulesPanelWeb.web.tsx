import React, { useMemo, useState } from 'react';
import { CalendarDays, Clock, Info, Loader2, Undo2 } from 'lucide-react';
import { useFareRulesMobile } from '../useFareRulesMobile';
import {
  buildRows,
  buildRuleTabs,
  money,
  textRulesFor,
  type FareRuleTab,
  type FareRulesLeg,
  type RuleRow,
} from '../logic/fareRules';

const TONE_COLOR: Record<RuleRow['tone'], string> = {
  green: '#007F20',
  orange: '#CE6400',
  red: '#C5001F',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// "Fri, 25 Sep · 09:25"
function legDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${WEEKDAYS[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} · ${hh}:${mm}`;
}

const Notice: React.FC<{ tone: 'blue' | 'orange'; title?: string; children: React.ReactNode }> = ({ tone, title, children }) => (
  <div
    className={`w-full flex gap-2 p-3 rounded-xl border ${
      tone === 'blue' ? 'bg-[#E8EEFF] border-[rgba(0,112,200,0.1)]' : 'bg-[#FFF3E8] border-[rgba(179,98,0,0.1)]'
    }`}
  >
    {tone === 'blue' ? <Info size={20} className="text-[#2563EB] shrink-0" /> : <Clock size={20} className="text-[#CE6400] shrink-0" />}
    <div className="flex flex-col gap-1">
      {title && <div className="text-[15px] leading-5 font-bold text-[#182339]">{title}</div>}
      <div className="text-[13px] leading-[18px] text-[#182339]">{children}</div>
    </div>
  </div>
);

// Fare rules (Web Dev "Fare rules" popup): a card per leg/trip, then
// Cancellation and Date change side by side — each a banded timeline from
// the supplier's policies, or the airline's text rules when there are no
// amounts — with the transaction-fee and check-in notes underneath.
export const FareRulesPanelWeb: React.FC<{ legs: FareRulesLeg[] }> = ({ legs }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const offerIds = useMemo(() => legs.map((l) => l.offerId), [legs]);
  const fareIds = useMemo(() => legs.map((l) => l.fareId ?? ''), [legs]);
  const { data, isLoading, isError } = useFareRulesMobile(offerIds, fareIds);

  const tabs = useMemo(() => buildRuleTabs(legs, data), [legs, data]);
  const active = tabs[Math.min(activeTabIndex, tabs.length - 1)];
  const activeLeg = legs.find((l) => l.offerId === active?.offerId) ?? legs[0];
  const legRules = data?.legs.find((l) => l.offerId === active?.offerId);
  const policies = (legRules?.policies ?? []).filter((p) => !active?.route || p.route === active.route);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin text-[#7C1AEE]" />
      </div>
    );
  }
  if (isError) {
    return <p className="py-6 text-[13px] text-[#3E4B64]">Couldn't load fare rules right now. Please try again.</p>;
  }

  const renderColumn = (tab: FareRuleTab) => {
    const rows = buildRows(policies, tab, activeLeg?.airlineName ?? '');
    const textRules = textRulesFor(legRules?.rules ?? [], tab);
    const hasAmounts = rows.some((r) => r.amount != null);
    const transactionFee = Math.max(0, ...policies.filter((p) => p.type === tab).map((p) => p.transactionFee ?? 0));
    const isCancel = tab === 'Cancellation';

    let body: React.ReactNode;
    if (rows.length > 0) {
      body = (
        <div className="w-full flex flex-col p-3.5 bg-white border border-[#98A5BF] rounded-[14px]">
          <div className="text-[11px] leading-4 font-bold uppercase text-[#697691]">
            {isCancel ? 'If you cancel…' : 'If you change the date…'}
          </div>
          {rows.map((row, index) => {
            const last = index === rows.length - 1;
            return (
              <div key={`${row.title}-${index}`} className={`flex items-start gap-2.5 ${index === 0 ? 'pt-3' : ''}`}>
                <div className="w-3.5 flex flex-col items-center pt-[3px] self-stretch">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: TONE_COLOR[row.tone] }} />
                  {!last && <span className="flex-1 w-0.5 my-1 bg-[#98A5BF]" />}
                </div>
                <div className={`flex-1 min-w-0 ${last ? '' : 'pb-3.5'}`}>
                  <div className="text-[14px] leading-5 font-bold text-[#182339]">{row.title}</div>
                  <div className="pt-0.5 text-[13px] leading-4 text-[#697691]">{row.window}</div>
                  {row.note && <div className="pt-1 text-[12px] leading-4 text-[#3E4B64]">{row.note}</div>}
                </div>
                <div className="text-right shrink-0">
                  {row.amount != null ? (
                    <>
                      <div className="text-[16px] leading-[22px] font-bold text-[#182339]">{money(row.amount)}</div>
                      <div className="pt-px text-[13px] leading-4 text-[#697691]">{isCancel ? 'airline fee' : '+ fare difference'}</div>
                    </>
                  ) : row.chip ? (
                    <span
                      className={`inline-block px-2.5 py-1 rounded-[20px] text-[12px] leading-4 font-bold ${
                        row.tone === 'red' ? 'bg-[#FFE8EC] text-[#C5001F]' : 'bg-[#ECEEF3] text-[#3E4B64]'
                      }`}
                    >
                      {row.chip}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      );
    } else if (textRules.length > 0) {
      const Icon = isCancel ? Undo2 : CalendarDays;
      body = (
        <div className="w-full flex flex-col gap-3 p-3.5 bg-white border border-[#98A5BF] rounded-[14px]">
          <div className="flex items-center gap-2">
            <Icon size={16} className={isCancel ? 'text-[#CE6400]' : 'text-[#2563EB]'} />
            <span className="text-[14px] leading-5 font-bold text-[#182339]">Airline policy</span>
          </div>
          {textRules.map((rule, index) => (
            <div key={`${rule.segmentId}-${index}`}>
              {rule.fareRuleName && <div className="text-[13px] leading-4 font-bold text-[#182339]">{rule.fareRuleName}</div>}
              <p className="text-[13px] leading-4 text-[#697691] whitespace-pre-line">{rule.fareRuleDesc.replace(/__nls__/g, '\n')}</p>
            </div>
          ))}
        </div>
      );
    } else {
      body = (
        <p className="text-[13px] leading-4 text-[#3E4B64]">
          No specific {isCancel ? 'cancellation' : 'date change'} rule was provided for this fare.
        </p>
      );
    }

    return (
      <div className="flex-1 min-w-0 max-w-[343px] flex flex-col gap-3">
        <div className="h-8 flex items-stretch bg-white border border-[#ADB8CD] rounded">
          <div
            className={`flex-1 flex items-center justify-center px-3 rounded text-[15px] leading-5 text-center ${
              isCancel ? 'm-[2px] bg-[#F3E8FF] text-[#3E4B64]' : 'text-[#182339]'
            }`}
          >
            {isCancel ? 'Cancellation' : 'Date change'}
          </div>
        </div>
        {body}
        {transactionFee > 0 && (
          <Notice tone="blue">
            <strong>+ {money(transactionFee)} transaction fee</strong> per passenger on top of the airline fee. It applies even if
            the airline cancels the flight.
          </Notice>
        )}
        <Notice tone="orange" title="Check-in closes 45 min before departure">
          60 min for international flights. Fees are per passenger.
        </Notice>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-[18px]">
      {tabs.length > 1 && (
        <div className="flex gap-2 pb-3">
          {tabs.map((tab, index) => {
            const isActive = tab.key === active?.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTabIndex(index)}
                className={`w-[167px] text-left px-3.5 py-3 rounded-xl border-2 bg-white ${isActive ? 'border-[#7C1AEE]' : 'border-[#98A5BF]'}`}
              >
                <div className={`text-[11px] leading-4 font-bold uppercase ${isActive ? 'text-[#7C1AEE]' : 'text-[#697691]'}`}>{tab.label}</div>
                <div className="pt-1 text-[18px] leading-6 font-bold text-[#182339]">
                  {tab.origin} → {tab.destination}
                </div>
                {tab.departureDateTime && <div className="pt-0.5 text-[13px] leading-4 text-[#697691]">{legDate(tab.departureDateTime)}</div>}
              </button>
            );
          })}
        </div>
      )}
      <div className="flex items-start gap-10">
        {renderColumn('Cancellation')}
        {renderColumn('DateChange')}
      </div>
    </div>
  );
};
