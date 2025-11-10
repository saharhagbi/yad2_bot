/**
 * Environment configuration types
 */
export interface EnvironmentConfig {
  TELEGRAM_BOT_TOKEN: string;
  MONGO_URI: string;
  API_URL?: string;
  PROXY_URL?: string;
  USER_DATA: string;
  URLS: string;
}

/**
 * Application configuration type
 */
export interface AppConfig {
  bot: {
    token: string;
    polling: boolean;
  };
  database: {
    uri: string;
  };
  api: {
    url: string;
    proxyUrl?: string;
  };
  user: {
    id: number;
    first_name?: string;
    last_name?: string;
  };
  urls: string[];
}