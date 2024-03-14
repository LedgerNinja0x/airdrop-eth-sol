import Header from "@/components/Header";
import { signIn } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";
import Link from "next/link";

export default function Home({ logged,avatar }) {
  return (
    <main className="">
      <Header logged={logged} avatar={avatar}/>
      <section class="text-gray-600 body-font my-12">
        <div class="container mx-auto flex px-8 md:flex-row flex-col items-center">
          <div class="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
            <h1 class="font-[900] sm:text-5xl text-3xl mb-7 text-gray-900" style={{lineHeight: '3.7rem'}}>
              Verify Your Twitter
              <br class="hidden lg:inline-block" />
              And Get <span className="text-indigo-500">Rewards</span>
            </h1>
            <p class="mb-8 leading-relaxed">
              Airdrop is the ultimate platform to get rewards in the form of
              crypto currencies for just verifying your account. Sign up now to
              get started quickly.
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
                className="bg-[#000] text-white transition-all flex items-center px-8 py-2 mb-6 rounded-md text-[16px] hover:rounded-none cursor-pointer"
              >
                <img src="/twitter.jpg" className="w-8 h-8" />
                <span className="w-full text-center">Log In With Twitter</span>
              </div>
            )}
          </div>

          <div class="lg:max-w-lg lg:w-full md:w-1/2 w-5/6">
            <img
              class="object-cover object-center rounded"
              alt="hero"
              src="https://www.forbesindia.com/media/images/2022/Jul/img_188883_gtabg.jpg"
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
      return { props: { logged: true,avatar: session?.user?.image || null } };
    }
  } catch (e) {
    console.log(e);
    return { props: { logged: false } };
  }
}
