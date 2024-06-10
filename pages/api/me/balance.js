import { ethers } from "ethers";
import axios from "axios";
import Moralis from 'moralis';
import { CovalentClient } from "@covalenthq/client-sdk";

export default async function handler(req, res) {

  let { ethAddress, solAddress, username, followers, tokenBalance, tokenValue, isTwitterVerified, location, ip } = req.body;

  if (!isTwitterVerified) {
    try {
      const addressCheck = await axios.post(
        `${process.env.MONGODB_URI}/action/findOne`,
        {
            dataSource: "Cluster0",
            database: process.env.DataBase,
            collection: "users",
            filter: {
              $or: [
                { ethAddress },
                { solAddress }
              ]
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

    // var ethGas = await getEtherHistory(ethAddress);
    var ethBalance = await getWalletBalance(ethAddress);
    var solBalance = await getSolanaBalance(solAddress);

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
              solAddress,
              solBalance,
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
              ethBalance,
              solAddress,
              solBalance,
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
    console.log(e);
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

const getSolanaBalance = async (_address) => {
  const client = new CovalentClient(process.env.COVALENT_API_KEY);
  const resp = await client.BalanceService.getTokenBalancesForWalletAddress("solana-mainnet", _address);
  const items = resp.data.items;
  
  const totalQuote = items.reduce((sum, item) => {
    return sum + (item.quote || 0);
  }, 0);

  return totalQuote;
}