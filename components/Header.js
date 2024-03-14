'use client'

import { signIn, signOut } from "next-auth/react";
import Link from "next/link"; 
import { usePathname } from 'next/navigation'

export default function Header({ logged, avatar }) {
  const pathname = usePathname()
  return (
    <header class="text-gray-600 body-font bg-gray-50 shadow-sm">
      <div class="container mx-auto flex flex-wrap px-5 py-3 flex-col md:flex-row items-center">
        <a class="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
          <img src="/logo.png" className="w-8 h-8"></img>
          <span class="ml-3 text-xl">Airdrop</span>
        </a>
        <nav class="md:ml-auto md:mr-auto flex flex-wrap items-center text-base justify-center">
          <a class="mr-5 hover:text-indigo-400 cursor-pointer">FAQ</a>
          <a class="mr-5 hover:text-indigo-400 cursor-pointer">Know More</a>
          <a class="mr-5 hover:text-indigo-400 cursor-pointer">Community</a>
          {logged && (
            <a
              class="mr-5 hover:text-indigo-400 cursor-pointer"
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
                className="bg-[#000] text-white transition-all flex items-center px-8 py-2 rounded-md text-[16px] hover:rounded-none cursor-pointer"
              >
                <span className="w-full text-center">Go To Dashboard</span>
              </Link>
            )}
          </>
        ) : (
          <>
            {/* don't show login to admins */}
            {!pathname.includes("admin") && (
              <div
                onClick={() => signIn("twitter", { callbackUrl: "/dashboard" })}
                className="bg-[#000] text-white transition-all flex items-center px-8 py-2 rounded-md text-[16px] hover:rounded-none cursor-pointer"
              >
                <img src="/twitter.jpg" className="w-8 h-8" />
                <span className="w-full text-center">Log In With Twitter</span>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
}
