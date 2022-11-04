import { config } from 'dotenv';

type EnvironmentConfig = {
  readonly ROOM_SIGNING_SECRET: string;
  readonly REDIS_SERVER_URL: string;
  readonly REDIS_PASSWORD: string;
  readonly QUESTION_SERVICE_URL: string;
  readonly HISTORY_SERVICE_URL: string;
  readonly JUDGE0_SERVER_URL: string;
  readonly GRPC_PORT: number;

  readonly GRPC_CERT?: Buffer;
  readonly GRPC_KEY?: Buffer;
};

function requireExists(key: string): void {
  if (!(key in process.env)) {
    throw new Error(`${key} does not exist in environment variables`);
  }
}

function requireString(key: string, defaultValue?: string): string {
  if (defaultValue === undefined) {
    requireExists(key);
  }

  const variable = process.env[key];
  if (!variable || variable === '') {
    if (defaultValue === undefined) {
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
    return parseInt(variable, 10);
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
    ROOM_SIGNING_SECRET: requireString('ROOM_SIGNING_SECRET'),
    REDIS_SERVER_URL: `redis://${requireString('REDIS_SERVER')}`,
    REDIS_PASSWORD: requireString('REDIS_PASSWORD', ''),
    QUESTION_SERVICE_URL: requireString('QUESTION_SERVICE_URL'),
    HISTORY_SERVICE_URL: requireString('HISTORY_SERVICE_URL'),
    JUDGE0_SERVER_URL: requireString('JUDGE0_SERVER_URL'),
    GRPC_PORT: requireInt('GRPC_PORT', 4003),
    GRPC_CERT: grpcCert.length > 0 ? Buffer.from(grpcCert) : undefined,
    GRPC_KEY: grpcKey.length > 0 ? Buffer.from(grpcKey) : undefined,
  };
}
