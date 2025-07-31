// Error types for better categorization
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION', 
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: Error;
  context?: Record<string, any>;
  timestamp: Date;
  userId?: string;
}

// Firebase error code mapping
const FIREBASE_ERROR_MAPPING: Record<string, { type: ErrorType; message: string }> = {
  'auth/user-not-found': {
    type: ErrorType.AUTHENTICATION,
    message: 'No user found with this email address.'
  },
  'auth/wrong-password': {
    type: ErrorType.AUTHENTICATION,
    message: 'Incorrect password. Please try again.'
  },
  'auth/user-disabled': {
    type: ErrorType.AUTHORIZATION,
    message: 'This account has been disabled. Please contact support.'
  },
  'auth/too-many-requests': {
    type: ErrorType.NETWORK,
    message: 'Too many failed attempts. Please try again later.'
  },
  'auth/network-request-failed': {
    type: ErrorType.NETWORK,
    message: 'Network error. Please check your connection and try again.'
  },
  'permission-denied': {
    type: ErrorType.AUTHORIZATION,
    message: 'You do not have permission for this action.'
  },
  'not-found': {
    type: ErrorType.NOT_FOUND,
    message: 'The requested resource was not found.'
  },
  'unavailable': {
    type: ErrorType.NETWORK,
    message: 'Service is temporarily unavailable. Please try again.'
  }
};

// Error handler class
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorQueue: AppError[] = [];
  private maxErrorQueueSize = 50;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Main error handling method
  handleError(error: any, context?: Record<string, any>): AppError {
    const appError = this.createAppError(error, context);
    this.logError(appError);
    this.queueError(appError);
    return appError;
  }

  // Create standardized app error
  private createAppError(error: any, context?: Record<string, any>): AppError {
    let type = ErrorType.UNKNOWN;
    let message = 'An unexpected error occurred.';

    // Handle different error types
    if (error?.code && FIREBASE_ERROR_MAPPING[error.code]) {
      const mapping = FIREBASE_ERROR_MAPPING[error.code];
      type = mapping.type;
      message = mapping.message;
    } else if (error?.message) {
      message = error.message;
      
      // Categorize by message content
      if (error.message.includes('network') || error.message.includes('fetch')) {
        type = ErrorType.NETWORK;
      } else if (error.message.includes('unauthorized') || error.message.includes('permission')) {
        type = ErrorType.AUTHORIZATION;
      } else if (error.message.includes('not found')) {
        type = ErrorType.NOT_FOUND;
      } else if (error.message.includes('validation')) {
        type = ErrorType.VALIDATION;
      }
    }

    return {
      type,
      message,
      originalError: error instanceof Error ? error : new Error(String(error)),
      context: {
        ...context,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      userId: context?.userId
    };
  }

  // Log error with appropriate level
  private logError(appError: AppError): void {
    const logMessage = `[${appError.type}] ${appError.message}`;
    const logContext = {
      error: appError.originalError,
      context: appError.context,
      timestamp: appError.timestamp
    };

    switch (appError.type) {
      case ErrorType.NETWORK:
      case ErrorType.NOT_FOUND:
        console.warn(logMessage, logContext);
        break;
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
      case ErrorType.VALIDATION:
        console.error(logMessage, logContext);
        break;
      case ErrorType.SERVER_ERROR:
      case ErrorType.UNKNOWN:
        console.error(logMessage, logContext);
        break;
    }
  }

  // Queue errors for potential reporting
  private queueError(appError: AppError): void {
    this.errorQueue.push(appError);
    
    // Keep queue size manageable
    if (this.errorQueue.length > this.maxErrorQueueSize) {
      this.errorQueue.shift();
    }
  }

  // Get error queue (for debugging or reporting)
  getErrorQueue(): AppError[] {
    return [...this.errorQueue];
  }

  // Clear error queue
  clearErrorQueue(): void {
    this.errorQueue = [];
  }

  // Get user-friendly message for display
  getUserFriendlyMessage(appError: AppError): string {
    return appError.message;
  }

  // Check if error should be retried
  shouldRetry(appError: AppError): boolean {
    return appError.type === ErrorType.NETWORK;
  }
}

// Helper functions for common error scenarios
export const handleAsyncError = async <T>(
  operation: () => Promise<T>,
  context?: Record<string, any>
): Promise<{ data?: T; error?: AppError }> => {
  try {
    const data = await operation();
    return { data };
  } catch (error) {
    const appError = ErrorHandler.getInstance().handleError(error, context);
    return { error: appError };
  }
};

// React hook for error handling
export const useErrorHandler = () => {
  const errorHandler = ErrorHandler.getInstance();

  const handleError = (error: any, context?: Record<string, any>) => {
    return errorHandler.handleError(error, context);
  };

  const getUserFriendlyMessage = (error: AppError) => {
    return errorHandler.getUserFriendlyMessage(error);
  };

  const shouldRetry = (error: AppError) => {
    return errorHandler.shouldRetry(error);
  };

  return {
    handleError,
    getUserFriendlyMessage,
    shouldRetry
  };
};

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance(); 