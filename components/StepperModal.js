import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import HorizontalLinearStepper from "./Stepper";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "60%",
  bgcolor: "background.paper",
  border: "1px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function StepperModal({ isOpen, setIsOpen, name,followers }) {
  return (
    <Modal
      open={isOpen}
      onClose={() => setIsOpen(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <span className="text-gray-500 mb-4 text-sm">Airdrop</span>
        <h1 className="font-bold text-3xl mb-4">Verify Your Account</h1>
        <p className="mb-8">
          Verify your account by posting a tweet and adding your wallet
        </p>
        <HorizontalLinearStepper name={name} setIsOpen={setIsOpen} followers={followers}/>
      </Box>
    </Modal>
  );
}
