import axios from "axios";
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import TelegramBot from "node-telegram-bot-api";
import {
  findListingById,
  ListingInput,
  saveListing as saveListingToDb,
} from "./lib/mongo/operations";

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

class Yad2Listing implements ListingInput {
  id: string;
  link: string;
  title: string;
  price: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(id: string, link: string, title: string, price: string) {
    this.id = id;
    this.link = link;
    this.title = title;
    this.price = price;
  }
}

// Base URL of the Yad2 website
const BASE_URL = "https://www.yad2.co.il";

// Initialize the Telegram bot
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

// Function to send messages to Telegram
const sendToTelegram = async (
  chatId: number,
  message: string
): Promise<boolean> => {
  try {
    console.log("Message content:", message);

    // Return a new Promise that wraps the bot.sendMessage Promise
    return new Promise<boolean>((resolve, reject) => {
      bot
        .sendMessage(chatId, message)
        .then((result: TelegramBot.Message) => {
          console.log("Message sent successfully:", result);
          resolve(true);
        })
        .catch((error: TelegramBot.Message) => {
          console.error("Error sending message:", error);
          resolve(false); // resolve with false instead of rejecting
        });
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return false;
  }
};

const fetchYad2Listings = async (url: string): Promise<Yad2Listing[]> => {
  try {
    // Parse the URL parameters
    const urlParams = new URL(url).searchParams;

    // Construct the API URL with the parameters
    const apiUrl = "https://gw.yad2.co.il/feed-search-legacy/realestate/rent";

    interface ApiResponse {
      data: {
        feed: {
          feed_items: Array<{
            id: string;
            type: string;
            row_1: string;
            price?: string;
          }>;
        };
      };
    }

    const response = await axios.get<ApiResponse>(apiUrl, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "he-IL",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "Sec-Ch-Ua":
          '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      params: {
        area: urlParams.get("area"),
        city: urlParams.get("city"),
        neighborhood: urlParams.get("neighborhood"),
        propertyGroup: "apartments",
        rooms: `${urlParams.get("minRooms")}-${urlParams.get("maxRooms")}`,
        price: `${urlParams.get("minPrice")}-${urlParams.get("maxPrice")}`,
        page: 1,
        forceLdLoad: true,
      },
    });

    if (response.data?.data?.feed?.feed_items) {
      const listings = response.data.data.feed.feed_items
        .filter((item) => item.type === "ad")
        .map(
          (item) =>
            new Yad2Listing(
              item.id,
              `https://www.yad2.co.il/realestate/item/${item.id}`,
              item.row_1.trim(),
              item.price || "No price"
            )
        );

      // Remove duplicates based on id
      const uniqueListings = Array.from(
        new Map(
          listings.map((listing) => {
            const id = listing.link.split("/").pop(); // Extract id from the link
            return [id, listing];
          })
        ).values()
      );

      console.log(`Found ${uniqueListings.length} listings`);
      return uniqueListings;
    }

    return [];
  } catch (error) {
    console.error("Error fetching listings:", error);
    return [];
  }
};

// Function to save a listing to the database
const saveListing = async (listing: Yad2Listing): Promise<boolean> => {
  if (listing.price !== "No price" && listing.title !== "No title") {
    return await saveListingToDb(listing);
  }
  return false;
};

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
        const isNew = await saveListing(listing);
        console.log(`Is new listing: ${isNew}`);
        if (isNew) {
          const message = `Title: ${listing.title}\nPrice: ${listing.price}\nLink: ${listing.link}`;
          const response = await sendToTelegram(user.id, message);
          console.log(`Telegram response: ${response}`);
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
