"use client";

import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import {
  Activity,
  Binary,
  Gauge,
  Milestone,
  Shield,
  TimerReset
} from "lucide-react";
import type { Improvement, Incident, Metrics } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/metric-card";
import { LiveProgressCounter } from "@/components/live-progress-counter";
import { LatestFixPanel } from "@/components/latest-fix-panel";
import { ChartsPanel } from "@/components/charts-panel";
import { IncidentExplorer } from "@/components/incident-explorer";
import { PerceptionVisualizer } from "@/components/perception-visualizer";
import { formatNumber, formatPercent } from "@/lib/utils";

type DashboardState = {
  metrics: Metrics | null;
  incidents: Incident[];
  improvements: Improvement | null;
};

export function DashboardShell() {
  const [state, setState] = useState<DashboardState>({
    metrics: null,
    incidents: [],
    improvements: null
  });

  useEffect(() => {
    async function load() {
      const [metrics, incidents, improvements] = await Promise.all([
        fetch("/api/metrics", { cache: "no-store" }).then((response) => response.json()),
        fetch("/api/incidents", { cache: "no-store" }).then((response) => response.json()),
        fetch("/api/improvements", { cache: "no-store" }).then((response) => response.json())
      ]);

      setState({ metrics, incidents, improvements });
    }

    void load();
  }, []);

  if (!state.metrics || !state.improvements) {
    return (
      <main className="mx-auto flex min-h-screen max-w-[1600px] items-center justify-center px-6 py-16">
        <div className="panel-surface panel-outline rounded-3xl border border-white/10 px-8 py-6 text-sm text-slate-300">
          Syncing public telemetry snapshot...
        </div>
      </main>
    );
  }

  const metrics = [
    {
      label: "Autonomous Miles Driven",
      value: formatNumber(state.metrics.milesDriven),
      hint: "Fleet autonomy runtime logged across validated urban and highway stacks"
    },
    {
      label: "Critical Edge Cases Logged",
      value: formatNumber(state.metrics.edgeCases),
      hint: "Scenario registry of high-priority failures, interventions, and surprise behaviors"
    },
    {
      label: "Edge Cases Resolved",
      value: formatPercent(state.metrics.resolved, 0),
      hint: "Share of logged incidents closed through model changes, policy tuning, or tooling fixes"
    },
    {
      label: "System Safety Score",
      value: formatPercent(state.metrics.safetyScore),
      hint: "Composite benchmark from simulation, replay, disengagement, and planner QA signals"
    },
    {
      label: "Model Version",
      value: state.metrics.modelVersion,
      hint: "Currently deployed perception and planning build across the public validation fleet"
    },
    {
      label: "Latest Update",
      value: new Date(state.metrics.latestUpdate).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
      }),
      hint: "Most recent telemetry and incident package published to this transparency portal"
    }
  ];

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-5 md:px-6 md:py-6">
      <section className="panel-surface panel-outline relative overflow-hidden rounded-[32px] border border-white/10 px-6 py-8 shadow-panel md:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(110,242,255,0.14),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(0,255,194,0.08),_transparent_18%)]" />
        <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <Badge className="mb-5">Public Safety Telemetry</Badge>
            <h1 className="font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight text-white md:text-6xl">
              DriveOS Transparency Portal
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
              Mission-control view into how the autonomy stack logs mistakes, closes edge cases, and improves fleet safety over time.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <HeroChip icon={Milestone} label="Fleet Runtime" value={`${formatNumber(state.metrics.milesDriven)} mi`} />
            <HeroChip icon={Activity} label="Safety Score" value={formatPercent(state.metrics.safetyScore)} />
            <HeroChip icon={Binary} label="Model Release" value={state.metrics.modelVersion} />
            <HeroChip icon={Shield} label="Resolved" value={formatPercent(state.metrics.resolved, 0)} />
            <HeroChip icon={Gauge} label="Live Incidents" value={String(state.incidents.length)} />
            <HeroChip
              icon={TimerReset}
              label="Updated"
              value={new Date(state.metrics.latestUpdate).toLocaleDateString("en-IN")}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <LatestFixPanel latestFix={state.improvements.latestFix} />
        <LiveProgressCounter initialMiles={state.metrics.verifiedSafeMiles} />
      </section>

      <section className="mt-6">
        <ChartsPanel trendSeries={state.improvements.trendSeries} />
      </section>

      <section className="mt-6">
        <IncidentExplorer incidents={state.incidents} />
      </section>

      <section className="mt-6">
        <PerceptionVisualizer />
      </section>
    </main>
  );
}

function HeroChip({
  icon: Icon,
  label,
  value
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10">
        <Icon className="h-4 w-4 text-cyan-200" />
      </div>
      <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-100">{value}</p>
    </div>
  );
}
