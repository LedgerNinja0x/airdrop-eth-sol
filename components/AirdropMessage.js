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

export default function AirdropMessage({
  isOpen,
  setIsOpen,
  title,
  action,
  message
}) {
  const [msg, setMsg] = useState("");
  const [info, setInfo] = useState({ text: "", type: "" });

  const setAirMsg = () => {
    if (!msg) {
        setInfo({ text: "Input Message!", type: "error" });
        return;
    }
    action(msg);
  }

  useEffect(() => {
    setMsg(message);
  }, [message]);


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
                <textarea className="w-full h-36" onChange={(e) => setMsg(e.target.value)} value={msg} />
                <button className="flex items-center gap-x-1 bg-[#241008] text-white text-sm text-center justify-center py-2 mx-auto rounded-md w-full" onClick={setAirMsg}>
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
