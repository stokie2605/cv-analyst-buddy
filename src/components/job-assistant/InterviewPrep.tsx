import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function InterviewPrep({ questions }: { questions: string[] }) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Interview prep</CardTitle>
      </CardHeader>
      <CardContent className="min-w-0">
        {questions.length === 0 ? (
          <p className="break-words text-sm text-muted-foreground">
            No interview questions returned. Add more role requirements to generate prep prompts.
          </p>
        ) : (
          <ol className="min-w-0 space-y-3">
            {questions.map((q, i) => (
              <li key={i} className="flex min-w-0 gap-3 text-sm leading-relaxed text-foreground">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground tabular-nums">
                  {i + 1}
                </span>
                <span className="min-w-0 break-words">{q}</span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
