import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function InterviewPrep({ questions }: { questions: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Interview prep</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3">
          {questions.map((q, i) => (
            <li key={i} className="flex gap-3 text-sm text-foreground leading-relaxed">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground tabular-nums">
                {i + 1}
              </span>
              <span>{q}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
