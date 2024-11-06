import { OdooError, OdooAuthenticationError } from '../src/errors';

describe('Errors', () => {
  describe('OdooError', () => {
    it('should create OdooError with correct message and name', () => {
      const error = new OdooError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('OdooError');
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('OdooAuthenticationError', () => {
    it('should create OdooAuthenticationError with default message', () => {
      const error = new OdooAuthenticationError();
      expect(error.message).toBe('Authentication failed');
      expect(error.name).toBe('OdooAuthenticationError');
      expect(error instanceof OdooError).toBe(true);
    });

    it('should create OdooAuthenticationError with custom message', () => {
      const error = new OdooAuthenticationError('Custom auth error');
      expect(error.message).toBe('Custom auth error');
      expect(error.name).toBe('OdooAuthenticationError');
    });
  });
});
