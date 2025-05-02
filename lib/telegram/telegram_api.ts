import TelegramBot from "node-telegram-bot-api";

/**
 * Function to send messages to Telegram
 * @param bot Initialized TelegramBot instance
 * @param chatId Telegram chat ID to send the message to
 * @param message Message content to send
 * @returns Promise that resolves to true if message was sent successfully, false otherwise
 */
export const sendToTelegram = async (
  bot: TelegramBot,
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
          console.log("Message sent successfully!");
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
