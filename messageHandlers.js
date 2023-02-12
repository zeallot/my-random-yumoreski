const {getRandomJokeWithConnectedDb, getStatisticWithConnectedDb} = require('./mongoApi');

let lastMessageCount = 0;
let lastUserCount = 0;

const responseMessages = {
  anotherOne: 'Еще одну юморульку? /roll',
  error: errorMessage => `Ошибка... ${errorMessage}... Попробуй позже...`,
  onStart: 'Могу рассказать тебе случайную юмореску из паблика https://vk.com/jumoreski\n\nНапиши /roll, чтобы заролить юмореску',
  default: 'Я могу только в команду /roll',
  statistic: (messageCount, usersCount) =>
    `Сообщени было: *${lastMessageCount}*\nСообщений сейчас: *${messageCount}*\nЮзеров было: *${lastUserCount}*\nЮзеров сейчас: *${usersCount}*`
};




const onStartMessage = async (bot, chatId) => {
  await bot.sendMessage(chatId, responseMessages.onStart);
};

const onDefaultMessage = async (bot, chatId) => {
  await bot.sendMessage(chatId, responseMessages.default);
};

const onRollJoke = async (bot, chatId, msg) => {
  const { text, photo } = await getRandomJokeWithConnectedDb();

  if (photo) {
    let options = {
      caption: text,
    };
    if (chatId === process.env.OWNER_CHAT_ID && msg.chat.username === process.env.OWNER_USERNAME) {
      options.reply_markup = {
        inline_keyboard: [
          [
            {
              text: 'Запостить в "Анекдоты для слепых"',
              callback_data: 'postToGroup'
            }
          ]
        ]
      };
    }
    bot.sendPhoto(chatId, photo, options)
      .then(() => bot.sendMessage(chatId, responseMessages.anotherOne))
      .catch(e => {
        console.log(new Date(), e.response.body.description)
        bot.sendMessage(chatId, responseMessages.error(e.response.body.description))
      })
  } else {
    let options = {};
    if (chatId === process.env.OWNER_CHAT_ID && msg.chat.username === process.env.OWNER_USERNAME) {
      options = {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Запостить в "Анекдоты для слепых"',
                callback_data: 'postToGroup'
              }
            ]
          ]
        }
      };
    }

    bot.sendMessage(chatId, text, options)
      .then(() => bot.sendMessage(chatId, responseMessages.anotherOne))
      .catch(e => {
        console.log(new Date(), e.response.body.description)
        bot.sendMessage(chatId, responseMessages.error(e.response.body.description))
      })
  }
}

const onStat = async (bot, chatId, msg) => {
  if (chatId === process.env.OWNER_CHAT_ID && msg.chat.username === process.env.OWNER_USERNAME) {
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
}



module.exports = {
  onStartMessage,
  onDefaultMessage,
  onRollJoke,
  onStat,
};
