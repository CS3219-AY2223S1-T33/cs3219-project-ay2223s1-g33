import { config } from 'dotenv';

type EnvironmentConfig = {
  readonly SESSION_SERVICE_URL: string,
  readonly HTTP_PORT: number,
  readonly GRPC_PORT: number,
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
    SESSION_SERVICE_URL: requireString('SESSION_SERVICE_URL'),
    HTTP_PORT: requireInt('SERVER_HTTP_PORT', 8081),
    GRPC_PORT: requireInt('SERVER_GRPC_PORT', 4000),
  };
}
