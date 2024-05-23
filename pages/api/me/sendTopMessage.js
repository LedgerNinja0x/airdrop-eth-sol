import axios from "axios";


export default async function handler(req, res) {
  try {
    const users = req.body.userList;
    const msg = req.body.msg;
    users.map(async user => {
        await axios.post(
            `${process.env.MONGODB_URI}/action/updateOne`,
            {
              dataSource: "Cluster0",
              database: process.env.DataBase,
              collection: "users",
              filter: {
                twitt_username: user.twitt_username,
              },
              update: {
                $set: {
                    isAirMsgRead: 0
                },
                $push: {
                    topMessage: {title: "Admin Notification", content: msg}
                }
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

    return res.status(201).send("success");
    
  } catch (e) {
    console.error(e);
  }
}
