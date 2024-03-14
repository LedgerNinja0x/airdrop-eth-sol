"use client";
import StepperModal from "@/components/StepperModal";
import { useState } from "react";

export default function NotificationArea({name,followers}) {
  let [isOpen, setIsopen] = useState(false);

  return (
    <>
      <button onClick={() => setIsopen(true)} className="bg-[#000] mt-8 text-white transition-all flex items-center px-8 py-2 rounded-md text-[16px] hover:rounded-none cursor-pointer">
        <span className="w-full text-center">Check Your Messages</span>
      </button>
      <StepperModal isOpen={isOpen} setIsOpen={setIsopen} name={name} followers={followers}/>
    </>
  );
}
