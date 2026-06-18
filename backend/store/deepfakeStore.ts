import type { DeepfakeAssessment } from "../services/contextLens/deepfakeDetection.js";
import { formatManipulationLabel } from "../services/contextLens/deepfakeDetection.js";

export type DeepfakeReport = {
  id: string;
  imageUrl: string;
  resolvedUrl: string;
  submittedAt: string;
  assessment: DeepfakeAssessment;
  narrativeDelta?: string;
};

const reports: DeepfakeReport[] = [];

export function trackDeepfakeReport(input: {
  imageUrl: string;
  resolvedUrl: string;
  assessment: DeepfakeAssessment;
  narrativeDelta?: string;
}): DeepfakeReport | null {
  if (!input.assessment.tracked) return null;

  const report: DeepfakeReport = {
    id: `df-${Date.now().toString(36)}`,
    imageUrl: input.imageUrl,
    resolvedUrl: input.resolvedUrl,
    submittedAt: new Date().toISOString(),
    assessment: input.assessment,
    narrativeDelta: input.narrativeDelta,
  };

  reports.unshift(report);
  return report;
}

export function getDeepfakeReports(): DeepfakeReport[] {
  return [...reports];
}

export function buildMapClaimText(
  assessment: DeepfakeAssessment,
  narrativeDelta?: string,
): string {
  const label = formatManipulationLabel(assessment.manipulationType);
  const pct = Math.round(assessment.deepfakeRiskScore * 100);
  const narrative = narrativeDelta ? ` ${narrativeDelta}` : "";
  return `Synthetic media alert (${pct}% risk): ${label}.${narrative}`.trim();
}
