# Yad2 Apartment Monitoring Bot 🏠📢🤖

## Overview 🌍💬🔎

Yad2 Bot is a **Telegram bot** that scrapes apartment listings from Yad2 based on user-defined filters and **notifies users** about new listings in real time. This bot enables users to find apartments effortlessly by receiving instant Telegram updates when new listings match their criteria.

---

## Features ⚡🏡📲

- **Automated Apartment Monitoring**: The bot scrapes Yad2 listings using user-provided search filters.
- **Real-Time Notifications**: Alerts are sent via Telegram for new apartment listings.
- **Smart Duplicate Prevention**: Prevents duplicate notifications by tracking previously sent listings.
- **Customizable Filters**: Users can specify location, price range, number of rooms, and other criteria.
- **Automation**: Runs automatically every 5 minutes via **GitHub Actions**.
- **MongoDB Integration**: Stores listings to ensure efficient tracking.

---

## Technologies Used 🛠️📌

- **Programming Language**: TypeScript (Node.js)
- **Libraries & Frameworks**:
  - `node-telegram-bot-api` - Handles Telegram bot interactions
  - `axios` - Fetches HTML content from Yad2
  - `cheerio` - Parses HTML to extract apartment listings
  - `dotenv` - Loads environment variables
  - `mongoose` - Handles MongoDB database operations
- **Database**: MongoDB (for storing tracked listings)
- **Automation**: GitHub Actions (for scheduled execution)

## Code Architecture 🏗️📐

The codebase follows a modular architecture with clear separation of concerns:

- **`types/`**: Centralized TypeScript type definitions for better type safety and maintainability
- **`lib/mongo/`**: Database operations and MongoDB schema definitions
- **`lib/telegram/`**: Telegram Bot API integration and messaging logic
- **`lib/yad2/`**: Yad2 website scraping and API integration
- **`lib/utils/`**: Utility functions and application constants

This structure ensures code reusability, easier testing, and better maintainability.

---

## Project Structure 📂🛠️🔍

```
nirhazan35-yad2_bot/
├── README.md
├── env_template.txt
├── index.ts  # Main bot logic
├── tsconfig.json  # TypeScript configuration
├── package.json  # Project dependencies
├── lib/  # Core business logic
│   ├── mongo/
│   │   └── operations.ts  # Database operations
│   ├── telegram/
│   │   └── telegram_api.ts  # Telegram API integration
│   ├── utils/
│   │   └── constants.ts  # Application constants
│   └── yad2/
│       └── yad2_api.ts  # Yad2 API integration
├── types/  # TypeScript type definitions
│   ├── index.ts  # Main export file
│   ├── user.ts  # User interface definitions
│   ├── listing.ts  # Listing interfaces
│   ├── yad2-listing.ts  # Yad2Listing class
│   ├── yad2-api.ts  # API response interfaces
│   ├── config.ts  # Configuration interfaces
│   ├── common.ts  # Common utility types
│   └── README.md  # Types documentation
└── .github/
    └── workflows/
        └── schedule.yml  # GitHub Actions workflow for automated execution
```

---

## Setup Instructions 🛠️📌💡

### 1. Clone the Repository 🔽💻

```sh
git clone https://github.com/nirhazan35/yad2_bot.git
cd yad2_bot
```

### 2. Install Dependencies 📦⚙️✅

```sh
npm install
```

### 3. Create a Telegram Bot 🤖🔑

1. Open Telegram and search for **`BotFather`**.
2. Type `/newbot` and follow the instructions to create a new bot.
3. Copy the **bot token** and save it in the `.env` file (`TELEGRAM_BOT_TOKEN`).

### 4. Configure the `.env` File 🔒📝

Create a `.env` file in the project root directory and add the following variables:

```env
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
USER_DATA=[{"id":123456789,"first_name":"John","last_name":"Doe"}]
URLS=["https://yad2.com/example-url"]
MONGO_URI=your-mongodb-connection-string
HEADLESS_MODE=true
```

#### **How to Get These Values:**

- **`TELEGRAM_BOT_TOKEN`**: Follow the **BotFather** instructions above.
- **`USER_DATA`**: Get your Telegram **User ID** using [@userinfobot](https://t.me/userinfobot).
- **`URLS`**:
  1. Go to [Yad2](https://www.yad2.co.il/), **filter apartments** based on your preferences.
  2. Copy the resulting **URL** and paste it into the `.env` file.
- **`MONGO_URI`**: Obtain your MongoDB connection string from **MongoDB Atlas** or your local database.
- **`HEADLESS_MODE`**:
  - `true`: Runs the bot in the background (recommended for deployment).
  - `false`: Opens a browser for debugging purposes.

### 5. Run the Bot 🚀📢

```sh
# Build the TypeScript code
npm run build

# Run the compiled JavaScript
npm start

# Or run directly with ts-node for development
npm run dev
```

---

## How It Works ⚙️📡🏠

1. The bot scrapes apartment listings from **Yad2** based on URLs provided in `.env`.
2. It compares newly fetched listings against MongoDB to **avoid duplicate notifications**.
3. New listings are **sent to the specified Telegram users** with title, price, and link.
4. The database is **updated** with the newly sent listings.

---

## Automated Execution 🤖⚡🕒

### **GitHub Actions Workflow**

- The bot runs automatically **every 5 minutes** using a scheduled **GitHub Actions workflow**.
- The workflow installs dependencies, sets up environment variables, and **executes the bot**.

### **Run the Workflow Manually**

You can manually trigger the bot via GitHub Actions:

1. Go to the repository **Actions tab**.
2. Select **Yad2 Apartment Bot Workflow**.
3. Click **Run workflow**.

---

## Logs & Debugging 📝⚙️🔍

- **Messages Sent**: Logs all messages sent to users.
- **Errors**: Any issues during scraping or Telegram messaging are logged.
- **Fetched Listings**: New apartments are logged for transparency.

---

## Contributing 🤝💡🚀

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit changes (`git commit -m "Added new feature"`).
4. Push (`git push origin feature-branch`).

