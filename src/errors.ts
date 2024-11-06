export class OdooError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OdooError';
  }
}

export class OdooAuthenticationError extends OdooError {
  constructor(message = 'Authentication failed') {
    super(message);
    this.name = 'OdooAuthenticationError';
  }
}
