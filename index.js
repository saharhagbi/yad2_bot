require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

// Load environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const users = process.env.USER_DATA ? JSON.parse(process.env.USER_DATA) : [];
const urls = process.env.URLS ? JSON.parse(process.env.URLS) : [];

if (!TELEGRAM_BOT_TOKEN) {
    console.error("TELEGRAM_BOT_TOKEN is missing. Ensure it's set as a GitHub secret or in your .env file.");
    process.exit(1);
}

if (users.length === 0) {
    console.warn("No users found in USER_DATA. Check your GitHub secrets or .env file.");
}

if (urls.length === 0) {
    console.warn("No URLs found in URLS. Check your GitHub secrets or .env file.");
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

// Function to fetch new apartment listings from Yad2 using Axios and Cheerio
const fetchYad2Listings = async (url) => {
    try {
        console.log(`Fetching URL: ${url}`);
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        const listings = [];

        // Example selectors; update according to the Yad2 website's structure
        $('#__next ul li').each((index, element) => {
            const title = $(element).find('.item-data-content_heading__tphH4').text().trim() || 'No title';
            const price = $(element).find('span.price_price__xQt90').text().trim() || 'No price';
            const link = $(element).find('a').attr('href') || 'No link';

            listings.push({ title, price, link });
        });

        console.log('Fetched listings:', listings);
        return listings;
    } catch (error) {
        console.error('Error fetching Yad2 listings:', error);
        return [];
    }
};

// Function to load the last checked listings from a file
const loadLastCheckedListings = (filePath) => {
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

    let lastCheckedListings = loadLastCheckedListings(filePath);

    while (true) {
        for (const url of urls) {
            const newListings = await fetchYad2Listings(url);
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
        console.log('Waiting for 1 minute...');
        await new Promise(resolve => setTimeout(resolve, 60000)); // Wait for 1 minute
    }
};

main();
