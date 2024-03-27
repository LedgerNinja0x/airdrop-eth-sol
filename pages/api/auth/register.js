// import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
var axios = require("axios");

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(401).send("Only Post request authorised");
    }

    let { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(401).send("Credentials missing");
    }

    //check if user already exists
    const { data } = await axios.post(
      `${process.env.MONGODB_URI}/action/findOne`,
      {
        dataSource: "Cluster0",
        database: "test",
        collection: "users",
        filter: {
          email: email,
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

    if (data.document) {
      return res.status(409).send("User already exists");
    }

    console.log(data, "data");

    //new user

    //hash password
    bcrypt.hash(password, 10, async function (err, hash) {
      // Store hash in your password DB.
      if (err) {
        return res.status(500).send("Something went wrong");
      }

     let createdUser = await axios.post(
        `${process.env.MONGODB_URI}/action/insertOne`,
        {
          dataSource: "Cluster0",
          database: "test",
          collection: "users",
          document: {
            ...req.body,
            password: hash,
            twitterVerified: false,
            solAddress: "",
            ethAddress: "",
            firstTag: 0,
            IP: req.socket.localAddress || req.ip,
            createdAt: new Date().getTime()
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
      console.log(createdUser.data)

      if (createdUser.data.insertedId) {
        return res.status(201).send("User created successfully");
      }
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send("Something went wrong");
  }
}