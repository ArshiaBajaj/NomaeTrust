import type {
  AudioAnalysisResult,
  EvidenceCard as EvidenceCardType,
} from "../types";

function formatReportText(
  result: AudioAnalysisResult,
  card: EvidenceCardType,
): string {
  const lines = [
    "═══════════════════════════════════════════",
    "  NOMAETRUST — VOICE VERIFICATION REPORT",
    "  OFFICIAL INTELLIGENCE EVIDENCE CARD",
    "═══════════════════════════════════════════",
    "",
    `Report ID:     ${card.id}`,
    `Generated:     ${new Date(card.verifiedAt).toLocaleString()}`,
    `Classification: UNVERIFIED — FOR OFFICIAL USE`,
    "",
    "── VERIFICATION STATUS ──",
    `Status:        ${card.statusLabel ?? card.status}`,
    `Confidence:    ${Math.round(card.confidence * 100)}%`,
    `Risk Level:    ${card.riskLevel.toUpperCase()}`,
    "",
    "── EXTRACTED CLAIM ──",
    card.claim,
    "",
    "── TRANSCRIPT ──",
    `"${result.transcript}"`,
    "",
    "── ANALYSIS SUMMARY ──",
    card.summary,
    "",
  ];

  if (result.regionalIntelligence) {
    const intel = result.regionalIntelligence;
    lines.push("── REGIONAL INTELLIGENCE ──");
    lines.push(`Category:      ${intel.claimCategory}`);
    lines.push(`Domain:        ${intel.sourceCategory}`);
    lines.push(`Locations:     ${intel.locations.join(", ")}`);
    lines.push("");
    lines.push("── RECOMMENDED VERIFICATION SOURCES ──");
    for (const source of intel.recommendedSources) {
      lines.push(`• ${source.name}`);
      lines.push(`  ${source.url}`);
      lines.push(`  ${source.description}`);
      lines.push("");
    }
  }

  lines.push("── DATA SOURCES ──");
  for (const source of card.sources) {
    lines.push(`• ${source}`);
  }

  if (card.demoMode) {
    lines.push("");
    lines.push("[ DEMO MODE — Sample data for demonstration purposes ]");
  }

  lines.push("");
  lines.push("═══════════════════════════════════════════");
  lines.push("NomaeTrust · Verify People. Verify Information.");
  lines.push("Before Harm Spreads.");
  lines.push("═══════════════════════════════════════════");

  return lines.join("\n");
}

export async function copyReport(
  result: AudioAnalysisResult,
  card: EvidenceCardType,
): Promise<boolean> {
  const text = formatReportText(result, card);
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export async function downloadPdfReport(
  result: AudioAnalysisResult,
  card: EvidenceCardType,
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 48;
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = margin;

  const addLine = (text: string, size = 10, style: "normal" | "bold" = "normal") => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    if (y > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
    const wrapped = doc.splitTextToSize(text, pageWidth - margin * 2);
    doc.text(wrapped, margin, y);
    y += wrapped.length * (size + 4);
  };

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 72, "F");
  doc.setTextColor(255, 255, 255);
  addLine("NOMAETRUST", 16, "bold");
  doc.setTextColor(148, 163, 184);
  addLine("Voice Verification Intelligence Report", 11);
  y += 8;
  doc.setTextColor(30, 41, 59);

  addLine(`Report ID: ${card.id}`, 9);
  addLine(`Generated: ${new Date(card.verifiedAt).toLocaleString()}`, 9);
  y += 6;

  addLine("VERIFICATION STATUS", 11, "bold");
  addLine(`Status: ${card.statusLabel ?? card.status}`, 10);
  addLine(`Confidence: ${Math.round(card.confidence * 100)}%`, 10);
  addLine(`Risk Level: ${card.riskLevel.toUpperCase()}`, 10);
  y += 6;

  addLine("EXTRACTED CLAIM", 11, "bold");
  addLine(card.claim, 10);
  y += 6;

  addLine("TRANSCRIPT", 11, "bold");
  addLine(`"${result.transcript}"`, 10);
  y += 6;

  addLine("ANALYSIS SUMMARY", 11, "bold");
  addLine(card.summary, 10);
  y += 6;

  if (result.regionalIntelligence) {
    const intel = result.regionalIntelligence;
    addLine("REGIONAL INTELLIGENCE", 11, "bold");
    addLine(`Category: ${intel.claimCategory}`, 10);
    addLine(`Domain: ${intel.sourceCategory}`, 10);
    addLine(`Locations: ${intel.locations.join(", ")}`, 10);
    y += 4;
    addLine("RECOMMENDED VERIFICATION SOURCES", 11, "bold");
    for (const source of intel.recommendedSources) {
      addLine(`• ${source.name}`, 10, "bold");
      addLine(source.url, 9);
      addLine(source.description, 9);
    }
  }

  if (card.demoMode) {
    y += 4;
    addLine("[ DEMO MODE — Sample data for demonstration ]", 9);
  }

  doc.save(`NomaeTrust-Report-${card.id}.pdf`);
}

export async function shareReport(
  result: AudioAnalysisResult,
  card: EvidenceCardType,
): Promise<"shared" | "copied" | "failed"> {
  const text = formatReportText(result, card);
  const title = "NomaeTrust Evidence Card";

  if (navigator.share) {
    try {
      await navigator.share({ title, text });
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return "failed";
      }
    }
  }

  const copied = await copyReport(result, card);
  return copied ? "copied" : "failed";
}

export function computeHarmRiskScore(result: AudioAnalysisResult): number {
  const confidencePct = result.confidence * 100;
  const status = result.status.toLowerCase();

  if (
    status.includes("needs verification") ||
    status === "unverified" ||
    status === "disputed" ||
    status === "pending"
  ) {
    return Math.min(99, Math.round(confidencePct * 0.92 + 8));
  }

  return Math.max(5, Math.round(100 - confidencePct));
}
