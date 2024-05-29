import axios from "axios";
import needle from "needle";

export default async function handler(req, res) {
  try {
    //this is a POST route /api/me/verify
    //takes in message,hashtags,username and url from req.body
    //uses twitter graphql and cookies to fetch that particular tweet in the url
    //checks if the content in the tweet includes message and hastags
    //If yes then updates the user document(username) => set twitterVerified: true and return a 201 response else 400
    const { message, hashtags, username, url, twittUsername } = req.body;
    if (!message || !hashtags || !username || !url) {
      return res.status(401).send("body missing");
    }

    let arr = url.split("/");
    let id = arr[arr.length - 1];
    let tweetUsername = arr[arr.length - 3];
    
    if (!id) {
      return res.status(401).send("Wrong url format");
    }

    if (!tweetUsername === twittUsername) {
      return res.status(500).send("wrong user");
    }

    const resp = await getTweet(id);

    const tweetText = resp.text;
    const tweetHashtags = Object.values(resp?.entities?.hashtags);

    let verified = false;

    let num = 0;

    hashtags.forEach((tag) => {
      if (!tweetHashtags[num] || tweetHashtags[num].tag !== tag) {
        verified = false;
        return;
      } else {
        verified = true;
      }
      num++;
    });

    if (!tweetText.includes(message)) {
      verified = false;
    }

    if (verified) {
      await axios.post(
        `${process.env.MONGODB_URI}/action/updateOne`,
        {
          dataSource: "Cluster0",
          database: process.env.DataBase,
          collection: "users",
          filter: {
            username,
          },
          update: {
            $set: {
              twitterVerified: "yes",
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
      res.status(201).send("user verified and updated successfully");
    } else {
      res.status(401).send("Tweet doesn't match. Check msg and hashtag carefully.");
    }
  } catch (e) {
    console.error(e);
    res.status(500).send('Something went wrong')
  }
}

async function getTweet(id) {

    const endpointURL = "https://api.twitter.com/2/tweets/" + id;
    
    const token = process.env.BEARER_TOKEN;

    // These are the parameters for the API request
    // specify Tweet IDs to fetch, and any additional fields that are required
    // by default, only the Tweet ID and text are returned
    const params = {
        "tweet.fields": "entities", // Edit optional query parameters here
        "user.fields": "created_at" // Edit optional query parameters here
    }

    // this is the HTTP header that adds bearer token authentication
    const res = await needle('get', endpointURL, params, {
        headers: {
            "User-Agent": "v2TweetLookupJS",
            "authorization": `Bearer ${token}`
        }
    })

    console.log(res.body);

    if (res.body) {
        return res.body.data;
    } else {
        return "";
    }
}
