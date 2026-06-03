import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BulletSuggestions({ bullets }: { bullets: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Suggested CV bullets</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-3 text-sm text-foreground leading-relaxed">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
