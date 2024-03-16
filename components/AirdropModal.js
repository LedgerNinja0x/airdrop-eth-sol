import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { useState,useEffect } from "react";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "1px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function AirdropModal({
  isOpen,
  setIsOpen,
  title,
  description,
  action
}) {
  let [token, setToken] = useState(0);
  let [info, setInfo] = useState({ text: "", type: "" });

  const doAirDrop = () => {
    if (token === 0) {
        setInfo({ text: "Input token number!", type: "error" });
        return;
    }
    action(token);
  }

  useEffect(() => {
    if (!isOpen) {
      setToken(0)
    }
  },[isOpen]);


  return (
    <Modal
      open={isOpen}
      onClose={() => setIsOpen(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      style={{zIndex: 1}}
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
            <input
              type="Number"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Input token Number"
              min="0"
              className="block mb-4 !outline-none rounded-md w-full px-4 border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
            <button className="flex items-center gap-x-1 bg-indigo-500 text-white text-sm px-8 py-2 mx-auto rounded-md hover:bg-indigo-400" onClick={doAirDrop}>
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
              <span>Airdrop</span>
            </button>
          </>
      </Box>
    </Modal>
  );
}
