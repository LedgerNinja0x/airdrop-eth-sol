import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import HorizontalLinearStepper from "./Stepper";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  borderRadius: "24px",
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
        <h1 className="font-bold text-[32px] mb-4">Verify Your Account</h1>
        <div className="flex w-full">
          <div>
            <p className="mb-8 text-[18px]">
              Verify your account by posting a tweet and adding your wallet
            </p>
            <HorizontalLinearStepper name={name} setIsOpen={setIsOpen} followers={followers}/>
          </div>
          <div>
            <img src="./moose_verify.png" />
          </div>
        </div>
      </Box>
    </Modal>
  );
}
