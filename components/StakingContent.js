'use client'

import { useState, useEffect } from 'react';
import { ethers, Contract } from 'ethers';
import StakingAbi from "@/Contracts/Staking.json";
import TokenAbi from "@/Contracts/erc20.json";
import contractAddress from "@/Contracts/addresses.json";
import StakingBox from './StakingBox';
import NoWalletDetected from './NoWalletDetected';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { Toast } from 'react-toastify/dist/components';

export default function StakingContent() {
  const [ tokenContract, setTokenContract ] = useState(false);
  const [ stakingContract, setStakingContract ] = useState(false);
  const [ walletAddress, setWalletAddress ] = useState("");
  const [stakingInfo, setStakingInfo] = useState(false);
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

  const initializeStakingContract = async () => {
    const _provider = new ethers.providers.Web3Provider(window.ethereum);
    const _StakingContract = new Contract(
      contractAddress.Staking,
      StakingAbi.abi,
      _provider.getSigner(0)
    );
    setStakingContract(_StakingContract);
    const stakingData = await _StakingContract.getUserStakingInfo();
    setStakingInfo(stakingData);
  }

  const doWithDraw = async (id, amount) => {
    const withdrawAmount = await stakingContract.withdrawableAmount(id);
    const tokenToWei = Number(ethers.utils.parseEther(amount.toString(), 18).toString());
    if (tokenToWei > withdrawAmount) {
      toast.error("it's greater than your possible withdrawAmount");
      return;
    }
    try {
      const withDrawTx = await stakingContract.withdraw(id, BigInt(tokenToWei));
      const receipt = await withDrawTx.wait();
      if (receipt.status === 0) {
        console.log("transaction failed");
      } else {
        const stakingData = await _StakingContract.getUserStakingInfo();
        setStakingInfo(stakingData);
        toast.success("Congratulations!, you get reward.");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const doWithDrawAll = async (id) => {
    try {
      const withAllTx = await stakingContract.withdrawAll(id);
      const receipt = await withAllTx.wait();
      if (receipt.status === 0) {
        console.log("transaction failed");
      } else {
        const stakingData = await _StakingContract.getUserStakingInfo();
        setStakingInfo(stakingData);
        toast.success("Congratulations!, you get reward.");
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if(!window.ethereum) {
      return NoWalletDetected;
    }
    if (walletAddress == "") {
      connectWallet();
    }
    initializeStakingContract();
  }, []);
  return (
    <section className="text-gray-600 body-font py-24">
      <ToastContainer />
      <h2 className="font-bold text-black text-4xl mb-4 text-center underline">
        Get Rewards from Staking
      </h2>
      <div className="container px-5 mx-auto flex flex-wrap gap-5">
        {
          stakingInfo && stakingInfo.length != 0 
          ? 
          stakingInfo.map((stake, index) => 
            ethers.utils.formatEther(stake.stakedAmount.toString()) != 0 ?
            <StakingBox stake={stake} id={index} doWithDraw={doWithDraw} doWithDrawAll={doWithDrawAll} key={index} />
            : null
          ) 
          : "You have not staking reward"
        }
      </div>
    </section>
  );
}
