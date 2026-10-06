import React, { useMemo, useState } from 'react';
import { ArrowLeft, CalendarDays, Clock, Info, Loader2 } from 'lucide-react';
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
  green: '#15803D',
  orange: '#D97706',
  red: '#C8102E',
};

function formatTime24(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function formatWeekdayDate(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'short' });
  return `${weekday}, ${date.getDate()} ${date.toLocaleDateString('en-GB', { month: 'short' })}`;
}

const Chip: React.FC<{ text: string; red?: boolean }> = ({ text, red }) => (
  <span
    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${
      red ? 'bg-[#FDECEE] text-[#C8102E]' : 'bg-[#F1F3F7] text-[#4C5973]'
    }`}
  >
    {text}
  </span>
);

// Fare rules for one or more legs (Web Dev Figma "Fare rules" popup):
// Cancellation and Date change side by side, each a banded timeline from the
// supplier's policies, or the airline's text rules when there are no amounts.
// Shared logic with the mobile FareRulesModal (logic/fareRules.ts).
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
    return <p className="py-6 text-sm text-[#4C5973]">Couldn't load fare rules right now. Please try again.</p>;
  }

  const renderColumn = (tab: FareRuleTab) => {
    const rows = buildRows(policies, tab, activeLeg?.airlineName ?? '');
    const textRules = textRulesFor(legRules?.rules ?? [], tab);
    const hasAmounts = rows.some((r) => r.amount != null);
    const transactionFee = Math.max(0, ...policies.filter((p) => p.type === tab).map((p) => p.transactionFee ?? 0));
    const isCancel = tab === 'Cancellation';

    let body: React.ReactNode;
    if (hasAmounts) {
      body = (
        <div className="rounded-xl border border-[#E4E7EC] p-4">
          <div className="text-[11px] font-semibold text-[#697691] mb-3">
            {isCancel ? 'IF YOU CANCEL…' : 'IF YOU CHANGE THE DATE…'}
          </div>
          {rows.map((row, index) => (
            <div key={`${row.title}-${index}`} className="flex gap-3">
              <div className="flex flex-col items-center pt-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TONE_COLOR[row.tone] }} />
                {index < rows.length - 1 && <span className="flex-1 w-px bg-[#D5DAE3] my-1" />}
              </div>
              <div className="flex-1 pb-4">
                <div className="text-sm font-semibold text-[#182339]">{row.title}</div>
                <div className="text-xs text-[#697691]">{row.window}</div>
              </div>
              <div className="text-right">
                {row.amount != null ? (
                  <>
                    <div className="text-sm font-bold text-[#182339]">{money(row.amount)}</div>
                    <div className="text-[11px] text-[#697691]">{isCancel ? 'airline fee' : '+ fare difference'}</div>
                  </>
                ) : row.chip ? (
                  <Chip text={row.chip} red={row.tone === 'red'} />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      );
    } else if (rows.length > 0 || textRules.length > 0) {
      const Icon = isCancel ? ArrowLeft : CalendarDays;
      const policyRows = rows.filter((r) => r.tone !== 'red');
      body = (
        <div className="rounded-xl border border-[#E4E7EC] p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ backgroundColor: isCancel ? '#FEF3E7' : '#EEF3FF' }}
            >
              <Icon size={14} color={isCancel ? '#C2410C' : '#2563EB'} />
            </span>
            <span className="text-sm font-semibold text-[#182339]">{isCancel ? 'Cancellation' : 'Date change'}</span>
          </div>
          {policyRows.map((row, index) => (
            <div key={index}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-[#182339]">{row.title}</div>
                  <div className="text-xs text-[#697691]">{row.window}</div>
                </div>
                <Chip text="Airline policy" />
              </div>
              {row.note && <p className="text-xs text-[#4C5973] mt-1">{row.note}</p>}
            </div>
          ))}
          {policyRows.length === 0 &&
            textRules.map((rule, index) => (
              <div key={`${rule.segmentId}-${index}`}>
                {rule.fareRuleName && <div className="text-sm font-semibold text-[#182339]">{rule.fareRuleName}</div>}
                <p className="text-xs text-[#4C5973] whitespace-pre-line">{rule.fareRuleDesc}</p>
              </div>
            ))}
          {transactionFee > 0 && (
            <div className="flex justify-between text-sm pt-2 border-t border-[#E4E7EC]">
              <span className="text-[#4C5973]">Transaction fee</span>
              <span className="font-semibold text-[#182339]">+ {money(transactionFee)}</span>
            </div>
          )}
        </div>
      );
    } else {
      body = (
        <p className="text-sm text-[#4C5973]">
          No specific {isCancel ? 'cancellation' : 'date change'} rule was provided for this fare.
        </p>
      );
    }

    return (
      <div className="flex-1 min-w-0 space-y-3">
        <div className="text-center text-sm font-medium py-1.5 rounded-md border border-[#C9B5F5] bg-[#F5F0FF] text-[#182339]">
          {isCancel ? 'Cancellation' : 'Date change'}
        </div>
        {body}
        {hasAmounts && transactionFee > 0 && (
          <div className="flex gap-2 rounded-xl bg-[#EEF3FF] p-3 text-xs text-[#182339]">
            <Info size={16} className="text-[#2563EB] shrink-0" />
            <span>
              <strong>+ {money(transactionFee)} transaction fee</strong> per passenger on top of the airline fee.
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {tabs.length > 1 && (
        <div className="flex gap-3 overflow-x-auto">
          {tabs.map((tab, index) => {
            const isActive = tab.key === active?.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTabIndex(index)}
                className={`text-left px-3 py-2 rounded-lg border min-w-[130px] ${
                  isActive ? 'border-[#7C1AEE] bg-[#F5F0FF]' : 'border-[#D5DAE3] bg-white'
                }`}
              >
                <div className="text-[11px] font-semibold text-[#7C1AEE] uppercase">{tab.label}</div>
                <div className="text-sm font-semibold text-[#182339]">
                  {tab.origin} → {tab.destination}
                </div>
                {tab.departureDateTime && (
                  <div className="text-[11px] text-[#697691]">
                    {formatWeekdayDate(tab.departureDateTime)} · {formatTime24(tab.departureDateTime)}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex gap-4">
        {renderColumn('Cancellation')}
        {renderColumn('DateChange')}
      </div>

      <div className="flex gap-2 rounded-xl bg-[#FEF6E7] p-3 text-xs text-[#182339]">
        <Clock size={16} className="text-[#D97706] shrink-0" />
        <span>
          <strong className="block">Check-in closes 45 min before departure</strong>
          60 min for international flights. Fees are per passenger.
        </span>
      </div>
    </div>
  );
};
