import { config } from './index.js';

export interface EmailProviderConfig {
  provider: string;
  from: string;
  smtp: {
    host: string;
    port: number;
    user: string;
    pass: string;
  };
}

export const emailConfig: EmailProviderConfig = {
  provider: config.email.provider,
  from: config.email.from,
  smtp: config.email.smtp,
};
