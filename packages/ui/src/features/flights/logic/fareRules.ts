// Pure fare-rule logic shared by the mobile Fare rules modal and the web
// Fare rules popup: turns a fare's policies into the banded timeline rows.
import type { FareRule, FareRulePolicy, FareRulesResponse, LegFareRules } from '../useFareRulesMobile';

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

// One flight (leg) whose fare rules are shown.
export interface FareRulesLeg {
  offerId: string;
  label: string;
  origin: string;
  destination: string;
  airlineName: string;
  airlineCode?: string;
  flightNumbers: string[];
  departureDateTime: string;
  // Every flight of the leg — a combined return/multi-city fare is one offer
  // whose rules come back per trip, and each trip gets its own tab.
  segments?: { origin: string; destination: string; departureDateTime: string }[];
  // The fare picked for this leg, if any.
  fareId?: string | null;
}

// One tab in the flight strip: a leg, or one trip of a combined fare.
export interface RuleTab {
  key: string;
  offerId: string;
  route: string | null;
  label: string;
  origin: string;
  destination: string;
  departureDateTime: string;
}

// One tab per leg, or per trip when a single offer's rules come back for
// several routes (a combined return or multi-city fare).
export function buildRuleTabs(legs: FareRulesLeg[], data: FareRulesResponse | undefined): RuleTab[] {
  const result: RuleTab[] = [];
  legs.forEach((leg) => {
    const routes = [...new Set((data?.legs.find((l) => l.offerId === leg.offerId)?.policies ?? []).map((p) => p.route))];
    if (routes.length <= 1) {
      result.push({
        key: leg.offerId,
        offerId: leg.offerId,
        route: routes[0] ?? null,
        label: leg.label,
        origin: leg.origin,
        destination: leg.destination,
        departureDateTime: leg.departureDateTime,
      });
      return;
    }
    routes.forEach((route) => {
      const [origin, destination] = route.split('-');
      const segment = leg.segments?.find((s) => s.origin === origin);
      result.push({
        key: `${leg.offerId}-${route}`,
        offerId: leg.offerId,
        route,
        label: '',
        origin: origin ?? '',
        destination: destination ?? '',
        departureDateTime: segment?.departureDateTime ?? '',
      });
    });
  });
  // Leg labels (Onward/Return) only fit when each tab is a whole leg.
  const usesLegLabels = result.length === legs.length;
  return result.map((tab, index) => ({
    ...tab,
    label: usesLegLabels && tab.label ? tab.label : `Flight-${index + 1}`,
  }));
}

export type FareRuleTone = 'included' | 'pay' | 'na';

export interface FareRuleSummary {
  text: string;
  tone: FareRuleTone;
}

// One line for a fare card ("Cancellation fee from ₹3,000", "Free date change
// until 3 days before"), from the fare's real rules. Tripjack's banded
// policies give amounts; Flyshop's rules are text only, so those point to the
// Fare Rule tab. Null when there are no rules to go on — the card keeps its
// own wording then. fareAmount (per adult): a cancellation fee at or above it
// leaves nothing to refund, so that reads as non-refundable.
export function fareRuleSummary(
  rules: LegFareRules | undefined,
  tab: FareRuleTab,
  refundable: boolean,
  fareAmount?: number
): FareRuleSummary | null {
  const label = tab === 'Cancellation' ? 'Cancellation' : 'Date change';
  const noun = tab === 'Cancellation' ? 'cancellation' : 'date change';
  if (!rules) return null;

  const bands = rules.policies.filter((p) => p.type === tab);
  if (bands.length > 0) {
    const priced = bands.filter((b) => b.airlineFee != null);
    if (priced.length === 0) return { text: `${label}: as per airline policy`, tone: 'pay' };
    const cheapest = priced.reduce((a, b) => ((b.airlineFee ?? 0) < (a.airlineFee ?? 0) ? b : a));
    if ((cheapest.airlineFee ?? 0) === 0) {
      const start = cheapest.startHours ?? 0;
      return {
        text: start > 0 ? `Free ${noun} until ${hoursText(start)} before` : `Free ${noun}`,
        tone: 'included',
      };
    }
    if (tab === 'Cancellation' && fareAmount != null && (cheapest.airlineFee ?? 0) >= fareAmount) {
      return { text: 'Cancellation: non-refundable', tone: 'na' };
    }
    const prefix = priced.length > 1 || bands.length > priced.length ? 'from ' : '';
    return { text: `${label} fee ${prefix}${money(cheapest.airlineFee ?? 0)}`, tone: 'pay' };
  }

  // No amounts. A non-refundable fare can't be cancelled whatever the text says.
  if (tab === 'Cancellation' && !refundable) return { text: 'Cancellation: non-refundable', tone: 'na' };
  if (textRulesFor(rules.rules, tab).length > 0) return { text: `${label}: see Fare Rule tab`, tone: 'pay' };
  return null;
}
