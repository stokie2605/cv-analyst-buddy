import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { KeyRound, Settings } from "lucide-react";

const GEMINI_KEY_STORAGE = "gemini_api_key";

export function GeminiSettings() {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [hasSavedKey, setHasSavedKey] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(GEMINI_KEY_STORAGE);
    setHasSavedKey(Boolean(saved));
    setApiKey(saved ?? "");
  }, []);

  const saveKey = () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      toast.error("Paste a Gemini API key first");
      return;
    }

    window.localStorage.setItem(GEMINI_KEY_STORAGE, trimmed);
    setHasSavedKey(true);
    setOpen(false);
    toast.success("Gemini key saved", {
      description: "Future analyses will try Live Gemini AI first, then fall back locally if needed.",
    });
  };

  const clearKey = () => {
    window.localStorage.removeItem(GEMINI_KEY_STORAGE);
    setApiKey("");
    setHasSavedKey(false);
    toast.success("Gemini key cleared", {
      description: "Analyses will use the local baseline engine.",
    });
  };

  return (
    <div className="ml-auto flex items-center gap-2">
      <Badge
        variant={hasSavedKey ? "default" : "secondary"}
        className={hasSavedKey ? "bg-emerald-600 hover:bg-emerald-600" : ""}
      >
        {hasSavedKey ? "Mode: Live Gemini AI" : "Mode: Local Engine Baseline"}
      </Badge>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gemini analysis mode</DialogTitle>
            <DialogDescription>
              Add your own Gemini API key to try live AI analysis. Without a key, the app uses the local rule-based
              baseline.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
              Browser BYOK is useful for demos, but production apps should keep API keys on a backend.
            </div>
            <div className="space-y-2">
              <Label htmlFor="gemini-key">Gemini API key</Label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="gemini-key"
                  type="password"
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  placeholder="Paste your Gemini API key"
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={clearKey} disabled={!hasSavedKey}>
              Clear key
            </Button>
            <Button onClick={saveKey}>Save key</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
