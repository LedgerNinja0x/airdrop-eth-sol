'use client'

import { signIn, signOut } from "next-auth/react";
import Link from "next/link"; 
import { usePathname } from 'next/navigation'

export default function Header({ logged, avatar }) {
  const pathname = usePathname()
  return (
    <header className="text-gray-600 body-font shadow-sm">
      <div className="flex flex-wrap md:px-32 sm:px-8 py-8 flex-col md:flex-row items-center w-screen justify-between">
        <a className="flex title-font font-medium items-center text-gray-900">
          <img src="/logo.png"></img>
          <span className="ml-3 text-xl logo-txt">Moose</span>
        </a>
        <nav className="flex flex-wrap items-center text-base text-gray-900">
          {logged && (
            <a
              className="mr-5 hover:text-indigo-400 cursor-pointer"
              onClick={() => signOut()}
            >
              Sign out
            </a>
          )}
        </nav>
        {logged ? (
          <>
            {avatar ? (
              <img
                src={avatar}
                className="w-12 h-12 rounded-full object-cover cursor-pointer transition-all hover:opacity-[0.7]"
              />
            ) : (
              <Link
                href="/dashboard"
                className="bg-[#241008] text-white transition-all flex items-center px-4 py-4 rounded-md text-[18px] hover:rounded-none cursor-pointer gap-x-7 w-auto text-center"
              >
                <span className="leading-7">Go To Dashboard</span>
              </Link>
            )}
          </>
        ) : (
          <>
            {/* don't show login to admins */}
            {!pathname.includes("admin") && (
              <div
                onClick={() => signIn("twitter", { callbackUrl: "/dashboard" })}
                className="bg-[#241008] text-white transition-all flex items-center px-4 py-4 rounded-md text-[18px] hover:rounded-none cursor-pointer gap-x-7 w-64"
              >
                <img src="/twitter.png"/>
                <span className="text-center leading-7">Log In With Twitter</span>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
}
