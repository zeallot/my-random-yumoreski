const { telegramToken } = require('./config');
const TelegramBot = require('node-telegram-bot-api');
const { connectToMongo, getRandomJokeWithConnectedDb, incMessageCountWithConnectedDb } = require('./mongoApi');

const bot = new TelegramBot(telegramToken, { polling: true });

const parseUser = (msg) => ({
    chat_id: msg.chat.id,
    title: msg.chat.title,
    first_name: msg.chat.first_name,
    last_name: msg.chat.last_name,
    username: msg.chat.username,
});

const responseMessages = {
    anotherOne: 'Еще одну юморульку? /roll',
    error: errorMessage => `Ошибка... ${errorMessage}... Попробуй позже...`,
    onStart: 'Могу рассказать тебе случайную юмореску из паблика https://vk.com/jumoreski\n\nНапиши /roll, чтобы заролить юмореску',
    default: 'Я могу только в команду /roll',
    incoming: (user) => `${new Date()} incoming message from ${user.username || user.chat_id}`,
}

const listenMessages = () => connectToMongo().then(() => {
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const user = parseUser(msg);

        await incMessageCountWithConnectedDb(user);
        console.log(responseMessages.incoming(user))

        switch(msg.text) {
            case('/roll'):
                const { text, photo } = await getRandomJokeWithConnectedDb();
                photo ? (
                    bot.sendPhoto(chatId, photo, { caption: text })
                    .then(() => bot.sendMessage(chatId, responseMessages.anotherOne))
                    .catch(e => {
                        console.log(new Date(), e.response.body.description)
                        bot.sendMessage(chatId, responseMessages.error(e.response.body.description))
                    })
                ) : (
                    bot.sendMessage(chatId, text)
                    .then(() => bot.sendMessage(chatId, responseMessages.anotherOne))
                    .catch(e => {
                        console.log(new Date(), e.response.body.description)
                        bot.sendMessage(chatId, responseMessages.error(e.response.body.description))
                    })
                );
                break;
            case('/start'):
                bot.sendMessage(chatId, responseMessages.onStart);
                break;
            default:
                bot.sendMessage(chatId, responseMessages.default);
        }
      });
});

module.exports = {
    listenMessages,
};