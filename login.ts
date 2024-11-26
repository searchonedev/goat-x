import { Scraper } from './src/scraper';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function login() {
    try {
        console.log('Starting login process...');
        const scraper = new Scraper();
        
        // Attempt login
        await scraper.login(
            process.env.TWITTER_USERNAME!,
            process.env.TWITTER_PASSWORD!,
            process.env.TWITTER_EMAIL
        );

        // Get cookies after successful login
        const cookies = await scraper.getCookies();
        
        // Save cookies to file
        fs.writeFileSync(
            path.join(__dirname, 'cookies.json'),
            JSON.stringify(cookies, null, 2)
        );
        
        console.log('Login successful! Cookies saved to cookies.json');
    } catch (error) {
        console.error('Login failed:', error);
    }
}

// Run the login function
login();
