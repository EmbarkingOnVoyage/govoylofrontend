import { describe, test, expect } from 'vitest';
import type { FareRule, FareRulePolicy } from '../useFareRulesMobile';
import { buildRows, hoursText, textRulesFor } from './fareRules';

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
