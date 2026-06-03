import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { InputPanel } from "@/components/job-assistant/InputPanel";
import { ResultsPanel } from "@/components/job-assistant/ResultsPanel";
import { ResultsSkeleton } from "@/components/job-assistant/ResultsSkeleton";
import { analyzeMatch } from "@/lib/job-assistant/analyzer";
import { SAMPLE_CV, SAMPLE_JOB_DESCRIPTION } from "@/lib/job-assistant/sample-data";
import type { AnalysisResult } from "@/lib/job-assistant/types";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Job Application Assistant" },
      {
        name: "description",
        content:
          "Compare your CV against a job description and get an automatic match score, missing skills, suggested bullets, and interview prep.",
      },
      { property: "og:title", content: "AI Job Application Assistant" },
      {
        property: "og:description",
        content:
          "Paste your CV and a job description to get instant, structured application feedback.",
      },
    ],
  }),
  component: JobAssistantPage,
});

const MIN_LENGTH = 50;

function JobAssistantPage() {
  const [cv, setCv] = useState("");
  const [jd, setJd] = useState("");
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const handleAnalyse = async () => {
    if (cv.trim().length < MIN_LENGTH) {
      toast.error("Your CV is too short", {
        description: `Please paste at least ${MIN_LENGTH} characters of CV content.`,
      });
      return;
    }
    if (jd.trim().length < MIN_LENGTH) {
      toast.error("Job description is too short", {
        description: `Please paste at least ${MIN_LENGTH} characters of job description.`,
      });
      return;
    }
    setIsAnalysing(true);
    setResult(null);
    // Let the skeleton render before scrolling.
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    try {
      const r = await analyzeMatch(cv, jd);
      setResult(r);
      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (err) {
      console.error(err);
      toast.error("Analysis failed", { description: "Please try again." });
    } finally {
      setIsAnalysing(false);
    }
  };

  const handleLoadSample = () => {
    setCv(SAMPLE_CV);
    setJd(SAMPLE_JOB_DESCRIPTION);
    toast.success("Sample CV and job description loaded");
  };

  const handleClear = () => {
    setCv("");
    setJd("");
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 sm:px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground leading-tight">
              AI Job Application Assistant
            </h1>
            <p className="text-xs text-muted-foreground">
              Paste a CV and a job description to get an automatic, evidence-backed match.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <section aria-label="Inputs">
          <InputPanel
            cv={cv}
            jd={jd}
            isAnalysing={isAnalysing}
            onCvChange={setCv}
            onJdChange={setJd}
            onAnalyse={handleAnalyse}
            onLoadSample={handleLoadSample}
            onClear={handleClear}
          />
        </section>

        <section
          ref={resultsRef}
          aria-label="Analysis results"
          className="mt-8 scroll-mt-6"
        >
          {isAnalysing ? (
            <ResultsSkeleton />
          ) : result ? (
            <ResultsPanel result={result} />
          ) : (
            <EmptyState />
          )}
        </section>
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed bg-background/60 px-6 py-12 text-center">
      <h2 className="text-sm font-medium text-foreground">No analysis yet</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        Paste a CV and a job description above, then click <span className="font-medium text-foreground">Analyse match</span>.
        Tap <span className="font-medium text-foreground">Load sample</span> to try it instantly.
      </p>
    </div>
  );
}
