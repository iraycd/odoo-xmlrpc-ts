import { parseError } from '../src/utils';

describe('Utils', () => {
  describe('parseError', () => {
    it('should parse Error object', () => {
      const error = new Error('Test error');
      expect(parseError(error)).toBe('Test error');
    });

    it('should parse object with faultString', () => {
      const error = { faultString: 'Fault error' };
      expect(parseError(error)).toBe('Fault error');
    });

    it('should parse object with message', () => {
      const error = { message: 'Message error' };
      expect(parseError(error)).toBe('Message error');
    });

    it('should convert other types to string', () => {
      expect(parseError(123)).toBe('123');
      expect(parseError(null)).toBe('null');
      expect(parseError(undefined)).toBe('undefined');
    });
  });
});
