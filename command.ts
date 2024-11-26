// Declare the types for our custom global properties
declare global {
  var PLATFORM_NODE: boolean;
  var PLATFORM_NODE_JEST: boolean;
  var executeCommand: (commandLine: string) => Promise<string | void>;
}

// Define platform constants before imports
globalThis.PLATFORM_NODE = true;
globalThis.PLATFORM_NODE_JEST = false;

import { Scraper } from './src/scraper';
import { Tweet } from './src/tweets';
import { Profile } from './src/profile';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Rate limiting helper
const RATE_LIMIT_DELAY = 2000;
async function executeWithRateLimit(fn: () => Promise<any>) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
    return fn();
}

// Single scraper instance and state
const scraper = new Scraper();
let isLoggedIn = false;
let lastCommandTime = 0;

// Helper function for cookie management
async function loadCookies() {
    try {
        const cookiesPath = path.resolve(__dirname, 'cookies.json');
        if (fs.existsSync(cookiesPath)) {
            const cookiesData = fs.readFileSync(cookiesPath, 'utf8');
            const cookiesArray = JSON.parse(cookiesData);
            const cookieStrings = cookiesArray.map((cookie: any) => 
                `${cookie.key}=${cookie.value}; Domain=${cookie.domain}; Path=${cookie.path}; ${
                    cookie.secure ? 'Secure' : ''
                }; ${cookie.httpOnly ? 'HttpOnly' : ''}; SameSite=${
                    cookie.sameSite || 'Lax'
                }`
            );
            await scraper.setCookies(cookieStrings);
            return true;
        }
    } catch (error) {
        console.error('Error loading cookies:', error);
    }
    return false;
}

// Command execution function
export async function executeCommand(commandLine: string): Promise<string | void> {
    try {
        // Rate limiting
        const now = Date.now();
        if (now - lastCommandTime < RATE_LIMIT_DELAY) {
            await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - (now - lastCommandTime)));
        }
        lastCommandTime = Date.now();

        const [command, ...args] = commandLine.trim().toLowerCase().split(' ');

        switch (command) {
            case 'help':
                return `
Available Commands:
------------------
help                    Show this help message
clear                   Clear the terminal
status                  Show system status
version                 Show version information

Twitter Commands:
---------------
login                   Login to Twitter using env credentials
tweet <message>         Send a tweet (requires login)
reply <tweetId> <msg>   Reply to a tweet
search <query>          Search tweets
follow <username>       Follow a user
profile <username>      Show user profile
trends                  Show current trending topics

Note: Commands are rate-limited to prevent Twitter API restrictions.
`;

            case 'login':
                if (isLoggedIn) {
                    return 'Already logged in!';
                }
                return executeWithRateLimit(async () => {
                    if (await loadCookies()) {
                        isLoggedIn = true;
                        return '✅ Successfully logged in using saved cookies';
                    }
                    await scraper.login(
                        process.env.TWITTER_USERNAME!,
                        process.env.TWITTER_PASSWORD!,
                        process.env.TWITTER_EMAIL
                    );
                    isLoggedIn = true;
                    return '✅ Successfully logged in to Twitter';
                });

            case 'tweet':
                if (!isLoggedIn) {
                    throw new Error('Please login first using the "login" command');
                }
                if (args.length === 0) {
                    return 'Usage: tweet <message>';
                }
                return executeWithRateLimit(async () => {
                    const message = args.join(' ');
                    await scraper.sendTweet(message);
                    return `✅ Tweet sent: ${message}`;
                });

            case 'search':
                return executeWithRateLimit(async () => {
                    if (args.length === 0) {
                        return 'Usage: search <query>';
                    }
                    const query = args.join(' ');
                    const tweets = scraper.searchTweets(query, 5);
                    let result = `Search results for "${query}":\n`;
                    let count = 0;
                    for await (const tweet of tweets) {
                        result += `\n[${tweet.timeParsed}] @${tweet.username}: ${tweet.text}\n`;
                        result += `♥️ ${tweet.likes} 🔁 ${tweet.retweets}\n`;
                        count++;
                        if (count >= 5) break;
                    }
                    return result;
                });

            case 'profile':
                return executeWithRateLimit(async () => {
                    if (args.length === 0) {
                        return 'Usage: profile <username>';
                    }
                    const username = args[0];
                    const profile = await scraper.getProfile(username);
                    return `
Profile: @${profile.username}
Name: ${profile.name}
Location: ${profile.location || 'Not specified'}
Stats: ${profile.tweetsCount} tweets • ${profile.followingCount} following • ${profile.followersCount} followers
Verified: ${profile.isVerified ? 'Yes' : 'No'}
`;
                });

            case 'trends':
                return executeWithRateLimit(async () => {
                    const trends = await scraper.getTrends();
                    return 'Current Trending Topics:\n' + trends.map((t, i) => `${i + 1}. ${t}`).join('\n');
                });

            case 'clear':
                return 'clear';

            case 'status':
                return `System Status: ${isLoggedIn ? '🟢 Logged in' : '🔴 Not logged in'}`;

            case 'version':
                return 'Terminal v1.0.0 | Twitter Integration Enabled';

            default:
                throw new Error(`Unknown command: ${command}`);
        }
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Command failed: ${error.message}`);
        }
        throw new Error('An unexpected error occurred');
    }
}
