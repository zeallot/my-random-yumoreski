const TelegramBot = require('node-telegram-bot-api');
const { onStartMessage, onDefaultMessage, onRollJoke, onStat} = require('./messageHandlers');
const {
    incMessageCountWithConnectedDb,
} = require('./mongoApi');
const { sendMessageToVk } = require('./vkApi');
const { translateToBraille } = require('./braille');
require('dotenv').config();


const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

const ONE_DAY = 86400000;

setInterval(async () => {
    await bot.sendMessage('-666385793', '@ayoz4 @animepingvini @gun_katto @volodyaBallbeskin как дела?');
}, ONE_DAY);


const parseUser = (msg) => ({
    chat_id: msg.chat.id,
    title: msg.chat.title,
    first_name: msg.chat.first_name,
    last_name: msg.chat.last_name,
    username: msg.chat.username,
});

const listenMessages = () => {
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const user = parseUser(msg);

        // TODO: uncomment this
        await incMessageCountWithConnectedDb(user);
        console.log(`${new Date()} incoming message from ${user.username || user.chat_id}`)

        switch(msg.text) {
            case('/stat'):
                await onStat(bot, chatId, msg)
                break;
            case('/roll'):
            case('/roll@random_yumoreski_bot'):
                await onRollJoke(bot, chatId, msg);
                break;
            case('/start'):
                await onStartMessage(bot, chatId);
                break;
            default:
                await onDefaultMessage(bot, chatId);
        }
      });

    bot.on('callback_query',  async (callback_message) => {
        if (callback_message.message.photo) {
            bot.sendPhoto('@blind_jokes', callback_message.message.photo[0].file_id, { caption: translateToBraille(callback_message.message.caption)})
              .then(() => console.log('send message to @blind_jokes'));

        } else {
            const message = translateToBraille(callback_message.message.text);
            bot.sendMessage('@blind_jokes', message)
              .then(() => console.log('send message to @blind_jokes'));
            await sendMessageToVk(-162704615, message)

        }
        await bot.answerCallbackQuery(callback_message.id);
    });
};

module.exports = {
    listenMessages,
};
