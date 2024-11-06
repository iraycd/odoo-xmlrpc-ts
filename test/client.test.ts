// test/client.test.ts
import { OdooClient } from '../src/client';
import { OdooAuthenticationError, OdooError } from '../src/errors';
import { OdooConfig } from '../src/types';

// Mock xmlrpc module
const mockMethodCall = jest.fn();
jest.mock('xmlrpc', () => ({
  createClient: jest.fn(() => ({
    methodCall: mockMethodCall,
  })),
}));

describe('OdooClient', () => {
  let client: OdooClient;
  const mockConfig: OdooConfig = {
    url: 'http://localhost:8069',
    db: 'test_db',
    username: 'admin',
    password: 'admin',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockMethodCall.mockReset();
    client = new OdooClient(mockConfig);
  });

  describe('version', () => {
    it('should return version information', async () => {
      const mockVersion = {
        server_version: '14.0',
        server_version_info: [14, 0, 0, 'final', 0],
        server_serie: '14.0',
        protocol_version: 1,
      };

      mockMethodCall.mockImplementation((_method, _params, callback) => {
        callback(null, mockVersion);
      });

      const version = await client.version();
      expect(version).toEqual(mockVersion);
    });

    it('should throw OdooError on failure', async () => {
      mockMethodCall.mockImplementation((_method, _params, callback) => {
        callback(new Error('Connection failed'));
      });

      await expect(client.version()).rejects.toThrow(OdooError);
    });
  });

  describe('authenticate', () => {
    it('should authenticate successfully', async () => {
      mockMethodCall.mockImplementation((_method, _params, callback) => {
        callback(null, 1);
      });

      const uid = await client.authenticate();
      expect(uid).toBe(1);
    });

    it('should throw OdooAuthenticationError when authentication fails', async () => {
      mockMethodCall.mockImplementation((_method, _params, callback) => {
        callback(null, false);
      });

      await expect(client.authenticate()).rejects.toThrow(OdooAuthenticationError);
    });
  });

  describe('CRUD Operations', () => {
    beforeEach(() => {
      (client as any).uid = 1; // Mock authenticated state
    });

    describe('search', () => {
      it('should perform search operation', async () => {
        const mockIds = [1, 2, 3];
        mockMethodCall.mockImplementation((_method, _params, callback) => {
          callback(null, mockIds);
        });

        const result = await client.search('res.partner', [['is_company', '=', true]]);
        expect(result).toEqual(mockIds);
      });
    });

    describe('searchRead', () => {
      it('should perform search_read operation', async () => {
        const mockRecords = [
          { id: 1, name: 'Test 1' },
          { id: 2, name: 'Test 2' },
        ];
        mockMethodCall.mockImplementation((_method, _params, callback) => {
          callback(null, mockRecords);
        });

        const result = await client.searchRead('res.partner', [['is_company', '=', true]], {
          fields: ['name'],
        });
        expect(result).toEqual(mockRecords);
      });
    });

    describe('create', () => {
      it('should create a record', async () => {
        mockMethodCall.mockImplementation((_method, _params, callback) => {
          callback(null, 1);
        });

        const result = await client.create('res.partner', { name: 'Test Partner' });
        expect(result).toBe(1);
      });
    });

    describe('write', () => {
      it('should update a record', async () => {
        mockMethodCall.mockImplementation((_method, _params, callback) => {
          callback(null, true);
        });

        const result = await client.write('res.partner', [1], { name: 'Updated Name' });
        expect(result).toBe(true);
      });
    });

    describe('unlink', () => {
      it('should delete records', async () => {
        mockMethodCall.mockImplementation((_method, _params, callback) => {
          callback(null, true);
        });

        const result = await client.unlink('res.partner', [1]);
        expect(result).toBe(true);
      });
    });
  });

  describe('fieldsGet', () => {
    it('should return fields information', async () => {
      const mockFields = {
        name: {
          type: 'char',
          string: 'Name',
          required: true,
        },
      };

      mockMethodCall.mockImplementation((_method, _params, callback) => {
        callback(null, mockFields);
      });

      const result = await client.fieldsGet('res.partner');
      expect(result).toEqual(mockFields);
    });

    it('should handle errors', async () => {
      mockMethodCall.mockImplementation((_method, _params, callback) => {
        callback(new Error('Failed to get fields'));
      });

      await expect(client.fieldsGet('res.partner')).rejects.toThrow(OdooError);
    });
  });
});
