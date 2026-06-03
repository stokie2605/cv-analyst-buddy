export interface EvidenceSnippet {
  source: "CV" | "Job Description";
  text: string;
  signals: string[];
}

export interface ScoreFactor {
  label: string;
  score: number;
  detail: string;
}

export interface AnalysisResult {
  matchScore: number;
  matchSummary: string;
  skillsFound: string[];
  missingSignals: string[];
  cvBulletSuggestions: string[];
  interviewPrep: string[];
  retrievedEvidence: EvidenceSnippet[];
  scoreBreakdown: ScoreFactor[];
}
