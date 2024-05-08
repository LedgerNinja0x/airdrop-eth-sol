import axios from "axios";


export default async function handler(req, res) {
    console.log(req.body);
    try {
        const { data } = await axios.post(
            `${process.env.MONGODB_URI}/action/findOne`,
            {
                dataSource: "Cluster0",
                database: process.env.DataBase,
                collection: "users",
                filter: {
                    username: req.body.name,
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

        return res.status(201).send(data.document);

    } catch (e) {
        console.error(e);
    }
}
