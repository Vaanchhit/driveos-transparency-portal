"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";

export function LiveProgressCounter({ initialMiles }: { initialMiles: number }) {
  const [miles, setMiles] = useState(initialMiles);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMiles((current) => current + Math.floor(6 + Math.random() * 19));
    }, 3200);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Live Progress Counter</p>
        <CardTitle className="text-xl">Verified Safe Miles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-[28px] border border-cyan-300/20 bg-cyan-300/5 p-6">
          <div className="font-[family-name:var(--font-display)] text-5xl font-semibold tracking-tight text-cyan-200 md:text-6xl">
            {formatNumber(miles)}
          </div>
          <p className="mt-3 max-w-md text-sm text-slate-400">
            Counter increments continuously from validated fleet telemetry and closed-loop simulation replays.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
