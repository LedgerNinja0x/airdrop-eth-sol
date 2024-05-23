import { ethers } from "ethers";
import axios from "axios";
import Moralis from 'moralis';

export default async function handler(req, res) {

  let { ethAddress, username, followers, tokenBalance, tokenValue, isTwitterVerified, location, ip } = req.body;

  if (!isTwitterVerified) {
    try {
      const addressCheck = await axios.post(
        `${process.env.MONGODB_URI}/action/findOne`,
        {
            dataSource: "Cluster0",
            database: process.env.DataBase,
            collection: "users",
            filter: {
                ethAddress,
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
      console.log("addressCheck", );
  
      if (addressCheck?.data?.document) {
        res.status(401).send("duplicate");
        return;
      }
    } catch (err) {
      console.log(err);
    }
  }

  try {
    //req.body contains ethAddress and solAddress
    //POST /api/me/balance
    //After checking the balance update user schema

    var ethGas = await getEtherHistory(ethAddress);
    var ethBalance = await getWalletBalance(ethAddress);

    let firstTag = 0;

    if (isTwitterVerified) {
      firstTag = 1; 
    }

    var data;
    //update their balance in database
    if (location) {
      data = await axios.post(
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
              ethAddress,
              ethBalance,
              ethGas,
              tokenBalance,
              tokenValue,
              followers_count: followers,
              firstTag,
              IP: ip,
              location,
              isAirMsgRead: 1
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
    } else {
      data = await axios.post(
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
              ethAddress,
              ethGas,
              tokenBalance,
              tokenValue,
              followers_count: followers,
              firstTag
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

    res.status(201).send("Balance Updated");
  } catch (e) {
    res.status(500).send("Something went wrong");
  }
}

let myEtherScanInstance = new ethers.providers.EtherscanProvider();

const getEtherHistory = (_address) => {
  return myEtherScanInstance
    .getHistory(_address)
    .then((data) => {
      let sum = 0;
      data.map((key) => {
        sum += Number(key.gasPrice._hex);
      });
      return sum;
    })
    .catch((e) => {
      return 0;
    });
};

const getWalletBalance = async (_address) => {
  if (!Moralis.Core.isStarted) {
    await Moralis.start({
      apiKey: process.env.MORALIS_API_KEY
    });
  }

  const response = await Moralis.EvmApi.wallets.getWalletTokenBalancesPrice({
    "chain": "0x1",
    "address": _address
  });

  const result = response.toJSON().result;
  let sum = 0;
  result.map(key => {
    sum += key.usd_value;
  })

  return sum;
}