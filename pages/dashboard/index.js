import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import axios from "axios";
import { getToken } from "next-auth/jwt";
import NotificationArea from "./notification";
import WalletModal from "@/components/WalletModal";
import VerifiedModal from "@/components/VerifiedModal";
import StakingContent from "@/components/StakingContent";
import { ToastContainer, toast } from 'react-toastify';
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

export default function Page({ name, avatar, isTwitterVerified, followers, isFirstVerified, ethAddress, twittUsername, data}) {

  const [ isLoading, setLoading ] = useState(false);

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
    if (isTwitterVerified) {
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
            ip
          }
        );
      } catch (e) {
        console.log(e);
      }
    }
  }

  useEffect(() => {
    if (!twittUsername) {
      toast.error("Oops! Something wrong. Please login again after few mins!");
      signOut();
    }
    if (isTwitterVerified) {
      updateBalance();
    }
  }, [])  

  return (
    <div className="min-h-screen h-fit flex flex-col justify-between">
      <ToastContainer />
      <Header logged={true} avatar={avatar} />
      <div className="container mx-auto mt-8 flex md:flex-row flex-col overflow-none">
        <div className="md:w-1/2 w-full flex flex-col md:items-start md:text-left md:mb-0 text-center p-12">
          <h1 className="font-bold lg:text-6xl md:text-5xl text-4xl mb-7 text-[#241008]">
            Hello {name} 👋
            {isTwitterVerified ?
            isLoading ? (
              <div className="loader-container" style={{height: "100%"}}>
                  <div className="spinner"></div>
              </div>
            ) : <StakingContent name={name} setLoading={setLoading}/> : ""
            }
          </h1>
          <p className="mb-8 leading-relaxed text-lg font-normal">
          {!isTwitterVerified
            && "Good to see you on airdrop! Please wait for the admins to send you a verification message"}
          </p>
          {!isTwitterVerified && <NotificationArea name={name} followers={followers} twittUsername={twittUsername}/>}
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
      <VerifiedModal title="Your account has been verified" text="Congratulations on verifying your account. Our admin team will soon take into consideration your account and send a gift your way!" />
      }
      { data.airdropMessage && data.isAirMsgRead == 0 && 
      <VerifiedModal title="Airdrop Success" text={data.airdropMessage}/>
      }
    </div>
  );
}

export const config = {
  runtime: "nodejs", // or "edge"
};

export async function getServerSideProps({ req, res }) {
  try {
    const session = await getServerSession(req, res, authOptions);

    // Protect route from unlogged users
    // if (!session) {
    //   return { redirect: { destination: "/" } };
    // }

    if (
      session?.user?.email == process.env.ADMIN_EMAIL &&
      session?.user?.name == process.env.ADMIN_USERNAME
    ) {
      return { redirect: { destination: "/admin" } };
    }

    //update user field the first time he lands on dashboard(followers and location)

    let isFirstTime = false;

    //check if user is already verified
    let username = session?.user?.name || "Sassmedia";
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
              userRating: 0
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
