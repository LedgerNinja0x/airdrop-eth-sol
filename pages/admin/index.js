import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import { useEffect, useState } from "react";
import axios from "axios";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Table from "@/components/Table";
import AirdropModal from "@/components/AirdropModal";
import StakingModal from "@/components/StakingModal";
import AirdropMessage from "@/components/AirdropMessage";
import ContractModal from "@/components/ContractModal";
import MessageModal from "@/components/MessageModal";
import SetBtn from "@/components/SetBtn";
import TweetMessage from "@/components/Modal";
import { ethers, Contract } from "ethers";
import TokenAbi from "@/Contracts/erc20.json";
import StakingAbi from "@/Contracts/Staking.json";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Button } from "@mui/material";
import { utils, writeFile } from "xlsx";
import { useAccount } from 'wagmi'
import React from "react";

const renderSummaryButton = (params) => {

  async function sendMessage(twitt_username, ethAddress) {
    
    if (!ethAddress) {
      toast.error("You can send tweet message to user who input ethereum wallet address");
      return;
    }

    try {
      //insert msg into required user

      //find and update with selectedUser
      const res = await axios.post("/api/me/message", {
        twitt_username,
      });
      if (res.status == 201) {
        toast.success("Message sent successfully");
        document.location.reload();
      }
    } catch (e) {
      if (e.response.status == 400){
        toast.error("Please set Tweet Message");
      } else {
        toast.error("Oops! Something Wrong");
      }
    }
  }

  return (
    <div className="flex flex-row w-full mt-[10px]">
      {!params.row.message?.text ?
      (<button className="flex items-center gap-x-1 bg-indigo-500 text-white text-sm px-2 py-1 rounded-md hover:bg-indigo-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4 -rotate-45"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
          />
        </svg>
        {/* dont show message btn is twitter already verified */}

        <span onClick={() => sendMessage(params.row.twitt_username, params.row.ethAddress)}>
          Message
        </span>

        {/* <span>{cell.render("Cell")}</span> */}
      </button>
      ) : (
      <a
        href={`https://twitter.com/${params.row.twitt_username}`}
        target="_blank"
        className="flex items-center gap-x-1 bg-gray-900 text-white text-sm px-2 py-1 rounded-md hover:bg-gray-800"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </svg>
        View
      </a>
      )
      }
    </div>
  )
}

export default function Page({users}) {
  
  const columns = [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 90, 
      sortable: false,
      filterable: false, 
    },
    {
      headerName: 'Actions',
      field: "",
      renderCell: renderSummaryButton,
      sortable: false,
      filterable: false,
      closest: false,
      width: 120
    },
    {
      headerName: 'Name',
      field: 'username',
    },
    {
      headerName: 'Twitter Verified',
      field: 'twitterVerified',
    },
    {
      headerName: 'IP',
      field: 'IP',
    },
    {
      headerName: 'Country',
      field: 'location',
    },
    {
      headerName: 'User Rating',
      field: 'userRating',
      type: "number"
    },
    {
      headerName: 'Eth Address',
      field: 'ethAddress',
    },
    {
      headerName: 'Wallet Balance',
      field: 'ethBalance',
    },
    {
      headerName: 'Tokens Airdropped',
      field: 'token_airdrop'
    },
    {
      headerName: 'Eth Gas',
      field: 'ethGas',
    },
    {
      headerName: 'Followers',
      field: 'followers_count',
    },
    {
      headerName: 'Following',
      field: 'following_count',
    },
    {
      headerName: 'Like Count',
      field: 'like_count',
    },
    {
      headerName: 'Twitter Username',
      field: 'twitt_username',
    },
    {
      headerName: 'Created At',
      field: 'createdAt',
    },

    // Add more columns as needed
  ]
  const [ isOpen, setIsOpen ] = useState(false);
  const [ isStakingOpen, setIsStakingOpen ] = useState(false);
  const [ isAirMsgOpen, setIsAirMsgOpen ] = useState(false);
  const [ isTweetOpen, setIsTweetOpen ] = useState(false);
  const [ isContractOpen, setIsContractOpen ] = useState(false);
  const [ isMessageOpen, setIsMessageOpen ] = useState(false);
  const [ openOwner, setOpenOwner ] = useState(false);
  const [ tokenContract, setTokenContract ] = useState(false);
  const [ stakingContract, setStakingContract ] = useState(false);
  const [ userData, setUserData ] = useState([]);
  const [ ownerAddress, setOwnerAddress] = useState("");
  const [ ownerAdd, changeOwnerAdd] = useState("");
  const [ isLoading, setLoading ] = useState(false);
  const [ topCount, setTopCount ] = useState(0);
  const [ adminId, setAdminId ] = useState("");
  const [ airdropMessage, setAirdropMessage ] = useState("");
  const [ tweetMessage, setTweetMessage ] = useState("");
  const [ contractAddress, setContractAddress ] = useState("");
  const [ tokenAddress, setTokenAddress ] = useState("");
  const [ hashtag, setHashTag ] = useState("");
  const { address } = useAccount();

  const handleUsers = async (userInfo) => {
    try {
      const result = await axios.post('/api/me/userInfo',{userInfo});
      if (result.status == 201) {
        const userList = result.data.map((item, index) => {
          return {
            ...item, id: index + 1
          }
        })
        setUserData(userList); 
      } else {
        setUserData(userInfo);
      }
    } catch (err) {
      setUserData(userInfo);
    }
    setLoading(false);
  }

  const getAdminData = async () => {
    const result = await axios.post('/api/me/getAdminData');
    if (result.status == 201) {
      const adminData = result.data[0];
      if (adminData) {
        setAdminId(adminData._id ? adminData._id : "");
        setAirdropMessage(adminData?.airdropMessage ? adminData.airdropMessage : "");
        setTweetMessage(adminData?.tweetMessage ? adminData.tweetMessage : "");
        setHashTag(adminData?.hashtag ? adminData.hashtag : "");
        setContractAddress(adminData?.contractAddress ? adminData?.contractAddress : "");
        setTokenAddress(adminData?.tokenAddress ? adminData?.tokenAddress : "");
      }
    }
  }

  const initializeTokenContract = async () => {
    try {
      const _provider = new ethers.providers.Web3Provider(window.ethereum);
      const _TokenContract = new Contract(
        tokenAddress,
        TokenAbi,
        _provider.getSigner(0)
      );
      setTokenContract(_TokenContract);
    } catch (error) {
      toast.error("Please Set Correct token Address");
    }
  }

  const initializeStakingContract = async () => {
    try {
      const _provider = new ethers.providers.Web3Provider(window.ethereum);
      const _StakingContract = new Contract(
        contractAddress,
        StakingAbi.abi,
        _provider.getSigner(0)
      );
      const owner = await _StakingContract.getOwner();
      setOwnerAddress(owner);
      setStakingContract(_StakingContract);
    } catch (err) {
      toast.error("Please Set Correct Contract Address");
    }
  }

  const doAirDrop = async (token) => {
    if (!address) {
      toast.error("Please connect wallet");
      return;
    }
    if (!ownerAddress) {
      toast.error("Contract Connect Error. Please reload this page");
      return;
    }
    if (ownerAddress.toLocaleLowerCase() != address.toLocaleLowerCase()) {
      toast.error(`you must be contract owner: ${ownerAddress}`);
      setIsOpen(false);
      return;
    }
    const tokenToWei = Number(ethers.utils.parseEther(token.toString(), 18).toString());
    const userList = userData.filter(entry => entry.twitterVerified === "yes" && entry.ethAddress !== "").sort((a, b) => b.userRating - a.userRating).slice(0, topCount);
    const userAddress = userList.map(entry => entry.ethAddress);
    setLoading(true);
    try {
      const approveTx = await tokenContract.approve(contractAddress, BigInt(tokenToWei * userAddress.length));
      const receipt = await approveTx.wait();
      if (receipt.status === 0) {
        toast.error("transaction failed");
      } else {
        const airdropTx = await stakingContract.doAirDrop(userAddress, BigInt(tokenToWei));
        const airdropReceipt = await airdropTx.wait();
        if(airdropReceipt.status === 0) {
          toast.error("transaction failed");
        } else {
          try {
            const result = await axios.post('/api/me/token',{userList, token, airdropMessage, tokenAddress})
            if (result.status == 201) {
              handleUsers(result.data);
            }
            toast.success("Success AirDrop");
          } catch (err) {
            console.log(err);
            toast.error("DataBase Connection Error");
          }
        }
      }
    } catch (error) {
      toast.error("Oops! Something Wrong");
    }
    setIsOpen(false);
    setLoading(false);
  }

  const doStaking = async (token, reward, period) => {
    if (!address) {
      toast.error("Please connect wallet");
      return;
    }
    if (!ownerAddress) {
      toast.error("Contract Connect Error. Please reload this page");
      return;
    }
    if (ownerAddress.toLocaleLowerCase() != address.toLocaleLowerCase()) {
      toast.error(`you must be contract owner: ${ownerAddress}`);
      setIsStakingOpen(false);
      return;
    }
    const userAddress = userData.filter(entry => entry.twitterVerified === "yes" && entry.ethAddress !== "").sort((a, b) => b.userRating - a.userRating).map(entry => entry.ethAddress).slice(0, topCount);
    const stakingPeriod = Math.floor(period * 60 * 60 * 24);
    const tokenToWei = Number(ethers.utils.parseEther(token.toString(), 18).toString());
    const rewardToWei = Number(ethers.utils.parseEther(reward.toString(), 18).toString());
    const approveAmount = tokenToWei + rewardToWei * stakingPeriod;
    setLoading(true);
    try {
      const approveTx = await tokenContract.approve(contractAddress, BigInt(approveAmount * userAddress.length));
      const receipt = await approveTx.wait();
      if (receipt.status === 0) {
        toast.error("transaction failed");
      } else {
        const stakingTx = await stakingContract.stake(userAddress, BigInt(tokenToWei), BigInt(stakingPeriod), BigInt(rewardToWei));
        const stakingReceipt = await stakingTx.wait();
        if (stakingReceipt.status === 0) {
          toast.error("transaction failed");
        } else {
          toast.success("staking success");
        }
      }
    } catch (error) {
      toast.error("Oops! Something Wrong.");
    }
    setIsStakingOpen(false);
    setLoading(false);
  }

  const changeOwnerAddress = async () => {
    if (!address) {
      toast.error("Please connect wallet");
      return;
    }
    if (ownerAdd == "") {
      toast.error("Pls input new Ower Address");
      return;
    }
    setLoading(true);
    if (ownerAddress.toLocaleLowerCase() != address.toLocaleLowerCase()) {
      toast.error(`you must be contract owner: ${ownerAddress}`);
      setOpenOwner(false);
      setLoading(false);
      return;
    }
    try {
      const stakingTx = await stakingContract.changeOwner(ownerAdd);
      const stakingReceipt = await stakingTx.wait();
      if (stakingReceipt == 0) {
        toast.error("transaction failed");
      } else{
        toast.success("Congratulations! Set new owner of contract");
        setOwnerAddress(ownerAdd);
      }
    } catch (error) {
      toast.error("Oops! something wrong");
    }
    setLoading(false);
    changeOwnerAdd("");
    setOpenOwner(false);
  }

  function generateExcelData() {
    const worksheet = utils.json_to_sheet(userData);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelData = writeFile(workbook, "products.xlsx", {
      compression: true,
    });
    const blob = new Blob([excelData], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "data.xlsx");
    document.body.appendChild(link);
    link.click();
  }

  const changeAirMsg = async (msg) => {
    try {
      const result = await axios.post('/api/me/airdropMsg',{id: adminId, msg});
      setAirdropMessage(msg);
      toast.success("Message Changed");
      setIsAirMsgOpen(false);
    } catch (err) {
      toast.error("Oops, something wrong!");
    }
  }

  const changeTweetMsg = async (msg, hashtag) => {
    try {
      const result = await axios.post('/api/me/tweetMessage',{id: adminId, msg, hashtag});
      setTweetMessage(msg);
      setHashTag(hashtag)
      toast.success("Message Changed");
      setIsTweetOpen(false);
    } catch (err) {
      toast.error("Oops, something wrong!");
    }
  }

  const changeContractAddress = async (contract, token) => {
    const checkContract = ethers.utils.isAddress(contract);
    const tokenContract = ethers.utils.isAddress(token);
    if (checkContract && tokenContract) {
      try {
        const result = await axios.post('/api/me/setContract',{id: adminId, contract, token});
        setContractAddress(contract);
        setTokenAddress(token);
        toast.success("Message Changed");
        setIsContractOpen(false);
      } catch (err) {
        toast.error("Oops, something wrong!");
      } 
    } else {
      toast.error("Please input valid address");
    }
  }

  const sendTopMessage = async (type, topCount) => {
    setLoading(true);
    let userList = userData.filter(entry => entry.twitterVerified != "yes" && entry.ethAddress !== "").sort((a, b) => b.userRating - a.userRating);
    if (type != "all") {
      userList.slice(0, topCount);
    }
    try {
      const result = await axios.post('/api/me/sendTopMessage', {userList, tweetMessage, hashtag});
      if (result.status == 201) {
        handleUsers(result.data);
      }
      toast.success("Message Sent");

    } catch (err) {
      if (err.response.status == 400){
        toast.error("Please set Tweet Message");
      } else {
        toast.error("Oops! Something Wrong");
      }
    }
    setLoading(false);
    setIsMessageOpen(false);
  }

  useEffect(() => {
    setLoading(true);
    handleUsers(users);
    getAdminData();
    if(!window.ethereum) {
      toast.error("No Ethereum wallet was detected.");
      return;
    }
  }, []);

  useEffect(() => {
    if (window.ethereum && address && contractAddress && tokenAddress) {
      initializeTokenContract();
      initializeStakingContract(); 
    }
  }, [address, contractAddress, tokenAddress])

  return (
    <>
    <ToastContainer />
    <div className="admin-dashboard min-h-screen h-fit flex flex-col justify-between">
      <Header/>
      <div className="p-12 pb-0">
        <div className="flex justify-between flex-col md:flex-row mb-6 gap-2">
          <div className="flex justify-center items-center lg:flex-row flex-col gap-3">
            <h1 className="font-bold text-2xl">Admin Dashboard</h1>
            <div className="text-nowrap">(Twitter Verified Accounts: {userData.filter(entry => entry.twitterVerified === "yes" && entry.ethAddress !== "").length})</div>
          </div>
          <div className="flex gap-1 flex-wrap">
          <button className="items-center bg-[#5A3214] text-white text-lg px-3 py-2 rounded-lg mx-2" style={{height: "fit-content"}} onClick={() => setIsMessageOpen(true)}>
              Send Message
            </button>
            <button className="items-center bg-[#5A3214] text-white text-lg px-3 py-2 rounded-lg mx-2" style={{height: "fit-content"}} onClick={() => generateExcelData()}>
              Export
            </button>
            <button className="items-center bg-[#5A3214] text-white text-lg px-3 py-2 rounded-lg mx-2" style={{height: "fit-content"}} onClick={() => location.reload()}>
              Reload
            </button>
            <button className="items-center bg-[#5A3214] text-white text-lg px-3 py-2 rounded-lg mx-2" style={{height: "fit-content"}} onClick={() => setIsOpen(true)}>
              Airdrop
            </button>
            {/* <button className="items-center bg-[#5A3214] text-white text-lg px-3 py-2 rounded-lg mx-2" style={{height: "fit-content"}} onClick={() => setIsStakingOpen(true)}>
              Staking
            </button> */}
            <SetBtn setIsAirMsgOpen={setIsAirMsgOpen} setOpenOwner={setOpenOwner} setIsTweetOpen={setIsTweetOpen} setIsContractOpen={setIsContractOpen}/>
          </div>
        </div>
        {
          userData && isLoading ? (
            <div className="loader-container">
                <div className="spinner"></div>
            </div>
          ) :
          <Table columns={columns} data={userData} />
        }
        <AirdropModal 
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          title={"Airdrop Manager"}
          description={
            "Please input information for airdrop"
          }
          action={doAirDrop}
          setTopCount={setTopCount}
          topCount={topCount}
        />
        <StakingModal 
          isOpen={isStakingOpen}
          setIsOpen={setIsStakingOpen}
          title={"Staking Manager"}
          description={
            "Please input information about staking"
          }
          action={doStaking}
          setTopCount={setTopCount}
          topCount={topCount}
        />
        <AirdropMessage 
          isOpen={isAirMsgOpen}
          setIsOpen={setIsAirMsgOpen}
          title={"Airdrop Message Manager"}
          action={changeAirMsg}
          message={airdropMessage}
        />
        <TweetMessage 
          isOpen={isTweetOpen}
          setIsOpen={setIsTweetOpen}
          title={"Tweet Message Manager"}
          description={
            "Please Change Tweet Message"
          }
          action={changeTweetMsg}
          message={tweetMessage}
          hashtag={hashtag}
        />
        <ContractModal 
          isOpen={isContractOpen}
          setIsOpen={setIsContractOpen}
          title={"Contract Manager"}
          description={
            "Please Set Contract Address"
          }
          action={changeContractAddress}
          contractAddress={contractAddress}
          tokenAddress={tokenAddress}
        />
        <MessageModal 
          isOpen={isMessageOpen}
          setIsOpen={setIsMessageOpen}
          title={"Message Manager"}
          description={
            "Please Input Message Info"
          }
          action={sendTopMessage}
          setTopCount={setTopCount}
          topCount={topCount}
        />
      </div>
      <Footer />
      <Dialog
        open={openOwner}
        onClose={() => setOpenOwner(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <div className="flex p-[24px]">
          <div>
            <DialogTitle id="alert-dialog-title" className="text-3xl font-bold">
            {"Do You Agree?"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                <div className="text-lg text-black">Do you want to change Owner?</div>
                <input 
                type='string'
                className="block mt-4 !outline-none rounded-md w-full px-4 border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-stone-600 sm:text-sm sm:leading-6"
                value={ownerAdd}
                placeholder="new address(ex: 0x0..)"
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
          </div>
          <div>
            <img src="../moose-airdrop.png" />
          </div>
        </div>
      </Dialog>
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

    return { props: {users: data.documents}};
  } catch (e) {
    console.log(e);
    return {
      props: {},
    };
  }
}
