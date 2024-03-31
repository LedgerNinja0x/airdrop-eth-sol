'use client'

import { useState, useEffect } from 'react';
import { ethers, Contract } from 'ethers';
import StakingAbi from "@/Contracts/Staking.json";
import TokenAbi from "@/Contracts/erc20.json";
import contractAddress from "@/Contracts/addresses.json";
import StakingBox from './StakingBox';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function StakingContent({name}) {
  const [ stakingContract, setStakingContract ] = useState(false);
  const [ walletAddress, setWalletAddress ] = useState("");
  const [stakingInfo, setStakingInfo] = useState(false);
  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("Oops! something wrong");
      return;
    }
    const [walletAddress] = await window.ethereum.request({ method: 'eth_requestAccounts' })
    setWalletAddress(walletAddress)
  }

  const initializeStakingContract = async () => {
    try {
      const _provider = new ethers.providers.Web3Provider(window.ethereum);
      const _StakingContract = new Contract(
        contractAddress.Staking,
        StakingAbi.abi,
        _provider.getSigner(0)
      );
      setStakingContract(_StakingContract);
      const stakingData = await _StakingContract.getUserStakingInfo();
      setStakingInfo(stakingData); 
    } catch (error) {
      toast.error("wallet connect error");
    }
  }

  const doWithDraw = async (id, amount) => {
    if (walletAddress == "") {
      connectWallet();
    }
    const withdrawAmount = await stakingContract.withdrawableAmount(id);
    const tokenToWei = Number(ethers.utils.parseEther(amount.toString(), 18).toString());
    if (tokenToWei > withdrawAmount) {
      toast.error("it's greater than your possible withdrawAmount");
      return;
    }
    try {
      const withDrawTx = await stakingContract.withdraw(id, BigInt(tokenToWei));
      const receipt = await withDrawTx.wait();
      if (receipt.status == 0) {
        toast.error("transaction failed");
      } else {
        const stakingData = await stakingContract.getUserStakingInfo();
        setStakingInfo(stakingData);
        const result = await updateUserInfo(name, amount);
        toast.success("Congratulations!, you get reward.");
      }
    } catch (error) {
      toast.error("Oops, something went wrong!");
    }
  }

  const doWithDrawAll = async (id) => {
    if (walletAddress == "") {
      connectWallet();
    }
    try {
      const withdrawAmount = await stakingContract.withdrawableAmount(id);
      const amount = Number(ethers.utils.formatEther(withdrawAmount).toString());
      const withAllTx = await stakingContract.withdrawAll(id);
      const receipt = await withAllTx.wait();
      if (receipt.status == 0) {
        toast.error("transaction failed");
      } else {
        const stakingData = await stakingContract.getUserStakingInfo();
        setStakingInfo(stakingData);
        const result = await updateUserInfo(name, amount);
        toast.success("Congratulations!, you get reward.");
      }
    } catch (error) {
      toast.error("Oops, something went wrong!");
    }
  }

  useEffect(() => {
    if(!window.ethereum) {
      toast.error("No Ethereum wallet was detected.");
      return;
    }
    connectWallet();
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      if (newAddress === undefined) {
          return resetState();
      }
      setWalletAddress(newAddress);
    })
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      initializeStakingContract(); 
    }
  }, [walletAddress])
  return (
    <>
    <section className="text-gray-600 body-font py-24">
      <h2 className="font-bold text-black text-4xl mb-4 text-center underline">
        Get Rewards from Staking
      </h2>
      <div className="container items-center mx-auto flex flex-col gap-5 text-[28px]">
        {
          stakingInfo && stakingInfo.length != 0 
          ? 
          stakingInfo.map((stake, index) => 
            ethers.utils.formatEther(stake.stakedAmount.toString()) != 0 ?
            <StakingBox stake={stake} id={index} doWithDraw={doWithDraw} doWithDrawAll={doWithDrawAll} key={index} />
            : null
          ) : 
          <div className='bg-[#EEE0B3] p-5'>
            You have not staking reward
          </div>
        }
      </div>
    </section>
    </>
  );
}

const updateUserInfo = async (name, amount) => {
  try {
    const { data } = await axios.post(
      `${process.env.MONGODB_URI}/action/findOne`,
      {
        dataSource: "Cluster0",
        database: process.env.DataBase,
        collection: "users",
        filter: {
          username: name,
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
    let { ethAddress, solAddress, username, tokenBalance, tokenValue } = data.document;
    try {
      const _provider = new ethers.providers.Web3Provider(window.ethereum);
      const _TokenContract = new Contract(
        contractAddress.Token,
        TokenAbi,
        _provider.getSigner(0)
      );
      tokenValue = await _TokenContract.balanceOf(ethAddress);
    } catch (error) {
      console.log(error);
    }
    tokenBalance += amount;
  
    const result = await axios.post('/api/me/balance',{ethAddress, solAddress, username, followers: data.document.followers_count, tokenBalance, tokenValue});    
    if (result.status == 201) {
      return 1;
    } else {
      return 0;
    }
  } catch (error) {
    console.log(error);
    return 0;
  }
}