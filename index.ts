import * as dotenv from "dotenv";
import mongoose from "mongoose";
import TelegramBot from "node-telegram-bot-api";
import { findListingById, saveListing } from "./lib/mongo/operations";
import { fetchYad2Listings, Yad2Listing } from "./lib/yad2/yad2_api";
import { sendToTelegram } from "./lib/telegram/telegram_api";

// Load environment variables first
dotenv.config();

// Define interfaces
interface User {
  id: number;
  first_name?: string;
  last_name?: string;
}

// Parse environment variables with proper type checking
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const MONGO_URI = process.env.MONGO_URI;

// Parse JSON with type checking and provide default values
const user: User = (() => {
  try {
    return JSON.parse(process.env.USER_DATA || "{}") as User;
  } catch (error) {
    console.error("Error parsing USER_DATA:", error);
    return { id: 0 };
  }
})();

const urls: string[] = (() => {
  try {
    return JSON.parse(process.env.URLS || "[]") as string[];
  } catch (error) {
    console.error("Error parsing URLS:", error);
    return [];
  }
})();

// Log all environment variables
console.log("Environment Variables:");
console.log("TELEGRAM_BOT_TOKEN:", process.env.TELEGRAM_BOT_TOKEN);
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("USER_DATA:", process.env.USER_DATA);
console.log("URLS:", process.env.URLS);

if (!TELEGRAM_BOT_TOKEN || !MONGO_URI || !user || !urls) {
  console.error(
    "Missing required environment variables. Please check your .env file."
  );
  process.exit(1);
}

// Initialize Mongoose
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Initialize the Telegram bot
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

// Main function to periodically check for new listings
const main = async (): Promise<void> => {
  console.log("Checking for new listings...");

  try {
    for (const url of urls) {
      const newListings = await fetchYad2Listings(url);

      for (const listing of newListings) {
        console.log(`Checking listing: ${listing?.title}`);

        // Check if the listing already exists before saving it
        const existingListing = await findListingById(listing.id);

        if (existingListing) {
          console.log(`Listing already exists: ${listing.title}`);
          continue; // Skip to the next listing
        }

        // If the listing doesn't exist, save it
        if (listing.price !== "No price" && listing.title !== "No title") {
          const isNew = await saveListing(listing);
          console.log(`Is new listing: ${isNew}`);
          if (isNew) {
            const message = `Title: ${listing.title}\nPrice: ${listing.price}\nLink: ${listing.link}`;
            const response = await sendToTelegram(bot, user.id, message);
            console.log(`Telegram response: ${response}`);
          }
        }
      }
    }
    console.log("Finished checking listings.");
  } catch (error) {
    console.error("Error during main execution:", error);
  } finally {
    console.log("Closing MongoDB connection...");
    await mongoose.disconnect(); // Properly close the MongoDB connection
    console.log("MongoDB connection closed.");
    process.exit(0); // Exit the process
  }
};

// Run the main function
main().catch(console.error);
