"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/pages/firebase/config";
import { signOut } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

const Navbar: React.FC = () => {
  const [user, loading, error] = useAuthState(auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-d6efff p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-fe654f font-bold text-lg">
          Recipe Sharing Platform
        </Link>
        <div className="lg:hidden">
          <button
            onClick={toggleMenu}
            className="text-fe654f focus:outline-none"
          >
            <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
          </button>
        </div>
        <div className={`hidden lg:flex space-x-4 lg:space-x-32`}>
          <Link href="/" className="text-fe654f hover:text-fed99b">
            Home
          </Link>
          {user ? (
            <>
              <Link href="/myrecipes" className="text-fe654f hover:text-fed99b">
                My Recipes
              </Link>
              <button
                onClick={handleLogout}
                className="text-fe654f hover:text-fed99b focus:outline-none"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-fe654f hover:text-fed99b">
                Login
              </Link>
              <Link href="/sign-up" className="text-fe654f hover:text-fed99b">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
      {isMenuOpen && (
        <div className="lg:hidden flex flex-col items-center space-y-4 mt-2">
          <Link
            href="/"
            className="text-fe654f hover:text-fed99b"
            onClick={toggleMenu}
          >
            Home
          </Link>
          {user ? (
            <>
              <Link
                href="/myrecipes"
                className="text-fe654f hover:text-fed99b"
                onClick={toggleMenu}
              >
                My Recipes
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  toggleMenu();
                }}
                className="text-fe654f hover:text-fed99b focus:outline-none"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-fe654f hover:text-fed99b"
                onClick={toggleMenu}
              >
                Login
              </Link>
              <Link
                href="/sign-up"
                className="text-fe654f hover:text-fed99b"
                onClick={toggleMenu}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
