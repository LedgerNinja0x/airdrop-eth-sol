
import { getProviders } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import Signup from "@/components/Auth/Signup";
import { useSearchParams } from "next/navigation";
import Head from "next/head";

export default function Page({ providers }) {

  const errorParams = useSearchParams();

  const error = errorParams.get("error");

  return (
    <>
      <Head>
        <title>New Admin</title>
        <meta
          name="description"
          content="New Admin"
          key="desc"
        />
        <meta
          property="og:title"
          content="New Admin"
        />
        <meta
          property="og:description"
          content="New Admin"
        />
      </Head>
        <Signup providers={providers} error={error}/>
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

    // If the user is already logged in, redirect.
    // Note: Make sure not to redirect to the same page
    // To avoid an infinite loop!
    if (session) {
      return { redirect: { destination: "/admin" } };
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