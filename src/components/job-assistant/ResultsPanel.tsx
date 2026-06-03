import type { AnalysisResult } from "@/lib/job-assistant/types";
import { ScoreCard } from "./ScoreCard";
import { SkillsCard } from "./SkillsCard";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { BulletSuggestions } from "./BulletSuggestions";
import { InterviewPrep } from "./InterviewPrep";
import { EvidenceList } from "./EvidenceList";

export function ResultsPanel({ result }: { result: AnalysisResult }) {
  return (
    <div className="space-y-6">
      <ScoreCard score={result.matchScore} summary={result.matchSummary} />
      <div className="grid gap-6 md:grid-cols-2">
        <SkillsCard found={result.skillsFound} missing={result.missingSignals} />
        <ScoreBreakdown breakdown={result.scoreBreakdown} />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <BulletSuggestions bullets={result.cvBulletSuggestions} />
        <InterviewPrep questions={result.interviewPrep} />
      </div>
      <EvidenceList evidence={result.retrievedEvidence} />
    </div>
  );
}
