import type { AnalysisResult, EvidenceSnippet, ScoreFactor } from "./types";
import { extractSkills, SKILL_DICTIONARY } from "./skills-dictionary";

// Split into sentence/bullet chunks while preserving original text for evidence.
function chunkText(text: string): string[] {
  return text
    .split(/(?:\r?\n+|(?<=[.!?])\s+)/)
    .map((c) => c.replace(/^[-•*\d.)\s]+/, "").trim())
    .filter((c) => c.length > 20);
}

function countMatches(haystack: string, needle: string): number {
  if (!needle) return 0;
  const re = new RegExp(`\\b${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
  return (haystack.match(re) || []).length;
}

function hasMetric(text: string): boolean {
  return /\b\d+%?|\b\d+\+|\$\d|\d+ ?(users|customers|hours|days|weeks|months|years|teams|reports)/i.test(text);
}

function summaryFor(score: number): string {
  if (score >= 80) {
    return "Strong match. Your CV already speaks the language of this role — focus on tightening evidence and metrics.";
  }
  if (score >= 60) {
    return "Promising match. You have several useful signals, but the CV should make the role fit clearer.";
  }
  if (score >= 40) {
    return "Partial match. Some relevant experience is there, but key skills and signals are missing or buried.";
  }
  return "Early-stage match. Consider whether this role aligns with your current experience, or reshape the CV around its core requirements.";
}

function generateBullets(missing: string[], cvHasMetrics: boolean): string[] {
  const templates = [
    (skill: string) =>
      `Built or contributed to a project using ${skill}, focusing on a clear outcome and measurable impact.`,
    (skill: string) =>
      `Used ${skill} to solve a practical problem end-to-end, from understanding requirements to shipping a working solution.`,
    (skill: string) =>
      `Collaborated with teammates to apply ${skill} in a real workflow, documenting decisions and trade-offs.`,
    (skill: string) =>
      `Investigated and improved an existing process using ${skill}, sharing findings with the wider team.`,
  ];
  const out: string[] = [];
  const picks = missing.slice(0, 4);
  picks.forEach((skill, i) => out.push(templates[i % templates.length](skill)));
  if (!cvHasMetrics) {
    out.push(
      "Quantify at least two CV bullets with concrete numbers (users, tickets, time saved, % improvement) — recruiters scan for these first.",
    );
  }
  if (out.length === 0) {
    out.push(
      "Your CV already covers the main skills. Tighten 2–3 bullets so each starts with a strong verb and ends with a measurable outcome.",
    );
  }
  return out;
}

function generateInterviewQuestions(jdSkills: string[], missing: string[]): string[] {
  const questions: string[] = [];
  if (missing[0]) {
    questions.push(`Tell me about a time you picked up ${missing[0]} quickly and used it to solve a real problem.`);
  }
  if (jdSkills.includes("ai") || jdSkills.includes("llm")) {
    questions.push("How would you check whether an AI assistant is giving accurate, trustworthy answers?");
  }
  if (jdSkills.includes("customer support")) {
    questions.push("Walk me through how you handled a difficult customer issue from first message to resolution.");
  }
  if (jdSkills.includes("documentation")) {
    questions.push("Describe a piece of documentation you wrote that genuinely changed how a team worked.");
  }
  questions.push("What part of this role do you think you'd have to grow into, and how would you approach that?");
  questions.push("What's a recent project you're proud of, and what would you do differently next time?");
  return questions.slice(0, 5);
}

function retrieveEvidence(cv: string, jdSkills: string[]): EvidenceSnippet[] {
  const chunks = chunkText(cv);
  const scored = chunks.map((chunk) => {
    const lower = chunk.toLowerCase();
    const signals: string[] = [];
    for (const skill of jdSkills) {
      const aliases = SKILL_DICTIONARY[skill] || [skill];
      if (aliases.some((a) => lower.includes(a))) signals.push(skill);
    }
    return { text: chunk, signals, score: signals.length + (hasMetric(chunk) ? 0.5 : 0) };
  });
  return scored
    .filter((s) => s.signals.length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((s) => ({ source: "CV" as const, text: s.text, signals: s.signals }));
}

/**
 * Analyse a CV against a job description.
 *
 * Local rule-based implementation. Returns the canonical AnalysisResult
 * shape so this function can later be swapped for an LLM call (e.g. Gemini)
 * with no UI changes.
 */
export async function runLocalRuleBasedAnalysis(cv: string, jd: string): Promise<AnalysisResult> {
  // Simulated latency so the loading state is always visible.
  await new Promise((r) => setTimeout(r, 1100));

  const cvSkills = extractSkills(cv);
  const jdSkills = extractSkills(jd);

  const skillsFound = cvSkills.filter((s) => jdSkills.includes(s));
  const missingSignals = jdSkills.filter((s) => !cvSkills.includes(s));

  // Score factors (0–100 each)
  const skillOverlap =
    jdSkills.length === 0 ? 0 : Math.round((skillsFound.length / jdSkills.length) * 100);

  const evidence = retrieveEvidence(cv, jdSkills);
  const evidenceStrength = Math.min(
    100,
    Math.round(evidence.length * 22 + (evidence.some((e) => hasMetric(e.text)) ? 12 : 0)),
  );

  const cvWords = Math.max(1, cv.split(/\s+/).length);
  const keywordHits = jdSkills.reduce((acc, skill) => {
    const aliases = SKILL_DICTIONARY[skill] || [skill];
    return acc + aliases.reduce((a, alias) => a + countMatches(cv, alias), 0);
  }, 0);
  const keywordDensity = Math.min(100, Math.round((keywordHits / cvWords) * 100 * 12));

  // Role-term coverage: top frequency non-skill words in JD that also appear in CV.
  const stop = new Set([
    "the","and","with","for","you","our","are","will","that","this","from","have","your","into","using","work","role","team","about","they","their","what","when","where","which","while","also","each","such","other","more","most","very","than","then","been","over","into","just","like","make","made","need","want","help","both","across","within","there","these","those","under","upon","onto","because","including","include","includes","through","across",
  ]);
  const jdWordFreq: Record<string, number> = {};
  jd.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).forEach((w) => {
    if (w.length >= 5 && !stop.has(w)) jdWordFreq[w] = (jdWordFreq[w] || 0) + 1;
  });
  const topRoleTerms = Object.entries(jdWordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([w]) => w);
  const cvLower = cv.toLowerCase();
  const covered = topRoleTerms.filter((t) => cvLower.includes(t)).length;
  const roleCoverage = topRoleTerms.length === 0 ? 0 : Math.round((covered / topRoleTerms.length) * 100);

  const scoreBreakdown: ScoreFactor[] = [
    {
      label: "Skill overlap",
      score: skillOverlap,
      detail:
        skillsFound.length === 0
          ? "No direct skill matches were detected between the CV and the job description."
          : `${skillsFound.length} of ${jdSkills.length} skills mentioned in the job appear in the CV.`,
    },
    {
      label: "Evidence strength",
      score: evidenceStrength,
      detail:
        evidence.length === 0
          ? "The CV doesn't contain clear examples that map to the job's responsibilities."
          : `Found ${evidence.length} CV passage${evidence.length === 1 ? "" : "s"} that back up the role's requirements${evidence.some((e) => hasMetric(e.text)) ? ", including measurable outcomes." : "."}`,
    },
    {
      label: "Keyword density",
      score: keywordDensity,
      detail: `${keywordHits} job-relevant keyword mention${keywordHits === 1 ? "" : "s"} across the CV.`,
    },
    {
      label: "Role-term coverage",
      score: roleCoverage,
      detail: `${covered} of the job description's top recurring terms also appear in the CV.`,
    },
  ];

  const matchScore = Math.round(
    skillOverlap * 0.4 + evidenceStrength * 0.25 + keywordDensity * 0.15 + roleCoverage * 0.2,
  );

  return {
    matchScore,
    matchSummary: summaryFor(matchScore),
    skillsFound,
    missingSignals,
    cvBulletSuggestions: generateBullets(missingSignals, evidence.some((e) => hasMetric(e.text))),
    interviewPrep: generateInterviewQuestions(jdSkills, missingSignals),
    retrievedEvidence: evidence,
    scoreBreakdown,
  };
}
