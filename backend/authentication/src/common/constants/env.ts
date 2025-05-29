const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;

  if (value == undefined ){
    throw new Error (`Missing environment variable ${key}`);
  }

  return value;
}

export const MONGO_URI = getEnv("MONGO_URI");
export const BASE_PATH = getEnv("BASE_PATH", "/api/v1");
export const PORT = getEnv("PORT", "5000");
export const NODE_ENV = getEnv("NODE_ENV", "development");
export const APP_ORIGIN = getEnv("APP_ORIGIN");
export const JWT_SECRET = getEnv("JWT_SECRET");
export const JWT_EXPIRES_IN= getEnv("JWT_EXPIRES_IN", "15m");
export const JWT_REFRESH_SECRET = getEnv("JWT_REFRESH_SECRET");
export const JWT_REFRESH_EXPIRES_IN= getEnv("JWT_REFRESH_EXPIRES_IN","30d");
export const RESEND_API_KEY = getEnv("RESEND_API_KEY");
export const MAILER_SENDER = getEnv("MAILER_SENDER");