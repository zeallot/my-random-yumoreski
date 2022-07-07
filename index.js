const { listenMessages } = require('./telegramApi');
const mongoose = require('mongoose');
const { mongoLink } = require('./config');

// const { parseJokes } = require('./vkApi');
// const { writeMany } = require('./mongoApi');


// parseJokes().then((jokes) => writeMany(jokes));


mongoose.connect(mongoLink)
  .then(async () => {
    console.log('connected');
    listenMessages();
  })
  .catch(() => 'not connected');
