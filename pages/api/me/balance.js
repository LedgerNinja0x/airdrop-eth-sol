import { ethers } from "ethers";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  Connection,
  clusterApiUrl,
} from "@solana/web3.js";
import axios from "axios";
import Moralis from 'moralis';

const connection = new Connection(clusterApiUrl("mainnet-beta"));

export default async function handler(req, res) {
  try {
    //req.body contains ethAddress and solAddress
    //POST /api/me/balance
    //After checking the balance update user schema

    let { ethAddress, solAddress, username, followers, tokenBalance, tokenValue, isTwitterVerified, location, ip } = req.body;
    
    var { solBalance, solGas } = await getSolBalance(solAddress);

    var ethGas = await getEtherHistory(ethAddress);
    var ethBalance = await getWalletBanace(ethAddress);

    let firstTag = 0;

    if (isTwitterVerified) {
      firstTag = 1; 
    }
    var data;
    //update their balance in database
    if (location) {
      data  = await axios.post(
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
              solAddress,
              ethBalance,
              solBalance,
              ethGas,
              solGas,
              tokenBalance,
              tokenValue,
              followers_count: followers,
              firstTag,
              IP: ip,
              location,
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
              solAddress,
              solBalance,
              ethGas,
              solGas,
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
    console.error(e);
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
      console.error(e)
      return 0;
    });
};

const getSolBalance = async (address) => {
  const publicKey = new PublicKey(address);
  const transactionList = await connection.getSignaturesForAddress(publicKey);
  let signatureList = transactionList.map(
    (transaction) => transaction.signature
  );
  let transactionDetails = await connection.getParsedTransactions(
    signatureList,
    { maxSupportedTransactionVersion: 0 }
  );
  let solGas = 0;
  transactionDetails.map(async (data) => {
    solGas += Number(data.meta.fee);
  });
  const balance = await connection.getBalance(publicKey);
  const solBalance = balance / LAMPORTS_PER_SOL;
  return { solBalance, solGas };
};

const getWalletBanace = async (_address) => {
  try {
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
  } catch (e) {
    console.error(e);
    return 0;
  }
}