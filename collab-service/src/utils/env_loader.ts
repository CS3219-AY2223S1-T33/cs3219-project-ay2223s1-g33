import { config } from 'dotenv';

type EnvironmentConfig = {
  readonly JWT_ROOM_SECRET: string;
  readonly REDIS_SERVER_URL: string;
  readonly QUESTION_SERVER_URL: string;
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

  return {
    JWT_ROOM_SECRET: requireString('JWT_ROOM_SECRET'),
    REDIS_SERVER_URL: requireString('REDIS_SERVER_URL'),
    QUESTION_SERVER_URL: requireString('QUESTION_SERVER_URL'),
    GRPC_PORT: requireInt('GRPC_PORT', 4003),
  };
}
