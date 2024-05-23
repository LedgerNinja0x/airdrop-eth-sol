import axios from "axios";
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    try {
        const Id = req.body.id;
        const contractAddress = req.body.contract;
        const tokenAddress = req.body.token;

        if (Id == "") {
          let createdUser = await axios.post(
            `${process.env.MONGODB_URI}/action/insertOne`,
            {
              dataSource: "Cluster0",
              database: process.env.DataBase,
              collection: "adminData",
              document: {
                contractAddress,
                tokenAddress
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
        } else {
            const MongoId = new ObjectId(Id);
            const data = await axios.post(
                `${process.env.MONGODB_URI}/action/updateOne`,
                {
                  dataSource: "Cluster0",
                  database: process.env.DataBase,
                  collection: "adminData",
                  filter: {
                    _id : {
                        $oid: MongoId,
                    },
                  },
                  update: {
                    $set: {
                        contractAddress,
                        tokenAddress
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
        }

        await axios.post(
            `${process.env.MONGODB_URI}/action/updateMany`,
            {
              dataSource: "Cluster0",
              database: process.env.DataBase,
              collection: "users",
              filter: {
                "tokenBalance.contract" : { $ne: tokenAddress }
              },
              update: {
                $push: {
                  tokenBalance: {contract: tokenAddress, balance: 0}
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

        return res.status(201).send(true);
    } catch (err) {
        console.log(err);
        return res.status(404).send(false);
    }
}
