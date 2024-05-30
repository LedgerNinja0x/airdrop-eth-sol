import axios from "axios";

export default async function handler(req, res) {
    try {
        await axios.post(
            `${process.env.MONGODB_URI}/action/updateMany`,
            {
                dataSource: "Cluster0",
                database: process.env.DataBase,
                collection: "users",
                filter: {
                    username: {$ne: "admin"}
                },
                update: {
                    $set: {
                        twitterVerified: "no",
                        message: "",
                        firstTag: 0
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
        )

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
    } catch (err) {
        console.log(err);
        return res.status(404).send(false);
    }
}
