import { ethers } from "ethers";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  Connection,
  clusterApiUrl,
} from "@solana/web3.js";
import axios from "axios";

const connection = new Connection(clusterApiUrl("mainnet-beta"));

// fake sol: 76xVTNxn6XdAUVgpTpU6SoWfAE1pUF42rc8ist5fzGLB
// fake eth: 0xAD12B2F3f331c72d18eE7525d9Dba3F217C54349

export default async function handler(req, res) {
  try {
    //req.body contains ethAddress and solAddress
    //POST /api/me/balance
    //After checking the balance update user schema

    let { ethAddress, solAddress, username, followers, tokenBalance, tokenValue, isTwitterVerified } = req.body;

    let { solBalance, solGas } = await getSolBalance(solAddress);

    let ethGas = await getEtherHistory(ethAddress);

    let firstTag = 0;

    if (isTwitterVerified) {
      firstTag = 1; 
    }

    //update their balance in database
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
            ethAddress,
            solAddress,
            solBalance,
            userRating,
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
    );

    res.status(201).send("Balance updated successfully!");
  } catch (e) {
    console.error(e);
    res.status(500).send("Something went wrong");
  }
}

const myEtherScanInstance = new ethers.providers.MyEtherscanProvider();

const getEtherHistory = (_address) => {
  return myEtherScanInstance
    .getHistory(_address)
    .then((data) => {
      let sum = 0;
      data.map((key) => {
        sum += Number(key.gasUsed);
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