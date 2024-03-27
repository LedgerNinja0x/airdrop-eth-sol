"use client"
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { useState } from "react";
import { useRouter } from "next/router";
import { BorderColor } from "@mui/icons-material";

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

export default function VerifiedModal() {
  let [isOpen, setIsOpen] = useState(true);

  const router = useRouter();

  return (
    <Modal
      open={isOpen}
      onClose={() => setIsOpen(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style} className="rounded-3xl">
        <div>
          <h2 className="font-bold text-xl mb-1">
            Your account has been verified
          </h2>
          <p className="pt-[15px]">Congratulations on verifying your account. Our admin team will soon take into consideration your account and send a gift your way!</p>
          <img src="./party_moose.png" />
        </div>
      </Box>
    </Modal>
  );
}
