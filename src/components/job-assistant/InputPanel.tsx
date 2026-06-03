import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface InputPanelProps {
  cv: string;
  jd: string;
  isAnalysing: boolean;
  onCvChange: (v: string) => void;
  onJdChange: (v: string) => void;
  onAnalyse: () => void;
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
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-baseline justify-between gap-3">
          <CardTitle className="text-base">{title}</CardTitle>
          <span className="text-xs text-muted-foreground tabular-nums">
            {value.length.toLocaleString()} chars
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardHeader>
      <CardContent className="flex-1">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[280px] resize-y font-mono text-xs leading-relaxed"
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
  onLoadSample,
  onClear,
}: InputPanelProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
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
        <Button variant="ghost" onClick={onClear} disabled={isAnalysing}>
          Clear
        </Button>
      </div>
    </div>
  );
}
