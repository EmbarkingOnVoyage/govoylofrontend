import { describe, test, expect } from 'vitest';
import { UI_VERSION } from './index';

describe('UI Workspace Package Contract', () => {
  test('should export a valid production version string', () => {
    expect(UI_VERSION).toBe('1.0.0');
    expect(UI_VERSION).not.toBeNull();
  });
});
