"use client";
import StepperModal from "@/components/StepperModal";
import { useState } from "react";

export default function NotificationArea({name,followers,twittUsername}) {
  let [isOpen, setIsopen] = useState(false);

  return (
    <>
      <button onClick={() => setIsopen(true)} className="bg-[#241008] mt-8 text-white transition-all flex items-center justify-center py-4 rounded-md text-[18px] hover:rounded-none cursor-pointer gap-x-7 lg:w-2/4 md:w-auto md:px-6 text-center items-center">
        <span className="w-full text-center">Check Your Messages</span>
      </button>
      <StepperModal isOpen={isOpen} setIsOpen={setIsopen} name={name} followers={followers} twittUsername={twittUsername}/>
    </>
  );
}
