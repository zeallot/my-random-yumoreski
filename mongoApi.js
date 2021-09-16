const { MongoClient } = require('mongodb');
const { mongoLink } = require('./config');

const  client = new MongoClient(mongoLink);
const jokes = client.db().collection('jokes');
const statistic = client.db().collection('statistic');

const start = async () => {
    try {
        await client.connect();
        console.log('Connected to db');
    } catch (e) {
        console.log(e);
    }
};

const writeOne = (joke) => {
    start()
    .then(async () => {
        await jokes.insertOne(joke);
        console.log('Write one items in db')
    })
    .then(() => {
        client.close();
        console.log('Disconnected from db');
    })
    .catch(e => {
        client.close();
        console.log(e)
    })
};

const writeMany = (jokeList) => {
    start()
    .then(async () => {
        await jokes.insertMany(jokeList);
        console.log(`Write ${jokeList.length} items in db`)
    })
    .then(() => {
        client.close();
        console.log('Disconnected from db');
    })
    .catch(e => {
        client.close();
        console.log(e)
    })
};

const getRandomJoke = () => (
    start()
    .then(async () => {
        return await jokes.aggregate([{$sample: {size: 1}}]).next();
    })
    .then((joke) => {
        client.close();
        console.log('Disconnected from db');
        return joke;
    })
    .catch(e => {
        client.close();
        console.log(e)
    })
);

const getRandomJokeWithConnectedDb = async () => {
    try {
        return await jokes.aggregate([{$sample: {size: 1}}]).next();
    } catch (e) {
        console.log(e);
    }
};

const getStatisticWithConnectedDb = async () =>{
    try {
        return await statistic.findOne({id: 1});
    } catch (e) {
        console.log(e);
    }
}


const incMessageCount = () => {
    start()
    .then(async () => {
        await statistic.updateOne({id: 1}, {$inc: {messageCount: 1}})
    })
    .then(() => {
        client.close()
        console.log('Disconnected from db');
    })
    .catch(e => console.log(e));
};


const incMessageCountWithConnectedDb = async (user) => {
    try {
        await statistic.updateOne({id: 1}, {$inc: {messageCount: 1}});
        await statistic.updateOne({}, {$addToSet: { userList: user }}, { upsert: true})
    } catch (e) {
        console.log(e);
    }
};


module.exports = {
    writeOne,
    writeMany,
    getRandomJoke,
    getRandomJokeWithConnectedDb,
    connectToMongo: start,
    incMessageCount,
    incMessageCountWithConnectedDb,
    getStatisticWithConnectedDb,
};
