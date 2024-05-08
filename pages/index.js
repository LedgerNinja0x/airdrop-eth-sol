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
            <div
                onClick={() => location.href = "https://forwardprotocol.io/"}
                className="bg-[#241008] text-white transition-all flex items-center justify-center py-2 px-2 rounded-md text-[18px] hover:rounded-none cursor-pointer gap-x-7 lg:w-auto md:w-auto md:px-6 text-center items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 83 83" fill="#241008">
                  <path d="M82.8322 0H0V82.8322H82.8322V0Z" fill="#241008"/>
                  <path d="M59.8782 41.2344L27.3016 68.0067V58.9229C27.3012 57.3488 27.6487 55.7942 28.3191 54.37C28.9894 52.9459 29.9662 51.6875 31.1795 50.6847L42.6314 41.225L31.2672 32.0785C30.025 31.0775 29.0228 29.8109 28.3344 28.3717C27.646 26.9325 27.2888 25.3574 27.2891 23.7621V14.8254L59.8782 41.2344Z" fill="#241008" stroke="white" strokeWidth="2px"/>
                </svg>
                <span className="leading-7">Powered by Forward Protocol</span>
            </div>
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
    return { props: { logged: false } };
  }
}
