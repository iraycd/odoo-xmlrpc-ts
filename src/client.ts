// src/client.ts
import * as xmlrpc from 'xmlrpc';

import {
  OdooConfig,
  OdooVersion,
  OdooFieldsMap,
  SearchOptions,
  SearchReadOptions,
  OdooDomain,
} from './types';
import { OdooError, OdooAuthenticationError } from './errors';

export class OdooClient {
  private common: xmlrpc.Client;
  private object: xmlrpc.Client;
  private uid: number | null = null;
  private config: OdooConfig;

  constructor(config: OdooConfig) {
    this.config = config;

    const isSecure = config?.options?.isSecure ?? true;

    const protocol = isSecure ? 'https://' : 'http://';
    const baseUrl = config.url.replace(/^https?:\/\//, '');

    const createClient = isSecure ? xmlrpc.createSecureClient : xmlrpc.createClient;

    this.common = createClient(`${protocol}${baseUrl}/xmlrpc/2/common`);
    this.object = createClient(`${protocol}${baseUrl}/xmlrpc/2/object`);
  }

  private methodCall<T>(client: xmlrpc.Client, method: string, params: any[]): Promise<T> {
    return new Promise((resolve, reject) => {
      client.methodCall(method, params, (error: object, value: T) => {
        if (error) {
          reject(new Error(String(error)));
        } else {
          resolve(value);
        }
      });
    });
  }

  public async version(): Promise<OdooVersion> {
    try {
      return await this.methodCall(this.common, 'version', []);
    } catch (error) {
      if (error instanceof Error) {
        throw new OdooError(`Failed to get version: ${error.message}`);
      }
      throw new OdooError('Failed to get version');
    }
  }

  public async authenticate(): Promise<number> {
    try {
      const uid = await this.methodCall<number>(this.common, 'authenticate', [
        this.config.db,
        this.config.username,
        this.config.password,
        {},
      ]);

      if (!uid) {
        throw new OdooAuthenticationError();
      }

      this.uid = uid;
      return uid;
    } catch (error) {
      if (error instanceof Error) {
        throw new OdooAuthenticationError(error.message);
      }
      throw new OdooAuthenticationError();
    }
  }

  public async execute<T>(
    model: string,
    method: string,
    args: any[] = [],
    kwargs: object = {},
  ): Promise<T> {
    if (!this.uid) {
      await this.authenticate();
    }

    try {
      return await this.methodCall<T>(this.object, 'execute_kw', [
        this.config.db,
        this.uid,
        this.config.password,
        model,
        method,
        args,
        kwargs,
      ]);
    } catch (error) {
      if (error instanceof Error) {
        throw new OdooError(`Method ${method} failed on ${model}: ${error.message}`);
      }
      throw new OdooError(`Method ${method} failed on ${model}`);
    }
  }

  public async search(
    model: string,
    domain: OdooDomain,
    options: SearchOptions = {},
  ): Promise<number[]> {
    return await this.execute(model, 'search', [domain], options);
  }

  public async searchCount(model: string, domain: OdooDomain): Promise<number> {
    return await this.execute(model, 'search_count', [domain]);
  }

  public async read<T>(model: string, ids: number[], fields: string[] = []): Promise<T[]> {
    return await this.execute(model, 'read', [ids], { fields });
  }

  public async searchRead<T>(
    model: string,
    domain: OdooDomain,
    options: SearchReadOptions = {},
  ): Promise<T[]> {
    return await this.execute(model, 'search_read', [domain], options);
  }

  public async create<T extends object>(model: string, values: T): Promise<number> {
    return await this.execute(model, 'create', [values]);
  }

  public async write<T extends object>(model: string, ids: number[], values: T): Promise<boolean> {
    return await this.execute(model, 'write', [ids, values]);
  }

  public async unlink(model: string, ids: number[]): Promise<boolean> {
    return await this.execute(model, 'unlink', [ids]);
  }

  public async fieldsGet(
    model: string,
    attributes: string[] = ['string', 'help', 'type'],
  ): Promise<OdooFieldsMap> {
    return await this.execute(model, 'fields_get', [], { attributes });
  }
}
