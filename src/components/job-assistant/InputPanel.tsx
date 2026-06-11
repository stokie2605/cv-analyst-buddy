import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface InputPanelProps {
  cv: string;
  jd: string;
  isAnalysing: boolean;
  onCvChange: (v: string) => void;
  onJdChange: (v: string) => void;
  onAnalyse: () => void;
  onFindJobs: () => void;
  onLoadSample: () => void;
  onClear: () => void;
}

function Field({
  title,
  hint,
  value,
  onChange,
  placeholder,
}: {
  title: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  // Direct interior buffer tracking to bridge async file stream transitions smoothly
  const [localTextValue, setLocalTextValue] = useState(value);

  useEffect(() => {
    setLocalTextValue(value);
  }, [value]);

  const handleTextChange = (newVal: string) => {
    setLocalTextValue(newVal);
    onChange(newVal);
  };

  return (
    <Card className="min-w-0 flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex min-w-0 items-baseline justify-between gap-3">
          <CardTitle className="min-w-0 break-words text-base">{title}</CardTitle>
          <span className="text-xs text-muted-foreground tabular-nums">
            {localTextValue.length.toLocaleString()} chars
          </span>
        </div>
        <p className="break-words text-xs text-muted-foreground">{hint}</p>
      </CardHeader>
      <CardContent className="min-w-0 flex-1">
        <Textarea
          value={localTextValue}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[280px] min-w-0 resize-y break-words font-mono text-xs leading-relaxed"
        />
      </CardContent>
    </Card>
  );
}

export function InputPanel({
  cv,
  jd,
  isAnalysing,
  onCvChange,
  onJdChange,
  onAnalyse,
  onFindJobs,
  onLoadSample,
  onClear,
}: InputPanelProps) {
  return (
    <div className="min-w-0 space-y-4">
      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
        <Field
          title="Your CV"
          hint="Paste your CV, resume, or a summary of your work experience."
          value={cv}
          onChange={onCvChange}
          placeholder="Paste your CV here..."
        />
        <Field
          title="Job description"
          hint="Paste the full job posting, including responsibilities and requirements."
          value={jd}
          onChange={onJdChange}
          placeholder="Paste the job description here..."
        />
      </div>
      <div className="flex min-w-0 gap-2 rounded-lg border bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
        <Lock className="mt-0.5 h-4 w-4 shrink-0" />
        <p className="min-w-0 break-words">
          <strong className="font-medium text-foreground">Privacy Notice:</strong> Your text data remains strictly local
          or travels directly to the official Gemini API using your browser's local BYOK storage key. No data is
          harvested, collected, or stored by this application.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={onAnalyse} disabled={isAnalysing} size="lg">
          {isAnalysing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analysing...
            </>
          ) : (
            "Analyse match"
          )}
        </Button>
        <Button variant="outline" onClick={onLoadSample} disabled={isAnalysing}>
          Load sample
        </Button>
        <Button variant="secondary" onClick={onFindJobs} disabled={isAnalysing}>
          🔍 Auto-Find Matching Jobs
        </Button>
        <Button variant="ghost" onClick={onClear} disabled={isAnalysing}>
          Clear
        </Button>
      </div>
    </div>
  );
}
