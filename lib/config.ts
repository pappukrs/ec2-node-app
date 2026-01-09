// Environment configuration
// This automatically reads from environment variables
// Set NODE_ENV and NEXT_PUBLIC_API_BASE_URL to switch between dev/prod

const getEnv = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isDev = nodeEnv === 'development';
  const isProd = nodeEnv === 'production';

  // Determine API URL based on environment
  const defaultApiUrl = isDev 
    ? 'http://localhost:3001/api'
    : 'https://api.yourdomain.com/api'; // Update this for production

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || defaultApiUrl;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (isDev ? 'http://localhost:3000' : 'https://yourdomain.com');

  return {
    env: nodeEnv,
    isDev,
    isProd,
    apiBaseUrl,
    appUrl,
  };
};

const env = getEnv();

export const config = {
  // Environment
  env: env.env,
  isDev: env.isDev,
  isProd: env.isProd,

  // API Configuration
  api: {
    baseUrl: env.apiBaseUrl,
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'),
  },

  // Application Configuration
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'FullStack App',
    url: env.appUrl,
  },

  // Authentication Configuration
  auth: {
    tokenRefreshThreshold: parseInt(process.env.NEXT_PUBLIC_TOKEN_REFRESH_THRESHOLD || '300000'), // 5 minutes
    maxRetryAttempts: parseInt(process.env.NEXT_PUBLIC_MAX_RETRY_ATTEMPTS || '3'),
  },

  // Cookie Configuration
  cookies: {
    accessToken: 'access_token',
    refreshToken: 'refresh_token',
    user: 'user_data',
  },

  // Feature Flags
  features: {
    enableUserSearch: true,
    enableProfileUpdate: true,
    enablePasswordChange: true,
    enableAccountDeletion: true,
  },
} as const;

// Log current environment (only in development)
if (typeof window === 'undefined' && env.isDev) {
  console.log('🔧 Environment Configuration:');
  console.log(`   Mode: ${env.env}`);
  console.log(`   API URL: ${env.apiBaseUrl}`);
  console.log(`   App URL: ${env.appUrl}`);
}

// Log on client side for debugging
if (typeof window !== 'undefined') {
  console.log('🌐 Client-side API Configuration:');
  console.log(`   API Base URL: ${config.api.baseUrl}`);
  console.log(`   Environment: ${config.env}`);
}

// Type exports for TypeScript
export type Config = typeof config;
