import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import Header from "@/components/Header";
// import { setCookie,hasCookie,getCookies } from "cookies-next";
// import Cookies from "cookies";
import { serialize } from "cookie";
import cookie from "cookie";
import axios from "axios";
import { getToken } from "next-auth/jwt";

import geoip from "geoip-lite";

import Steps from "@/components/Steps";
import NotificationArea from "./notification";

export default function Page({ name, avatar, isTwitterVerified,followers }) {
  console.log(name);
  return (
    <>
      <Header logged={true} avatar={avatar} />
      <div className="p-12 pb-0">
        <h1 className="font-bold text-4xl mb-4">
          {!isTwitterVerified
            ? `Hello ${name} 👋`
            : "Your Account Has Been Verified"}
        </h1>
        <p>
          {!isTwitterVerified
            ? "Good to see you on airdrop! Please wait for the admins to send you a verification message"
            : "Congratulations on verifying your account. Our admin team will soon take into consideration your account and send a gift your way!"}
        </p>
        {!isTwitterVerified && <NotificationArea name={name} followers={followers}/>}
      </div>
      {!isTwitterVerified && <Steps />}
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

    console.log(session, "session");

    if (
      session?.user?.email == process.env.ADMIN_EMAIL &&
      session?.user?.name == process.env.ADMIN_USERNAME
    ) {
      return { redirect: { destination: "/admin" } };
    }

    //update user field the first time he lands on dashboard(followers and location)

    //check if user has landed for first time(check ping cookie)

    // Parse the cookies on the request

    var cookies = cookie.parse(req.headers.cookie || "");

    // Get the visitor name set in the cookie
    var ping = cookies.ping;

    if (!ping) {
      const token = await getToken({ req });

      let details = await axios.get(
        "https://airdrop-rewards.netlify.app/api/me/details?key=" +
          token.twitter.access_token
      );

      console.log(details, "frontend details");

      // let details = {
      //   data: {
      //     id: "1767985969033015296",
      //     username: "SmediaSas55633",
      //     public_metrics: {
      //       followers_count: 0,
      //       following_count: 1,
      //       tweet_count: 0,
      //       listed_count: 0,
      //       like_count: 0,
      //     },
      //     name: "SASSmedia",
      //   },
      // };

      //update fields

      //ip address
      const forwarded = req.headers["x-forwarded-for"];

      const ip =
        typeof forwarded === "string"
          ? forwarded.split(/, /)[0]
          : req.socket.remoteAddress;

      var geo = geoip.lookup(ip);

      await axios.post(
        `${process.env.MONGODB_URI}/action/updateOne`,
        {
          dataSource: "Cluster0",
          database: "test",
          collection: "users",
          filter: {
            username: session.user.name,
          },
          update: {
            $set: {
              IP: ip,
              location: geo.country + "," + geo.city,
              followers_count:
                details?.data?.data?.public_metrics?.followers_count,
              following_count:
                details?.data?.data?.public_metrics?.following_count,
              like_count: details?.data?.data?.public_metrics?.like_count,
              twitt_username: details?.data?.data.username,
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

      // console.log("updated", resp);

      const cookie = serialize("ping", "true", {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      console.log("cookie", cookie);

      res.setHeader("Set-Cookie", cookie);
    }

    //check if user is already verified
    console.log(session.user.name, "name here");

    let { data } = await axios.post(
      `${process.env.MONGODB_URI}/action/findOne`,
      {
        dataSource: "Cluster0",
        database: "test",
        collection: "users",
        filter: {
          username: session.user.name,
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

    console.log(data.document);

    let isTwitterVerified = data.document.twitterVerified == "yes";

    console.log(isTwitterVerified);

    return {
      props: {
        name: session.user.name,
        avatar: session?.user?.image || null,
        isTwitterVerified,
        followers: data.document.followers_count
      },
    };
  } catch (e) {
    console.log(e?.response?.data || e);
    return {
      props: {},
    };
  }
}
