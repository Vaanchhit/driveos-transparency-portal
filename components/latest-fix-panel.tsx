import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Improvement } from "@/lib/types";

export function LatestFixPanel({ latestFix }: { latestFix: Improvement["latestFix"] }) {
  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Latest Engineering Fix</p>
          <CardTitle className="mt-2 text-2xl">{latestFix.title}</CardTitle>
        </div>
        <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 p-2">
          <Sparkles className="h-5 w-5 text-cyan-200" />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="max-w-lg text-sm leading-6 text-slate-300">{latestFix.summary}</p>
        <div className="flex flex-wrap gap-3">
          <Badge variant="success">Urban detection accuracy {latestFix.accuracyGain}</Badge>
          <Badge variant="default">Edge-case reduction {latestFix.reduction}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
