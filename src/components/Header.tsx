"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Quiz App
          </Link>
          <div className="flex items-center">
            <UserButton />
          </div>
        </div>
      </div>
    </header>
  );
}
