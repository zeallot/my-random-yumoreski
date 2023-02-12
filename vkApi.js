const easyvk = require('easyvk');

const formatJokes = (jokes) => {
    return jokes.flatMap((joke) => {
        const isValidJoke = !joke.marked_as_ads && !!joke.text && !joke.text.includes('https://t.me/myfavoritejumoreski') && !joke.text.includes('https://vk.com/') && !joke.copyright;
        const photoParams = joke?.attachments?.find(({type}) => type === 'photo');
        if (isValidJoke) {
            return {
                text: joke.text,
                photo: !!photoParams && photoParams.photo.sizes[photoParams.photo.sizes.length - 1].url,
                likes: joke.likes.count,
                reposts: joke.reposts.count
            }
        } else {
            return [];
        }
    });
};

const connectToVk = () => {
    return easyvk({
        username: process.env.VK_LOGIN,
        password: process.env.VK_PASSWORD,
    });
}

const parseJokes = () => (
    connectToVk()
    .then(async vk => {
        let filteredJokes = [];
        let offset = 100;
        let { count, items } = await vk.call('wall.get', {
            domain: 'jumoreski',
            count: 100,
        });

        filteredJokes = [
            ...filteredJokes,
            ...formatJokes(items),
        ];

        for (let index = 0; index < count; index += 100) {
            let { items } = await vk.call('wall.get', {
                domain: 'jumoreski',
                count: 100,
                offset,
            });

            offset += 100;

            filteredJokes = [
                ...filteredJokes,
                ...formatJokes(items),
            ];

            console.log(`Jokes count ${filteredJokes.length}; Offset: ${offset}; Post count: ${count}`);
        }

        return filteredJokes;
    })
    .catch(e => console.log(e))
);

const getWallPostsCount = () => (
    connectToVk()
    .then(async vk => {
        let { count } = await vk.call('wall.get', {
            domain: 'jumoreski',
            count: 1,
        });
        return count;
    })
    .catch(e => console.log(e))
);

const sendMessageToVk = (ownerId, message) => (
  connectToVk()
    .then(async vk => {
      vk.call('wall.post', {
        owner_id: ownerId,
        message,
      });
    })
    .catch(e => console.log(e))
);


module.exports = {
    parseJokes,
    getWallPostsCount,
    sendMessageToVk,
}
