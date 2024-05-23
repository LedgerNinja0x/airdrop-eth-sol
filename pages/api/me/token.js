import axios from "axios";

export default async function handler(req, res) {
  try {
    const users = req.body.userList;
    const airdropMsg = req.body?.airdropMessage ? req.body.airdropMessage : "";

    const filter = [];
    const tokenBalance = Number(req.body.token);
    const tokenContract = req.body.tokenAddress;

    users.map(async user => {
        filter.push({twitt_username: user.twitt_username});
    });

    await axios.post(
      `${process.env.MONGODB_URI}/action/updateMany`,
      {
        dataSource: "Cluster0",
        database: process.env.DataBase,
        collection: "users",
        filter: {
          $or: filter,
          tokenBalance: {
            $elemMatch: {
              contract: {tokenContract}
            }
          }
        },
        update: {
          $push: {
            topMessage: {title: "Airdrop Success", content: airdropMsg}
          },
          $set: {}
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

    console.log(data.documents);

    return res.status(201).send(data.documents);
    
  } catch (e) {
    console.log(e);
    return res.status(404).send(false);
  }
}
