// src/services/conversationAnalysisService.ts

import {
  ConversationAnalysisRequest,
  ConversationAnalysisResponse,
  SingleConversationAnalysisResponse,
  MultipleConversationsAnalysisResponse,
  ConversationAnalysisErrorResponse,
} from '../types/conversationAnalysis';

/**
 * Service for interacting with the Conversation Analysis API
 * API Endpoint: https://rag-flask-api.onrender.com/analyze_conversations
 * 
 * Features:
 * - Single conversation analysis
 * - Multiple conversations analysis (batch)
 * - Error handling with proper typing
 * - Request validation
 */

const API_BASE_URL = 'https://rag-flask-api.onrender.com';
const ANALYZE_ENDPOINT = `${API_BASE_URL}/analyze_conversations`;

// API Limits
const MAX_CONVERSATIONS_PER_REQUEST = 50;
const MAX_MESSAGES_PER_CONVERSATION = 100;

export interface ConversationAnalysisServiceInterface {
  analyzeSingleConversation(conversationId: string): Promise<SingleConversationAnalysisResponse>;
  analyzeMultipleConversations(conversationIds: string[]): Promise<MultipleConversationsAnalysisResponse>;
  analyzeConversations(conversationIds: string[]): Promise<ConversationAnalysisResponse>;
}

class ConversationAnalysisService implements ConversationAnalysisServiceInterface {
  /**
   * Validate conversation IDs before making API request
   */
  private validateConversationIds(conversationIds: string[]): void {
    if (!conversationIds || conversationIds.length === 0) {
      throw new Error('At least one conversation ID is required');
    }

    if (conversationIds.length > MAX_CONVERSATIONS_PER_REQUEST) {
      throw new Error(
        `Maximum ${MAX_CONVERSATIONS_PER_REQUEST} conversations allowed per request. ` +
        `You provided ${conversationIds.length}.`
      );
    }

    // Check for invalid IDs
    const invalidIds = conversationIds.filter(id => !id || typeof id !== 'string' || id.trim() === '');
    if (invalidIds.length > 0) {
      throw new Error('All conversation IDs must be non-empty strings');
    }
  }

  /**
   * Make API request to analyze conversations
   */
  private async makeAnalysisRequest(
    conversationIds: string[]
  ): Promise<ConversationAnalysisResponse> {
    this.validateConversationIds(conversationIds);

    const requestBody: ConversationAnalysisRequest = {
      conversation_ids: conversationIds,
    };

    try {
      const response = await fetch(ANALYZE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // Handle non-200 responses
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage: string;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || 'Unknown error occurred';
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }

        const errorResponse: ConversationAnalysisErrorResponse = {
          success: false,
          error: errorMessage,
        };
        return errorResponse;
      }

      const data = await response.json();

      // Debug: Log the API response
      console.log('🔍 Conversation Analysis API Response:', {
        success: data.success,
        analysis_type: data.analysis_type,
        has_analysis_results: !!data.analysis_results,
        full_response: data,
      });

      // Validate response structure
      if (typeof data.success !== 'boolean') {
        console.error('❌ Invalid API response - missing success field:', data);
        throw new Error('Invalid response format: missing success field');
      }

      if (!data.success) {
        console.error('❌ API returned error:', data);
        const errorResponse = data as ConversationAnalysisErrorResponse;
        throw new Error(errorResponse.error || 'Unknown API error');
      }

      return data as ConversationAnalysisResponse;
    } catch (error) {
      // Handle network errors, parse errors, etc.
      if (error instanceof Error) {
        const errorResponse: ConversationAnalysisErrorResponse = {
          success: false,
          error: `Network error: ${error.message}`,
        };
        return errorResponse;
      }

      const errorResponse: ConversationAnalysisErrorResponse = {
        success: false,
        error: 'An unexpected error occurred while analyzing conversations',
      };
      return errorResponse;
    }
  }

  /**
   * Analyze a single conversation
   * @param conversationId - The ID of the conversation to analyze
   * @returns Promise with single conversation analysis results
   */
  async analyzeSingleConversation(
    conversationId: string
  ): Promise<SingleConversationAnalysisResponse> {
    const response = await this.makeAnalysisRequest([conversationId]);

    if (!response.success) {
      // Type guard to check if it's an error response
      const errorResponse = response as ConversationAnalysisErrorResponse;
      throw new Error(errorResponse.error);
    }

    if (response.analysis_type !== 'single_conversation') {
      throw new Error('Expected single conversation analysis but received different type');
    }

    return response as SingleConversationAnalysisResponse;
  }

  /**
   * Analyze multiple conversations (batch analysis)
   * @param conversationIds - Array of conversation IDs to analyze
   * @returns Promise with multiple conversations analysis results
   */
  async analyzeMultipleConversations(
    conversationIds: string[]
  ): Promise<MultipleConversationsAnalysisResponse> {
    if (conversationIds.length === 1) {
      // If only one conversation, still return it in the multiple format
      // The API will handle this appropriately
    }

    const response = await this.makeAnalysisRequest(conversationIds);

    if (!response.success) {
      // Type guard to check if it's an error response
      const errorResponse = response as ConversationAnalysisErrorResponse;
      throw new Error(errorResponse.error);
    }

    // Handle single conversation wrapped in multiple format
    if (response.analysis_type === 'single_conversation') {
      // This shouldn't happen normally, but we'll handle it gracefully
      throw new Error('Expected multiple conversations analysis but received single conversation type');
    }

    return response as MultipleConversationsAnalysisResponse;
  }

  /**
   * Generic method to analyze conversations (automatically handles single vs multiple)
   * @param conversationIds - Array of conversation IDs to analyze
   * @returns Promise with analysis results (type depends on number of conversations)
   */
  async analyzeConversations(
    conversationIds: string[]
  ): Promise<ConversationAnalysisResponse> {
    return this.makeAnalysisRequest(conversationIds);
  }

  /**
   * Get the maximum number of conversations allowed per request
   */
  getMaxConversationsPerRequest(): number {
    return MAX_CONVERSATIONS_PER_REQUEST;
  }

  /**
   * Get the maximum number of messages allowed per conversation
   */
  getMaxMessagesPerConversation(): number {
    return MAX_MESSAGES_PER_CONVERSATION;
  }
}

// Export singleton instance
export const conversationAnalysisService = new ConversationAnalysisService();

// Export class for testing purposes
export { ConversationAnalysisService };

