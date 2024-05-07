import Header from "@/components/Header";
import { signIn } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";
import Link from "next/link";

export default function Home({ logged,avatar }) {

  return (
    <main className="">
      <Header logged={logged} avatar={avatar}/>
      <section className="text-gray-600 body-font mt-8">
        <div className="container mx-auto flex md:flex-row flex-col overflow-none items-center">
          <div className="md:w-1/2 w-full flex flex-col md:items-start md:text-left mb-16 md:mb-0 text-center">
            <h1 className="font-bold lg:text-6xl md:text-5xl mb-7 text-[#241008]">
              Verify Your Twitter
              And Get Rewards
            </h1>
            <p className="mb-8 leading-relaxed text-lg font-normal">
              Airdrop is the ultimate platform to get rewards in the form of
              crypto currencies for just verifying your account. Sign up now to
              get started quickly.
            </p>
            {logged ? (
              <Link
                href="/dashboard"
                className="bg-[#241008] text-white transition-all flex items-center justify-center py-4 rounded-md text-[18px] hover:rounded-none cursor-pointer gap-x-7 lg:w-2/4 md:w-auto md:px-6 text-center items-center"
              >
                <span className="leading-7">Go To Dashboard</span>
              </Link>
            ) : (
              <>
              <div
                onClick={() => signIn("twitter", { callbackUrl: "/dashboard" })}
                className="bg-[#241008] text-white transition-all flex items-center justify-center py-4 rounded-md text-[18px] hover:rounded-none cursor-pointer gap-x-7 lg:w-2/4 md:w-auto md:px-6 text-center items-center"
              >
                <img src="/twitter.png"/>
                <span className="leading-7">Log In With Twitter</span>
              </div>
              <div
                onClick={() => signIn("twitter", { callbackUrl: "/dashboard" })}
                className="bg-[#241008] text-white transition-all flex items-center justify-center py-4 rounded-md text-[18px] hover:rounded-none cursor-pointer gap-x-7 lg:w-2/4 md:w-auto md:px-6 text-center items-center"
              >
                <img src="/twitter.png"/>
                <span className="leading-7">Powered by Forward Protocol</span>
              </div>
              </>
            )}
          </div>

          <div className="md:w-1/2 w-full">
            <img
              className="w-full"
              alt="hero"
              src="./moose.png"
            />
          </div>
        </div>
      </section>
    </main>
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
      return { props: { logged: false } };
    } else {
      return { props: { logged: true, avatar: session?.user?.image || null } };
    }
  } catch (e) {
    console.log(e);
    return { props: { logged: false } };
  }
}
