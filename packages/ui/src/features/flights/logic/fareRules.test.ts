import { describe, test, expect } from 'vitest';
import type { FareRule, FareRulePolicy } from '../useFareRulesMobile';
import { buildRows, fareRuleSummary, hoursText, textRulesFor } from './fareRules';

function policy(overrides: Partial<FareRulePolicy>): FareRulePolicy {
  return {
    route: 'DEL-BOM',
    type: 'Cancellation',
    startHours: 0,
    endHours: 8760,
    airlineFee: null,
    transactionFee: null,
    info: null,
    ...overrides,
  } as FareRulePolicy;
}

describe('fare rule rows', () => {
  test('hours read as days when they divide evenly', () => {
    expect(hoursText(72)).toBe('3 days');
    expect(hoursText(24)).toBe('1 day');
    expect(hoursText(5)).toBe('5 hrs');
    expect(hoursText(1)).toBe('1 hr');
  });

  test('bands run latest-allowed last, then a red "No refund" row', () => {
    const rows = buildRows(
      [
        policy({ startHours: 4, endHours: 72, airlineFee: 4999 }),
        policy({ startHours: 72, endHours: 8760, airlineFee: 4299 }),
        policy({ type: 'DateChange', startHours: 2, airlineFee: 2500 }),
      ],
      'Cancellation',
      'IndiGo'
    );
    expect(rows.map((r) => [r.title, r.amount, r.tone, r.chip])).toEqual([
      ['More than 3 days before', 4299, 'green', null],
      ['More than 4 hrs before', 4999, 'orange', null],
      ['Less than 4 hrs before', null, 'red', 'No refund'],
    ]);
  });

  test('a band without a fee is left to the airline', () => {
    const [row] = buildRows([policy({ type: 'DateChange' })], 'DateChange', 'IndiGo');
    expect(row.chip).toBe('Airline policy');
    expect(row.title).toBe('Any time before departure');
    expect(row.note).toContain('IndiGo');
  });

  test('free-text rules are grouped by keyword, unclear ones shown under both tabs', () => {
    const rules = [
      { fareRuleName: 'Cancellation', fareRuleDesc: 'Refund less fee' },
      { fareRuleName: 'Reissue', fareRuleDesc: 'Date change allowed' },
      { fareRuleName: 'General', fareRuleDesc: 'Subject to availability' },
    ] as FareRule[];
    expect(textRulesFor(rules, 'Cancellation').map((r) => r.fareRuleName)).toEqual(['Cancellation', 'General']);
    expect(textRulesFor(rules, 'DateChange').map((r) => r.fareRuleName)).toEqual(['Reissue', 'General']);
  });
});

describe('fare card summary', () => {
  const legRules = (policies: FareRulePolicy[], rules: FareRule[] = []) => ({ offerId: 'o', rules, policies });

  test('the cheapest band gives the fee, "from" when it varies', () => {
    const rules = legRules([
      policy({ startHours: 4, endHours: 72, airlineFee: 4999 }),
      policy({ startHours: 72, endHours: 8760, airlineFee: 3000 }),
      policy({ type: 'DateChange', startHours: 4, endHours: 8760, airlineFee: 2250 }),
    ]);
    expect(fareRuleSummary(rules, 'Cancellation', true)).toEqual({ text: 'Cancellation fee from ₹3,000', tone: 'pay' });
    expect(fareRuleSummary(rules, 'DateChange', true)).toEqual({ text: 'Date change fee ₹2,250', tone: 'pay' });
  });

  test('a cancellation fee at or above the fare means no refund', () => {
    const rules = legRules([policy({ startHours: 0, endHours: 8760, airlineFee: 3000 })]);
    expect(fareRuleSummary(rules, 'Cancellation', false, 1588.5)).toEqual({ text: 'Cancellation: non-refundable', tone: 'na' });
    expect(fareRuleSummary(rules, 'Cancellation', true, 6000)?.text).toBe('Cancellation fee ₹3,000');
  });

  test('a free band and an airline-set fee', () => {
    const rules = legRules([
      policy({ type: 'DateChange', startHours: 72, endHours: 8760, airlineFee: 0 }),
      policy({ startHours: 0, endHours: 8760, airlineFee: null }),
    ]);
    expect(fareRuleSummary(rules, 'DateChange', true)).toEqual({ text: 'Free date change until 3 days before', tone: 'included' });
    expect(fareRuleSummary(rules, 'Cancellation', true)).toEqual({ text: 'Cancellation: as per airline policy', tone: 'pay' });
  });

  test('text-only rules point to the Fare Rule tab; no rules keep the card wording', () => {
    const rules = legRules([], [{ segmentId: '1', fareRuleName: 'Date change', fareRuleDesc: 'Reschedule fee INR 2500' }]);
    expect(fareRuleSummary(rules, 'DateChange', true)?.text).toBe('Date change: see Fare Rule tab');
    expect(fareRuleSummary(rules, 'Cancellation', false)).toEqual({ text: 'Cancellation: non-refundable', tone: 'na' });
    expect(fareRuleSummary(undefined, 'Cancellation', true)).toBeNull();
    expect(fareRuleSummary(legRules([]), 'DateChange', true)).toBeNull();
  });
});
