const { listenMessages } = require('./telegramApi');
const mongoose = require('mongoose');
// const { parseJokes } = require('./vkApi');
// const { writeMany } = require('./mongoApi');


// parseJokes().then(ff(jokes) => writeMany(jokes));


mongoose.connect(process.env.MONGO_LINK)
  .then(async () => {
    console.log('connected');
    listenMessages();
  })
  .catch(() => 'not connected');
