export interface OdooConfig {
  url: string;
  db: string;
  username: string;
  password: string;
  options?: {
    isSecure?: boolean;
  };
}

export interface OdooVersion {
  server_version: string;
  server_version_info: [number, number, number, string, number];
  server_serie: string;
  protocol_version: number;
}

export interface OdooField {
  type: string;
  string: string;
  help?: string;
  required?: boolean;
  readonly?: boolean;
  selection?: [string, string][];
  relation?: string;
}

export interface OdooFieldsMap {
  [key: string]: OdooField;
}

export interface SearchOptions {
  offset?: number;
  limit?: number;
  order?: string;
}

export interface SearchReadOptions extends SearchOptions {
  fields?: string[];
}

export type OdooDomain = Array<[string, string, any]>;
