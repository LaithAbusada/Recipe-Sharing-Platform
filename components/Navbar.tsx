"use client";
import React from "react";
import Link from "next/link";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-d6efff p-4">
      {" "}
      {/* Light Blue */}
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-fe654f font-bold text-lg">
          {" "}
          {/* Red-Orange */}
          Recipe Sharing Platform
        </Link>
        <div className="flex space-x-4 lg:space-x-32">
          {" "}
          {/* Larger spacing on larger screens */}
          <Link href="/login" className="text-fe654f hover:text-fed99b">
            {" "}
            {/* Light Orange and Peach */}
            Login
          </Link>
          <Link href="/sign-up" className="text-fe654f hover:text-fed99b">
            {" "}
            {/* Light Orange and Peach */}
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
