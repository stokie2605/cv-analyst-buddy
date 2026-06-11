import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ScoreFactor } from "@/lib/job-assistant/types";

export function ScoreBreakdown({ breakdown }: { breakdown: ScoreFactor[] }) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Score breakdown</CardTitle>
      </CardHeader>
      <CardContent className="min-w-0 space-y-5">
        {breakdown.length === 0 ? (
          <p className="break-words text-sm text-muted-foreground">
            No score factors returned. The app can still show the overall score when available.
          </p>
        ) : (
          breakdown.map((f) => (
            <div key={f.label} className="min-w-0 space-y-1.5">
              <div className="flex min-w-0 items-baseline justify-between gap-3">
                <span className="min-w-0 break-words text-sm font-medium text-foreground">{f.label}</span>
                <span className="text-sm font-medium tabular-nums text-muted-foreground">
                  {f.score}
                </span>
              </div>
              <Progress value={f.score} className="h-1.5" />
              <p className="break-words text-xs leading-relaxed text-muted-foreground">{f.detail}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
