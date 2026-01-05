// src/hooks/useConversationAnalysis.tsx

import { useState, useCallback } from 'react';
import { conversationAnalysisService } from '../services/conversationAnalysisService';
import {
  SingleConversationAnalysis,
  MultipleConversationsAnalysis,
  ConversationAnalysisResponse,
} from '../types/conversationAnalysis';

export interface UseConversationAnalysisResult {
  // State
  loading: boolean;
  error: string | null;
  data: SingleConversationAnalysis | MultipleConversationsAnalysis | null;
  analysisType: 'single' | 'multiple' | null;
  
  // Actions
  analyzeSingle: (conversationId: string) => Promise<void>;
  analyzeMultiple: (conversationIds: string[]) => Promise<void>;
  analyze: (conversationIds: string[]) => Promise<void>;
  reset: () => void;
  
  // Utilities
  isSuccess: boolean;
  isSingleAnalysis: boolean;
  isMultipleAnalysis: boolean;
}

/**
 * Custom hook for managing conversation analysis state and operations
 * 
 * Features:
 * - Loading and error states
 * - Single conversation analysis
 * - Multiple conversations analysis (batch)
 * - Type-safe results
 * - Reset functionality
 * 
 * @example
 * ```tsx
 * const {
 *   loading,
 *   error,
 *   data,
 *   analyzeSingle,
 *   analyzeMultiple,
 *   reset
 * } = useConversationAnalysis();
 * 
 * // Analyze single conversation
 * await analyzeSingle('conv_123');
 * 
 * // Analyze multiple conversations
 * await analyzeMultiple(['conv_123', 'conv_456']);
 * ```
 */
export const useConversationAnalysis = (): UseConversationAnalysisResult => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SingleConversationAnalysis | MultipleConversationsAnalysis | null>(null);
  const [analysisType, setAnalysisType] = useState<'single' | 'multiple' | null>(null);

  /**
   * Process API response and update state
   */
  const processResponse = useCallback((response: ConversationAnalysisResponse) => {
    if (!response.success) {
      // Type guard to check if it's an error response
      const errorResponse = response as { success: false; error: string };
      throw new Error(errorResponse.error);
    }

    if (response.analysis_type === 'single_conversation') {
      setAnalysisType('single');
      setData(response.analysis_results);
    } else if (response.analysis_type === 'multiple_conversations') {
      setAnalysisType('multiple');
      setData(response.analysis_results);
    } else {
      throw new Error('Unknown analysis type received from API');
    }
  }, []);

  /**
   * Analyze a single conversation
   */
  const analyzeSingle = useCallback(async (conversationId: string) => {
    setLoading(true);
    setError(null);
    setData(null);
    setAnalysisType(null);

    try {
      const response = await conversationAnalysisService.analyzeSingleConversation(conversationId);
      processResponse(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze conversation';
      setError(errorMessage);
      console.error('Error analyzing single conversation:', err);
    } finally {
      setLoading(false);
    }
  }, [processResponse]);

  /**
   * Analyze multiple conversations (batch)
   */
  const analyzeMultiple = useCallback(async (conversationIds: string[]) => {
    setLoading(true);
    setError(null);
    setData(null);
    setAnalysisType(null);

    try {
      const response = await conversationAnalysisService.analyzeMultipleConversations(conversationIds);
      processResponse(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze conversations';
      setError(errorMessage);
      console.error('Error analyzing multiple conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [processResponse]);

  /**
   * Generic analyze method that automatically determines single vs multiple
   */
  const analyze = useCallback(async (conversationIds: string[]) => {
    setLoading(true);
    setError(null);
    setData(null);
    setAnalysisType(null);

    try {
      const response = await conversationAnalysisService.analyzeConversations(conversationIds);
      processResponse(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze conversations';
      setError(errorMessage);
      console.error('Error analyzing conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [processResponse]);

  /**
   * Reset all state to initial values
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
    setAnalysisType(null);
  }, []);

  // Computed properties
  const isSuccess = data !== null && error === null;
  const isSingleAnalysis = analysisType === 'single';
  const isMultipleAnalysis = analysisType === 'multiple';

  return {
    // State
    loading,
    error,
    data,
    analysisType,
    
    // Actions
    analyzeSingle,
    analyzeMultiple,
    analyze,
    reset,
    
    // Utilities
    isSuccess,
    isSingleAnalysis,
    isMultipleAnalysis,
  };
};

