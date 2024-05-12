'use client'

import { useState, useEffect } from 'react';
import { ethers, Contract } from 'ethers';
import StakingAbi from "@/Contracts/Staking.json";
import contractAddress from "@/Contracts/addresses.json";
import StakingBox from './StakingBox';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAccount } from 'wagmi'
import 'react-toastify/dist/ReactToastify.css';

export default function StakingContent({name, setLoading}) {
  const [ stakingContract, setStakingContract ] = useState(false);
  const [ walletAddress, setWalletAddress ] = useState("");
  const [stakingInfo, setStakingInfo] = useState(false);

  const { address } = useAccount();

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

  const doWithDraw = async (id, amount, time) => {
    if (!address) {
      toast.error("Please connect wallet");
      return;
    }
    setLoading(true);
    if (time > 0) {
      const withdrawAmount = await stakingContract.withdrawableRewardAmount(id);
      const tokenToWei = Number(ethers.utils.parseEther(amount.toString(), 18).toString());
      if (tokenToWei > Number(withdrawAmount.toString())) {
        toast.error("it's greater than your possible withdrawAmount");
        setLoading(false);
        return;
      }
      try {
        const withDrawTx = await stakingContract.withdrawReward(id, BigInt(tokenToWei));
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
    } else {
      const withdrawAmount = await stakingContract.withdrawableAmount(id);
      const tokenToWei = Number(ethers.utils.parseEther(amount.toString(), 18).toString());
      if (tokenToWei > withdrawAmount) {
        toast.error("it's greater than your possible withdrawAmount");
        setLoading(false);
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
    setLoading(false);
  }

  const doWithDrawAll = async (id, time) => {
    if (!address) {
      toast.error("Please connect wallet");
      return;
    }
    setLoading(true);
    if (time > 0) {
      try {
        const withdrawAmount = await stakingContract.withdrawableRewardAmount(id);
        const amount = Number(ethers.utils.formatEther(withdrawAmount).toString());
        const withAllTx = await stakingContract.withdrawRewardAll(id);
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
    } else {
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
    setLoading(false);
  }

  useEffect(() => {
    if(!window.ethereum) {
      toast.error("No Ethereum wallet was detected.");
      return;
    }
  }, []);

  useEffect(() => {
    if (window.ethereum && address) {
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
    const res = await axios.post('/api/me/userData', {name});
    let { ethAddress, solAddress, username, tokenBalance, tokenValue, followers_count } = res.data;
    tokenBalance = Number(tokenBalance) + Number(amount);
    const result = await axios.post('/api/me/balance',{ethAddress, solAddress, username, followers: followers_count, tokenBalance, tokenValue, isTwitterVerified: 0, location: "", ip: ""});    
    if (result.status == 201) {
      return 1;
    } else {
      return 0;
    }
  } catch (error) {
    return 0;
  }
}