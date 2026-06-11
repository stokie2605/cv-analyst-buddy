import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EvidenceSnippet } from "@/lib/job-assistant/types";

export function EvidenceList({ evidence }: { evidence: EvidenceSnippet[] }) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Retrieved evidence</CardTitle>
      </CardHeader>
      <CardContent className="min-w-0">
        {evidence.length === 0 ? (
          <p className="break-words text-sm text-muted-foreground">
            No CV passages matched the job description's skills closely enough to retrieve.
          </p>
        ) : (
          <ul className="space-y-4">
            {evidence.map((e, i) => (
              <li key={i} className="min-w-0 rounded-lg border bg-muted/30 p-4">
                <div className="mb-2 flex min-w-0 flex-wrap items-center gap-2">
                  <Badge variant="outline" className="shrink-0 text-xs">{e.source}</Badge>
                  <div className="flex min-w-0 flex-wrap gap-1">
                    {e.signals.map((s) => (
                      <Badge key={s} variant="secondary" className="max-w-full whitespace-normal break-words text-xs capitalize">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
                <p className="break-words text-sm leading-relaxed text-foreground">"{e.text}"</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
