const { listenMessages } = require('./telegramApi');
const { parseJokes } = require('./vkApi');
const { writeMany } = require('./mongoApi');


listenMessages();
// parseJokes().then((jokes) => writeMany(jokes));
