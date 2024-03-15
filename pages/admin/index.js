import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import axios from "axios";
import Header from "@/components/Header";
import Table from "@/components/Table";

export default function Page({users}) {
  const columns = [
    {
      Header: 'Actions',
      accessor: 'message',
    },
    {
      Header: 'Name',
      accessor: 'username',
    },
    {
      Header: 'Twitter Verified',
      accessor: 'twitterVerified',
    },
    {
      Header: 'IP',
      accessor: 'IP',
    },
    {
      Header: 'Country',
      accessor: 'location',
    },
    {
      Header: 'User Rating',
      accessor: 'userRating',
    },
    {
      Header: 'Sol Address',
      accessor: 'solAddress',
    },
    {
      Header: 'Eth Address',
      accessor: 'ethAddress',
    },
    {
      Header: 'Eth Balance',
      accessor: 'ethBalance',
    },
    {
      Header: 'Sol Balance',
      accessor: 'solBalance',
    },
    {
      Header: 'Eth Gas',
      accessor: 'ethGas',
    },
    {
      Header: 'Sol Gas',
      accessor: 'solGas',
    },
    {
      Header: 'Followers',
      accessor: 'followers_count',
    },
    {
      Header: 'Following',
      accessor: 'following_count',
    },
    {
      Header: 'Like Count',
      accessor: 'like_count',
    },
    {
      Header: 'Twitter Username',
      accessor: 'twitt_username',
    },
    {
      Header: 'Created At',
      accessor: 'createdAt',
    },

    // Add more columns as needed
  ]

  return (
    <>
      <Header />
      <div className="p-12 pb-0">
        <h1 className="font-bold text-3xl mb-12">Admin Dashboard</h1>
        <Table columns={columns} data={users} />
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  try {
    const session = await getServerSession(
      context.req,
      context.res,
      authOptions
    );

    // Protect route from unlogged users
    if (!session) {
      return { redirect: { destination: "/admin/login" } };
    }

    console.log("session here", session);

    //this is entire admin auth
    //change this to change admin credentials

    if (
      session?.user?.email !== process.env.ADMIN_EMAIL &&
      session?.user?.name !== process.env.ADMIN_USERNAME
    ) {
      return { redirect: { destination: "/admin/login" } };
    }

    //get all user data and pass it as props
    let {data} = await axios.post(
      `${process.env.MONGODB_URI}/action/find`,
      {
        dataSource: "Cluster0",
        database: "test",
        collection: "users",
        filter: {
         provider: "twitter",
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

    console.log(data.documents.length, 'len of data')

    return { props: {users: data.documents} };
  } catch (e) {
    console.log(e);
    return {
      props: {},
    };
  }
}
