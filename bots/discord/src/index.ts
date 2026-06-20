import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  Events,
  GatewayIntentBits,
  Interaction,
  MessageFlags,
} from "discord.js";
import dotenv from "dotenv";
import { verifyWithNomaeTrust } from "./api.js";
import { buildVerifyEmbed } from "./embeds/actionCard.js";

dotenv.config();

const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  console.error("Set DISCORD_BOT_TOKEN in bots/discord/.env");
  process.exit(1);
}

const rateLimit = new Map<string, number[]>();
const MAX_PER_HOUR = 10;

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const hits = (rateLimit.get(userId) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= MAX_PER_HOUR) {
    rateLimit.set(userId, hits);
    return true;
  }
  hits.push(now);
  rateLimit.set(userId, hits);
  return false;
}

async function handleVerify(
  interaction: Interaction,
  text: string,
  url?: string,
) {
  if (!interaction.isRepliable()) return;

  const userId = interaction.user.id;
  if (isRateLimited(userId)) {
    await interaction.reply({
      content: "Rate limit reached (10 verifies/hour). Try again later.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (!text.trim() && !url?.trim()) {
    await interaction.reply({
      content: "Provide claim text or a URL to verify.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.deferReply();

  try {
    const result = await verifyWithNomaeTrust({
      text: text.trim(),
      url: url?.trim(),
      platform: "discord",
    });

    const embed = buildVerifyEmbed(result);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel("Open Action Card")
        .setStyle(ButtonStyle.Link)
        .setURL(result.cardUrl),
      new ButtonBuilder()
        .setLabel("Confusion Map")
        .setStyle(ButtonStyle.Link)
        .setURL(
          `${(process.env.FRONTEND_BASE_URL ?? "http://localhost:5173").replace(/\/$/, "")}/trust-map`,
        ),
    );

    await interaction.editReply({ embeds: [embed], components: [row] });
  } catch (err) {
    await interaction.editReply({
      content: `Verification failed: ${err instanceof Error ? err.message : "Unknown error"}`,
    });
  }
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (c) => {
  console.log(`NomaeTrust Discord bot ready as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand() && interaction.commandName === "verify") {
    const text = interaction.options.getString("text") ?? "";
    const url = interaction.options.getString("url") ?? undefined;
    await handleVerify(interaction, text, url);
    return;
  }

  if (
    interaction.isMessageContextMenuCommand() &&
    interaction.commandName === "Verify with NomaeTrust"
  ) {
    const msg = interaction.targetMessage;
    const text = msg.content?.trim() ?? "";
    const url = msg.embeds[0]?.url ?? undefined;
    await handleVerify(interaction, text || "Verify this shared message", url);
  }
});

client.login(token);
