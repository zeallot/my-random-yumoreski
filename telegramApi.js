const { telegramToken, ownerChatId, ownerUsername } = require('./config');
const TelegramBot = require('node-telegram-bot-api');
const {
    connectToMongo,
    getRandomJokeWithConnectedDb,
    getStatisticWithConnectedDb,
    incMessageCountWithConnectedDb
} = require('./mongoApi');


// TODO: change to telegramToken
const bot = new TelegramBot(telegramToken, { polling: true });

const parseUser = (msg) => ({
    chat_id: msg.chat.id,
    title: msg.chat.title,
    first_name: msg.chat.first_name,
    last_name: msg.chat.last_name,
    username: msg.chat.username,
});

let lastMessageCount = 0;
let lastUserCount = 0;


const responseMessages = {
    anotherOne: 'Еще одну юморульку? /roll',
    error: errorMessage => `Ошибка... ${errorMessage}... Попробуй позже...`,
    onStart: 'Могу рассказать тебе случайную юмореску из паблика https://vk.com/jumoreski\n\nНапиши /roll, чтобы заролить юмореску',
    default: 'Я могу только в команду /roll',
    incoming: (user) => `${new Date()} incoming message from ${user.username || user.chat_id}`,
    statistic: (messageCount, usersCount) =>
      `Сообщени было: *${lastMessageCount}*\nСообщений сейчас: *${messageCount}*\nЮзеров было: *${lastUserCount}*\nЮзеров сейчас: *${usersCount}*`
}

const listenMessages = () => connectToMongo().then(() => {
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const user = parseUser(msg);

        // TODO: uncomment this
        await incMessageCountWithConnectedDb(user);
        console.log(responseMessages.incoming(user))

        switch(msg.text) {
            case('/stat'):
                if (chatId === ownerChatId && msg.chat.username === ownerUsername) {
                    const { messageCount, userList } = await getStatisticWithConnectedDb();
                    bot.sendMessage(chatId, responseMessages.statistic(messageCount,  userList.length), {parse_mode: 'Markdown'})
                      .then(() => {
                          lastMessageCount = messageCount;
                          lastUserCount = userList.length;
                      })
                      .catch(e => {
                          console.log(new Date(), e.response.body.description)
                          bot.sendMessage(chatId, responseMessages.error(e.response.body.description))
                      })
                } else {
                    await bot.sendMessage(chatId, responseMessages.default);
                }
                break;
            case('/roll' || '/roll@random_yumoreski_bot'):
                const { text, photo } = await getRandomJokeWithConnectedDb();

                if (photo) {
                    bot.sendPhoto(chatId, photo, { caption: text })
                      .then(() => bot.sendMessage(chatId, responseMessages.anotherOne))
                      .catch(e => {
                          console.log(new Date(), e.response.body.description)
                          bot.sendMessage(chatId, responseMessages.error(e.response.body.description))
                      })
                } else {
                    bot.sendMessage(chatId, text)
                      .then(() => bot.sendMessage(chatId, responseMessages.anotherOne))
                      .catch(e => {
                          console.log(new Date(), e.response.body.description)
                          bot.sendMessage(chatId, responseMessages.error(e.response.body.description))
                      })
                }
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
