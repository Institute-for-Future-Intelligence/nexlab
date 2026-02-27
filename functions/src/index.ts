import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {GoogleGenAI} from "@google/genai";

admin.initializeApp();

// Initialize Gemini AI with API key from Firebase config
const getGeminiAI = (apiKey: string) => {
  return new GoogleGenAI({apiKey});
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
 * Cloud Function: Process Course/Syllabus with Gemini 3.1
 * Keeps API key server-side for security
 */
export const processCourseWithGemini = functions
  .runWith({timeoutSeconds: 300, memory: "1GB"})
  .https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    const {
      prompt,
      thinkingLevel = "high",
      maxTokens = 16384,
    } = data;

    if (!prompt) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Prompt is required"
      );
    }

    try {
      const config = functions.config().gemini;
      const apiKey = config?.course_key || config?.api_key;
      if (!apiKey) {
        const msg = "Gemini API key not configured. " +
          "Run: firebase functions:config:set " +
          "gemini.course_key=\"YOUR_KEY\"";
        throw new functions.https.HttpsError("failed-precondition", msg);
      }

      const ai = getGeminiAI(apiKey);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const requestConfig: any = {
        temperature: 1.0,
        maxOutputTokens: maxTokens,
        thinkingLevel: thinkingLevel,
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: requestConfig,
      });

      return {
        success: true,
        text: response.text,
        usageMetadata: response.usageMetadata,
      };
    } catch (error) {
      const err = error as Error;
      console.error("Gemini API Error:", err);

      // Handle specific error types
      if (err.message?.includes("leaked")) {
        const msg = "API key has been reported as leaked. " +
          "Please update the Firebase config with a new key.";
        throw new functions.https.HttpsError("failed-precondition", msg);
      }
      if (err.message?.includes("quota") ||
          err.message?.includes("rate limit")) {
        const msg = "API rate limit exceeded. Please try again later.";
        throw new functions.https.HttpsError("resource-exhausted", msg);
      }

      const msg = `AI processing failed: ${err.message}`;
      throw new functions.https.HttpsError("internal", msg);
    }
  });

/**
 * Cloud Function: Process Material Import with Gemini 3.1
 * Separate function for material processing with dedicated API key option
 * Uses 'low' thinking level for faster processing of materials
 */
export const processMaterialWithGemini = functions
  .runWith({timeoutSeconds: 540, memory: "2GB"})
  .https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    const {
      prompt,
      thinkingLevel = "low",
      maxTokens = 16384,
      useMaterialKey = true,
      mediaResolution = "media_resolution_high",
    } = data;

    if (!prompt) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Prompt is required"
      );
    }

    try {
      const config = functions.config().gemini;
      const apiKey = useMaterialKey ?
        (config?.material_key || config?.course_key) :
        config?.course_key;

      if (!apiKey) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "Gemini API key not configured"
        );
      }

      const ai = getGeminiAI(apiKey);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const requestConfig: any = {
        temperature: 1.0,
        maxOutputTokens: maxTokens,
        thinkingLevel: thinkingLevel,
        mediaResolution: mediaResolution,
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: requestConfig,
      });

      return {
        success: true,
        text: response.text,
        usageMetadata: response.usageMetadata,
      };
    } catch (error) {
      const err = error as Error;
      console.error("Material Import AI Error:", err);

      if (err.message?.includes("leaked")) {
        const msg = "API key has been reported as leaked. " +
          "Please update the Firebase config.";
        throw new functions.https.HttpsError("failed-precondition", msg);
      }
      if (err.message?.includes("quota") ||
          err.message?.includes("rate limit")) {
        const msg = "API rate limit exceeded. Please try again later.";
        throw new functions.https.HttpsError("resource-exhausted", msg);
      }

      const msg = `Material processing failed: ${err.message}`;
      throw new functions.https.HttpsError("internal", msg);
    }
  });
