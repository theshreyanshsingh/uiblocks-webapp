import Sidebar from "../../_components/Sidebar";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen w-screen flex flex-col md:flex-row justify-start items-center bg-[#0A0A0D]">
      {/* Sidebar */}
      <Sidebar />

      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
};

export default Layout;
