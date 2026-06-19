import type {
  AudioAnalysisResult,
  EvidenceCard as EvidenceCardType,
} from "../types";
import { resolveVerificationConfidence, ASSESSMENT_CONFIDENCE_DISCLAIMER } from "./verificationConfidence";

function formatVerificationConfidenceBlock(card: EvidenceCardType): string[] {
  const verification = resolveVerificationConfidence(card);
  return [
    "── VERIFICATION RESULT ──",
    verification.outcomeLabel,
    verification.headline,
    ASSESSMENT_CONFIDENCE_DISCLAIMER,
    verification.evidenceStatement,
    verification.summary,
    "",
  ];
}

function formatReportText(
  result: AudioAnalysisResult,
  card: EvidenceCardType,
): string {
  const lines = [
    "═══════════════════════════════════════════",
    "  NOMAETRUST — EVIDENCE CARD",
    "  Community Truth & Call Verification",
    "═══════════════════════════════════════════",
    "",
    `Report ID:     ${card.id}`,
    `Generated:     ${new Date(card.verifiedAt).toLocaleString()}`,
    "",
    ...formatVerificationConfidenceBlock(card),
    "── EXTRACTED CLAIM ──",
    card.claim,
    "",
    "── SUMMARY ──",
    card.summary,
    "",
  ];

  if (card.recommendation) {
    lines.push("── RECOMMENDATION ──", card.recommendation, "");
  }

  if (card.actionSteps?.length) {
    lines.push("── ACTION STEPS ──");
    for (const step of card.actionSteps) {
      lines.push(`☐ ${step}`);
    }
    lines.push("");
  }

  if (card.doNotDo?.length) {
    lines.push("── DO NOT DO YET ──");
    for (const item of card.doNotDo) {
      lines.push(`✕ ${item}`);
    }
    lines.push("");
  }

  if (card.primaryActionUrl) {
    lines.push("── PRIMARY ACTION ──", `${card.primaryActionLabel ?? "Open"}: ${card.primaryActionUrl}`, "");
  }

  if (card.sourceReferences?.length) {
    lines.push("── SOURCES ──");
    for (const s of card.sourceReferences) {
      lines.push(`• ${s.title} (${s.date})`);
      lines.push(`  ${s.url}`);
      lines.push(`  ${s.snippet}`);
    }
    lines.push("");
  }

  if (card.translations) {
    lines.push("── MULTILINGUAL (for WhatsApp sharing) ──");
    lines.push(`Somali: ${card.translations.somali}`);
    lines.push(`Spanish: ${card.translations.spanish}`);
    lines.push("");
  }

  lines.push("── TRANSCRIPT ──", `"${result.transcript}"`, "");
  lines.push("NomaeTrust · Verify before harm spreads.");
  return lines.join("\n");
}

export function formatWhatsAppEvidence(card: EvidenceCardType): string {
  const verification = resolveVerificationConfidence(card);
  const sources =
    card.sourceReferences?.slice(0, 3).map((s) => `• ${s.title}: ${s.url}`).join("\n") ??
    card.sources.map((s) => `• ${s}`).join("\n");

  const actionSteps = card.actionSteps?.map((s) => `☐ ${s}`).join("\n") ?? "";
  const avoid = card.doNotDo?.map((s) => `✕ ${s}`).join("\n") ?? "";

  const lines = [
    "🛡️ *NomaeTrust Action Card*",
    "",
    `*${verification.outcomeLabel}*`,
    verification.headline,
    ASSESSMENT_CONFIDENCE_DISCLAIMER,
    verification.evidenceStatement,
    "",
    `*Claim:* ${card.claim}`,
    "",
  ];

  if (card.plainLanguageSummary) {
    lines.push(card.plainLanguageSummary, "");
  } else {
    lines.push(card.summary, "");
  }

  if (actionSteps) {
    lines.push("*Do this now:*", actionSteps, "");
  }

  if (avoid) {
    lines.push("*Do not do yet:*", avoid, "");
  }

  lines.push(
    card.recommendation ? `*Next step:* ${card.recommendation}` : "",
    "",
    "*Sources:*",
    sources,
  );

  if (card.primaryActionUrl) {
    lines.push("", `*${card.primaryActionLabel ?? "Official source"}:* ${card.primaryActionUrl}`);
  }

  if (card.translations) {
    lines.push("", "*Somali:*", card.translations.somali);
    lines.push("", "*Español:*", card.translations.spanish);
  }

  lines.push("", "_Verify important claims with official sources before acting._");
  return lines.filter(Boolean).join("\n");
}

export async function copyWhatsAppEvidence(card: EvidenceCardType): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(formatWhatsAppEvidence(card));
    return true;
  } catch {
    return false;
  }
}

export async function copyReport(
  result: AudioAnalysisResult,
  card: EvidenceCardType,
): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(formatReportText(result, card));
    return true;
  } catch {
    return false;
  }
}

export async function downloadPdfReport(
  _result: AudioAnalysisResult,
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

  addLine("NOMAETRUST EVIDENCE CARD", 16, "bold");
  addLine(`Report ID: ${card.id}`, 9);

  const verification = resolveVerificationConfidence(card);
  addLine("VERIFICATION RESULT", 11, "bold");
  addLine(verification.outcomeLabel, 12, "bold");
  addLine(verification.headline, 10, "bold");
  addLine(ASSESSMENT_CONFIDENCE_DISCLAIMER, 9);
  addLine(verification.evidenceStatement, 10);
  addLine(verification.summary, 9);

  addLine("CLAIM", 11, "bold");
  addLine(card.claim, 10);
  addLine("SUMMARY", 11, "bold");
  addLine(card.summary, 10);

  if (card.sourceReferences?.length) {
    addLine("SOURCES", 11, "bold");
    for (const s of card.sourceReferences) {
      addLine(`• ${s.title} — ${s.url}`, 9);
    }
  }

  doc.save(`NomaeTrust-Report-${card.id}.pdf`);
}

export async function shareReport(
  _result: AudioAnalysisResult,
  card: EvidenceCardType,
): Promise<"shared" | "copied" | "failed"> {
  const text = formatWhatsAppEvidence(card);
  if (navigator.share) {
    try {
      await navigator.share({ title: "NomaeTrust Evidence Card", text });
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return "failed";
    }
  }
  const copied = await copyWhatsAppEvidence(card);
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
