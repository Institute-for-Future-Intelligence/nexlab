// src/services/geminiProxyService.ts
// Proxy service that calls Firebase Functions instead of Gemini directly
// This keeps API keys server-side and secure

import {httpsCallable} from "firebase/functions";
import {functions} from "../config/firestore";

interface GeminiRequest {
  prompt: string;
  thinkingLevel?: "low" | "high";
  maxTokens?: number;
  useMaterialKey?: boolean;
  mediaResolution?: string;
}

interface GeminiResponse {
  success: boolean;
  text: string;
  usageMetadata?: any;
}

/**
 * Call Gemini 3.1 for course/syllabus processing via Firebase Function
 * API key is kept server-side for security
 */
export const callGeminiForCourse = async (
  prompt: string,
  options?: {thinkingLevel?: "low" | "high"; maxTokens?: number}
): Promise<string> => {
  const processCourseWithGemini = httpsCallable<GeminiRequest, GeminiResponse>(
    functions,
    "processCourseWithGemini"
  );

  try {
    const result = await processCourseWithGemini({
      prompt,
      thinkingLevel: options?.thinkingLevel || "high",
      maxTokens: options?.maxTokens || 16384,
    });

    if (!result.data.success) {
      throw new Error("Gemini processing failed");
    }

    return result.data.text;
  } catch (error: any) {
    console.error("Gemini proxy error:", error);

    // Handle Firebase Function errors
    if (error.code === "unauthenticated") {
      throw new Error("You must be signed in to use AI features");
    }
    if (error.code === "resource-exhausted") {
      throw new Error(
        "API rate limit exceeded. Please try again in a few minutes."
      );
    }
    if (error.code === "failed-precondition") {
      throw new Error(error.message || "API key configuration error");
    }

    throw new Error(`AI processing failed: ${error.message}`);
  }
};

/**
 * Call Gemini 3.1 for material import via Firebase Function
 * Uses 'low' thinking level for faster processing
 */
export const callGeminiForMaterial = async (
  prompt: string,
  options?: {
    thinkingLevel?: "low" | "high";
    maxTokens?: number;
    mediaResolution?: string;
  }
): Promise<string> => {
  const processMaterialWithGemini = httpsCallable<
    GeminiRequest,
    GeminiResponse
  >(functions, "processMaterialWithGemini");

  try {
    const result = await processMaterialWithGemini({
      prompt,
      thinkingLevel: options?.thinkingLevel || "low",
      maxTokens: options?.maxTokens || 16384,
      useMaterialKey: true,
      mediaResolution: options?.mediaResolution || "media_resolution_high",
    });

    if (!result.data.success) {
      throw new Error("Material processing failed");
    }

    return result.data.text;
  } catch (error: any) {
    console.error("Material proxy error:", error);

    if (error.code === "unauthenticated") {
      throw new Error("You must be signed in to use AI features");
    }
    if (error.code === "resource-exhausted") {
      throw new Error(
        "API rate limit exceeded. Please try again in a few minutes."
      );
    }
    if (error.code === "failed-precondition") {
      throw new Error(error.message || "API key configuration error");
    }

    throw new Error(`Material processing failed: ${error.message}`);
  }
};

