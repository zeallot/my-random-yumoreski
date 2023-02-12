const express = require('express')
const mongoose = require('mongoose');
const {getRandomJokeWithConnectedDb} = require('./mongoApi');
const app = express()

const host = '89.108.102.155'
const port = 7000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/randomJoke', async (req, res) => {
  const joke = await getRandomJokeWithConnectedDb();
  res.json(joke);
})

mongoose.connect(process.env.MONGO_LINK)
  .then(async () => {
    console.log('connected to mongo');
    app.listen(port, host, () => {
      console.log(`Server listens http://${host}:${port}`)
    })
  })
  .catch(() => 'not connected');
