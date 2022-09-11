import { config } from 'dotenv';

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
    return parseInt(variable, 10);
  } catch {
    if (!defaultValue) {
      throw new Error(`${key} is not an integer in environment variables`);
    }
    return defaultValue;
  }
}

export default function loadEnvironment(): {
  GRPC_PORT: number;
  JWT_ROOM_SECRET: string;
  REDIS_SERVER_URL: string;
  JWT_SIGNING_SECRET: string;
  HTTP_PORT: number } {
  config();

  return {
    JWT_SIGNING_SECRET: requireString('JWT_SIGNING_SECRET'),
    JWT_ROOM_SECRET: requireString('JWT_ROOM_SECRET'),
    REDIS_SERVER_URL: requireString('REDIS_SERVER_URL'),
    HTTP_PORT: requireInt('SERVER_HTTP_PORT', 8083),
    GRPC_PORT: requireInt('SERVER_GRPC_PORT', 4000),
  };
}
