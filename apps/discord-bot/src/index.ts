import * as dotenv from "dotenv";
import { createDiscordClient } from "./client";
import { handleReady } from "./events/ready";
import { handleMessageCreate } from "./events/messageCreate";
import { handleChannelCreate } from "./events/channelCreate";
import { logError } from "./utils/logger";

dotenv.config();

const required = ["DISCORD_BOT_TOKEN", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
for (const key of required) {
  if (!process.env[key]) {
    logError(`Missing required env var: ${key}`);
    process.exit(1);
  }
}

const client = createDiscordClient();

client.once("ready", () => handleReady(client));
client.on("messageCreate", handleMessageCreate);
client.on("channelCreate", handleChannelCreate);

client.login(process.env.DISCORD_BOT_TOKEN);
