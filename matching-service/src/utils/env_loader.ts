import { config } from 'dotenv';

type EnvironmentConfig = {
  readonly ROOM_SIGNING_SECRET: string;
  readonly REDIS_SERVER_URL: string;
  readonly REDIS_PASSWORD: string;

  readonly HTTP_PORT: number;
  readonly GRPC_PORT: number;
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

  return {
    ROOM_SIGNING_SECRET: requireString('ROOM_SIGNING_SECRET'),
    REDIS_SERVER_URL: `redis://${requireString('REDIS_SERVER')}`,
    REDIS_PASSWORD: requireString('REDIS_PASSWORD', ''),
    HTTP_PORT: requireInt('SERVER_HTTP_PORT', 8082),
    GRPC_PORT: requireInt('SERVER_GRPC_PORT', 4001),
  };
}
