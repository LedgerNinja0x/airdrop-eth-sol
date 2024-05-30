import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import HorizontalLinearStepper from "./Stepper";
import axios from 'axios';
import { useEffect, useState } from 'react';

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

export default function StepperModal({ isOpen, setIsOpen, name, followers, twittUsername}) {

  let [message, setMessage] = useState('');
  let [hashtags, setHashtags] = useState([]);

  const retrieveMsg = async () => {
    try {
      let { data } = await axios.get(
        `/api/me/message?timestamp=${new Date().getTime()}&username=${name}`,
      );

      //allow user to jump to next step
      setMessage(data.text);
      setHashtags(data.hashtags);
    } catch (e) {
      console.error(e?.response?.data || e);
    }
  };

  // retrieve tweet to be posted details
  useEffect(() => {
    retrieveMsg();
  }, []);

  return (
    <Modal
      open={isOpen}
      onClose={() => setIsOpen(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <div style={{maxHeight:"80vh", overflow: "auto"}}>
          <div className="flex w-full items-center">
            <div>
              <h1 className="font-bold md:text-[32px] sm:text-[20px] mb-4">{ message ? "Post the Tweet & Verify" : "We got your details!"}</h1>
              <p className="mb-8 md:text-[18px] sm:text-[10px]">
                {message ? "Participate in the Airdrop by posting the tweet & verifying the link" : "Our Admin team will send a Tweet to post if you’re eligible to Participate in the Airdrop."}
              </p>
              {
                message &&
                <HorizontalLinearStepper name={name} twittUsername={twittUsername} message={message} hashtags={hashtags}/>
              }
            </div>
            <div>
              <img src="./moose_verify.png" />
            </div>
          </div>
        </div>
      </Box>
    </Modal>
  );
}
