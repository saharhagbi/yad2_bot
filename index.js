require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');

// Load environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const MONGO_URI = process.env.MONGO_URI;
const users = JSON.parse(process.env.USER_DATA);
const urls = JSON.parse(process.env.URLS);

if (!TELEGRAM_BOT_TOKEN || !MONGO_URI || !users || !urls) {
    console.error("Missing required environment variables. Please check your .env file.");
    process.exit(1);
}

// Initialize Mongoose
mongoose.connect(MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// Define the listing schema
const listingSchema = new mongoose.Schema({
    link: { type: String, unique: true, required: true },
    title: String,
    price: String,
}, { timestamps: true });

const Listing = mongoose.model('Listing', listingSchema);

// Base URL of the Yad2 website
const BASE_URL = 'https://www.yad2.co.il';

// Initialize the Telegram bot
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

// Function to send messages to Telegram
const sendToTelegram = async (chatId, message) => {
    try {
        await bot.sendMessage(chatId, message);
    } catch (error) {
        console.error(`Error sending message to ${chatId}:`, error);
    }
};

const fetchYad2Listings3 = async (url) => {
    try {
        const response = await axios.get(url);

        if (!response || !response.data) {
            return [];
        }

        const html = response.data;
        const $ = cheerio.load(html);

        // Check for CAPTCHA indicators
        const captchaKeywords = ['CAPTCHA'];
        const isCaptcha = captchaKeywords.some(keyword => html.includes(keyword));
        if (isCaptcha) {
            console.error(`CAPTCHA encountered while accessing URL: ${url}`);
            return []; // Return an empty array or handle the CAPTCHA appropriately
        }

        const noResultsSelector = '.no-feed-results-with-alert_title__HVFR0';
        if ($(noResultsSelector).length > 0) {
            return [];
        }

        const listings = [];
        $('#__next ul li').each((index, element) => {
            const title = $(element).find('.item-data-content_heading__tphH4').text().trim() || 'No title';
            const price = $(element).find('span.price_price__xQt90').text().trim() || 'No price';
            const relativeLink = $(element).find('a').attr('href') || 'No link';
            const link = relativeLink.startsWith('http') ? relativeLink : `${BASE_URL}${relativeLink}`;

            listings.push({ title, price, link });
        });
        return listings;
    } catch (error) {
        console.error(`Error fetching Yad2 listings from URL: ${url}`, error);
        return [];
    }
};


// Function to fetch new apartment listings from Yad2 using Axios and Cheerio
const fetchYad2Listings = async (url) => {
    try {
        const response = await axios.get(url);

        if (!response || !response.data) {
            return [];
        }

        const html = response.data;
        const $ = cheerio.load(html);

        const noResultsSelector = '.no-feed-results-with-alert_title__HVFR0';
        if ($(noResultsSelector).length > 0) {
            return [];
        }

        const listings = [];
        $('#__next ul li').each((index, element) => {
            const title = $(element).find('.item-data-content_heading__tphH4').text().trim() || 'No title';
            const price = $(element).find('span.price_price__xQt90').text().trim() || 'No price';
            const relativeLink = $(element).find('a').attr('href') || 'No link';
            const link = relativeLink.startsWith('http') ? relativeLink : `${BASE_URL}${relativeLink}`;

            listings.push({ title, price, link });
        });
        console.log(`Fetched ${listings.length} listings from URL: ${url}`);
        return listings;
    } catch (error) {
        console.error(`Error fetching Yad2 listings from URL: ${url}`, error);
        return [];
    }
};

// Function to save a listing to the database
const saveListing = async (listing) => {
    if (listing.price !== 'No price' && listing.title !== 'No title') 
    {
        try {
        await Listing.create(listing);
        return true;
    } catch (error) {
        if (error.code === 11000) {
            
        } else {
            console.error("Error saving listing:", error);
        }
        return false;
    }
}
};

// Main function to periodically check for new listings
const main = async () => {
    console.log('Checking for new listings...');

    try {
        for (const url of urls) {
            const newListings = await fetchYad2Listings(url);

            for (const listing of newListings) {
                const isNew = await saveListing(listing);
                if (isNew) {
                    const message = `New listing on Yad2:\n\nTitle: ${listing.title}\nPrice: ${listing.price}\nLink: ${listing.link}`;
                    users.forEach((user) => {
                        if (listing.title !== 'No title') sendToTelegram(user.id, message);
                    });
                }
            }
        }
        console.log('Finished checking listings.');
    } catch (error) {
        console.error('Error during main execution:', error);
    } finally {
        console.log('Closing MongoDB connection...');
        await mongoose.disconnect(); // Properly close the MongoDB connection
        console.log('MongoDB connection closed.');
        process.exit(0); // Exit the process
    }
};

// Run the main function
main().catch(console.error);

