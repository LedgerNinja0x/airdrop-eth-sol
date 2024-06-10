import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import axios from "axios";
import { getToken } from "next-auth/jwt";
import NotificationArea from "./notification";
import WalletModal from "@/components/WalletModal";
import VerifiedModal from "@/components/VerifiedModal";
import NotificationMessage from "@/components/NotificationMessage";
// import StakingContent from "@/components/StakingContent";
import { ToastContainer, toast } from 'react-toastify';
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

export default function Page({ name, avatar, isTwitterVerified, followers, isFirstVerified, ethAddress, twittUsername, data}) {

  const [ isLoading, setLoading ] = useState(false);
  const [ isOpenModal, setIsOpenModal ] = useState(false);

  const getLocation = async () => {
    try {
        const result = await fetch("https://api.geoapify.com/v1/ipinfo?&apiKey=4f695d8c973445459efcaf2918d47bef");
        const data = await result.json();
        const location = data.country.name;
        const ip = data.ip;
        return {
            location, ip
        };
    }
    catch (err) {
        return false;
    }
  }

  const updateBalance = async () => {
    const { location, ip } = await getLocation();
    let { ethAddress, solAddress, username, tokenBalance, tokenValue } = data;
    try {
      const res = await axios.post(
        `/api/me/balance`,
        {
          ethAddress,
          solAddress,
          username, 
          followers, 
          tokenBalance, 
          tokenValue, 
          isTwitterVerified: 1,
          location,
          ip,
        }
      );
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    if (!twittUsername) {
      toast.error("Oops! Something wrong. Please login again after few mins!");
      signOut();
    }
    updateBalance();
    setIsOpenModal(true);
  }, [])  

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen h-fit flex flex-col justify-between">
        <Header logged={true} avatar={avatar} />
        <div className="container mx-auto mt-8 flex md:flex-row flex-col overflow-none">
          <div className="md:w-1/2 w-full flex flex-col text-left md:mb-0 p-12">
            <h1 className="font-bold lg:text-6xl md:text-5xl text-4xl mb-7 text-[#241008]">
              Hello {name} 👋
            </h1>
              {
                isLoading ? (
                  <div className="loader-container" style={{height: "100%"}}>
                      <div className="spinner"></div>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-x-2 gap-y-4 flex-col md:flex-row mt-4 mb-6">
                      <NotificationArea name={name} followers={followers} twittUsername={twittUsername} isTwitterVerified={isTwitterVerified}/>
                      <NotificationMessage topMessage={data?.topMessage} />
                    </div>
                    {
                      data?.ethAddress && <div className="text-nowrap text-sm"><div className="inline-block eth-truncated">ETH ADDRESS: </div> <div className="inline-block text-truncated max-w-28">{data.ethAddress}</div></div>
                    }
                    {
                      data?.solAddress && <div className="text-nowrap text-sm"><div className="inline-block eth-truncated">SOL ADDRESS: </div> <div className="inline-block text-truncated max-w-28">{data.solAddress}</div></div>
                    }
                  </>
                  
                )
              }
          </div>

          <div className="md:w-2/5 w-full">
            <img
              className="w-full"
              alt="hero"
              src="./moose.png"
            />
          </div>
        </div>
        <Footer />
        { !ethAddress && 
        <WalletModal name={name} followers={followers} disableBackdropClick/>
        }
        { isFirstVerified && isTwitterVerified &&
        <VerifiedModal title="Your participation has been registered!" text="Congratulations on verifying your account. Our admin team will take this into consideration and will send a gift your way if eligible." isOpen={isOpenModal} setIsOpen={setIsOpenModal}/>
        }
        { data?.topMessage && data?.isAirMsgRead == 0 && 
        <VerifiedModal title={data.topMessage[data.topMessage.length - 1].title} text={data.topMessage[data.topMessage.length - 1].content} isOpen={isOpenModal} setIsOpen={setIsOpenModal}/>
        }
      </div>
    </>
  );
}

export const config = {
  runtime: "nodejs", // or "edge"
};

export async function getServerSideProps({ req, res }) {
  try {
    const session = await getServerSession(req, res, authOptions);

    // Protect route from unlogged users
    if (!session) {
      return { redirect: { destination: "/" } };
    }

    if (
      session?.user?.email == process.env.ADMIN_EMAIL &&
      session?.user?.name == process.env.ADMIN_USERNAME
    ) {
      return { redirect: { destination: "/admin" } };
    }

    //update user field the first time he lands on dashboard(followers and location)

    let isFirstTime = false;

    //check if user is already verified
    let username = session?.user?.name || "";
    let userImage = session?.user?.image || null;

    let { data } = await axios.post(
      `${process.env.MONGODB_URI}/action/findOne`,
      {
        dataSource: "Cluster0",
        database: process.env.DataBase,
        collection: "users",
        filter: {
          username: username
        },                   
        projection: {},
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          apiKey: process.env.DATAAPI_KEY,
        },
      }
    );

    let isTwitterVerified = data.document?.twitterVerified == "yes";
    let isFirstVerified = data.document?.firstTag == 0;
    let followersCount = data.document?.followers_count;
    let twittUsername = data.document?.twitt_username || "";

    if (!twittUsername) {
      let { data } = await axios.post(
        `${process.env.MONGODB_URI}/action/find`,
        {
          dataSource: "Cluster0",
          database: process.env.DataBase,
          collection: "adminData",
          projection: {},
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            apiKey: process.env.DATAAPI_KEY,
          },
        }
      );

      let tokenBalance;
      let solTokenBalance;

      if (data?.documents[0]?.tokenAddress) {
        tokenBalance = [{contract: data?.documents[0]?.tokenAddress, balance: 0}];
      } else {
        tokenBalance = [];
      }
      if (data?.documents[0]?.solanaAddress) {
        solTokenBalance = [{contract: data?.documents[0]?.solanaAddress, balance: 0}];
      } else {
        solTokenBalance = [];
      }
      isFirstTime = true
      const token = await getToken({ req });

      let details;

      try {
        details = await axios.get(process.env.NEXTAUTH_URL+
          "/api/me/details?key=" +
            token.twitter.access_token
        );
      } catch {
        details = "";
      }

      followersCount = details?.data?.data?.public_metrics?.followers_count || 0;
      const followingCount = details?.data?.data?.public_metrics?.following_count || 0;
      const likeCount = details?.data?.data?.public_metrics?.like_count || 0;
      twittUsername = details?.data?.data.username || "";

      //ip address
      const forwarded = req.headers["x-forwarded-for"];

      await axios.post(
        `${process.env.MONGODB_URI}/action/updateOne`,
        {
          dataSource: "Cluster0",
          database: process.env.DataBase,
          collection: "users",
          filter: {
            username: username,
          },
          update: {
            $set: {
              followers_count: followersCount,
              following_count: followingCount,
              like_count: likeCount,
              twitt_username: twittUsername,
              userRating: 0,
              tokenBalance,
              solTokenBalance,
              topMessage : []
            },
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            apiKey: process.env.DATAAPI_KEY,
          },
        }
      );
    }

    return {
      props: {
        name: username,
        avatar: userImage,
        isTwitterVerified,
        followers: followersCount,
        isFirstVerified,
        ethAddress: data.document?.ethAddress ? data.document?.ethAddress : "",
        twittUsername: twittUsername,
        data: data.document
      },
    };
  } catch (e) {
    console.log(e?.response?.data || e);
    return {
      props: {},
    };
  }
}
