import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from "./types";
import { runLocalRuleBasedAnalysis } from "./local-analyzer-fallback";

const GEMINI_KEY_STORAGE = "gemini_api_key";

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    matchScore: {
      type: Type.NUMBER,
      description: "Overall match percentage from 0 to 100.",
    },
    matchSummary: {
      type: Type.STRING,
      description: "Brief, practical summary of the candidate's fit.",
    },
    skillsFound: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Matching skills and role signals found in both CV and job description.",
    },
    missingSignals: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Important skills, keywords, or experience signals missing or weak in the CV.",
    },
    cvBulletSuggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Tailored CV bullet suggestions grounded in the candidate's real experience.",
    },
    interviewPrep: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Likely interview questions based on role fit and gaps.",
    },
    retrievedEvidence: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          source: {
            type: Type.STRING,
            enum: ["CV", "Job Description"],
          },
          text: { type: Type.STRING },
          signals: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["source", "text", "signals"],
      },
    },
    scoreBreakdown: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          score: { type: Type.NUMBER },
          detail: { type: Type.STRING },
        },
        required: ["label", "score", "detail"],
      },
    },
  },
  required: [
    "matchScore",
    "matchSummary",
    "skillsFound",
    "missingSignals",
    "cvBulletSuggestions",
    "interviewPrep",
    "retrievedEvidence",
    "scoreBreakdown",
  ],
};

function getSavedGeminiKey(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(GEMINI_KEY_STORAGE);
}

function clampScore(result: AnalysisResult): AnalysisResult {
  return {
    ...result,
    matchScore: Math.max(0, Math.min(100, Math.round(result.matchScore))),
    scoreBreakdown: result.scoreBreakdown.map((factor) => ({
      ...factor,
      score: Math.max(0, Math.min(100, Math.round(factor.score))),
    })),
  };
}

function parseGeminiResult(text: string): AnalysisResult {
  const parsed = JSON.parse(text) as AnalysisResult;

  if (
    typeof parsed.matchScore !== "number" ||
    typeof parsed.matchSummary !== "string" ||
    !Array.isArray(parsed.skillsFound) ||
    !Array.isArray(parsed.missingSignals) ||
    !Array.isArray(parsed.cvBulletSuggestions) ||
    !Array.isArray(parsed.interviewPrep) ||
    !Array.isArray(parsed.retrievedEvidence) ||
    !Array.isArray(parsed.scoreBreakdown)
  ) {
    throw new Error("Gemini response did not match the expected analysis shape.");
  }

  return clampScore(parsed);
}

/**
 * Main dashboard analysis entry point.
 *
 * If the user saves a Gemini API key in browser storage, this uses Gemini live
 * mode. Without a key, or if Gemini fails, it falls back to the local analyzer.
 */
export async function analyzeMatch(cvText: string, jobDescription: string): Promise<AnalysisResult> {
  const apiKey = getSavedGeminiKey();

  if (!apiKey) {
    return runLocalRuleBasedAnalysis(cvText, jobDescription);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `CV CONTENT:\n${cvText}\n\nTARGET JOB DESCRIPTION:\n${jobDescription}`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema,
        systemInstruction: `You are an expert technical recruiter and rigorous career coach. Compare the candidate CV against the target job description.

CRITICAL OUTPUT CONSTRAINTS:
1. RESPONSE SCHEMA: Return a single strict JSON object matching the requested schema exactly. Do not output markdown, code fences, commentary, or alternate key names.
2. STRICT RESUME GROUNDING: When generating cvBulletSuggestions, never invent metrics, growth, tools, employers, certifications, responsibilities, or experiences the user did not explicitly list. Every suggestion must be an optimized rewrite of an existing CV line or a clearly framed transferable-skill suggestion grounded in actual CV evidence.
3. EXACT EVIDENCE RETRIEVAL: For every object in retrievedEvidence, the text property must be an exact verbatim quote from either the CV or the job description. Do not paraphrase evidence snippets. The signals array must identify the specific keywords or role signals that made that quote relevant.
4. MISSING SKILLS: If the job asks for a skill absent from the CV, place it in missingSignals and explain the gap honestly. Do not hide missing skills by inventing implied experience.
5. TONE: Be honest, supportive, practical, and specific. Prioritize useful application improvements over generic encouragement.`,
      },
    });

    if (!response.text) {
      throw new Error("Gemini returned an empty response.");
    }

    return parseGeminiResult(response.text);
  } catch (error) {
    console.error("Gemini analysis failed. Falling back to local rule-based analysis.", error);
    return runLocalRuleBasedAnalysis(cvText, jobDescription);
  }
}
