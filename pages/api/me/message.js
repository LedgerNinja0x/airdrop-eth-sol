import axios from "axios";


export default async function handler(req, res) {
  try {
    //insert a msg
    if (req.method == 'POST') {
      await axios.post(
        `${process.env.MONGODB_URI}/action/updateOne`,
        {
          dataSource: "Cluster0",
          database: process.env.DataBase,
          collection: "users",
          filter: {
            twitt_username: req.body.twitt_username,
          },
          update: {
            $set: {
              message: {
                text: process.env.MESSAGE,
                hashtags: process.env.HASHTAGS.split(","),
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

      console.log('user updated backend')

      return res.status(201).send("user updated successfully");
    } else {
      console.log(req.body.username,'username backend')
      //retrieve a msg GET /api/me/message @req.body.username: required
      let {data} = await axios.post(
        `${process.env.MONGODB_URI}/action/findOne`,
        {
          dataSource: "Cluster0",
          database: process.env.DataBase,
          collection: "users",
          filter: {
            username: req.query.username,
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

      console.log('user fetched for msg',data.document)

      res.status(200).json(data.document.message)
    }
  } catch (e) {
    console.error(e);
  }
}
