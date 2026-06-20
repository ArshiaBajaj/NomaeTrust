import { EmbedBuilder } from "discord.js";
import type { CompactExtensionResult } from "../api.js";

const OUTCOME_LABEL: Record<CompactExtensionResult["outcome"], string> = {
  verified: "Supported by sources",
  not_verified: "Refuted or misleading",
  inconclusive: "Needs more verification",
};

const TIER_COLOR: Record<string, number> = {
  A: 0x4ade80,
  B: 0x38bdf8,
  C: 0xfbbf24,
  D: 0xf87171,
};

export function buildVerifyEmbed(result: CompactExtensionResult): EmbedBuilder {
  const topFc = result.factChecks[0];
  const outletLine = result.outlet
    ? `${result.outlet.name} · Tier ${result.outlet.tier} (${result.outlet.tierLabel})`
    : "Publisher not in registry — verify original source";

  const fields = [
    {
      name: "Claim",
      value: result.claim.slice(0, 1024),
    },
    {
      name: "Outlet context",
      value: outletLine,
    },
    {
      name: "AI suggestion",
      value: `${OUTCOME_LABEL[result.outcome]} · ${result.confidenceBand} confidence`,
    },
  ];

  if (topFc) {
    fields.push({
      name: "Fact-check",
      value: `${topFc.publisher}: **${topFc.rating}**`,
    });
  }

  if (result.actionSteps.length > 0) {
    fields.push({
      name: "What to do next",
      value: result.actionSteps.map((s, i) => `${i + 1}. ${s}`).join("\n").slice(0, 1024),
    });
  }

  const color = result.outlet ? (TIER_COLOR[result.outlet.tier] ?? 0x2563eb) : 0x2563eb;

  return new EmbedBuilder()
    .setTitle("NomaeTrust Action Card")
    .setDescription(result.actionSummary.slice(0, 4096))
    .setColor(color)
    .addFields(fields)
    .setURL(result.cardUrl)
    .setFooter({
      text: result.demoMode
        ? "Demo fact-check data · AI suggestion — not a verdict"
        : "AI suggestion — not a verdict. Open full card for sources.",
    });
}
