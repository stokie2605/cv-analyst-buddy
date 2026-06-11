import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, ChangeEvent, DragEvent } from "react";
import { toast } from "sonner";
import { InputPanel } from "@/components/job-assistant/InputPanel";
import { ResultsPanel } from "@/components/job-assistant/ResultsPanel";
import { ResultsSkeleton } from "@/components/job-assistant/ResultsSkeleton";
import { GeminiSettings } from "@/components/job-assistant/GeminiSettings";
import { InterviewPrep } from "@/components/job-assistant/InterviewPrep";
import { Button } from "@/components/ui/button";
import { analyzeMatch } from "@/lib/job-assistant/analyzer";
import {
  extractSkills,
  keywordMatchCount,
  SKILL_DICTIONARY,
} from "@/lib/job-assistant/skills-dictionary";
import { SAMPLE_CV, SAMPLE_JOB_DESCRIPTION } from "@/lib/job-assistant/sample-data";
import type { AnalysisResult } from "@/lib/job-assistant/types";
import { Sparkles, Upload, FileText, Briefcase, FileCheck } from "lucide-react";

// --- Active AI Cover Letter Builder Component ---
function CoverLetterTab({ cv, jd }: { cv: string; jd: string }) {
  const [coverLetter, setCoverLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateCoverLetter = async () => {
    if (!cv.trim() || !jd.trim()) {
      toast.error("Missing input data", {
        description: "Please load both a CV and a Job Description first.",
      });
      return;
    }
    
    setIsGenerating(true);
    try {
      const { analyzeMatch } = await import("@/lib/job-assistant/analyzer");
      const r = await analyzeMatch(cv, jd);
      
      if (r && r.suggestedBulletPoints) {
        const dynamicLetter = `Dear Hiring Manager,\n\nI am writing to express my strong interest in the targeted position. Based on my background in operations and my active full-stack technical updates, I offer a unique combination of systems thinking and practical execution.\n\nKey alignments with your requirements include:\n• ${r.suggestedBulletPoints[0] || "Proven technical problem-solving capabilities."}\n• ${r.suggestedBulletPoints[1] || "Strong cross-functional project execution."}\n• ${r.suggestedBulletPoints[2] || "Dedication to continuous operational refinement."}\n\nThank you for your time and consideration. I look forward to discussing how my skills match your team's needs.\n\nSincerely,\n[Your Name]`;
        setCoverLetter(dynamicLetter);
        toast.success("Cover letter generated successfully!");
      } else {
        throw new Error("Could not extract custom parameters.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Generation failed", {
        description: "Make sure your Gemini API key is configured correctly in Settings.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="rounded-xl border bg-background p-6 space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-purple-500" /> AI Cover Letter Builder
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Generates a custom, high-impact cover letter tailored directly to the targeted job description.
          </p>
        </div>
        <Button 
          onClick={handleGenerateCoverLetter} 
          disabled={isGenerating || !cv.trim() || !jd.trim()}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          {isGenerating ? "Drafting letter..." : "Generate Custom Letter"}
        </Button>
      </div>

      {coverLetter ? (
        <div className="relative rounded-lg bg-muted/30 border p-4 font-mono text-xs whitespace-pre-wrap leading-relaxed text-foreground animate-in fade-in-50 duration-300">
          <Button
            size="sm"
            variant="outline"
            className="absolute top-3 right-3 bg-background"
            onClick={() => {
              navigator.clipboard.writeText(coverLetter);
              toast.success("Copied to clipboard!");
            }}
          >
            Copy Text
          </Button>
          {coverLetter}
        </div>
      ) : (
        <div className="rounded-lg bg-muted/40 p-8 border border-dashed text-center text-sm text-muted-foreground">
          {!cv.trim() || !jd.trim() ? (
            "Please paste or upload your CV and a job description above to unlock generation."
          ) : (
            <>
              Ready to build! Click the <span className="font-medium text-purple-600">Generate Custom Letter</span> button above to process your draft.
            </>
          )}
        </div>
      )}
    </div>
  );
}

// --- Application Pipeline Tracker Kanban View Component ---
function TrackingBoardTab() {
  return (
    <div className="rounded-xl border bg-background p-6">
      <h3 className="text-base font-semibold text-foreground flex items-center gap-2 mb-2">
        <Briefcase className="h-4 w-4 text-purple-500" /> Job Application Pipeline
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Track your live job hunting pipeline stages cleanly from applied, to interviews, to final offers.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["Applied", "Interviewing", "Offers Received"].map((stage) => (
          <div key={stage} className="rounded-lg bg-muted/50 p-4 border min-h-[150px]">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stage}</span>
            <div className="mt-4 text-xs text-center border border-dashed p-4 rounded text-muted-foreground bg-background/50">
              Drop active roles here
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- 🗺️ THE TANSTACK ROUTE GATEWAY ---
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Job Application Assistant" },
      {
        name: "description",
        content: "Compare your CV against a job description and get an automatic match score.",
      },
    ],
  }),
  component: JobAssistantPage,
});

const MIN_LENGTH = 50;

const JOB_SEARCH_SKILLS = [
  "customer support", "analytics", "sql", "documentation", "javascript", 
  "typescript", "react", "api", "automation", "ai", "llm", "rag", 
  "communication", "project management", "testing", "problemsolving", "collaboration"
];

const CHEF_HOSPITALITY_TERMS = ["chef", "kitchen", "culinary", "restaurant", "catering"];
const ADMIN_OFFICE_TERMS = ["admin", "office", "clerical", "receptionist"];

function containsAnyTerm(text: string, terms: string[]) {
  return terms.some((term) => new RegExp(`\\b${term}\\b`, "i").test(text));
}

function generateJobSearchUrl(cvText: string) {
  const foundSkills = extractSkills(cvText);
  const rankedSkills = foundSkills
    .filter((skill) => JOB_SEARCH_SKILLS.includes(skill))
    .map((skill) => ({
      skill,
      score: Math.max(
        ...SKILL_DICTIONARY[skill].map((alias) => keywordMatchCount(cvText, alias)),
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .map(({ skill }) => skill);

  const fallbackKeywords = foundSkills.some((skill) =>
    ["customer support", "communication", "documentation", "analytics"].includes(skill),
  )
    ? "operations support"
    : "junior analyst";

  const industryKeywords = containsAnyTerm(cvText, CHEF_HOSPITALITY_TERMS)
    ? "hospitality kitchen"
    : containsAnyTerm(cvText, ADMIN_OFFICE_TERMS)
      ? "administrative assistant"
      : fallbackKeywords;

  const detectedKeywords = rankedSkills.slice(0, 2).join(" ") || industryKeywords;
  return `https://www.google.com/search?q=${encodeURIComponent(detectedKeywords)}+jobs+near+me&ibp=htl;jobs`;
}

// --- VISUAL INTERFACE LAYER ---
function JobAssistantPage() {
  const [cv, setCv] = useState("");
  const [jd, setJd] = useState("");
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<"analysis" | "cover-letter" | "interview-prep" | "tracker">("analysis");
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const handleFileLoading = (file: File) => {
    if (!file) return;

    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === "string") {
          setCv(text);
          setUploadedFileName(file.name);
          toast.success("CV uploaded successfully");
        }
      };
      reader.readAsText(file);
      return;
    }

    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const typedarray = new Uint8Array(e.target?.result as ArrayBuffer);
        try {
          // @ts-ignore
          const pdfjsLib = window['pdfjs-dist/build/pdf'];
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          let fullText = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map((item: any) => item.str).join(" ") + "\n";
          }
          if (fullText.trim().length > 0) {
            setCv(fullText);
            setUploadedFileName(file.name);
            toast.success("PDF CV parsed successfully!");
          }
        } catch (err) {
          console.error(err);
          toast.error("PDF core engine failure");
        }
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.endsWith(".docx")) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        try {
          // @ts-ignore
          const mammoth = window.mammoth;
          const res = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
          if (res.value.trim().length > 0) {
            setCv(res.value);
            setUploadedFileName(file.name);
            toast.success("Word Document parsed successfully!");
          }
        } catch (err) {
          console.error(err);
          toast.error("Word engine failure");
        }
      };
      reader.readAsArrayBuffer(file);
      return;
    }
    toast.error("Format mismatch");
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) handleFileLoading(files[0]);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) handleFileLoading(files[0]);
  };

  const handleAnalyse = async () => {
    if (cv.trim().length < MIN_LENGTH || jd.trim().length < MIN_LENGTH) {
      toast.error("Please ensure your inputs meet minimum character configurations.");
      return;
    }
    setIsAnalysing(true);
    setResult(null);
    try {
      const r = await analyzeMatch(cv, jd);
      setResult(r);
      setActiveTab("analysis");
      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (err) {
      console.error(err);
      toast.error("Analysis failed");
    } finally {
      setIsAnalysing(false);
    }
  };

  const handleFindJobs = () => {
    if (!cv.trim()) {
      toast.error("Upload a CV first to parse target metrics.");
      return;
    }
    window.open(generateJobSearchUrl(cv), "_blank", "noopener,noreferrer");
  };

  const handleLoadSample = () => {
    setCv(SAMPLE_CV);
    setJd(SAMPLE_JOB_DESCRIPTION);
    setUploadedFileName("sample-cv.txt");
    toast.success("Sample profile metrics loaded");
  };

  const handleClear = () => {
    setCv("");
    setJd("");
    setUploadedFileName("");
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-4 sm:px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground leading-tight">
              AI Job Application Assistant
            </h1>
            <p className="text-xs text-muted-foreground">
              Analyze CV compatibility metrics and coordinate your interview pipeline in real time.
            </p>
          </div>
          <GeminiSettings />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* File Drop Zone area */}
        <div className="mb-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative rounded-xl border-2 border-dashed p-6 text-center transition-all duration-300 ${
              isDragging ? "border-purple-500 bg-purple-500/10" : uploadedFileName ? "border-green-500/50 bg-green-500/5" : "border-muted-foreground/20 bg-background"
            }`}
          >
            <input type="file" id="cv-file-upload" accept=".txt,.pdf,.docx" onChange={handleFileChange} className="absolute inset-0 cursor-pointer opacity-0" />
            <div className="flex flex-col items-center justify-center gap-2">
              {uploadedFileName ? <FileText className="h-5 w-5 text-green-500" /> : <Upload className="h-5 w-5 text-purple-500" />}
              <p className="text-sm font-medium text-foreground">{uploadedFileName ? `Active file: ${uploadedFileName}` : "Drop your CV here or browse"}</p>
            </div>
          </div>
        </div>

        {/* Input Text Form Fields Container */}
        <section aria-label="Inputs">
          <InputPanel
            key={cv.length}
            cv={cv}
            jd={jd}
            isAnalysing={isAnalysing}
            onCvChange={setCv}
            onJdChange={setJd}
            onAnalyse={handleAnalyse}
            onFindJobs={handleFindJobs}
            onLoadSample={handleLoadSample}
            onClear={handleClear}
          />
        </section>

        {/* 🗂️ NAVIGATION WORKSPACE TABS */}
        <div className="mt-8 border-b flex flex-wrap gap-4 text-sm font-medium text-muted-foreground">
          <button 
            onClick={() => setActiveTab("analysis")}
            className={`pb-3 border-b-2 transition-colors ${activeTab === "analysis" ? "border-primary text-foreground font-semibold" : "border-transparent hover:text-foreground"}`}
          >
            Match Analysis
          </button>
          <button 
            onClick={() => setActiveTab("interview-prep")}
            className={`pb-3 border-b-2 transition-colors ${activeTab === "interview-prep" ? "border-primary text-foreground font-semibold" : "border-transparent hover:text-foreground"}`}
          >
            Interview Preparation
          </button>
          <button 
            onClick={() => setActiveTab("cover-letter")}
            className={`pb-3 border-b-2 transition-colors ${activeTab === "cover-letter" ? "border-primary text-foreground font-semibold" : "border-transparent hover:text-foreground"}`}
          >
            Cover Letter Builder
          </button>
          <button 
            onClick={() => setActiveTab("tracker")}
            className={`pb-3 border-b-2 transition-colors ${activeTab === "tracker" ? "border-primary text-foreground font-semibold" : "border-transparent hover:text-foreground"}`}
          >
            Applications Pipeline
          </button>
        </div>

        {/* DYNAMIC INTERFACE ROUTER BLOCK */}
        <section ref={resultsRef} className="mt-6">
          {activeTab === "analysis" && (
            isAnalysing ? <ResultsSkeleton /> : result ? <ResultsPanel result={result} /> : (
              <div className="rounded-xl border border-dashed bg-background/60 px-6 py-12 text-center text-sm text-muted-foreground">
                Paste files above and tap <span className="font-medium text-foreground">Analyse match</span> to launch processing parameters.
              </div>
            )
          )}
          
          {activeTab === "interview-prep" && (
            result ? <InterviewPrep questions={result.interviewPrep || []} /> : (
              <div className="rounded-xl border border-dashed bg-background/60 px-6 py-12 text-center text-sm text-muted-foreground">
                Run an analysis match first to populate your targeted interview questions.
              </div>
            )
          )}

          {activeTab === "cover-letter" && <CoverLetterTab cv={cv} jd={jd} />}
          {activeTab === "tracker" && <TrackingBoardTab />}
        </section>
      </main>
    </div>
  );
}