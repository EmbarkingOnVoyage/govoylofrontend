// Pure fare-rule logic shared by the mobile Fare rules modal and the web
// Fare rules popup: turns a fare's policies into the banded timeline rows.
import type { FareRule, FareRulePolicy } from '../useFareRulesMobile';

export type FareRuleTab = 'Cancellation' | 'DateChange';

export function money(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

// 72 → "3 days", 8760 → "365 days", 5 → "5 hrs".
export function hoursText(hours: number): string {
  if (hours >= 24 && hours % 24 === 0) {
    const days = hours / 24;
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  }
  return `${hours} ${hours === 1 ? 'hr' : 'hrs'}`;
}

export interface RuleRow {
  title: string;
  window: string;
  amount: number | null;
  // "No refund" / "Can't change" / "Airline policy"
  chip: string | null;
  tone: 'green' | 'orange' | 'red';
  note: string | null;
}

// Tripjack gives each policy as time bands before departure (e.g. 4–8760 hrs:
// ₹3,000). Each band becomes a row, latest-allowed last; anything closer to
// departure than the last band isn't allowed at all, which is the red row.
export function buildRows(policies: FareRulePolicy[], tab: FareRuleTab, airlineName: string): RuleRow[] {
  const bands = policies
    .filter((p) => p.type === tab)
    .sort((a, b) => (b.startHours ?? 0) - (a.startHours ?? 0));
  if (bands.length === 0) return [];

  const rows: RuleRow[] = bands.map((band, index) => {
    const start = band.startHours ?? 0;
    const end = band.endHours ?? 8760;
    const title = start > 0 ? `More than ${hoursText(start)} before` : 'Any time before departure';
    return {
      title,
      window: `${hoursText(start)} – ${hoursText(end)} ${start > 0 ? 'to departure' : ''}`.trim(),
      amount: band.airlineFee ?? null,
      chip: band.airlineFee == null ? 'Airline policy' : null,
      tone: index === 0 ? 'green' : 'orange',
      note:
        band.airlineFee == null
          ? tab === 'Cancellation'
            ? `The penalty is set by ${airlineName || 'the airline'} at the time you cancel.`
            : `${airlineName || 'The airline'}'s change penalty plus any difference in fare.`
          : null,
    };
  });

  const earliest = bands[bands.length - 1].startHours ?? 0;
  if (earliest > 0) {
    rows.push({
      title: `Less than ${hoursText(earliest)} before`,
      window: `0 – ${hoursText(earliest)} to departure`,
      amount: null,
      chip: tab === 'Cancellation' ? 'No refund' : "Can't change",
      tone: 'red',
      note: null,
    });
  }
  return rows;
}

// Flyshop's Air_FareRule is free text only, so its rules are grouped into the
// two tabs by keyword. A rule that reads as neither (e.g. a generic disclaimer)
// is shown under both rather than dropped.
export function textRulesFor(rules: FareRule[], tab: FareRuleTab): FareRule[] {
  return rules.filter((rule) => {
    const text = `${rule.fareRuleName} ${rule.fareRuleDesc}`.toLowerCase();
    const mentionsCancel = text.includes('cancel') || text.includes('refund');
    const mentionsChange = text.includes('change') || text.includes('resched') || text.includes('reissue');
    if (!mentionsCancel && !mentionsChange) return true;
    return tab === 'Cancellation' ? mentionsCancel : mentionsChange;
  });
}
