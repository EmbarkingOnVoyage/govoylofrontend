import { describe, test, expect } from 'vitest';
import { travelerTypeForDob } from './travellers';

describe('saved traveller type from date of birth', () => {
  const today = new Date(Date.UTC(2026, 9, 13));

  test('matches the API rule: under 2 infant, 2–12 child, over 12 adult', () => {
    expect(travelerTypeForDob('2026-02-15', today)).toBe('infant');
    expect(travelerTypeForDob('2024-10-14', today)).toBe('infant');
    expect(travelerTypeForDob('2024-10-12', today)).toBe('child');
    expect(travelerTypeForDob('2019-03-10', today)).toBe('child');
    expect(travelerTypeForDob('2014-10-20', today)).toBe('child');
    expect(travelerTypeForDob('2014-01-01', today)).toBe('adult');
    expect(travelerTypeForDob('2013-10-01', today)).toBe('adult');
    expect(travelerTypeForDob('1990-05-14T00:00:00', today)).toBe('adult');
  });

  test('no date of birth saves as an adult', () => {
    expect(travelerTypeForDob(null, today)).toBe('adult');
    expect(travelerTypeForDob('', today)).toBe('adult');
  });
});
