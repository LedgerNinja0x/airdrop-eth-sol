import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { useState,useEffect } from "react";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  maxWidth: 600,
  minWidth: 300,
  bgcolor: "background.paper",
  borderRadius: "24px",
  boxShadow: 24,
  p: 4,
};

export default function StakingModal({
  isOpen,
  setIsOpen,
  title,
  description,
  action,
  setTopCount,
  topCount
}) {
  const [token, setToken] = useState(0);
  const [reward, setReward] = useState(0);
  const [period, setPeriod] = useState(0);
  const [info, setInfo] = useState({ text: "", type: "" });

  const doStaking = () => {
    if (period == 0) {
      setInfo({text: "Inpute staking period", type: "error" });
      return;
    }
    if (token == 0) {
      setInfo({ text: "Input token number!", type: "error" });
      return;
    }
    if (reward == 0) {
      setInfo({ text: "Input reward per second!", type: "error" });
      return;
    }
    action(token, reward, period);
  }

  useEffect(() => {
    if (!isOpen) {
      setToken(0);
      setReward(0);
      setPeriod(0);
      setInfo("");
    }
  },[isOpen]);


  return (
    <Modal
      open={isOpen}
      onClose={() => setIsOpen(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      sx={{zIndex: 7}}
    >
      <Box sx={style}>
        <h1 className="font-bold text-3xl mb-4">{title}</h1>
        <p className="pb-8">{description}</p>
        {info.text && (
          <p
            className={`${
              info.type == "success" ? "bg-green-200" : "bg-red-200"
            } py-2 text-center w-full mb-4`}
          >
            {info.text}
          </p>
        )}
          <>
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1">
                <p>Staking Period(days): </p>
                <input
                  type="Number"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder="Input Staking Period"
                  min="0"
                  className="block mb-4 w-full !outline-none rounded-md px-4 border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
              <div className="flex-1">
                <p>Top Members: </p>
                <input
                  type="Number"
                  value={topCount}
                  onChange={(e) => setTopCount(e.target.value)}
                  placeholder="Input top Member"
                  min="0"
                  className="block mb-4 w-full !outline-none rounded-md px-4 border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
              </div>
            </div>
            <p>Reward Amount: </p>
            <input
              type="Number"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              placeholder="Input reward token Number per second"
              min="0"
              className="block mb-4 !outline-none rounded-md w-full px-4 border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
            <p>Staking Amount: </p>
            <input
              type="Number"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Input staking token Number"
              min="0"
              className="block mb-4 !outline-none rounded-md w-full px-4 border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
            <div className="flex gap-20">
              <div className="w-full">
                <button className="flex justify-center items-center gap-x-1 bg-[#241008] w-full text-white text-sm px-8 py-2 mx-auto rounded-md" onClick={doStaking}>
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
                  <span>Staking</span>
                </button>
              </div>
              <div>
                <img src="../moose-staking.png" />
              </div>
            </div>
          </>
      </Box>
    </Modal>
  );
}
