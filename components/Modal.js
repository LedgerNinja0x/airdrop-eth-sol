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

export default function TweetMessage({
  isOpen,
  setIsOpen,
  title,
  action,
  message,
  hashtag
}) {
  const [msg, setMsg] = useState("");
  const [hashTag, setHashTag] = useState("");
  const [info, setInfo] = useState({ text: "", type: "" });

  const changeMessage = () => {
    if (!msg || !hashTag) {
        setInfo({ text: "Input Message!", type: "error" });
        return;
    }
    action(msg, hashTag);
  }

  useEffect(() => {
    setMsg(message);
    setHashTag(hashtag);
  }, [message, hashtag]);


  return (
    <Modal
      open={isOpen}
      onClose={() => setIsOpen(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      sx={{zIndex: 7}}
    >
      <Box sx={style}>
        <div className="flex flex-col md:flex-row gap-2 justify-center items-center">
          <div className="text-center">
          <h1 className="font-bold text-3xl mb-4">{title}</h1>
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
                <textarea 
                className="w-full h-36 block mb-4 !outline-none rounded-md px-4 border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-stone-600 sm:text-sm sm:leading-6" 
                onChange={(e) => setMsg(e.target.value)} 
                value={msg} 
                />
                <input
                type="text"
                value={hashTag}
                onChange={(e) => setHashTag(e.target.value)}
                placeholder="Input Hashtag with comma(,)"
                className="block mb-4 !outline-none rounded-md w-full px-4 border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-stone-600 sm:text-sm sm:leading-6"
                />
                <button className="flex items-center gap-x-1 bg-[#241008] text-white text-sm text-center justify-center py-2 mx-auto rounded-md w-full" onClick={changeMessage}>
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
                  <span>Change Message</span>
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
