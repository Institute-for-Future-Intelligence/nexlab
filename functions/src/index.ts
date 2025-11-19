import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { GoogleGenAI } from "@google/genai";

admin.initializeApp();

// Initialize Gemini AI with API key from Firebase config
const getGeminiAI = (apiKey: string) => {
  return new GoogleGenAI({ apiKey });
};

export const publishScheduledMaterials = functions.pubsub
  .schedule("every 1 minutes")
  .onRun(async () => {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();

    try {
      const snapshot = await db.collection("materials")
        .where("scheduledTimestamp", "<=", now)
        .where("published", "==", false)
        .get();

      const batch = db.batch();
      snapshot.forEach((doc) => {
        batch.update(doc.ref, {
          published: true,
          scheduledTimestamp: null,
        });
      });

      await batch.commit();
      console.log("Scheduled materials published successfully.");
    } catch (error) {
      console.error("Error publishing scheduled materials:", error);
    }

    return null;
  });

/**
 * Cloud Function: Process Course/Syllabus with Gemini 3
 * Keeps API key server-side for security
 */
export const processCourseWithGemini = functions
  .runWith({ timeoutSeconds: 300, memory: "1GB" })
  .https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { 
      prompt, 
      thinkingLevel = 'high', // 'low' | 'high' - Gemini 3 defaults to high
      maxTokens = 16384 
    } = data;

    if (!prompt) {
      throw new functions.https.HttpsError('invalid-argument', 'Prompt is required');
    }

    try {
      const apiKey = functions.config().gemini?.course_key || functions.config().gemini?.api_key;
      if (!apiKey) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Gemini API key not configured. Run: firebase functions:config:set gemini.course_key="YOUR_KEY"'
        );
      }

      const ai = getGeminiAI(apiKey);
      
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
          // Temperature should be 1.0 for Gemini 3 (do not change!)
          temperature: 1.0,
          maxOutputTokens: maxTokens,
          // @ts-ignore - thinkingLevel is a new Gemini 3 feature, types not updated yet
          thinkingLevel: thinkingLevel,
        },
      });

      return {
        success: true,
        text: response.text,
        usageMetadata: response.usageMetadata,
      };
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      
      // Handle specific error types
      if (error.message?.includes('leaked')) {
        throw new functions.https.HttpsError('failed-precondition', 'API key has been reported as leaked. Please update the Firebase config with a new key.');
      }
      if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
        throw new functions.https.HttpsError('resource-exhausted', 'API rate limit exceeded. Please try again later.');
      }
      
      throw new functions.https.HttpsError('internal', `AI processing failed: ${error.message}`);
    }
  });

/**
 * Cloud Function: Process Material Import with Gemini 3
 * Separate function for material processing with dedicated API key option
 * Uses 'low' thinking level for faster processing of materials
 */
export const processMaterialWithGemini = functions
  .runWith({ timeoutSeconds: 540, memory: "2GB" }) // Longer timeout for large files
  .https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { 
      prompt, 
      thinkingLevel = 'low', // Use 'low' for faster material processing
      maxTokens = 16384, 
      useMaterialKey = true,
      mediaResolution = 'media_resolution_high', // For PDFs and images
    } = data;

    if (!prompt) {
      throw new functions.https.HttpsError('invalid-argument', 'Prompt is required');
    }

    try {
      // Try material-specific key first, fall back to course key
      const apiKey = useMaterialKey 
        ? (functions.config().gemini?.material_key || functions.config().gemini?.course_key)
        : functions.config().gemini?.course_key;

      if (!apiKey) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Gemini API key not configured'
        );
      }

      const ai = getGeminiAI(apiKey);
      
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
          // Temperature should be 1.0 for Gemini 3 (do not change!)
          temperature: 1.0,
          maxOutputTokens: maxTokens,
          // @ts-ignore - thinkingLevel is a new Gemini 3 feature, types not updated yet
          thinkingLevel: thinkingLevel,
          // @ts-ignore - mediaResolution is a new Gemini 3 feature, types not updated yet
          mediaResolution: mediaResolution,
        },
      });

      return {
        success: true,
        text: response.text,
        usageMetadata: response.usageMetadata,
      };
    } catch (error: any) {
      console.error('Material Import AI Error:', error);
      
      if (error.message?.includes('leaked')) {
        throw new functions.https.HttpsError('failed-precondition', 'API key has been reported as leaked. Please update the Firebase config.');
      }
      if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
        throw new functions.https.HttpsError('resource-exhausted', 'API rate limit exceeded. Please try again later.');
      }
      
      throw new functions.https.HttpsError('internal', `Material processing failed: ${error.message}`);
    }
  });
