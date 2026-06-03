import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ScoreFactor } from "@/lib/job-assistant/types";

export function ScoreBreakdown({ breakdown }: { breakdown: ScoreFactor[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Score breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {breakdown.map((f) => (
          <div key={f.label} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium text-foreground">{f.label}</span>
              <span className="text-sm font-medium tabular-nums text-muted-foreground">
                {f.score}
              </span>
            </div>
            <Progress value={f.score} className="h-1.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">{f.detail}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
