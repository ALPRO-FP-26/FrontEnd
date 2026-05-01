'use client';

import Image from "next/image";

export default function Dashboard() {
  return (
    <div className="flex flex-col md:flex-row h-full bg-gray-300">
      <div className="w-full md:w-1/2">
        <Image
          src="/images/health-shield.png"
          width={500}
          height={500}
          alt="3D Health Shield Illustration"
        />
      </div>
      <div className="w-full md:w-1/2 bg-red-400">
        hello world
      </div>
    </div>
  );
}
