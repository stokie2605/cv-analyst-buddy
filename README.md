# AI Job Application Assistant

A focused dashboard app that compares a CV against a job description and returns structured, evidence-backed application feedback.

Live Lovable preview: <https://cv-analyst-buddy.lovable.app>

## What It Does

Users paste a CV and a job description, then click **Analyse match**. The app returns:

- match score
- match summary
- skills and signals found
- missing or weak signals
- suggested CV bullets
- interview prep questions
- retrieved evidence snippets
- score breakdown

The first screen is the tool itself. There is no marketing landing page and no manual scoring sliders.

## Current Architecture

The dashboard calls a single async analysis function:

```ts
analyzeMatch(cvText, jobDescription): Promise<AnalysisResult>
```

That abstraction allows the app to switch analysis engines without changing the UI.

Current modes:

- **Local Engine Baseline:** rule-based analysis using keyword extraction, evidence retrieval, and weighted scoring.
- **Live Gemini AI:** optional BYOK mode. If a user saves a Gemini API key in browser storage, the app calls Gemini 2.5 Flash and requests strict JSON output.

If Gemini fails or no key exists, the app falls back to the local engine.

## Key Files

```text
src/routes/index.tsx
src/components/job-assistant/InputPanel.tsx
src/components/job-assistant/ResultsPanel.tsx
src/components/job-assistant/ScoreCard.tsx
src/components/job-assistant/SkillsCard.tsx
src/components/job-assistant/ScoreBreakdown.tsx
src/components/job-assistant/BulletSuggestions.tsx
src/components/job-assistant/InterviewPrep.tsx
src/components/job-assistant/EvidenceList.tsx
src/components/job-assistant/GeminiSettings.tsx
src/lib/job-assistant/analyzer.ts
src/lib/job-assistant/local-analyzer-fallback.ts
src/lib/job-assistant/types.ts
src/lib/job-assistant/sample-data.ts
src/lib/job-assistant/skills-dictionary.ts
```

## Result Shape

```ts
interface AnalysisResult {
  matchScore: number;
  matchSummary: string;
  skillsFound: string[];
  missingSignals: string[];
  cvBulletSuggestions: string[];
  interviewPrep: string[];
  retrievedEvidence: {
    source: "CV" | "Job Description";
    text: string;
    signals: string[];
  }[];
  scoreBreakdown: {
    label: string;
    score: number;
    detail: string;
  }[];
}
```

## Run Locally

```powershell
npm install
npm run dev
```

The local preview currently runs at:

```text
http://127.0.0.1:8080
```

Build check:

```powershell
npm run build
```

## Gemini BYOK Mode

Open **Settings** in the app header and paste a Gemini API key. The key is stored in browser `localStorage` under:

```text
gemini_api_key
```

This is useful for demos and personal testing. For production, Gemini calls should move to a backend or serverless function so API keys are not exposed in the browser.

## Recent Local Improvements

- Added optional Gemini BYOK analysis mode.
- Preserved the original rule-based analyzer as a safe fallback.
- Added a mode badge for Local Engine vs Live Gemini AI.
- Added empty states for Gemini edge cases.
- Added copy buttons for suggested CV bullets.
- Confirmed production build passes.

## Next Improvements

- Improve the local analyzer so bullet suggestions use more specific CV evidence.
- Improve evidence retrieval and scoring quality.
- Add a privacy warning near the input fields.
- Move Gemini calls to a backend/serverless function.
- Add PDF/DOCX CV upload later.
- Add saved analysis history later.
