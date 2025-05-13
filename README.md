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

---

## Project Structure 📂🛠️🔍

```
yad2_bot/
├── README.md
├── env_template.txt  # Template for environment variables
├── index.ts  # Main bot logic
├── lib/  # Library code
│   ├── mongo/  # MongoDB operations
│   ├── telegram/  # Telegram API integration
│   ├── utils/  # Utility functions
│   └── yad2/  # Yad2 scraping logic
├── tsconfig.json  # TypeScript configuration
├── package.json  # Project dependencies
├── Dockerfile  # Docker build configuration
├── docker-compose.yml  # Docker Compose configuration
├── docker-run.sh  # Helper script for Docker operations
└── .dockerignore  # Files to exclude from Docker build
```

---

## Setup Instructions 🛠️📌💡

### 1. Clone the Repository 🔽💻

```sh
git clone https://github.com/nirhazan35/yad2_bot.git
cd yad2_bot
```

### 2. Choose Your Setup Method

#### Option A: Standard Setup

##### Install Dependencies 📦⚙️✅

```sh
npm install
```

##### Run the Bot 🚀📢

```sh
# Build the TypeScript code
npm run build

# Run the compiled JavaScript
npm start

# Or run directly with ts-node for development
npm run dev
```

#### Option B: Docker Setup 🐳

##### Using Docker Helper Script

```sh
# Make the script executable
chmod +x docker-run.sh

# Create .env file from template
./docker-run.sh setup

# Edit the .env file with your values
nano .env

# Build and start the containers
./docker-run.sh build
./docker-run.sh start

# View logs
./docker-run.sh logs

# Other available commands
./docker-run.sh help
```

##### Using Docker Compose Directly

```sh
# Create .env file from template
cp env_template.txt .env
# Edit the .env file with your values
nano .env

# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f
```

##### Using Docker Directly

```sh
# Build the Docker image
docker build -t yad2-bot .

# Run the container
docker run -d --name yad2-bot \
  -e TELEGRAM_BOT_TOKEN=your-token \
  -e USER_DATA='[{"id":123456789,"first_name":"John","last_name":"Doe"}]' \
  -e URLS='["https://www.yad2.co.il/realestate/rent?city=5000"]' \
  -e MONGO_URI=your-mongodb-uri \
  -e API_URL=https://gw.yad2.co.il/feed-search-legacy/realestate/rent \
  yad2-bot
```

### 3. Create a Telegram Bot 🤖🔑

1. Open Telegram and search for **`BotFather`**.
2. Type `/newbot` and follow the instructions to create a new bot.
3. Copy the **bot token** and save it in the `.env` file (`TELEGRAM_BOT_TOKEN`).

### 4. Configure the `.env` File 🔒📝

Create a `.env` file in the project root directory (or copy from env_template.txt) and add the following variables:

```env
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
USER_DATA=[{"id":123456789,"first_name":"John","last_name":"Doe"}]
URLS=["https://www.yad2.co.il/realestate/rent?city=5000"]
MONGO_URI=your-mongodb-connection-string
API_URL=https://gw.yad2.co.il/feed-search-legacy/realestate/rent
PROXY_URL=http://username:password@host:port  # Optional
```

#### **How to Get These Values:**

- **`TELEGRAM_BOT_TOKEN`**: Follow the **BotFather** instructions above.
- **`USER_DATA`**: Get your Telegram **User ID** using [@userinfobot](https://t.me/userinfobot).
- **`URLS`**:
  1. Go to [Yad2](https://www.yad2.co.il/), **filter apartments** based on your preferences.
  2. Copy the resulting **URL** and paste it into the `.env` file.
- **`MONGO_URI`**: Obtain your MongoDB connection string from **MongoDB Atlas** or your local database.
  - For Docker setup, use `mongodb://mongodb:27017/yad2bot` when using the provided docker-compose.yml

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

