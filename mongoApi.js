const mongoose = require('mongoose');

const db = mongoose.connection;

const jokesCollection = db.collection("jokes");
const statistic = db.collection('statistic');

// const writeOne = (joke) => {
//     start()
//     .then(async () => {
//         await jokesCollection.insertOne(joke);
//         console.log('Write one items in db')
//     })
//     .then(() => {
//         client.close();
//         console.log('Disconnected from db');
//     })
//     .catch(e => {
//         client.close();
//         console.log(e)
//     })
// };

// const writeMany = (jokeList) => {
//     start()
//     .then(async () => {
//         await jokesCollection.insertMany(jokeList);
//         console.log(`Write ${jokeList.length} items in db`)
//     })
//     .then(() => {
//         client.close();
//         console.log('Disconnected from db');
//     })
//     .catch(e => {
//         client.close();
//         console.log(e)
//     })
// };

const getRandomJokeWithConnectedDb = async () => {
    try {
        return await jokesCollection.aggregate([{$sample: {size: 1}}]).next();
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

const incMessageCountWithConnectedDb = async (user) => {
    try {
        await statistic.updateOne({id: 1}, {$inc: {messageCount: 1}});
        await statistic.updateOne({}, {$addToSet: { userList: user }}, { upsert: true})
    } catch (e) {
        console.log(e);
    }
};


module.exports = {
    getRandomJokeWithConnectedDb,
    incMessageCountWithConnectedDb,
    getStatisticWithConnectedDb,
};
