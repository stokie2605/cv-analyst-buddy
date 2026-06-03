import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SkillsCardProps {
  found: string[];
  missing: string[];
}

export function SkillsCard({ found, missing }: SkillsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills & signals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground">Found in your CV</h4>
            <span className="text-xs text-muted-foreground">{found.length}</span>
          </div>
          {found.length === 0 ? (
            <p className="text-sm text-muted-foreground">No overlapping skills detected.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {found.map((s) => (
                <Badge key={s} variant="secondary" className="capitalize">
                  {s}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground">Missing or weak</h4>
            <span className="text-xs text-muted-foreground">{missing.length}</span>
          </div>
          {missing.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing obvious missing — nice.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {missing.map((s) => (
                <Badge
                  key={s}
                  variant="outline"
                  className="capitalize border-amber-400/60 text-amber-700 dark:text-amber-300"
                >
                  {s}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
