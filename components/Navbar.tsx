// components/Navbar.tsx
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "@/pages/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

const Navbar: React.FC = () => {
  const [user, loading, error] = useAuthState(auth);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const fetchUserName = async () => {
      if (user) {
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(userData.firstName || user.email); // Assuming firstName is stored in Firestore
        }
      }
    };

    fetchUserName();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <nav className="bg-d6efff p-4">
      {/* Light Blue */}
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-fe654f font-bold text-lg">
          {/* Red-Orange */}
          Recipe Sharing Platform
        </Link>
        <div className="flex space-x-4 lg:space-x-32">
          {/* Larger spacing on larger screens */}
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-fe654f">Welcome, {userName}</span>
              <button
                onClick={handleLogout}
                className="text-fe654f hover:text-fed99b focus:outline-none"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-fe654f hover:text-fed99b">
                {/* Light Orange and Peach */}
                Login
              </Link>
              <Link href="/sign-up" className="text-fe654f hover:text-fed99b">
                {/* Light Orange and Peach */}
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
