import { getProviders } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import { useSearchParams } from "next/navigation";

import Signin from "@/components/Auth/Signin";
import Head from "next/head";

export default function Page({ providers }) {
  const errorParams = useSearchParams();

  const error = errorParams.get("error");
  return (
    <div className="admin-dashboard overflow-y-hidden">
      <div className="flex w-screen">
        <div className="w-1/2">
          <Head>
            <title>Admin Login</title>
            <meta name="description" content="Admin" key="desc" />
            <meta property="og:title" content="Admin" />
            <meta property="og:description" content="Admin" />{" "}
          </Head>
          <Signin providers={providers} error={error} />
        </div>
        <div className="w-1/2">
          <img src="../mosse_head.png" />
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  try {
    const session = await getServerSession(
      context.req,
      context.res,
      authOptions
    );

    // If the user is already logged in, redirect.
    // Note: Make sure not to redirect to the same page
    // To avoid an infinite loop!
    if (session) {
      return { redirect: { destination: "/dashboard" } };
    }

    const providers = await getProviders();
    return {
      props: { providers, email: session?.user?.email || null },
    };
  } catch (err) {
    console.log(err);
    return {
      props: null,
    };
  }
}
