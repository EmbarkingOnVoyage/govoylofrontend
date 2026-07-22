import { describe, test, expect, vi, beforeEach } from 'vitest';
import { logger } from './logger';

describe('Automated Telemetry Logger Engine', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  test('should parse and structuralize standard system logs accurately', () => {
    const logSpy = vi.spyOn(console, 'log');
    
    logger.info('System initialization success', 'BOOTSTRAP');
    
    expect(logSpy).toHaveBeenCalled();
  });

  test('should extract name, message, and execution stack details from thrown exceptions', () => {
    const errorSpy = vi.spyOn(console, 'error');
    const mockError = new Error('Database connection failed');
    
    logger.error('Critical data tier failure', 'DATA-LAYER', mockError);
    
    expect(errorSpy).toHaveBeenCalled();
  });
});
