### **README**

# Yad2 Apartment Monitoring Bot

This project is a Telegram bot that monitors apartment listings on Yad2 and notifies users about new apartments based on specified criteria. It uses the Playwright library to scrape data and the `node-telegram-bot-api` library to send notifications via Telegram.

---

## **Features**
- Scrapes apartment listings from Yad2 based on provided URLs.
- Sends notifications to Telegram users with details about new apartments.
- Tracks previously sent apartments to avoid duplicate notifications.
- Logs all activity, including sent messages and errors.

---

## **Requirements**
- Node.js installed on your system.
- A Telegram bot token (from BotFather).
- User IDs of Telegram users to send notifications.
- URLs of Yad2 apartment listings to monitor.

---

## **Setup Instructions**

### **1. Clone the Repository**
Clone this project to your local machine:

```bash
git clone https://github.com/nirhazan35/yad2_bot.git
cd yad2_bot
```

---

### **2. Install Dependencies**
Install the required Node.js dependencies:

```bash
npm install
```

---

### **3. Create the `.env` File**
Create a `.env` file in the project root directory and add the following variables:

```env
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
USER_DATA=[{"id":123456789,"first_name":"John","last_name":"Doe"}]
URLS=["https://example.com/url1","https://example.com/url2"]
HEADLESS_MODE=true
```

#### **How to Get These Values:**

- **`TELEGRAM_BOT_TOKEN`:**
  1. Open Telegram and search for the BotFather.
  2. Use the `/newbot` command to create a new bot.
  3. Copy the provided token and paste it here.

- **`USER_DATA`:**
  1. To get a Telegram user's ID, you can use the bot itself or another bot like [@userinfobot](https://t.me/userinfobot).
  2. Replace `123456789` with the user's ID and update `first_name` and `last_name`.

- **`URLS`:**
  1. Go to Yad2 and perform a search with your desired filters (e.g., location, price range, rooms, etc.).
  2. Copy the resulting URL and paste it into the array.

- **`HEADLESS_MODE`:**
  - Set to `true` for running the bot in headless mode (without browser UI).
  - Set to `false` for debugging purposes (with browser UI).

---

### **4. Add the `lastCheckedListings.json` File**
The `lastCheckedListings.json` file tracks apartments that have already been sent to avoid duplicate notifications. Create this file in the root directory with the following content:

```json
{}
```

This initializes the file as an empty JSON object. The bot will update this file as it processes new listings.

---

### **5. Run the Bot**
Start the bot using:

```bash
node index.js
```

---

### **Logs**
- **Messages Sent:** The bot logs each sent message, including the recipient and apartment details.
- **Errors:** Any issues during scraping or messaging are logged for debugging.
- **Fetched Listings:** The bot logs new apartments for transparency.

---

## **How It Works**
1. The bot scrapes apartment listings from Yad2 based on the URLs provided in the `.env` file.
2. It compares the fetched listings against `lastCheckedListings.json` to avoid duplicates.
3. New listings are sent to the specified Telegram users with details like title, price, and link.
4. The `lastCheckedListings.json` file is updated with the new listings.

---

## **File Details**
- **`index.js`:** Main bot logic.
- **`.env`:** Stores sensitive information like bot token, user data, and URLs.
- **`lastCheckedListings.json`:** Tracks previously sent listings to prevent duplicates.

---

## **Contributions**
Feel free to fork the repository and submit pull requests for improvements or bug fixes.

---

## **License**
This project is open-source and available under the MIT License.

---

Let me know if you need further refinements or have questions about this setup! 🚀
