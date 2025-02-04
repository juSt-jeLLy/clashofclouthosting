import { OrbisKeyDidAuth } from "@useorbis/db-sdk/auth";
import { writeFileSync, readFileSync } from "fs";
import { join } from "path";
import fetch from "node-fetch";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { PinataSDK } from "pinata-web3";
import { Scraper } from "agent-twitter-client";
import { config } from "dotenv";
import fs from "fs/promises";
import { ethers } from "ethers";

const __dirname = new URL(".", import.meta.url).pathname;
const path = join(__dirname, "..", "..", ".env");

config({
  path: path,
});

const providerUrl = "https://testnet.evm.nodes.onflow.org";
const contractAddress = "0x56bAD49451a06c19b1b9d4dD7168Ae9abf7ffca7";
import contractABI from "./abi.json" with { type: "json" };

const NUMBER_OF_MEMES_GENERATED = 1;

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: "gray-tough-gull-222.mypinata.cloud",
});

const twitterCookiesPath = join(__dirname, "..", "..", "twitter-cookies.json");

const twitter_token = process.env.TWITTER_ACCESS_TOKEN_SECRET;
const endpointUrl = "https://api.twitter.com/2/tweets/search/recent";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.on(Events.ClientReady, async (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
  //run();
  fetchMemes();
});

client.login(process.env.DISCORD_BOT_TOKEN);

const run = async () => {
  console.log("hello internet");

  for (let i = 0; i < NUMBER_OF_MEMES_GENERATED; i++) {
    const meme_json = await getMeme();
    const { text_meme, image } = JSON.parse(meme_json);
    const gifUrl = await getGif(image);
    const [twitterUrl, messageUrl] = await spreadMeme(text_meme, gifUrl);
    const cid = await uploadMeme(text_meme, messageUrl, twitterUrl, gifUrl);
    publishMeme(cid);
  }

  //const winner = await getWinner();
  //console.log("the winner is", winner);

  await client.destroy();
};

async function fetchMemes() {
  const provider = new ethers.JsonRpcProvider(providerUrl);

  const contract = new ethers.Contract(contractAddress, contractABI, provider);

  const filter = contract.filters.MemeSubmitted();
  const events = await contract.queryFilter(filter);

  const memes = events.map((event) => ({
    cid: event.args.cid.toString(),
    address: event.args[1],
  }));

  console.log(memes);

  return memes;
}

async function publishResult() {
  const provider = new ethers.JsonRpcProvider(providerUrl);
  const wallet = new ethers.Wallet(process.env.privateKey, provider);
  const contract = new ethers.Contract(contractAddress, contractABI, wallet);

  const winner = await getWinner();

  contract.declareWinner(winner.cid);
}

async function publishMeme(cid) {
  const provider = new ethers.JsonRpcProvider(providerUrl);
  const wallet = new ethers.Wallet(process.env.privateKey, provider);
  const contract = new ethers.Contract(contractAddress, contractABI, wallet);

  console.log("submitting", cid);

  contract.submitMeme(cid, "0x5889D465C61136584793A50D18ae7C4ad98e152f");
}

// pinata cid to object
async function getDataMemes(memes) {
  return await Promise.all(
    memes.map(async (meme) => {
      const { cid } = meme;
      const data = await pinata.gateways.get(cid);
      return { ...data.data, cid: cid };
    })
  );
}

async function spreadMeme(message, gif_url) {
  // discord
  const [messageId, messageUrl] = await postOnDiscord(message, gif_url);
  const twitterUrl = await postOnTwitter(message, gif_url);
  return [twitterUrl, messageUrl];
}

async function getWinner() {
  const link_memes = await fetchMemes();
  const memes = await getDataMemes(link_memes);
  console.log(memes);
  const winner = await memes.sort(
    (a, b) =>
      checkDiscord(a.discord_message_url) - checkDiscord(b.discord_message_url)
  )[0];
  return {
    ...winner,
    discordCount: await checkDiscord(winner.discord_message_url),
  };
}

async function checkDiscord(discord_message_url) {
  const regex = /https:\/\/discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/;
  const match = discord_message_url.match(regex);
  if (!match) throw new Error("link not valid");

  const [, guildId, channelId, messageId] = match;

  const guild = await client.guilds.fetch(guildId);
  const channel = await guild.channels.fetch(channelId);
  const message = await channel.messages.fetch(messageId);

  const count = message.reactions
    .valueOf()
    .map((reaction) => reaction.count)
    .reduce((a, b) => a + b, 0);
  console.log(count);

  return count;
}

async function postOnDiscord(message, gif_url) {
  const guild = await client.guilds.fetch("1335110076297641984");
  const channel = await guild.channels.fetch("1335110126574633000");
  const messageSent = await channel.send({
    content: message,
    files: [gif_url],
  });
  console.log("meme sent", messageSent.id);
  return [messageSent.id, messageSent.url];
}

async function postOnTwitter(message, gifUrl) {
  try {
    const cookieJson = await fs.readFile(twitterCookiesPath, "utf-8");
    const cookiesJSON = JSON.parse(cookieJson);
    const scraper = new Scraper();
    await scraper.setCookies(cookiesJSON.cookies);
    console.log("[TwitterService] Starting service with existing cookies...");
    const connected = await scraper.isLoggedIn();
    if (!connected) {
      throw new Error("Failed to login with existing cookies.");
    }
    const me = await scraper.me();
    console.log(me);
    const username = me.username;

    const response = await fetch(gifUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await scraper.sendTweet(message, undefined, [
      { data: buffer, mediaType: "image/gif" },
    ]);
    const latestTweet = await scraper.getLatestTweet(username);
    console.log(latestTweet);
    return latestTweet.permanentUrl;
  } catch (error) {
    console.log(error);
  }
}

async function getMeme() {
  try {
    const url = "http://3.81.38.203:3000/v1/chat/completions";
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are an AI agent creating memes." },
          {
            role: "user",
            content:
              'Please generate a short meme about web3. I want only the meme, no other word. It should only be a text-meme. You should also include words so I could search these words on tenor and get an image related to the text_meme. Keep in mind that I will always only take the first image that I find.  I will then add the text on the meme. The answer format should be a JSON like this: {"text_meme":{{the text_meme}}, "image": {{image i should search on tenor}}. The format is VERY very important, please respect it. Just remplate text between {{}}.',
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

// JSON to Blob
function encodeJSON(object) {
  const str = JSON.stringify(object);
  const bytes = new TextEncoder().encode(str);
  return new Blob([bytes], {
    type: "application/json;charset=utf-8",
  });
}

async function uploadMeme(meme, messageUrl, twitterUrl, gifUrl) {
  try {
    const auth = await pinata.testAuthentication();
    const files = await pinata.listFiles();

    const object = {
      meme: meme,
      discord_message_url: messageUrl,
      twitter_url: twitterUrl,
      gif_url: gifUrl,
    };
    const blob = encodeJSON(object);
    const file = new File([blob], meme, { type: "application/json" });
    const upload = await pinata.upload.file(file);
    console.log(upload);
    return upload.IpfsHash;
  } catch (error) {
    console.log(error);
  }
}

async function getGif(search_terms) {
  const url =
    "https://tenor.googleapis.com/v2/search?q=" +
    search_terms +
    "&key=" +
    process.env.TENOR_API_KEY +
    "&client_key=my_test_app&limit=1";

  try {
    const response = await fetch(url);
    const data = await response.json();
    const gif = data.results[0].media_formats.gif.url;
    console.log(gif);
    return gif;
  } catch (error) {
    console.error("Error:", error);
  }
}
