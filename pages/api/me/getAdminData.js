import axios from "axios";

export default async function handler(req, res) {
    try {
        let { data } = await axios.post(
            `${process.env.MONGODB_URI}/action/find`,
            {
              dataSource: "Cluster0",
              database: process.env.DataBase,
              collection: "adminData",
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
    } catch (err) {
        console.log(err);
        return res.status(404).send(false);
    }
}
