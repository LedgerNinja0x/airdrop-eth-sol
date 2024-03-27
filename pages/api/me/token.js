import axios from "axios";
import { getUserRating } from "@/lib/util";


export default async function handler(req, res) {
  try {
    const users = req.body.userList;
    users.map(async user => {
        const tokenBalance = Number(user.tokenBalance) + Number(req.body.token);
        const tokenValue = Number(user.tokenValue) + Number(req.body.token);

        const userRating = getUserRating(user.solBalance, user.ethBalance, tokenBalance, tokenValue, user.solGas, user.ethGas, user.followers);
        await axios.post(
            `${process.env.MONGODB_URI}/action/updateOne`,
            {
              dataSource: "Cluster0",
              database: process.env.DataBase
              collection: "users",
              filter: {
                twitt_username: user.twitt_username,
              },
              update: {
                $set: {
                    tokenBalance: tokenBalance.toString(),
                    tokenValue: tokenValue.toString(),
                    userRating: userRating
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
    });

    let {data} = await axios.post(
        `${process.env.MONGODB_URI}/action/find`,
        {
          dataSource: "Cluster0",
          database: process.env.DataBase
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
  }
}
