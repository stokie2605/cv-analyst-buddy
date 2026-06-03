# Gemini BYOK Mode

The app now supports two analysis modes:

- **Local Engine Baseline:** default mode. Uses `src/lib/job-assistant/local-analyzer-fallback.ts`.
- **Live Gemini AI:** enabled when the user saves a Gemini API key in the settings dialog.

The main UI still calls one function:

```ts
analyzeMatch(cvText, jobDescription): Promise<AnalysisResult>
```

That function lives in:

```text
src/lib/job-assistant/analyzer.ts
```

It checks `localStorage.gemini_api_key`. If a key exists, it calls Gemini with JSON schema output. If Gemini fails, the app falls back to the local analyzer.

Important: browser-side API keys are only suitable for demos and personal testing. A production version should move Gemini calls to a backend or serverless function.

After pulling these changes, install dependencies so `@google/genai` is available:

```powershell
npm install
```

Then run:

```powershell
npm run dev
```
