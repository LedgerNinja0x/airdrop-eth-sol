import { ObjectId } from "mongodb";
import axios from "axios";

var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {};
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (
          e.indexOf(p[i]) < 0 &&
          Object.prototype.propertyIsEnumerable.call(s, p[i])
        )
          t[p[i]] = s[p[i]];
      }
    return t;
  };

export function _id(hex) {
  if ((hex === null || hex === void 0 ? void 0 : hex.length) !== 24)
    return new ObjectId();
  return new ObjectId(hex);
}

function toHexString(bytes) {
  return Array.from(bytes, (byte) =>
    ("00" + (byte & 0xff).toString(16)).slice(-2)
  ).join("");
}

export const format = {
  /** Takes a mongoDB object and returns a plain old JavaScript object */
  from(object) {
    const newObject = {};
    for (const key in object) {
      const value = object[key];
      if (key === "_id") {
        console.log(value, "-> val");
        newObject.id = value;
      } else if (key === "userId") {
        console.log(value, "-> id");
        newObject[key] = value;
      } else {
        console.log(value, "-> normal");
        newObject[key] = value;
      }
    }
    return newObject;
  },
  /** Takes a plain old JavaScript object and turns it into a mongoDB object */
  to(object) {
    const newObject = {
      _id: _id(object.id),
    };
    for (const key in object) {
      const value = object[key];
      if (key === "userId") newObject[key] = _id(value);
      else if (key === "id") continue;
      else newObject[key] = value;
    }
    return newObject;
  },
};

/** @return { import("next-auth/adapters").Adapter } */
export default function MongoDbAdapter() {
  let { from, to } = format;
  return {
    async createUser(data) {
      console.log('inside createUser adapter, data: ',data)
      let user = to(data);
      console.log("Creating user:", user);
      return from(user);
    },
    async getUser(id) {
      console.log("Getting user with ID:", id);
      let res = await axios.post(
        `${process.env.MONGODB_URI}/action/findOne`,
        {
          dataSource: "Cluster0",
          database: process.env.DataBase
          collection: "users",
          filter: {
            _id: _id(id),
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
      if (!res.data.document) return null;
      console.log("User found:", res.data.document);
      return from(res.data.document);
    },
    async getUserByEmail(email) {
      console.log("Getting user by email:", email);
      let res = await axios.post(
        `${process.env.MONGODB_URI}/action/findOne`,
        {
          dataSource: "Cluster0",
          database: process.env.DataBase
          collection: "users",
          filter: {
            email,
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
      if (!res.data.document) return null;
      console.log("User found:", res.data.document);
      return from(res.data.document);
    },
    async getUserByAccount({ providerAccountId, provider }) {
      console.log("Getting user by account:", providerAccountId, provider);
      try {
        let accRes = await axios.post(
          `${process.env.MONGODB_URI}/action/findOne`,
          {
            dataSource: "Cluster0",
            database: process.env.DataBase
            collection: "accounts",
            filter: {
              provider: providerAccountId,
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
        if (!accRes.data.document) return null;

        let userRes = await axios.post(
          `${process.env.MONGODB_URI}/action/findOne`,
          {
            dataSource: "Cluster0",
            database: process.env.DataBase
            collection: "users",
            filter: {
              _id: new ObjectId(accRes.data.userId),
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

        if (!userRes.data.document) return null;
        console.log("User found:", userRes.data.document);
        return from(userRes.data.document);
      } catch (e) {
        console.log(e.response.data);
      }
    },
    async updateUser(data) {
      console.log("Updating user:", data);
      const _a = to(data),
        { _id } = _a,
        user = __rest(_a, ["_id"]);

      let res = await axios.post(
        `${process.env.MONGODB_URI}/action/updateOne`,
        {
          dataSource: "Cluster0",
          database: process.env.DataBase
          collection: "users",
          filter: {
            _id: {
              $oid: _id,
            },
          },
          update: {
            $set: user,
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
      console.log("User updated successfully.");
      return from(res.data.document);
    },
    async linkAccount(data) {
      console.log("Linking account:", data);
      const acc = to(data);

      await axios.post(
        `${process.env.MONGODB_URI}/action/insertOne`,
        {
          dataSource: "Cluster0",
          database: process.env.DataBase
          collection: "accounts",
          document: acc,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            apiKey: process.env.DATAAPI_KEY,
          },
        }
      );

      console.log("Account linked successfully.");
      return acc;
    },
    async createSession(data) {
      console.log("Creating session:", data);
      const session = to(data);
      await axios.post(
        `${process.env.MONGODB_URI}/action/insertOne`,
        {
          dataSource: "Cluster0",
          database: process.env.DataBase
          collection: "sessions",
          document: session,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            apiKey: process.env.DATAAPI_KEY,
          },
        }
      );
      console.log("Session created successfully.");
      return from(session);
    },
    async getSessionAndUser(sessionToken) {
      console.log("Getting session and user with session token:", sessionToken);
      const session = await axios.post(
        `${process.env.MONGODB_URI}/action/findOne`,
        {
          dataSource: "Cluster0",
          database: process.env.DataBase
          collection: "sessions",
          filter: {
            sessionToken,
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
      if (!session.data.document) return null;
      const user = await axios.post(
        `${process.env.MONGODB_URI}/action/findOne`,
        {
          dataSource: "Cluster0",
          database: process.env.DataBase
          collection: "users",
          filter: {
            _id: new ObjectId(session.data.userId),
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
      if (!user.data.document) return null;
      console.log("User found:", user.data.document);
      console.log("Session found:", session.data.document);
      return {
        user: from(user.data.document),
        session: from(session.data.document),
      };
    },
    async updateSession(data) {
      console.log("Updating session:", data);
      const _a = to(data),
        { _id } = _a,
        session = __rest(_a, ["_id"]);
      let res = await axios.post(
        `${process.env.MONGODB_URI}/action/updateOne`,
        {
          dataSource: "Cluster0",
          database: process.env.DataBase
          collection: "sessions",
          filter: {
            sessionToken: session.sessionToken,
          },
          update: {
            $set: session,
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
      console.log("Session updated successfully.");
      return from(res.data.document);
    },
    async deleteSession(sessionToken) {
      console.log("Deleting session with session token:", sessionToken);
      let session = await axios.post(
        `${process.env.MONGODB_URI}/action/findOne`,
        {
          dataSource: "Cluster0",
          database: process.env.DataBase
          collection: "users",
          filter: {
            sessionToken,
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
      await axios.post(
        `${process.env.MONGODB_URI}/action/deleteOne`,
        {
          dataSource: "Cluster0",
          database: process.env.DataBase
          collection: "users",
          filter: {
            sessionToken,
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
      console.log("Session deleted successfully.");
      return from(session.data.document);
    },
    async createVerificationToken(data) {
      console.log("Creating verification token:", data);
      await axios.post(
        `${process.env.MONGODB_URI}/action/insertOne`,
        {
          dataSource: "Cluster0",
          database: process.env.DataBase
          collection: "verification_tokens",
          document: to(data),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            apiKey: process.env.DATAAPI_KEY,
          },
        }
      );
      console.log("Verification token created successfully.");
      return data;
    },
    async useVerificationToken(data) {
      console.log("Using verification token:", data);
      const res = await axios.post(
        `${process.env.MONGODB_URI}/action/findOne`,
        {
          dataSource: "Cluster0",
          database: process.env.DataBase
          collection: "verification_tokens",
          filter: {
            token: data.token
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

      console.log("Verification token found:", res.data.document);

      if (!res.data.document) {
        return null;
      }

      await axios.post(
        `${process.env.MONGODB_URI}/action/deleteOne`,
        {
          dataSource: "Cluster0",
          database: process.env.DataBase
          collection: "verification_tokens",
          filter: {
            token: data.token,
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

      const { _id } = res.data.document,
        rest = __rest(res.data.document, _id);

      console.log("Verification token deleted successfully.");
      console.log("Returning rest:", rest);

      return rest;
    },
  };
}
