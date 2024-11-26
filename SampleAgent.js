import { Scraper } from './dist/node/esm/index.mjs';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const scraper = new Scraper();
  // Basic login (for reading tweets)
  await scraper.login(
    process.env.TWITTER_USERNAME,
    process.env.TWITTER_PASSWORD
  );
  console.log('Logged in successfully!');

  // Get tweets from Elon Musk
  console.log('Getting latest tweets from Elon Musk...');
  const tweets = scraper.getTweets('elonmusk', 5);
  for await (const tweet of tweets) {
    console.log('\n---Tweet---');
    console.log('Text:', tweet.text);
    console.log('Time:', tweet.timeParsed);
    console.log('Likes:', tweet.likes);
    console.log('Retweets:', tweet.retweets);
  }
}

main().catch(console.error);
