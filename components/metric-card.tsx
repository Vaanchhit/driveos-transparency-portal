import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type MetricCardProps = {
  label: string;
  value: string;
  hint: string;
};

export function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="relative p-5">
        <div className="data-sheen absolute inset-x-0 top-0 h-px" />
        <div className="mb-5 flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-slate-400">
          <span>{label}</span>
          <ArrowUpRight className="h-4 w-4 text-cyan-300" />
        </div>
        <div className="font-[family-name:var(--font-display)] text-3xl font-semibold text-white">
          {value}
        </div>
        <p className="mt-3 text-sm text-slate-400">{hint}</p>
      </CardContent>
    </Card>
  );
}
