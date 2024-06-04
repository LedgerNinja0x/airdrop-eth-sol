'use client'

import { signIn, signOut } from "next-auth/react";
import Link from "next/link"; 
import { usePathname } from 'next/navigation'

import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import { Logout } from '@mui/icons-material';
import WalletButton from "./WalletButton";

const actions = [
  { icon: <Logout />, name: 'SignOut' }
];

export default function Header({ logged, avatar }) {
  const pathname = usePathname()
  return (
    <header className="text-gray-600 body-font shadow-sm">
      <div className="flex flex-wrap md:px-20 sm:px-8 py-8 flex-col gap-2 md:flex-row items-center w-screen justify-between">
        <a className="flex title-font font-medium items-center text-gray-900" href={process.env.NEXTAUTH_URL}>
          <img src="/logo.png"></img>
          <span className="ml-3 text-xl logo-txt">Moose</span>
        </a>
        {logged ? (
          <div className="flex flex-col md:flex-row gap-2">
            {/* <WalletButton /> */}
            {avatar ? (
                <SpeedDial
                  ariaLabel="SpeedDial basic example"
                  sx={{ position: 'absolute', top: 30, right: 40 }}
                  icon={
                  <img
                    src={avatar}
                    className="w-12 h-12 rounded-full object-cover cursor-pointer transition-all hover:opacity-[0.7]"
                  />
                  }
                  direction="down"
                >
                  {actions.map((action) => (
                    <SpeedDialAction
                      key={action.name}
                      icon={action.icon}
                      tooltipTitle={action.name}
                      onClick={() => signOut()}
                    />
                  ))}
                </SpeedDial>
            ) : (
              <></>
            )}
          </div>
        ) : (
          <>
            {/* don't show login to admins */}
            {!pathname.includes("admin") ? (<></>) : 
              (
              <div className="flex flex-col md:flex-row gap-2">
                <WalletButton />
                <a
                  className="bg-[#241008] text-white transition-all flex items-center px-4 py-4 rounded-md text-[18px] hover:rounded-none cursor-pointer gap-x-7 w-auto"
                  onClick={() => signOut()}
                >
                  Sign out
                </a>
              </div>
              )
            }
          </>
        )}
      </div>
    </header>
  );
}
