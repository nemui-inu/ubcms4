import React from "react";
import Image from "next/image";
import profile from "./gcash.png";

const Page = () => {
  return (
    <Image
      src={profile}
      alt="GCash Payment Wall"
      className="w-full h-[100vh]"
      width={200}
      height={200}
    />
  );
};

export default Page;
