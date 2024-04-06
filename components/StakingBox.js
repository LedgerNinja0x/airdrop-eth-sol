'use client'

import Box from '@mui/material/Box';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState, useEffect } from "react";
import { ethers } from 'ethers';

export default function StakingBox({stake, id, doWithDraw, doWithDrawAll}) {

    const [ time, setTime ] = useState(stake.startTime.toNumber() + stake.stakingPeriod.toNumber() - Math.round(new Date().getTime() / 1000));
    const [open, setOpen] = useState(false);
    const [withdrawOpen, setWithdrawOpen] = useState(false);
    const [amount , setAmount] = useState(0);

    const handleClickOpen = () => {
        if (time > 0) {
            toast.error("The current staking period has not ended");
            return;
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleWithOpen = () => {
        if (time > 0) {
            toast.error("The current staking period has not ended");
            return;
        }
        setWithdrawOpen(true);
    };

    const handleWithClose = () => {
        setWithdrawOpen(false);
    };

    const convertSecondsToTime = (totalSeconds) => {
        if (totalSeconds <= 0) {
            totalSeconds = 0;
        }
        const years = Math.floor(totalSeconds / 31536000);
        const months = Math.floor((totalSeconds % 31536000) / 2592000);
        const days = Math.floor(((totalSeconds % 31536000) % 2592000) / 86400);
        const hours = Math.floor((((totalSeconds % 31536000) % 2592000) % 86400) / 3600);
        const minutes = Math.floor(((((totalSeconds % 31536000) % 2592000) % 86400) % 3600) / 60);
        const seconds = Math.floor((((totalSeconds % 31536000) % 2592000) % 86400) % 3600) % 60;
    
        let timeLeft = " " +years > 0 ? `${years}Y:` : "";
        timeLeft += months > 0 ? `${months}M:` : "";
        timeLeft += days > 0 ? `${days}D:` : "";
        timeLeft += hours > 0 ? `${hours}h:` : "";
        timeLeft += minutes > 0 ? `${minutes}m:` : "";
        timeLeft += `${seconds}s`;
        return timeLeft;
    }

    const withdrawAll = () => {
        doWithDrawAll(id)
    }

    const withdraw = () => {
        if(amount <= 0) {
            alert("withdraw mount must be greater than 0");
            return;
        }
        doWithDraw(id, amount)
    }

    useEffect(() => {
        const intervalId = setInterval(() => {
          setTime(prevTime => prevTime - 1); // Discount the number by 1 every second
        }, 1000); // Interval set to 1 second (1000 milliseconds)
    
        return () => clearInterval(intervalId); // Clear the interval on component unmount
    }, []);

    const rewardAmount = Number(ethers.utils.formatEther(stake.stakedAmount.toString()).toString()) + Number(ethers.utils.formatEther(stake.reward.toString()).toString()) * stake.stakingPeriod.toNumber();

    return (
        <>
        <Box
        my={2}
        gap={1}
        sx={{ border: '2px solid grey'}}
        className="text-center"
        >
            <div className='flex bg-white'>
                <div className='p-5'>
                    <div className='text-[32px]'>Staking Box</div>
                    <div className='text-sm mt-5'>Total Amount: {rewardAmount}</div>
                    <div className='text-sm mt-5'>
                        withdrawl timeline: { convertSecondsToTime(time) }
                    </div>
                    <div className='mt-5 flex gap-2'>
                        <button className='flex items-center bg-[#241008] text-white text-sm px-8 py-2 mx-auto rounded-md' onClick={handleWithOpen}>withdraw</button>
                        <button className='flex items-center bg-[#241008] text-white text-sm px-8 py-2 mx-auto rounded-md' onClick={handleClickOpen}>withdrawAll</button>
                    </div>
                </div>
                <div>
                    <img src='./moose-reward.png' />
                </div>
            </div>
        </Box>
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <div className='flex p-[24px]'>
                <div>
                    <DialogTitle id="alert-dialog-title"  className="text-3xl font-bold">
                    {"Do You Agree?"}
                    </DialogTitle>
                    <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <div className="text-lg text-black">Do you withdrawAll in this staking?</div>
                    </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                    <Button onClick={handleClose}>Disagree</Button>
                    <Button onClick={() => {handleClose();withdrawAll();}} autoFocus>
                        Agree
                    </Button>
                    </DialogActions>
                </div>
                <div>
                    <img src="./moose-airdrop.png" />
                </div>
            </div>
        </Dialog>
        <Dialog
            open={withdrawOpen}
            onClose={handleWithClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <div className='flex'>
                <div>
                    <DialogTitle id="alert-dialog-title" className="text-3xl font-bold">
                    {"Do you agree?"}
                    </DialogTitle>
                    <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Do you withdraw in this staking?
                            <input 
                            type='number' 
                            min="0" 
                            className="block mt-4 !outline-none rounded-md w-full px-4 border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)} 
                            />
                    </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                    <Button onClick={handleWithClose}>Disagree</Button>
                    <Button onClick={() => {handleWithClose();withdraw();}} autoFocus>
                        Agree
                    </Button>
                    </DialogActions>
                </div>
                <div>
                    <img src="./moose-airdrop.png" />
                </div>
            </div>
        </Dialog>
        </>
    );
}
