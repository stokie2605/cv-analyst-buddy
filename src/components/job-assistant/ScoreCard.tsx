import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ScoreCardProps {
  score: number;
  summary: string;
}

function scoreTone(score: number) {
  if (score >= 75) return { label: "Strong", className: "text-emerald-600 dark:text-emerald-400" };
  if (score >= 55) return { label: "Promising", className: "text-amber-600 dark:text-amber-400" };
  if (score >= 35) return { label: "Partial", className: "text-orange-600 dark:text-orange-400" };
  return { label: "Early", className: "text-rose-600 dark:text-rose-400" };
}

export function ScoreCard({ score, summary }: ScoreCardProps) {
  const tone = scoreTone(score);
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Match score
        </CardTitle>
      </CardHeader>
      <CardContent className="min-w-0 space-y-4">
        <div className="flex min-w-0 flex-wrap items-baseline gap-3">
          <span className="text-6xl font-semibold tabular-nums text-foreground">{score}</span>
          <span className="text-2xl font-medium text-muted-foreground">/ 100</span>
          <span className={`ml-auto text-sm font-medium ${tone.className}`}>{tone.label}</span>
        </div>
        <Progress value={score} className="h-2" />
        <p className="break-words text-sm leading-relaxed text-foreground">{summary}</p>
      </CardContent>
    </Card>
  );
}
