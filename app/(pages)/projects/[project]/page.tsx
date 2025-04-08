"use client";
import { NextPage } from "next";
import Sheet from "./_components/Sheet";
import Chat from "./_components/_sub-components/Chat";
import MobileChat from "./_components/_sub-components/MobileChat";

const Page: NextPage = () => {
  return (
    <div className="flex justify-between h-full max-md:w-screen">
      <Sheet />
      {/* Desktop */}
      <Chat />
      {/* Mobile */}
      <MobileChat />
    </div>
  );
};

export default Page;
