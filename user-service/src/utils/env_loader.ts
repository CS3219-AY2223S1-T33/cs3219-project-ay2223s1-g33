import { config } from 'dotenv';

type EnvironmentConfig = {
  readonly SESSION_SERVICE_URL: string;
  readonly REDIS_SERVER_URL: string;
  readonly REDIS_PASSWORD: string;
  readonly HTTP_PORT: number;
  readonly GRPC_PORT: number;

  readonly DATABASE_DBHOST: string;
  readonly DATABASE_USERNAME: string;
  readonly DATABASE_PASSWORD: string;
  readonly DATABASE_NAME: string;

  readonly EMAIL_SERVICE: string;
  readonly EMAIL_SERVER: string;
  readonly EMAIL_PORT: number;
  readonly EMAIL_IS_SECURE: boolean;
  readonly EMAIL_USERNAME: string;
  readonly EMAIL_PASSWORD: string;
  readonly EMAIL_SENDER: string;

  readonly RESET_PASSWORD_URL: string;

  readonly GRPC_CERT?: Buffer;
  readonly GRPC_KEY?: Buffer;
};

function requireExists(key: string): void {
  if (!(key in process.env)) {
    throw new Error(`${key} does not exist in environment variables`);
  }
}

function requireString(key: string, defaultValue?: string): string {
  if (!defaultValue) {
    requireExists(key);
  }

  const variable = process.env[key];
  if (!variable || variable === '') {
    if (!defaultValue) {
      throw new Error(`${key} is not a string in environment variables`);
    }
    return defaultValue;
  }

  return variable;
}

function requireInt(key: string, defaultValue?: number): number {
  if (!defaultValue) {
    requireExists(key);
  }

  const variable = process.env[key];
  if (!variable || variable === '') {
    if (!defaultValue) {
      throw new Error(`${key} is not an integer in environment variables`);
    }
    return defaultValue;
  }

  try {
    const value = parseInt(variable, 10);
    return value;
  } catch {
    if (!defaultValue) {
      throw new Error(`${key} is not an integer in environment variables`);
    }
    return defaultValue;
  }
}

export default function loadEnvironment(): EnvironmentConfig {
  config();

  const grpcCert = requireString('GRPC_CERT', '');
  const grpcKey = requireString('GRPC_KEY', '');

  return {
    SESSION_SERVICE_URL: requireString('SESSION_SERVICE_URL'),
    REDIS_SERVER_URL: `redis://${requireString('REDIS_SERVER')}`,
    REDIS_PASSWORD: requireString('REDIS_PASSWORD', ''),
    HTTP_PORT: requireInt('SERVER_HTTP_PORT', 8081),
    GRPC_PORT: requireInt('SERVER_GRPC_PORT', 4000),

    DATABASE_DBHOST: requireString('DATABASE_DBHOST'),
    DATABASE_USERNAME: requireString('DATABASE_USERNAME'),
    DATABASE_PASSWORD: requireString('DATABASE_PASSWORD'),
    DATABASE_NAME: requireString('DATABASE_NAME'),

    EMAIL_SERVICE: requireString('EMAIL_SERVICE', ''),
    EMAIL_SERVER: requireString('EMAIL_SERVER'),
    EMAIL_PORT: requireInt('EMAIL_PORT'),
    EMAIL_IS_SECURE: requireString('EMAIL_IS_SECURE', 'false').toLowerCase() === 'true',

    EMAIL_USERNAME: requireString('EMAIL_USERNAME'),
    EMAIL_PASSWORD: requireString('EMAIL_PASSWORD'),
    EMAIL_SENDER: requireString('EMAIL_SENDER'),

    RESET_PASSWORD_URL: requireString('RESET_PASSWORD_URL'),

    GRPC_CERT: grpcCert.length > 0 ? Buffer.from(grpcCert.replaceAll('\\n', '\n')) : undefined,
    GRPC_KEY: grpcKey.length > 0 ? Buffer.from(grpcKey.replaceAll('\\n', '\n')) : undefined,
  };
}
