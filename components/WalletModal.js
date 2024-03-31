"use client"
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

export default function WalletModal({name, followers}) {
  let [isOpen, setIsOpen] = useState(true);

  const router = useRouter();

  //state for eth and sol address
  let [ethAddress, setEthAddress] = useState("");
  let [solAddress, setSolAddress] = useState("");
  let [loading, setLoading] = useState(false);

  //call api and check balance on backend, verify
  async function checkBalance() {
    try {
      setLoading(true);
      let { data } = await axios.post("/api/me/balance", {
        ethAddress,
        solAddress,
        twitt_username: name,
        followers,
        tokenBalance: 0,
        tokenValue: 0,
        isTwitterVerified: 0
      });
      setLoading(false);

      //reload the page to reflect that verification is successfull
      router.reload();
    } catch (e) {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={isOpen}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style} className="rounded-3xl">
        <div className="text-center">
          <h2 className="font-bold text-xl mb-1">
            Enter Your Wallet Information
          </h2>
          <p className="pt-[15px]">Enter your ethereum and solana <br/> wallet address</p>
          <input
            type="text"
            value={ethAddress}
            onChange={(e) => setEthAddress(e.target.value)}
            placeholder="Ethereum address"
            className="block !outline-none rounded-md w-full my-4 px-4 border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6 focus:outline-none focus:ring focus:ring-[#241008]"
          />
          <input
            type="text"
            value={solAddress}
            onChange={(e) => setSolAddress(e.target.value)}
            placeholder="Solana address"
            className="block !outline-none rounded-md w-full my-4 px-4 border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6 focus:outline-none focus:ring focus:ring-[#241008]"
          />
          <button
            disabled={loading}
            className="flex items-center gap-x-1 text-white text-sm justify-center bg-[#241008] py-2 mx-auto rounded-md w-[100%]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>

            <span onClick={checkBalance} className="font-semibold">
              {!loading ? "Check balance" : "Checking..."}
            </span>
          </button>
          <div className="flex justify-content w-full">
            <img src="./moose_wallet.png" className="w-3/4 pt-[8px] mx-auto" />
          </div>          
        </div>
      </Box>
    </Modal>
  );
}
