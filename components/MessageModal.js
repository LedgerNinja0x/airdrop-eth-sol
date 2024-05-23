import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { useState,useEffect } from "react";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "20px",
  p: 4,
};

export default function MessageModal({
  isOpen,
  setIsOpen,
  title,
  description,
  action,
  setTopCount,
  topCount
}) {
  let [message, setMessage] = useState("");
  let [info, setInfo] = useState({ text: "", type: "" });

  const sendMessage = () => {
    if (!message) {
        setInfo({ text: "Input token number!", type: "error" });
        return;
    }
    action(message);
  }

  useEffect(() => {
    if (!isOpen) {
      setMessage("")
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
        <div className="flex flex-col md:flex-row justify-center items-center gap-2">
          <div>
          <h1 className="font-bold text-3xl mb-4 text-center">{title}</h1>
            <p className="pb-8 text-center">{description}</p>
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
                <p>Top Members: </p>
                <input
                  type="Number"
                  value={topCount}
                  onChange={(e) => setTopCount(e.target.value)}
                  placeholder="Input token Number"
                  min="0"
                  className="block mb-4 !outline-none rounded-md w-full px-4 border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-stone-600 sm:text-sm sm:leading-6"
                />
                <p>Message: </p>
                <textarea className="block mb-4 !outline-none rounded-md w-full px-4 border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-stone-600 sm:text-sm sm:leading-6 h-36" onChange={(e) => setMessage(e.target.value)} value={message} />
                <button className="flex items-center gap-x-1 bg-[#241008] text-white text-sm text-center justify-center py-2 mx-auto rounded-md w-full" onClick={sendMessage}>
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
                  <span>Send Message</span>
                </button>
              </>
          </div>
          <div>
            <img src="../moose-airdrop.png" />
          </div>
        </div>          
      </Box>
    </Modal>
  );
}
