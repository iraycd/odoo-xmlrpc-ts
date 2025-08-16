# odoo-xmlrpc-ts

A type-safe Odoo XML-RPC client for Node.js written in TypeScript. This package provides a robust interface to interact with Odoo's external API through XML-RPC.

## Features

- ✨ Full TypeScript support with type definitions
- 🔄 Promise-based API
- 🔐 Automatic authentication handling
- 🛡️ Comprehensive error handling
- 🎯 Support for all major Odoo operations
- 📝 Built-in TypeScript interfaces for Odoo models
- 🔍 Type-safe domain builders
- 📦 Zero external dependencies except xmlrpc
- 🔄 Supports both ESM and CommonJS

## Prerequisites

- Node.js >= 18
- pnpm >= 8
- Odoo instance with XML-RPC enabled
- API access enabled in your Odoo instance

## Installation

```bash
pnpm add odoo-xmlrpc-ts
```

Using npm:

```bash
npm install odoo-xmlrpc-ts
```

Using yarn:

```bash
yarn add odoo-xmlrpc-ts
```

## Usage

### ESM Import

```typescript
import { OdooClient } from 'odoo-xmlrpc-ts';
```

### CommonJS Require

```javascript
const { OdooClient } = require('odoo-xmlrpc-ts');
```


### Basic Example

```typescript
import { OdooClient } from 'odoo-xmlrpc-ts';
// Or for CommonJS:
// const { OdooClient } = require('odoo-xmlrpc-ts');

// Define your model interfaces
interface Partner {
  id: number;
  name: string;
  email?: string;
  is_company: boolean;
}

async function example() {
  // Initialize client
  const client = new OdooClient({
    url: 'https://your-odoo-instance.com',
    db: 'your-database',
    username: 'admin',
    password: 'admin',
  });

  try {
    // Search and read partners
    const partners = await client.searchRead<Partner>('res.partner', [['is_company', '=', true]], {
      fields: ['name', 'email'],
      limit: 10,
    });

    console.log('Partners:', partners);
  } catch (error) {
    if (error instanceof OdooError) {
      console.error('Odoo Error:', error.message);
    }
  }
}
```

### HTTP Agent Configuration

You can configure custom HTTP agents for advanced network configurations such as custom SSL settings, or connection pooling:

> **Note**: Odoo doesn't support HTTPS natively. For production deployments, place Odoo behind a reverse proxy (Nginx/Apache) with SSL termination. The agent configuration below is useful when connecting to such HTTPS-enabled Odoo instances.

```typescript
import { OdooClient } from 'odoo-xmlrpc-ts';
import https from 'node:https';
import fs from 'node:fs';

// Example: Custom HTTPS agent with specific SSL options
const httpsAgent = new https.Agent({
  ca: fs.readFileSync('/path/to/ca-certificate.pem'), // Custom CA certificate
  keepAlive: true,
  maxSockets: 10,
});

// Alternative: For development/testing only (not recommended for production)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // Disables SSL verification (use only for testing)
  keepAlive: true,
  maxSockets: 10,
});

const client = new OdooClient({
  url: 'https://your-odoo-instance.com', // HTTPS URL (via reverse proxy)
  db: 'your-database',
  username: 'admin',
  password: 'admin',
  agent: httpsAgent,
});
```

### Advanced Usage

```typescript
import { OdooClient, OdooBaseModel } from 'odoo-xmlrpc-ts';

// Extend the base model interface
interface CustomPartner extends OdooBaseModel {
  name: string;
  email: string;
  phone?: string;
  is_company: boolean;
  child_ids: number[];
}

async function advancedExample() {
  const client = new OdooClient({
    url: 'https://your-odoo-instance.com',
    db: 'your-database',
    username: 'admin',
    password: 'admin',
  });

  // Create a new partner
  const partnerId = await client.create<Partial<CustomPartner>>('res.partner', {
    name: 'Test Company',
    is_company: true,
    email: 'test@example.com',
  });

  // Read the created partner
  const [partner] = await client.read<CustomPartner>('res.partner', [partnerId]);

  // Update the partner
  await client.write<Partial<CustomPartner>>('res.partner', [partnerId], {
    phone: '+1234567890',
  });

  // Delete the partner
  await client.unlink('res.partner', [partnerId]);
}
```

## API Reference

### Constructor

```typescript
const client = new OdooClient({
  url: string;    // Odoo instance URL
  db: string;     // Database name
  username: string;
  password: string;
  agent?: https.Agent | http.Agent;  // Optional HTTP agent for custom network configuration
});
```

### Methods

#### `async version(): Promise<OdooVersion>`

Get Odoo server version information.

#### `async authenticate(): Promise<number>`

Authenticate with the Odoo server. Called automatically when needed.

#### `async search(model: string, domain: OdooDomain, options?: SearchOptions): Promise<number[]>`

Search for record IDs.

```typescript
interface SearchOptions {
  offset?: number;
  limit?: number;
  order?: string;
}
```

#### `async searchRead<T>(model: string, domain: OdooDomain, options?: SearchReadOptions): Promise<T[]>`

Search and read records in one call.

```typescript
interface SearchReadOptions extends SearchOptions {
  fields?: string[];
}
```

#### `async read<T>(model: string, ids: number[], fields?: string[]): Promise<T[]>`

Read specific records by ID.

#### `async create<T>(model: string, values: T): Promise<number>`

Create a new record.

#### `async write<T>(model: string, ids: number[], values: T): Promise<boolean>`

Update existing records.

#### `async unlink(model: string, ids: number[]): Promise<boolean>`

Delete records.

#### `async fieldsGet(model: string, attributes?: string[]): Promise<OdooFieldsMap>`

Get field information for a model.

#### `async execute<T>(model: string, method: string, args?: any[], kwargs?: object): Promise<T>`

Execute any method on an Odoo model. This is useful for calling custom methods or workflow actions.

```typescript
// Example: Confirm a sale order
await client.execute('sale.order', 'action_confirm', [orderId]);

// Example: Send email using template
await client.execute('mail.template', 'send_mail', [templateId, recordId]);

// Example: Custom method with keyword arguments
await client.execute('your.model', 'your_method', [arg1, arg2], {
  kwarg1: 'value1',
  kwarg2: 'value2'
});

## Error Handling

The client includes built-in error classes:

- `OdooError`: Base error class for all Odoo-related errors
- `OdooAuthenticationError`: Authentication-specific errors

```typescript
try {
  await client.authenticate();
} catch (error) {
  if (error instanceof OdooAuthenticationError) {
    console.error('Authentication failed:', error.message);
  }
}
```

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm run build

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Lint
pnpm run lint

# Format code
pnpm run format

# Type check
pnpm run type-check
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Common Issues

### CORS Issues

If you're using this client in a browser environment, you might encounter CORS issues. This client is intended for Node.js usage. For browser environments, consider using Odoo's JSON-RPC interface instead.

### Authentication Issues

Make sure your Odoo instance has XML-RPC enabled and your user has the necessary access rights. For Odoo.sh or Odoo Online instances, you might need to whitelist your IP address.

## Notes & Considerations

### HTTPS/SSL Deployment
- Odoo doesn't provide native HTTPS support (removed since ~v6.1)
- Production deployments require a reverse proxy (Nginx/Apache) for SSL termination
- Use `proxy_mode = 1` in Odoo configuration when behind a proxy
- The HTTP agent configuration is useful for custom SSL certificates and corporate environments

### XML-RPC vs JSON-RPC
- This library uses Odoo's XML-RPC endpoints (`/xmlrpc/2/common`, `/xmlrpc/2/object`)
- Odoo also provides JSON-RPC endpoints (`/jsonrpc`) - these are separate protocols
- Both provide the same functionality; JSON-RPC is lighter weight
- XML-RPC is well-documented with many examples and good TypeScript support

## Contributors

Thanks to all the amazing contributors who have made this project possible:

<!-- ALL-CONTRIBUTORS-LIST:START -->
<table>
  <tr>
    <td align="center">
      <a href="https://github.com/iraycd">
        <img src="https://avatars.githubusercontent.com/u/1450984?v=4" width="100px;" alt="Ray Ch"/>
        <br />
        <sub><b>Ray Ch</b></sub>
      </a>
      <br />
      <sub>29 contributions</sub>
    </td>
    <td align="center">
      <a href="https://github.com/Haris565">
        <img src="https://avatars.githubusercontent.com/u/64888353?v=4" width="100px;" alt="Haris565"/>
        <br />
        <sub><b>Haris565</b></sub>
      </a>
      <br />
      <sub>3 contributions</sub>
    </td>
    <td align="center">
      <a href="https://github.com/Xstoudi">
        <img src="https://avatars.githubusercontent.com/u/2575182?v=4" width="100px;" alt="Xavier Stouder"/>
        <br />
        <sub><b>Xavier Stouder</b></sub>
      </a>
      <br />
      <sub>1 contribution</sub>
    </td>
    <td align="center">
      <a href="https://github.com/vendethiel">
        <img src="https://avatars.githubusercontent.com/u/199499?v=4" width="100px;" alt="ven"/>
        <br />
        <sub><b>ven</b></sub>
      </a>
      <br />
      <sub>1 contribution</sub>
    </td>
  </tr>
</table>
<!-- ALL-CONTRIBUTORS-LIST:END -->

## License

MIT © Dilip Ray Ch
