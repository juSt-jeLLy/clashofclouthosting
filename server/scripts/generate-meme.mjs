import { OrbisKeyDidAuth } from "@useorbis/db-sdk/auth";
import { writeFileSync, readFileSync } from "fs";
import { join } from "path";
import fetch from "node-fetch";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { config } from "dotenv";
const __dirname = new URL(".", import.meta.url).pathname;
const path = join(__dirname, "..", "..", ".env");

config({
  path: path,
});

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.on(Events.ClientReady, async (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
  run();
});

client.login(process.env.DISCORD_BOT_TOKEN);

const memes = [{ messageId: "1335119971625336862" }];

const run = async () => {
  console.log("hello internet");

  const meme = await getMeme();
  const messageId = await spreadMeme(meme);

  const winner = await getWinner();
  console.log("the winner is", winner);

  await client.destroy();
};

async function spreadMeme(message) {
  const messageId = await postOnDiscord(message);
  return messageId;
}

async function getWinner() {
  const winner = await memes.sort(
    (a, b) => checkDiscord(a.messageId) - checkDiscord(b.messageId)
  )[0];
  return { ...winner, discordCount: await checkDiscord(winner.messageId) };
}

async function checkDiscord(messageId) {
  const guild = await client.guilds.fetch("1335110076297641984");
  const channel = await guild.channels.fetch("1335110126574633000");
  const message = await channel.messages.fetch(messageId);

  const count = message.reactions
    .valueOf()
    .map((reaction) => reaction.count)
    .reduce((a, b) => a + b);
  console.log(count);

  return count;
}

async function postOnDiscord(message) {
  const guild = await client.guilds.fetch("1335110076297641984");
  const channel = await guild.channels.fetch("1335110126574633000");
  const messageSent = await channel.send(message);
  console.log("meme sent", messageSent.id);
  return messageSent.id;
}

async function getMeme() {
  try {
    const url = "http://54.242.67.76:3000/v1/chat/completions";
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          {
            role: "user",
            content:
              "Please generate a short meme about web3. I want only the meme, no other word. Don't describe images. It should only be a text-meme.",
          },
        ],
      }),
    };

    const response = await fetch(url, options);
    const data = await response.json();
    console.log(data);
    const meme_message = data.choices[0].message.content;
    console.log(meme_message);
    return meme_message;
  } catch (error) {
    console.error("Error:", error);
  }
}
