import {
  ContextMenuCommandBuilder,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;

if (!token || !clientId) {
  console.error("Set DISCORD_BOT_TOKEN and DISCORD_CLIENT_ID in bots/discord/.env");
  process.exit(1);
}

const botToken = token;
const appClientId = clientId;

const commands = [
  new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Verify a claim with NomaeTrust Action Card")
    .addStringOption((opt) =>
      opt.setName("text").setDescription("Claim or headline to verify").setRequired(false),
    )
    .addStringOption((opt) =>
      opt.setName("url").setDescription("Source URL (optional)").setRequired(false),
    ),
  new ContextMenuCommandBuilder()
    .setName("Verify with NomaeTrust")
    .setType(3),
].map((c) => c.toJSON());

const rest = new REST({ version: "10" }).setToken(botToken);

async function main() {
  console.log("Registering Discord slash commands…");
  await rest.put(Routes.applicationCommands(appClientId), { body: commands });
  console.log("Commands registered.");
}

main().catch(console.error);
