// Declare the types for our custom global properties
declare global {
  var PLATFORM_NODE: boolean;
  var PLATFORM_NODE_JEST: boolean;
  var executeCommand: (commandLine: string) => Promise<string | void>;
}

// Define platform constants before imports
globalThis.PLATFORM_NODE = typeof process !== 'undefined' && (
  (process.versions?.node != null) ||
  (process.versions?.bun != null)
);
globalThis.PLATFORM_NODE_JEST = false;

import { Scraper } from './src/scraper';
import { Tweet } from './src/tweets';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a new Scraper instance
const scraper = new Scraper();
let isLoggedIn = false;

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

// Function to get media type based on file extension
function getMediaType(ext: string): string {
    switch (ext) {
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.png':
            return 'image/png';
        case '.gif':
            return 'image/gif';
        case '.mp4':
            return 'video/mp4';
        default:
            return 'application/octet-stream';
    }
}

// Function to send a tweet with optional media files
async function sendTweetCommand(
    text: string,
    mediaFiles?: string[],
    replyToTweetId?: string
): Promise<string | null> {
    try {
        let mediaData;

        if (mediaFiles && mediaFiles.length > 0) {
            mediaData = await Promise.all(
                mediaFiles.map(async (filePath) => {
                    const absolutePath = path.resolve(__dirname, filePath);
                    const buffer = await fs.promises.readFile(absolutePath);
                    const ext = path.extname(filePath).toLowerCase();
                    const mediaType = getMediaType(ext);
                    return { data: buffer, mediaType };
                })
            );
        }

        const response = await scraper.sendTweet(text, replyToTweetId, mediaData);
        const responseData = await response.json();
        const tweetId = responseData?.data?.create_tweet?.tweet_results?.result?.rest_id;

        if (tweetId) {
            return tweetId;
        }
        return null;
    } catch (error) {
        console.error('Error sending tweet:', error);
        return null;
    }
}

// Function to get replies to a specific tweet
async function getRepliesToTweet(tweetId: string): Promise<Tweet[]> {
    const replies: Tweet[] = [];
    try {
        const query = `to:${process.env.TWITTER_USERNAME} conversation_id:${tweetId}`;
        const maxReplies = 100;
        const searchMode = 1; // SearchMode.Latest

        for await (const tweet of scraper.searchTweets(query, maxReplies, searchMode)) {
            if (tweet.inReplyToStatusId === tweetId) {
                replies.push(tweet);
            }
        }
    } catch (error) {
        console.error('Error fetching replies:', error);
    }
    return replies;
}

// Command execution function
export async function executeCommand(commandLine: string): Promise<string | void> {
    const args = commandLine.trim().split(' ');
    const command = args.shift()?.toLowerCase();

    if (!command) return;

    switch (command) {
        case 'help':
            return `
Available Commands:
------------------
login                     - Login to Twitter and save cookies
send-tweet <text> [mediaFiles...]  - Send a tweet with optional media
get-tweets <username>     - Get recent tweets from user
get-replies <tweetId>     - Get replies to a tweet
reply-to-tweet <tweetId> <text>    - Reply to a tweet
get-mentions              - Get recent mentions
send-quote-tweet <tweetId> "<text>" [mediaFiles...]  - Quote tweet
get-photos <tweetId>      - Get photos from a tweet
like <tweetId>            - Like a tweet
retweet <tweetId>         - Retweet a tweet
follow <username>         - Follow a user
clear                     - Clear the terminal
help                      - Show this help message
`;

        case 'login':
            try {
                if (isLoggedIn) {
                    return 'Already logged in!';
                }
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
            } catch (error) {
                throw new Error('Failed to login: ' + (error as Error).message);
            }

        case 'status':
            return `
System Status:
-------------
Logged in: ${isLoggedIn ? '✅' : '❌'}
Username: ${process.env.TWITTER_USERNAME || 'Not set'}
API Status: ${scraper ? '🟢 Ready' : '🔴 Not Ready'}
`;

        case 'version':
            // Read package.json for version info
            try {
                const packageJson = JSON.parse(
                    fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8')
                );
                return `
Version Information:
------------------
Version: ${packageJson.version}
Node: ${process.version}
Platform: ${process.platform}
`;
            } catch (error) {
                return 'Version information unavailable';
            }

        case 'clear':
            // Clear terminal - implementation depends on platform
            if (process.stdout.isTTY) {
                process.stdout.write('\x1Bc');
            }
            return;

        default:
            return `Unknown command: ${command}\nType 'help' for available commands`;
    }
}
