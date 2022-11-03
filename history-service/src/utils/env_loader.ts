import { config } from 'dotenv';

type EnvironmentConfig = {
  readonly HTTP_PORT: number;
  readonly GRPC_PORT: number;

  readonly DATABASE_DBHOST: string;
  readonly DATABASE_USERNAME: string;
  readonly DATABASE_PASSWORD: string;
  readonly DATABASE_NAME: string;

  readonly USER_SERVICE_URL: string;
  readonly QUESTION_SERVICE_URL: string;
  readonly REDIS_SERVER_URL: string;
  readonly REDIS_PASSWORD: string;
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
    DATABASE_DBHOST: requireString('DATABASE_DBHOST'),
    DATABASE_USERNAME: requireString('DATABASE_USERNAME'),
    DATABASE_PASSWORD: requireString('DATABASE_PASSWORD'),
    DATABASE_NAME: requireString('DATABASE_NAME'),

    HTTP_PORT: requireInt('SERVER_HTTP_PORT', 8085),
    GRPC_PORT: requireInt('SERVER_GRPC_PORT', 4005),
    USER_SERVICE_URL: requireString('USER_SERVICE_URL', 'localhost:4000'),
    QUESTION_SERVICE_URL: requireString('QUESTION_SERVICE_URL', 'localhost:4004'),
    REDIS_SERVER_URL: `redis://${requireString('REDIS_SERVER')}`,
    REDIS_PASSWORD: requireString('REDIS_PASSWORD', ''),
  };
}
