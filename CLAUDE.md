# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Telegram bot that monitors Yad2 (Israeli real estate website) for new apartment listings and sends notifications to users. The bot runs periodically, scrapes listings from Yad2 API, stores them in MongoDB to prevent duplicates, and sends Telegram messages for new listings.

## Commands

### Build and Run
```bash
npm run build       # Compile TypeScript to JavaScript (outputs to ./dist)
npm start           # Run the compiled bot (requires prior build)
npm run dev         # Build and run in one command
```

### Development Notes
- No test suite is configured (test script exits with error)
- No linting is configured
- The project uses ES modules (`"type": "module"` in package.json)
- TypeScript compiles to ES2020 target with ESNext module format

## Architecture

### Core Data Flow
1. **index.ts** - Entry point that orchestrates the entire bot workflow:
   - Loads environment variables and validates configuration
   - Connects to MongoDB
   - Initializes Telegram bot (in non-polling mode)
   - Iterates through configured URLs
   - For each URL: fetches listings → checks for duplicates → saves new listings → sends Telegram notifications
   - Closes MongoDB connection and exits after one run

2. **Yad2 API Integration** (`lib/yad2/yad2_api.ts`):
   - Converts user-provided Yad2 search URLs to API requests
   - Makes HTTP requests to `https://gw.yad2.co.il/realestate-feed/rent/map` with search parameters
   - Uses proxy support via `https-proxy-agent` (configurable through PROXY_URL env var)
   - Parses API response to extract listing markers and creates `Yad2Listing` objects
   - Deduplicates listings within the API response before returning

3. **Database Layer** (`lib/mongo/operations.ts`):
   - Defines Mongoose schema with fields: `id` (unique), `link` (unique), `title`, `price`
   - Automatically adds `createdAt` and `updatedAt` timestamps
   - Provides `saveListing()`, `findListingById()`, and `findListingByLink()` operations
   - Double-checks for duplicates: both in the save operation and before calling save

4. **Telegram Integration** (`lib/telegram/telegram_api.ts`):
   - Simple wrapper around `node-telegram-bot-api`
   - Sends formatted messages: "Title: {title}\nPrice: {price}\nLink: {link}"
   - Bot runs in non-polling mode (one-shot execution, not a persistent listener)

### Type System
The `types/` directory contains centralized TypeScript definitions:
- **yad2-listing.ts**: `Yad2Listing` class representing a property listing
- **yad2-api.ts**: `ApiResponse` interface for Yad2 API responses
- **listing.ts**: Base listing interfaces (`ListingInput`, `ListingWithTimestamps`)
- **user.ts**: `User` interface for Telegram user data
- **config.ts**: Configuration-related types
- **common.ts**: Shared utility types
- **index.ts**: Central export point for all types (uses `.js` extensions in imports per ES module requirements)

All imports from `types/` use `.js` extensions even though the source files are `.ts` (required for ES module resolution at runtime).

## Environment Configuration

Required environment variables (see `.github/workflows/schedule.yml.disabled` for reference):
- `TELEGRAM_BOT_TOKEN`: Bot token from BotFather
- `USER_DATA`: JSON object with user info, e.g., `{"id":123456789,"first_name":"John","last_name":"Doe"}`
- `URLS`: JSON array of Yad2 search URLs, e.g., `["https://yad2.com/example-url"]`
- `MONGO_URI`: MongoDB connection string
- `API_URL`: Yad2 API endpoint (defaults to `https://gw.yad2.co.il/realestate-feed/rent/map` in workflow)
- `PROXY_URL`: Optional HTTP(S) proxy URL in format `http://user:pass@host:port`

## Execution Model

The bot is designed for **single-run execution**, not as a persistent service:
- Connects to MongoDB, processes all URLs once, then disconnects and exits
- Originally scheduled to run every 5 minutes via GitHub Actions (currently disabled: `.github/workflows/schedule.yml.disabled`)
- Uses non-polling Telegram bot mode (no webhook or continuous polling)

## Key Implementation Details

### Duplicate Prevention Strategy
Three-layer approach to prevent duplicate notifications:
1. API response deduplication within `fetchYad2Listings()` using Map
2. Pre-save check in `index.ts` calls `findListingById()` before attempting save
3. Database-level unique constraints on both `id` and `link` fields

### Listing ID Source
- Yad2 API provides a `token` field that serves as the unique listing ID
- This token is used to construct the listing link: `https://www.yad2.co.il/realestate/item/{token}`
- Title is generated from `address.street.text` + `address.house.number`

### Rate Limiting
- 1-second delay between API requests (`setTimeout` in `fetchYad2Listings()`)
- Custom User-Agent headers to mimic browser requests
