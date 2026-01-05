// src/types/conversationAnalysis.ts

/**
 * Type definitions for the Conversation Analysis API
 * API Endpoint: POST https://rag-flask-api.onrender.com/analyze_conversations
 */

// API Request Types
export interface ConversationAnalysisRequest {
  conversation_ids: string[];
}

// Common Types
export type BloomLevel = 
  | 'REMEMBER'
  | 'UNDERSTAND'
  | 'APPLY'
  | 'ANALYZE'
  | 'EVALUATE'
  | 'CREATE';

export type ProgressionPattern = 
  | 'staying_foundational'
  | 'building_up'
  | 'declining'
  | 'mixed';

export type EngagementLevel = 'low' | 'moderate' | 'high';

export type LearningTrajectory = 
  | 'improving'
  | 'staying_consistent'
  | 'declining'
  | 'inconsistent';

// Knowledge Building Types
export interface KnowledgeBuildingIndicator {
  detected: boolean;
  explanation: string;
}

export interface KnowledgeBuilding {
  repetitive_questions: KnowledgeBuildingIndicator;
  progressive_questioning: KnowledgeBuildingIndicator;
  concept_connections: KnowledgeBuildingIndicator;
  clarification_seeking: KnowledgeBuildingIndicator;
}

// Engagement Types
// Single Conversation Engagement (as per API docs)
export interface Engagement {
  message_count: number;
  engagement_level: EngagementLevel;
  // Additional fields that may appear in actual API responses:
  duration_formatted?: string;
}

// Multiple Conversations Engagement (as per API docs)
export interface MultipleConversationsEngagement {
  avg_questions_per_conversation: number;
  overall_engagement_level: EngagementLevel;
  // Additional fields that may appear in actual API responses:
  total_learning_time?: string;
}

// Bloom's Taxonomy Progression Types
export interface BloomsProgression {
  pattern: ProgressionPattern;
  pattern_explanation: string;
  dominant_levels: BloomLevel[];
  highest_level_reached: BloomLevel;
}

// Topic Types
export interface Topic {
  topic: string;
  depth: 'shallow' | 'moderate' | 'deep';
  question_count: number;
}

// Single Conversation Analysis Types
// As per API documentation - all fields required for successful analysis
export interface SingleConversationAnalysis {
  conversation_id: string;
  date: string;
  total_questions: number;
  engagement: Engagement;
  blooms_progression: BloomsProgression;
  knowledge_building: KnowledgeBuilding;
  topics: Topic[];
  interpretation: string;
}

// Failed individual analysis (appears in multiple conversations analysis)
export interface FailedConversationAnalysis {
  conversation_id: string;
  total_questions: number;
  error: string;
}

// Multiple Conversations Progression Analysis Types
export interface MasteryIndicator {
  detected: boolean;
  explanation: string;
}

// Topic Depth Analysis structure (discovered from actual API responses)
// API docs show this as "{ ... }" without detailed structure
export interface TopicDepthAnalysis {
  [key: string]: {
    progression: string;
    total_questions: number;
  };
}

export interface ProgressionAnalysis {
  learning_trajectory: LearningTrajectory;
  trajectory_explanation: string;
  pattern_evolution: string;
  bloom_level_progression: string;
  mastery_indicators: MasteryIndicator;
  topic_depth_analysis: TopicDepthAnalysis;
}

// Type for individual analyses - can be either successful or failed
export type IndividualAnalysis = SingleConversationAnalysis | FailedConversationAnalysis;

// Multiple Conversations Analysis (as per API docs)
export interface MultipleConversationsAnalysis {
  total_conversations: number;
  successful_analyses: number;
  failed_analyses: number;
  total_questions: number;
  individual_analyses: IndividualAnalysis[];
  engagement: MultipleConversationsEngagement;
  progression_analysis: ProgressionAnalysis;
  insights: string[];
  interpretation: string;
  // Additional fields that may appear in actual API responses:
  time_span_days?: number;
}

// API Response Types
export interface SingleConversationAnalysisResponse {
  success: true;
  analysis_type: 'single_conversation';
  analysis_results: SingleConversationAnalysis;
  analysis_timestamp: string;
}

export interface MultipleConversationsAnalysisResponse {
  success: true;
  analysis_type: 'multiple_conversations';
  analysis_results: MultipleConversationsAnalysis;
  analysis_timestamp: string;
  partial_failure: boolean;
}

export interface ConversationAnalysisErrorResponse {
  success: false;
  error: string;
}

export type ConversationAnalysisResponse =
  | SingleConversationAnalysisResponse
  | MultipleConversationsAnalysisResponse
  | ConversationAnalysisErrorResponse;

// Frontend State Types
export interface ConversationAnalysisState {
  loading: boolean;
  error: string | null;
  data: SingleConversationAnalysis | MultipleConversationsAnalysis | null;
  analysisType: 'single' | 'multiple' | null;
}

// UI Display Types
export interface AnalysisCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

export interface BloomsProgressionChartData {
  level: BloomLevel;
  count: number;
}

export interface TopicChartData {
  topic: string;
  questionCount: number;
  depth: string;
}

