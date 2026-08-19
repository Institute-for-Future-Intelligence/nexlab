import {onCall, HttpsError} from "firebase-functions/v2/https";
import {onSchedule} from "firebase-functions/v2/scheduler";
import {defineSecret} from "firebase-functions/params";
import {initializeApp} from "firebase-admin/app";
import {getFirestore, Timestamp} from "firebase-admin/firestore";
import {GoogleGenAI} from "@google/genai";

initializeApp();

// Gemini API keys live in Cloud Secret Manager and are bound to each
// function via the `secrets` option below. Manage them with:
//   firebase functions:secrets:set GEMINI_COURSE_KEY
//   firebase functions:secrets:set GEMINI_MATERIAL_KEY
const geminiCourseKey = defineSecret("GEMINI_COURSE_KEY");
const geminiMaterialKey = defineSecret("GEMINI_MATERIAL_KEY");

const getGeminiAI = (apiKey: string) => {
  return new GoogleGenAI({apiKey});
};

export const publishScheduledMaterials = onSchedule(
  "every 1 minutes",
  async () => {
    const db = getFirestore();
    const now = Timestamp.now();

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
  }
);

/**
 * Cloud Function: Process Course/Syllabus with Gemini 3.1
 * Keeps API key server-side for security
 */
export const processCourseWithGemini = onCall(
  {
    timeoutSeconds: 300,
    memory: "1GiB",
    secrets: [geminiCourseKey],
  },
  async (request) => {
    // Verify authentication
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    const {
      prompt,
      thinkingLevel = "high",
      maxTokens = 16384,
    } = request.data;

    if (!prompt) {
      throw new HttpsError(
        "invalid-argument",
        "Prompt is required"
      );
    }

    try {
      const apiKey = geminiCourseKey.value();
      if (!apiKey) {
        const msg = "Gemini API key not configured. " +
          "Run: firebase functions:secrets:set GEMINI_COURSE_KEY";
        throw new HttpsError("failed-precondition", msg);
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
      if (error instanceof HttpsError) {
        throw error;
      }
      const err = error as Error;
      console.error("Gemini API Error:", err);

      // Handle specific error types
      if (err.message?.includes("leaked")) {
        const msg = "API key has been reported as leaked. " +
          "Please rotate the GEMINI_COURSE_KEY secret.";
        throw new HttpsError("failed-precondition", msg);
      }
      if (err.message?.includes("quota") ||
          err.message?.includes("rate limit")) {
        const msg = "API rate limit exceeded. Please try again later.";
        throw new HttpsError("resource-exhausted", msg);
      }

      const msg = `AI processing failed: ${err.message}`;
      throw new HttpsError("internal", msg);
    }
  }
);

/**
 * Cloud Function: Process Material Import with Gemini 3.1
 * Separate function for material processing with dedicated API key option
 * Uses 'low' thinking level for faster processing of materials
 */
export const processMaterialWithGemini = onCall(
  {
    timeoutSeconds: 540,
    memory: "2GiB",
    secrets: [geminiCourseKey, geminiMaterialKey],
  },
  async (request) => {
    // Verify authentication
    if (!request.auth) {
      throw new HttpsError(
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
    } = request.data;

    if (!prompt) {
      throw new HttpsError(
        "invalid-argument",
        "Prompt is required"
      );
    }

    try {
      const apiKey = useMaterialKey ?
        (geminiMaterialKey.value() || geminiCourseKey.value()) :
        geminiCourseKey.value();

      if (!apiKey) {
        throw new HttpsError(
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
      if (error instanceof HttpsError) {
        throw error;
      }
      const err = error as Error;
      console.error("Material Import AI Error:", err);

      if (err.message?.includes("leaked")) {
        const msg = "API key has been reported as leaked. " +
          "Please rotate the GEMINI_MATERIAL_KEY secret.";
        throw new HttpsError("failed-precondition", msg);
      }
      if (err.message?.includes("quota") ||
          err.message?.includes("rate limit")) {
        const msg = "API rate limit exceeded. Please try again later.";
        throw new HttpsError("resource-exhausted", msg);
      }

      const msg = `Material processing failed: ${err.message}`;
      throw new HttpsError("internal", msg);
    }
  }
);
