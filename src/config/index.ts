import dotenv from 'dotenv';

dotenv.config();

export const config = {
  github: {
    token: process.env.GITHUB_TOKEN || '',
    owner: process.env.GITHUB_OWNER || '',
    repo: process.env.GITHUB_REPO || '',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    baseURL: process.env.OPENAI_BASE_URL || undefined,
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
  },
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  analysis: {
    maxFiles: parseInt(process.env.MAX_FILES_TO_ANALYZE || '1000', 10),
    timeoutMs: parseInt(process.env.ANALYSIS_TIMEOUT_MS || '300000', 10),
  },
};

export function validateConfig(): void {
  const required = [
    { key: 'GITHUB_TOKEN', value: config.github.token },
    { key: 'OPENAI_API_KEY', value: config.openai.apiKey },
  ];

  const missing = required.filter(({ value }) => !value);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.map(({ key }) => key).join(', ')}`
    );
  }
}

// Made with Bob
