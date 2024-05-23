import axios from "axios";


export default async function handler(req, res) {
  try {
    const users = req.body.userList;
    const tweetMessage = req.body.tweetMessage;
    const hashtag = req.body.hashtag;
    const filter = [];

    users.map(async user => {
        filter.push({ twitt_username: user.twitt_username });
    });

    await axios.post(
      `${process.env.MONGODB_URI}/action/updateMany`,
      {
        dataSource: "Cluster0",
        database: process.env.DataBase,
        collection: "users",
        filter: {
          $or: filter,
        },
        update: {
          $set: {
            message: {
              text: tweetMessage,
              hashtags: hashtag.split(","),
            },
          },
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          apiKey: process.env.DATAAPI_KEY,
        },
      }
    );

    let { data } = await axios.post(
      `${process.env.MONGODB_URI}/action/find`,
      {
        dataSource: "Cluster0",
        database: process.env.DataBase,
        collection: "users",
        filter: {
          provider: "twitter",
        },
        projection: {},
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          apiKey: process.env.DATAAPI_KEY,
        },
      }
    );

    return res.status(201).send(data.documents);
    
  } catch (e) {
    console.error(e);
    return res.status(400).send("error");
  }
}
