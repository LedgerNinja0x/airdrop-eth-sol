"use client"
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { useState } from "react";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

export default function VerifiedModal({title, text, isOpen, setIsOpen}) {

  return (
    <Modal
      open={isOpen}
      onClose={() => setIsOpen(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style} className="rounded-3xl">
        <div style={{maxWidth: 400}}>
          <h2 className="font-bold text-xl mb-1">
            {title}
          </h2>
          <p className="pt-[15px]">{text}</p>
          <img src="./party_moose.png" />
        </div>
      </Box>
    </Modal>
  );
}
