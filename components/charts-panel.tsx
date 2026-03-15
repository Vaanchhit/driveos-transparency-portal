"use client";

import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Improvement } from "@/lib/types";

const axisProps = {
  tick: { fill: "#94a3b8", fontSize: 12 },
  axisLine: false,
  tickLine: false
};

export function ChartsPanel({ trendSeries }: { trendSeries: Improvement["trendSeries"] }) {
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <ChartCard
        title="Edge-case Frequency"
        description="Weekly critical incident density"
        chart={
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trendSeries}>
              <defs>
                <linearGradient id="edgeFrequency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#63e6ff" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#63e6ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
              <XAxis dataKey="week" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip
                contentStyle={{
                  background: "rgba(8,14,24,0.96)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 16
                }}
              />
              <Area
                type="monotone"
                dataKey="edgeFrequency"
                stroke="#63e6ff"
                fill="url(#edgeFrequency)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        }
      />
      <ChartCard
        title="Resolution Rate"
        description="Faster closure of logged edge cases"
        chart={
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendSeries}>
              <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
              <XAxis dataKey="week" {...axisProps} />
              <YAxis {...axisProps} domain={[50, 100]} />
              <Tooltip
                contentStyle={{
                  background: "rgba(8,14,24,0.96)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 16
                }}
              />
              <Line
                type="monotone"
                dataKey="resolutionRate"
                stroke="#4ade80"
                strokeWidth={3}
                dot={{ r: 3, fill: "#4ade80" }}
              />
            </LineChart>
          </ResponsiveContainer>
        }
      />
      <ChartCard
        title="Model Accuracy"
        description="Perception stack benchmark progression"
        chart={
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendSeries}>
              <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
              <XAxis dataKey="week" {...axisProps} />
              <YAxis {...axisProps} domain={[88, 100]} />
              <Tooltip
                contentStyle={{
                  background: "rgba(8,14,24,0.96)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 16
                }}
              />
              <Line
                type="monotone"
                dataKey="modelAccuracy"
                stroke="#fbbf24"
                strokeWidth={3}
                dot={{ r: 3, fill: "#fbbf24" }}
              />
            </LineChart>
          </ResponsiveContainer>
        }
      />
    </div>
  );
}

function ChartCard({
  title,
  description,
  chart
}: {
  title: string;
  description: string;
  chart: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Safety Improvement</p>
        <CardTitle className="mt-2 text-xl">{title}</CardTitle>
        <p className="text-sm text-slate-400">{description}</p>
      </CardHeader>
      <CardContent className="pt-4">{chart}</CardContent>
    </Card>
  );
}
