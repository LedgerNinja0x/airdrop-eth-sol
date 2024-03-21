import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import { useEffect, useState } from "react";
import axios from "axios";
import Header from "@/components/Header";
import Table from "@/components/Table";
import AirdropModal from "@/components/AirdropModal";
import StakingModal from "@/components/StakingModal";
import NoWalletDetected from "@/components/NoWalletDetected";
import { ethers, Contract } from "ethers";
import contractAddress from "@/Contracts/addresses.json";
import TokenAbi from "@/Contracts/erc20.json";
import AirDropAbi from "@/Contracts/airDrop.json";
import StakingAbi from "@/Contracts/Staking.json";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Button } from "@mui/material";

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
      Header: 'Token Balance',
      accessor: 'tokenBalance'
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
  const [ isOpen, setIsOpen ] = useState(false);
  const [ isStakingOpen, setIsStakingOpen ] = useState(false);
  const [ walletAddress, setWalletAddress ] = useState("");
  const [ airDropContract, setAirDropContract ] = useState(false);
  const [ tokenContract, setTokenContract ] = useState(false);
  const [ stakingContract, setStakingContract ] = useState(false);
  const [ userData, setUserData ] = useState(false);
  const [ ownerAddress, setOwnerAddress] = useState("");
  const [ ownerAdd, changeOwnerAdd] = useState("");
  const [ openOwner, setOpenOwner ] = useState(false);

  const connectWallet = async () => {
    const [walletAddress] = await window.ethereum.request({ method: 'eth_requestAccounts' })
    setWalletAddress(walletAddress)
  }

  const initializeContract = async () => {
    const _provider = new ethers.providers.Web3Provider(window.ethereum);
    const _AirDropContract = new Contract(
      contractAddress.AirDrop,
      AirDropAbi.abi,
      _provider.getSigner(0)
    );
    setAirDropContract(_AirDropContract);
    const owner = await _AirDropContract.getOwner();
    setOwnerAddress(owner);
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

  const initializeStakingContract = async () => {
    const _provider = new ethers.providers.Web3Provider(window.ethereum);
    const _StakingContract = new Contract(
      contractAddress.Staking,
      StakingAbi.abi,
      _provider.getSigner(0)
    );
    setStakingContract(_StakingContract);
  }

  const doAirDrop = async (token) => {
    if (walletAddress == "") {
      await connectWallet();
    }
    if (ownerAddress != walletAddress) {
      toast.error("You must be contract owner.");
      return;
    }
    const tokenToWei = Number(ethers.utils.parseEther(token.toString(), 18).toString());
    const userList = userData.sort((a, b) => b.userRating - a.userRating).slice(0, 100).filter(entry => entry.twitterVerified === "yes" && entry.ethAddress !== "");
    const userAddress = userList.map(entry => entry.ethAddress);
    try {
      const approveTx = await tokenContract.approve(contractAddress.AirDrop, BigInt(tokenToWei * userAddress.length));
      const receipt = await approveTx.wait();
      if (receipt.status === 0) {
          console.log("transaction failed");
      } else {
        const airdropTx = await airDropContract.doAirDrop(userAddress, BigInt(tokenToWei));
        const airdropReceipt = await airdropTx.wait();
        if(airdropReceipt.status === 0) {
          toast.error("transaction failed");
        } else {
          const result = await axios.post('/api/me/token',{userList, token})
          if (result.status == 201) {
            setUserData(result.data);
          }
          toast.success("Success AirDrop");
          setIsOpen(false);
        }
      }
    } catch (error) {
        console.log(error);
    }
  }

  const doStaking = async (token, reward, period, periodType) => {
    if (walletAddress == "") {
      await connectWallet();
    }
    if (ownerAddress != walletAddress) {
      toast.error("you must be contract owner");
      return;
    }
    const userAddress = userData.sort((a, b) => b.userRating - a.userRating).filter(entry => entry.twitterVerified === "yes" && entry.ethAddress !== "").map(entry => entry.ethAddress).slice(0, 100);
    let stakingPeriod;
    if (periodType == 1) {
      stakingPeriod = period * 60 * 60 * 24;
    } else if( periodType == 2) {
      stakingPeriod = 60 * 60 * 24 * 30 * period;
    } else {
      stakingPeriod = 60 * 60 * 24 * 365 * period;
    }
    const tokenToWei = Number(ethers.utils.parseEther(token.toString(), 18).toString());
    const rewardToWei = Number(ethers.utils.parseEther(reward.toString(), 18).toString());
    const approveAmount = tokenToWei + rewardToWei * stakingPeriod;
    try {
      const approveTx = await tokenContract.approve(contractAddress.Staking, BigInt(approveAmount * userAddress.length));
      const receipt = await approveTx.wait();
      if (receipt.status === 0) {
        console.log("transaction failed");
      } else {
        const stakingTx = await stakingContract.stake(userAddress, BigInt(tokenToWei), BigInt(stakingPeriod), BigInt(rewardToWei));
        const stakingReceipt = await stakingTx.wait();
        if (stakingReceipt.status === 0) {
          console.log("transaction failed");
        } else {
          toast.success("staking success");
          setIsStakingOpen(false);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  const changeOwnerAddress = async () => {
    try {
      const airdropTx = await airDropContract.changeOwner(ownerAdd);
      const receipt = await airdropTx.wait();
      if(receipt.status == 0) {
        toast.error("transaction failed");
      }  else {
        const stakingTx = await stakingContract.changeOwner(ownerAdd);
        const stakingReceipt = await stakingTx.wait();
        if (stakingReceipt == 0) {
          toast.error("transaction failed");
        } else{
          toast.success("Congratulations! Set new owner of contract");
          setOwnerAddress(ownerAdd);
        }
      }
    } catch (error) {
      
    }
    changeOwnerAdd("");
    setOpenOwner(false);
  }

  useEffect(() => {
    if(!window.ethereum) {
      return NoWalletDetected;
    }
    if (walletAddress == "") {
        connectWallet();
    }
    setUserData(users);
    window.ethereum.on("accountsChanged", ([newAddress]) => {
        if (newAddress === undefined) {
            return resetState();
        }
        setWalletAddress(newAddress);
    })
  }, []);

  useEffect(() => {
    initializeContract();
    initializeTokenContract();
    initializeStakingContract();
  }, [walletAddress])

  return (
    <>
      <Header />
      <ToastContainer/>
      <div className="p-12 pb-0">
        <div className="flex justify-between">
          <h1 className="font-bold text-3xl mb-12">Admin Dashboard</h1>
          <div className="">
            <button className="items-center bg-indigo-500 text-white text-lg px-3 py-2 rounded-lg hover:bg-indigo-400 mx-2" onClick={() => setOpenOwner(true)}>
              Change Owner
            </button>
            <button className="items-center bg-indigo-500 text-white text-lg px-3 py-2 rounded-lg hover:bg-indigo-400 mx-2" onClick={() => setIsOpen(true)}>
              Airdrop
            </button>
            <button className="items-center bg-indigo-500 text-white text-lg px-3 py-2 rounded-lg hover:bg-indigo-400 mx-2" onClick={() => setIsStakingOpen(true)}>
              Staking
            </button>
          </div>
        </div>
        {
          userData ?
          <Table columns={columns} data={userData} /> : ""
        }
        <AirdropModal 
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        title={"Airdrop Manager"}
        description={
          "Please inpurt token number for airdrop"
        }
        action={doAirDrop}
        />
        <StakingModal 
        isOpen={isStakingOpen}
        setIsOpen={setIsStakingOpen}
        title={"Staking Manager"}
        description={
          "Please input information about staking"
        }
        action={doStaking}
        />
      </div>
      <Dialog
        open={openOwner}
        onClose={() => setOpenOwner(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
    >
        <DialogTitle id="alert-dialog-title">
        {"Do you agree?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Do you Change Owner?
            <input 
            type='string'
            className="block mt-4 !outline-none rounded-md w-full px-4 border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            value={ownerAdd}
            placeholder="0x0.."
            onChange={(e) => changeOwnerAdd(e.target.value)} 
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
        <Button onClick={() => {setOpenOwner(false)}}>Disagree</Button>
        <Button onClick={() => {changeOwnerAddress()}} autoFocus>
            Agree
        </Button>
        </DialogActions>
      </Dialog>
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
