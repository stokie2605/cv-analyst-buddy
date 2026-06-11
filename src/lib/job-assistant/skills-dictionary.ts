// Curated dictionary of skills/keywords with simple aliases.
// Keys are the canonical skill; values are alternative phrasings to match.
export const SKILL_DICTIONARY: Record<string, string[]> = {
  javascript: ["javascript", "js", "es6", "ecmascript"],
  typescript: ["typescript", "ts"],
  react: ["react", "react.js", "reactjs"],
  "next.js": ["next.js", "nextjs", "next js"],
  vue: ["vue", "vue.js", "vuejs"],
  node: ["node", "node.js", "nodejs"],
  python: ["python", "py"],
  java: ["java"],
  go: ["golang", " go "],
  rust: ["rust"],
  sql: ["sql", "postgres", "postgresql", "mysql", "sqlite"],
  nosql: ["nosql", "mongodb", "mongo", "dynamodb"],
  html: ["html", "html5"],
  css: ["css", "css3", "sass", "scss", "tailwind"],
  api: ["api", "rest", "graphql", "endpoint", "endpoints"],
  ai: ["ai", "artificial intelligence", "machine learning", "ml"],
  llm: ["llm", "large language model", "gpt", "gemini", "claude"],
  rag: ["rag", "retrieval augmented", "retrieval-augmented"],
  "prompt engineering": ["prompt engineering", "prompting", "prompt design"],
  chatbot: ["chatbot", "chat bot", "conversational"],
  automation: ["automation", "automate", "automated", "workflow"],
  docker: ["docker", "container", "containerization"],
  kubernetes: ["kubernetes", "k8s"],
  aws: ["aws", "amazon web services", "ec2", "s3", "lambda"],
  gcp: ["gcp", "google cloud"],
  azure: ["azure"],
  git: ["git", "github", "gitlab", "version control"],
  agile: ["agile", "scrum", "kanban", "sprint"],
  testing: ["testing", "unit test", "integration test", "jest", "vitest", "cypress"],
  ci: ["ci/cd", "continuous integration", "continuous delivery", "ci cd"],
  documentation: ["documentation", "docs", "technical writing"],
  "customer support": ["customer support", "customer service", "support ticket", "helpdesk"],
  communication: ["communication", "written communication", "verbal communication"],
  leadership: ["leadership", "led a team", "managed a team", "team lead"],
  "project management": ["project management", "pmp", "project manager"],
  design: ["design", "ui design", "ux design", "figma"],
  analytics: ["analytics", "data analysis", "metrics", "kpi"],
  seo: ["seo", "search engine optimization"],
  marketing: ["marketing", "growth", "campaign"],
  sales: ["sales", "outbound", "pipeline"],
  finance: ["finance", "financial", "accounting"],
  security: ["security", "infosec", "cybersecurity"],
  mobile: ["mobile", "ios", "android", "react native", "flutter"],
  devops: ["devops", "sre", "site reliability"],
  data: ["data engineering", "etl", "data pipeline", "warehouse"],
  collaboration: ["collaboration", "cross-functional", "stakeholder"],
  problemsolving: ["problem solving", "problem-solving", "troubleshoot", "debugging"],
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function normalizeToken(token: string): string {
  let normalized = token.toLowerCase().replace(/[^a-z0-9+#.]/g, "");

  if (normalized.length > 6 && normalized.endsWith("ions")) {
    normalized = normalized.slice(0, -4);
  } else if (normalized.length > 5 && normalized.endsWith("ion")) {
    normalized = normalized.slice(0, -3);
  } else if (normalized.length > 5 && normalized.endsWith("ing")) {
    normalized = normalized.slice(0, -3);
  } else if (normalized.length > 4 && normalized.endsWith("ed")) {
    normalized = normalized.slice(0, -2);
  } else if (normalized.length > 4 && normalized.endsWith("s")) {
    normalized = normalized.slice(0, -1);
  }

  if (normalized.length > 5 && normalized.endsWith("e")) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

export function normalizeKeywordText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .map(normalizeToken)
    .filter(Boolean)
    .join(" ");
}

const NORMALIZED_SKILL_DICTIONARY = Object.fromEntries(
  Object.entries(SKILL_DICTIONARY).map(([skill, aliases]) => [
    skill,
    [...new Set(aliases.map(normalizeKeywordText).filter(Boolean))],
  ]),
) as Record<string, string[]>;

const NORMALIZED_SKILL_ENTRIES = Object.entries(NORMALIZED_SKILL_DICTIONARY);

export function getNormalizedSkillAliases(skill: string): string[] {
  return NORMALIZED_SKILL_DICTIONARY[skill] || [normalizeKeywordText(skill)].filter(Boolean);
}

export function normalizedKeywordMatches(normalizedText: string, normalizedKeyword: string): boolean {
  return normalizedKeyword.length > 0 && ` ${normalizedText} `.includes(` ${normalizedKeyword} `);
}

export function normalizedKeywordMatchCount(normalizedText: string, normalizedKeyword: string): number {
  if (!normalizedKeyword) return 0;

  return normalizedText.match(new RegExp(`\\b${escapeRegExp(normalizedKeyword)}\\b`, "g"))?.length ?? 0;
}

export function keywordMatches(text: string, keyword: string): boolean {
  const normalizedKeyword = normalizeKeywordText(keyword);
  return normalizedKeywordMatches(normalizeKeywordText(text), normalizedKeyword);
}

export function keywordMatchCount(text: string, keyword: string): number {
  const normalizedKeyword = normalizeKeywordText(keyword);
  if (!normalizedKeyword) return 0;

  return normalizedKeywordMatchCount(normalizeKeywordText(text), normalizedKeyword);
}

export function extractSkillsFromNormalizedText(normalizedText: string): string[] {
  const found = new Set<string>();
  for (const [skill, aliases] of NORMALIZED_SKILL_ENTRIES) {
    for (const normalizedAlias of aliases) {
      if (normalizedKeywordMatches(normalizedText, normalizedAlias)) {
        found.add(skill);
        break;
      }
    }
  }
  return Array.from(found).sort();
}

export function extractSkills(text: string): string[] {
  return extractSkillsFromNormalizedText(normalizeKeywordText(text));
}
