import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import { useEffect, useState } from "react";
import axios from "axios";
import Header from "@/components/Header";
import Table from "@/components/Table";
import AirdropModal from "@/components/AirdropModal";
import NoWalletDetected from "@/components/NoWalletDetected";
import { ethers, Contract } from "ethers";
import contractAddress from "@/Contracts/addresses.json";
import AirDropAbi from "@/Contracts/airDrop.json";
import TokenAbi from "@/Contracts/erc20.json";

export default function Page({users}) {
  const columns = [
    {
      Header: 'Actions',
      accessor: 'message',
    },
    {
      Header: 'Name',
      accessor: 'username',
    },
    {
      Header: 'Twitter Verified',
      accessor: 'twitterVerified',
    },
    {
      Header: 'IP',
      accessor: 'IP',
    },
    {
      Header: 'Country',
      accessor: 'location',
    },
    {
      Header: 'User Rating',
      accessor: 'userRating',
    },
    {
      Header: 'Sol Address',
      accessor: 'solAddress',
    },
    {
      Header: 'Eth Address',
      accessor: 'ethAddress',
    },
    {
      Header: 'Eth Balance',
      accessor: 'ethBalance',
    },
    {
      Header: 'Sol Balance',
      accessor: 'solBalance',
    },
    {
      Header: 'Eth Gas',
      accessor: 'ethGas',
    },
    {
      Header: 'Sol Gas',
      accessor: 'solGas',
    },
    {
      Header: 'Followers',
      accessor: 'followers_count',
    },
    {
      Header: 'Following',
      accessor: 'following_count',
    },
    {
      Header: 'Like Count',
      accessor: 'like_count',
    },
    {
      Header: 'Twitter Username',
      accessor: 'twitt_username',
    },
    {
      Header: 'Created At',
      accessor: 'createdAt',
    },

    // Add more columns as needed
  ]
  const [isOpen, setIsOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [ airDropContract, setAirDropContract ] = useState(false);
  const [ tokenContract, setTokenContract ] = useState(false);

  const connectWallet = async () => {
    const [walletAddress] = await window.ethereum.request({ method: 'eth_requestAccounts' })
    setWalletAddress(walletAddress)

    window.ethereum.on("accountsChanged", ([newAddress]) => {
        if (newAddress === undefined) {
            return resetState();
        }
        setWalletAddress(newAddress);
    })
  }

  const initializeContract = async () => {
    const _provider = new ethers.providers.Web3Provider(window.ethereum);
    const _AirDropContract = new Contract(
      contractAddress.AirDrop,
      AirDropAbi.abi,
      _provider.getSigner(0)
    );
    setAirDropContract(_AirDropContract);
  }

  const initializeTokenContract = async () => {
    const _provider = new ethers.providers.Web3Provider(window.ethereum);
    const _TokenContract = new Contract(
      contractAddress.Token,
      TokenAbi,
      _provider.getSigner(0)
    );
    setTokenContract(_TokenContract);
  }

  const doAirDrop = async (token) => {
    if (walletAddress === "") {
      connectWallet();
    }
    const tokenToWei = Number(ethers.utils.parseEther(token.toString(), 18).toString());
    const userAddress = users.filter(entry => entry.twitterVerified === "yes" && entry.ethAddress !== "").map(entry => entry.ethAddress);
    try {
      const approveTx = await tokenContract.approve(contractAddress.AirDrop, BigInt(tokenToWei * userAddress.length));
      const receipt = await approveTx.wait();
      if (receipt.status === 0) {
          console.log("transaction failed");
      } else {
        const airdropTx = await airDropContract.doAirDrop(userAddress, BigInt(tokenToWei));
        const airdropReceipt = await airdropTx.wait();
        if(airdropReceipt.status === 0) {
          console.log("transaction failed");
        }
      }
    } catch (error) {
        console.log(error);
    }
  }

  useEffect(() => {
    if(!window.ethereum) {
      return NoWalletDetected;
    }
    initializeContract();
    initializeTokenContract();
  }, []);

  return (
    <>
      <Header />
      <div className="p-12 pb-0">
        <div className="flex justify-between">
          <h1 className="font-bold text-3xl mb-12">Admin Dashboard</h1>
          <div className="">
            <button className="items-center bg-indigo-500 text-white text-lg px-3 py-2 rounded-lg hover:bg-indigo-400 mx-2" onClick={() => setIsOpen(true)}>
              Airdrop
            </button>
            <button className="items-center bg-indigo-500 text-white text-lg px-3 py-2 rounded-lg hover:bg-indigo-400 mx-2">
              Staking
            </button>
          </div>
        </div>
        <Table columns={columns} data={users} />
        <AirdropModal 
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        title={"Airdrop Manager"}
        description={
          "Please inpurt token number for airdrop"
        }
        action={doAirDrop}
        />
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  try {
    const session = await getServerSession(
      context.req,
      context.res,
      authOptions
    );

    // Protect route from unlogged users
    if (!session) {
      return { redirect: { destination: "/admin/login" } };
    }

    //this is entire admin auth
    //change this to change admin credentials

    if (
      session?.user?.email !== process.env.ADMIN_EMAIL &&
      session?.user?.name !== process.env.ADMIN_USERNAME
    ) {
      return { redirect: { destination: "/admin/login" } };
    }

    //get all user data and pass it as props
    let {data} = await axios.post(
      `${process.env.MONGODB_URI}/action/find`,
      {
        dataSource: "Cluster0",
        database: "test",
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

    return { props: {users: data.documents} };
  } catch (e) {
    console.log(e);
    return {
      props: {},
    };
  }
}
