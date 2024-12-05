require('dotenv').config();
const { chromium } = require('playwright');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

// Load environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const users = JSON.parse(process.env.USER_DATA || '[]');
const urls = JSON.parse(process.env.URLS || '[]');

if (!TELEGRAM_BOT_TOKEN) {
    console.error("TELEGRAM_BOT_TOKEN is missing. Please check your .env file.");
    process.exit(1);
}
if (users.length === 0) {
    console.warn("No users found in USER_DATA. Check your .env file.");
}
if (urls.length === 0) {
    console.warn("No URLs found in URLS. Check your .env file.");
}

// Initialize the Telegram bot
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

// Function to send messages to Telegram
const sendToTelegram = async (chatId, message) => {
    try {
        await bot.sendMessage(chatId, message);
        console.log(`Message sent to ${chatId}`);
    } catch (error) {
        console.error(`Error sending message to ${chatId}:`, error);
    }
};

// Function to fetch new apartment listings from Yad2
const fetchYad2Listings = async (page, url) => {
    try {
        console.log(`Navigating to: ${url}`);
        const response = await page.goto(url);
        if (response) {
            console.log(`Response status: ${response.status()} for URL: ${url}`);
        } else {
            console.log(`No response received, possible navigation issue.`);
        }

        const noResultsSelector = '.no-feed-results-with-alert_title__HVFR0';
        const hasNoResults = await page.$(noResultsSelector);

        if (hasNoResults) {
            console.log('No results found for this URL, skipping to the next URL.');
            return [];
        }

        await page.waitForSelector('#__next > div > main > div.map-page-layout_feedBox__TgEg3 > div > div > div.container_container__w5yC0.map-feed_feedListContainer__KX5dg > ul', { timeout: 60000 });

        console.log('Fetching listings...');
        const listings = await page.$$eval('#__next > div > main > div.map-page-layout_feedBox__TgEg3 > div > div > div.container_container__w5yC0.map-feed_feedListContainer__KX5dg > ul > li', (items) => {
            return items.map(item => {
                const title = item.querySelector('.item-data-content_heading__tphH4')?.innerText || 'No title';
                const price = item.querySelector('span.price_price__xQt90')?.innerText || 'No price';
                const linkElement = item.querySelector('a');
                const link = linkElement ? linkElement.href : 'No link';
                return { title, price, link };
            });
        });

        return listings;
    } catch (error) {
        console.error('Error fetching listings:', error);
        return [];
    }
};

// Function to load the last checked listings from a file
const loadLastCheckedListings = (filePath) => {
    console.log(`Looking for file at: ${filePath}`);
    if (!fs.existsSync(filePath)) {
        console.error(`File not found at: ${filePath}`);
    } else {
        console.log('File found!');
    }

    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    }
    return {};
};

// Function to save the last checked listings to a file
const saveLastCheckedListings = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

// Main function to periodically check for new listings
const main = async () => {
    const filePath = 'lastCheckedListings.json';

    console.log('Launching browser...');
    const browser = await chromium.launch({ headless: false }); // Run in headful mode for debugging
    const context = await browser.newContext();
    const page = await context.newPage();

    let lastCheckedListings = loadLastCheckedListings(filePath);

    while (true) {
        for (const url of urls) {
            const newListings = await fetchYad2Listings(page, url);
            for (const listing of newListings) {
                const listingKey = `${listing.title}-${listing.price}`;
                if (!lastCheckedListings[listingKey]) {
                    const message = `New listing on Yad2:\n\nTitle: ${listing.title}\nPrice: ${listing.price}\nLink: ${listing.link}`;
                    users.forEach(user => {
                        if (listing.title !== 'No title') {
                            sendToTelegram(user.id, message);
                        }
                    });
                    lastCheckedListings[listingKey] = true;
                }
            }
        }
        saveLastCheckedListings(filePath, lastCheckedListings);
        console.log('LAST DATA:');
        console.log(lastCheckedListings);
        console.log('------------------------------------------------------------------');
        console.log('Waiting for 1 minute...');
        await new Promise(resolve => setTimeout(resolve, 60000)); // Wait for 1 minute
    }

    await browser.close();
};

main();
