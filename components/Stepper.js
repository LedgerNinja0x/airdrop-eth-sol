import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowForward } from '@mui/icons-material';
import TwitterIcon from '@mui/icons-material/Twitter';

const steps = ['Post Tweet', 'Verify Tweet'];

export default function HorizontalLinearStepper({
  name,
  setIsOpen,
  followers,
  twittUsername,
}) {
  const router = useRouter();

  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());
  let [canNavigate, setCanNavigate] = React.useState(false);
  let [loading, setLoading] = useState(false);

  //state to handle tweet(message and hashtags)
  let [message, setMessage] = useState('');
  let [hashtags, setHashtags] = useState([]);

  //state to handle tweet verification(url)
  let [url, setUrl] = useState('');
  let [err, setErr] = useState('');

  //whenever user jumps to next step, make sure he can't move further without completing the task
  useEffect(() => {
    setCanNavigate(false);
  }, [activeStep]);

  const handleShare = () => {
    // Construct the Twitter Web Intent URL
    const hashtagsString = hashtags.join(',');
    const tweetUrl = `https://x.com/intent/tweet?text=${message}&hashtags=${hashtagsString}`;

    // Open the URL in a new tab
    window.open(tweetUrl, '_blank');
  };

  const verifyTweet = async () => {
    try {
      setLoading(true);
      let { data } = await axios.post('/api/me/verify', {
        message: message,
        hashtags: hashtags,
        url,
        username: name,
        twittUsername: twittUsername,
      });
      setLoading(false);
      router.reload();
    } catch (e) {
      setLoading(false);
      setErr(e?.response?.data || 'Something went wrong. Try later');
    }
  };

  const retrieveMsg = async () => {
    try {
      let { data } = await axios.get(
        `/api/me/message?timestamp=${new Date().getTime()}&username=${name}`,
      );

      //allow user to jump to next step
      if (data.text) {
        setCanNavigate(true);
      }
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

  // retrieveMsg()

  const isStepOptional = (step) => {
    return false;
  };

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => {
          const stepProps = {};
          const labelProps = {};
          if (isStepOptional(index)) {
            labelProps.optional = (
              <Typography variant="caption">Optional</Typography>
            );
          }
          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {activeStep === steps.length ? (
        <React.Fragment>
          <Typography sx={{ mt: 2, mb: 1 }}>
            All steps completed - you&apos;re finished
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button onClick={handleReset}>Reset</Button>
          </Box>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <div className="mt-8">
            {activeStep == 0 ? (
              // post tweet step, retrieve msg details from user obj or show a error

              //check if msg from admin exists
              <div>
                {message ? (
                  <>
                    <h2 className="font-bold md:text-2xl mb-1 sm:text-[20px]">
                      Here are your tweet details
                    </h2>
                    <p className="md:text-[18px] sm:text-[10px]">
                      Post this exact tweet on your account
                    </p>
                    <h3 className="font-semibold text-lg my-2">Message</h3>
                    <p className="bg-[#ECF7FC] rounded-md py-2 px-1">
                      {message}
                    </p>
                    <h3 className="font-semibold text-lg my-2">Hashtags</h3>
                    <div className="flex flex-wrap">
                      {hashtags.map((tag) => (
                        <span className="bg-[#E9FEE6] px-8 py-1 m-1 cursor-pointer">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="bg-[#DEC470] py-2 px-8 mt-4">
                    Our Admin team will send a Tweet to post if you’re eligible
                    to Participate in the Airdrop.
                  </div>
                )}
              </div>
            ) : (
              <>
                <div>
                  {err && (
                    <p className="py-2 text-center w-full mb-4 bg-red-200">
                      {err}
                    </p>
                  )}
                  <h2 className="font-bold text-xl mb-1">
                    Enter Url Of Your Tweet
                  </h2>
                  <p>Copy the full url of your tweet and click verify</p>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter url of your tweet..."
                    className="block !outline-none rounded-md w-full my-4 px-4 border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring focus:ring-[#241008] sm:text-sm sm:leading-6"
                  />
                  <button
                    disabled={loading}
                    className="flex gap-x-1 bg-[#241008] text-white text-sm px-12 py-2 ml-1 rounded-md "
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                      />
                    </svg>

                    <span onClick={verifyTweet} className="font-semibold">
                      {!loading ? 'Verify' : 'Verifying...'}
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            {/* <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button> */}
            <Box sx={{ flex: '1 1 auto' }} />
            {/* {isStepOptional(activeStep) && (
              <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                Skip
              </Button>
            )} */}

            {/* only allow next btn for first step */}
            {activeStep == 0 && message && (
              <div className="flex gap-2">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleShare}
                >
                  Share <TwitterIcon />
                </Button>
                <Button onClick={handleNext}>
                  Next <ArrowForward />
                </Button>
              </div>
            )}
          </Box>
        </React.Fragment>
      )}
    </Box>
  );
}
