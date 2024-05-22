import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import bcrypt from "bcrypt";
import MongoDbAdapter from "@/lib/adapter";
import TwitterProvider from "next-auth/providers/twitter";

// import { MongoDBAdapter } from "@auth/mongodb-adapter";

export const authOptions = {
  //create custom adapter as well
  adapter: MongoDbAdapter(),
  session: {
    // Set to jwt in order to CredentialsProvider works properly
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Configure one or more authentication providers
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      version: "2.0"
    }),
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "joe@gmail.com" },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Password",
        },
      },
      async authorize(credentials, req) {
        console.log("inside authorize", process.env.MONGODB_URI);
        try {
          // Add logic here to look up the user from the credentials supplied
          let user = await axios.post(
            `${process.env.MONGODB_URI}/action/findOne`,
            {
              dataSource: "Cluster0",
              database: process.env.DataBase,
              collection: "users",
              filter: {
                email: credentials.email,
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

          //user not present in db but trying to signin
          if (!user.data.document) {
            return null;
          }

          console.log(user.data.document);

          //verify the password
          let verified = await bcrypt.compare(
            credentials.password,
            user.data.document.password
          );

          console.log("verified", verified);

          if (!verified) {
            return null;
          }

          return {
            name: user.data.document.username,
            email: user.data.document.email,
          };
        } catch (e) {
          console.log(e);
        }
      },
    }),
    // ...add more providers here
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log("inside signin", user);
      try {
        if (account.provider == "twitter") {
          //create a new user if it doesn't exist
          let founduser = await axios.post(
            `${process.env.MONGODB_URI}/action/findOne`,
            {
              dataSource: "Cluster0",
              database: process.env.DataBase,
              collection: "users",
              filter: {
                username: user.name,
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

          console.log(founduser.data.document, "founduser");

          if (!founduser.data.document) {
            console.log("new acc creating...");
            await axios.post(
              `${process.env.MONGODB_URI}/action/insertOne`,
              {
                dataSource: "Cluster0",
                database: process.env.DataBase,
                collection: "users",
                document: {
                  provider: account.provider,
                  username: user.name,
                  email: user.email,
                  avatar: user.image,
                  twitterVerified: "no",
                  userRating: 0,
                  ethAddress: "",
                  ethBalance: "",
                  ethGas: "",
                  location: "",
                  followers_count: "",
                  following_count: "",
                  like_count: "",
                  twitt_username: "",
                  firstTag: 0,
                  message: {},
                  // IP: req.socket.localAddress || req.ip,
                  createdAt: new Date(Date.now()).toLocaleString(),
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

          return true;
        }
        //authorise for email auth
        if (!credentials) {
          //check if it's an existing user before sending em a magic link
          let profile = await axios.post(
            `${process.env.MONGODB_URI}/action/findOne`,
            {
              dataSource: "Cluster0",
              database: process.env.DataBase,
              collection: "users",
              filter: {
                email: user.email,
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

          if (profile.data.document) {
            //user present in db, send magic link
            return true;
          }

          //user not present in db(register em)
          return "/admin/login";
        } else {
          return true; //credentials auth already verified
        }
      } catch (e) {
        console.log(e.response.data);

        return false;
      }
    },
    async jwt({ token, user, account = {}, profile = {}, isNewUser }) {
      // We want to return a token which containts an object called
      // provider (eg Twitter), along with the access_token and
      // the refresh_token.

      if (account.provider && !token[account.provider]) {
        token[account.provider] = {};
      }

      if (account.access_token) {
        token[account.provider].access_token = account.access_token;
      }

      if (account.refresh_token) {
        token[account.provider].refresh_token = account.refresh_token;
      }

      if (profile.data && profile.data.id) {
        token[account.provider].id = profile.data.id;
      }

      return token;
    },
    async session({ session, token, user }) {
      if (session.user) {
        session.user.name = token?.name;
        session.user.email = token?.email;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};

export default NextAuth(authOptions);
