import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function BulletSuggestions({ bullets }: { bullets: string[] }) {
  const copyBullet = async (bullet: string) => {
    await navigator.clipboard.writeText(bullet);
    toast.success("CV bullet copied");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suggested CV bullets</CardTitle>
      </CardHeader>
      <CardContent>
        {bullets.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No bullet suggestions returned. Try adding more role details or CV evidence.
          </p>
        ) : (
          <ul className="space-y-3">
            {bullets.map((b, i) => (
              <li key={i} className="flex gap-3 text-sm text-foreground leading-relaxed">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span className="flex-1">{b}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 shrink-0 px-2 text-xs"
                  onClick={() => copyBullet(b)}
                >
                  Copy
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
