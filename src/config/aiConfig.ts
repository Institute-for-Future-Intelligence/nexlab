// src/config/aiConfig.ts
// NOTE: API keys are now handled securely by Firebase Functions (no client-side keys)

export interface AIConfig {
  enableAIProcessing: boolean;
  maxRetries: number;
  timeout: number;
  fallbackToPatternParsing: boolean;
}

export const defaultAIConfig: AIConfig = {
  enableAIProcessing: true,
  maxRetries: 3,
  timeout: 30000, // 30 seconds
  fallbackToPatternParsing: true
};

// Environment variable names
export const AI_CONFIG_KEYS = {
  ENABLE_AI_PROCESSING: 'VITE_ENABLE_AI_PROCESSING',
  MAX_RETRIES: 'VITE_AI_MAX_RETRIES',
  TIMEOUT: 'VITE_AI_TIMEOUT',
  FALLBACK_TO_PATTERN: 'VITE_AI_FALLBACK_TO_PATTERN'
} as const;

/**
 * Load AI configuration from environment variables with fallbacks
 */
export const loadAIConfig = (): AIConfig => {
  return {
    enableAIProcessing: import.meta.env[AI_CONFIG_KEYS.ENABLE_AI_PROCESSING] !== 'false',
    maxRetries: parseInt(import.meta.env[AI_CONFIG_KEYS.MAX_RETRIES] || '3', 10),
    timeout: parseInt(import.meta.env[AI_CONFIG_KEYS.TIMEOUT] || '30000', 10),
    fallbackToPatternParsing: import.meta.env[AI_CONFIG_KEYS.FALLBACK_TO_PATTERN] !== 'false'
  };
};

/**
 * Validate AI configuration
 */
export const validateAIConfig = (config: AIConfig): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // API keys are now handled securely by Firebase Functions - no client-side validation needed
  
  if (config.maxRetries < 0 || config.maxRetries > 10) {
    errors.push('Max retries must be between 0 and 10');
  }
  
  if (config.timeout < 1000 || config.timeout > 120000) {
    errors.push('Timeout must be between 1 second and 2 minutes');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get runtime AI configuration with validation
 */
export const getAIConfig = (): { config: AIConfig; isValid: boolean; errors: string[] } => {
  const config = loadAIConfig();
  const validation = validateAIConfig(config);
  
  return {
    config,
    ...validation
  };
};
