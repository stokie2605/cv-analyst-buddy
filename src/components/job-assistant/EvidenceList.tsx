import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EvidenceSnippet } from "@/lib/job-assistant/types";

export function EvidenceList({ evidence }: { evidence: EvidenceSnippet[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Retrieved evidence</CardTitle>
      </CardHeader>
      <CardContent>
        {evidence.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No CV passages matched the job description's skills closely enough to retrieve.
          </p>
        ) : (
          <ul className="space-y-4">
            {evidence.map((e, i) => (
              <li key={i} className="rounded-lg border bg-muted/30 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{e.source}</Badge>
                  <div className="flex flex-wrap gap-1">
                    {e.signals.map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs capitalize">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-foreground leading-relaxed">"{e.text}"</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
