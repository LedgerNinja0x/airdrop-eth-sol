import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { signIn } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";
import Link from "next/link";

export default function Home({ logged,avatar }) {

  return (
    <main className="min-h-screen h-fit flex flex-col justify-between">
      <Header logged={logged} avatar={avatar}/>
      <section className="text-gray-600 body-font mt-8">
        <div className="container mx-auto flex md:flex-row flex-col overflow-none items-center">
          <div className="md:w-1/2 w-full flex flex-col md:items-start md:text-left mb-16 md:mb-0 text-center px-4 items-center">
            <h1 className="font-bold lg:text-6xl md:text-5xl mb-7 text-[#241008]">
              Verify Your Twitter & Join the Moose family To Get Rewards.
            </h1>
            <p className="mb-8 leading-relaxed text-lg font-normal">
              Signup now to get started quickly
            </p>
            {logged ? (
              <Link
                href="/dashboard"
                className="bg-[#000] text-white transition-all flex items-center px-8 py-2 mb-6 rounded-md text-[16px] hover:rounded-none cursor-pointer"
              >
                <span className="w-full text-center">Go To Dashboard</span>
              </Link>
            ) : (
              <div
                onClick={() => signIn("twitter",{ callbackUrl: '/dashboard' })}
                className="bg-[#000] text-white transition-all flex items-center px-8 py-2 mb-6 rounded-md text-[16px] hover:rounded-none cursor-pointer max-w-60"
              >
                <img src="/twitter.jpg" className="w-8 h-8" />
                <span className="w-full text-center">Log In With Twitter</span>
              </div>
            )}
          </div>

          <div className="md:w-2/5 w-full">
            <img
              className="w-full"
              alt="hero"
              src="./moose.png"
            />
          </div>
        </div>
      </section>
      <Footer />
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
      return { redirect: { destination: "/dashboard" } };
    }
  } catch (e) {
    return { props: { logged: false } };
  }
}
