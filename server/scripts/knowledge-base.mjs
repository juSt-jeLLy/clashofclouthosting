import { join } from "path";
import fetch from "node-fetch";
import { config } from "dotenv";
import { Scraper } from "agent-twitter-client";
import fs from "fs/promises";

const __dirname = new URL(".", import.meta.url).pathname;
const path = join(__dirname, "..", "..", ".env");

config({
  path: path,
});

// to be edited
const list = ["VitalikButerin", "BenArmstrongsX", "punk6529"];

const twitterCookiesPath = join(__dirname, "..", "..", "twitter-cookies.json");

const twitter_token = process.env.TWITTER_ACCESS_TOKEN_SECRET;
const endpointUrl = "https://api.twitter.com/2/tweets/search/recent";

async function getLastTweets() {
  const response = await getRequest();
}

async function getRequest() {
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
    for (const influencer of list) {
      const tweets = await scraper.getTweets(influencer, 100);
      for await (const tweet of tweets) {
        if (tweet.text) console.log("item", tweet.text);
        fs.appendFile("./tweets.txt", tweet.text + "\n");
      }
    }
  } catch (error) {
    console.log(error);
  }
}

(() => getLastTweets())();
