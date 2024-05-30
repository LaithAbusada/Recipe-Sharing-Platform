"use client";
import React, { useState, FormEvent, ChangeEvent } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import Link from "next/link";
import { auth } from "@/pages/firebase/config";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [emailError, setEmailError] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<boolean>(false);
  const router = useRouter();

  const [signInWithEmailAndPassword, user, loading, error] =
    useSignInWithEmailAndPassword(auth);

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError(false);
    setErrorMessage("");
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordError(false);
    setErrorMessage("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Reset error states
    setEmailError(false);
    setPasswordError(false);
    setErrorMessage("");

    try {
      const res = await signInWithEmailAndPassword(email, password);
      if (res) {
        console.log("User logged in successfully:", res.user);
        setEmail("");
        setPassword("");
        setErrorMessage(""); // Clear any existing error messages
        router.push("/"); // Redirect to home page
      } else {
        console.log(error?.code);
        console.log(error?.message);
        handleFirebaseError(error);
      }
    } catch (error: any) {
      handleFirebaseError(error);
    }
  };

  const handleFirebaseError = (error: any) => {
    switch (error.code) {
      case "auth/invalid-credential":
        setErrorMessage("You have entered the wrong email or password");
        setEmailError(true);
        break;
      case "auth/user-disabled":
        setErrorMessage("This user account has been disabled.");
        setEmailError(true);
        break;
      case "auth/too-many-requests":
        setErrorMessage(
          "Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later."
        );
        setEmailError(true);
        break;
      default:
        setErrorMessage("An unknown error occurred. Please try again.");
        break;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-d6efff">
      <div className="bg-fefeff p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="Logo" className="mx-auto w-24 h-24" />
        </div>
        <h1 className="text-3xl font-bold mb-6 text-fe654f text-center">
          Login
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-d87b57 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              className={`w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring focus:ring-fe654f ${
                emailError ? "border-fe654f text-fe654f" : "text-gray-900"
              }`}
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-d87b57 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={handlePasswordChange}
              className={`w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring focus:ring-fe654f ${
                passwordError ? "border-fe654f text-fe654f" : "text-gray-900"
              }`}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-d87b57 text-sm font-bold mb-2">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="mr-2"
              />
              Show Password
            </label>
          </div>
          {errorMessage && (
            <p className="text-fe654f text-sm mb-4">{errorMessage}</p>
          )}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="w-full bg-fe654f text-white py-2 px-4 rounded-md hover:bg-d87b57 focus:outline-none focus:ring-2 focus:ring-fe654f focus:ring-opacity-50"
              disabled={loading}
            >
              {loading ? "Logging In..." : "Login"}
            </button>
          </div>
        </form>
        <div className="mt-6 text-center text-lg">
          <div className="flex items-center justify-center">
            <div className="border-t border-d87b57 w-1/3"></div>
            <span className="text-d87b57 mx-4">OR</span>
            <div className="border-t border-d87b57 w-1/3"></div>
          </div>
          <Link href="/sign-up">
            <span className="text-fe654f hover:text-d87b57 font-bold text-xl mt-4 inline-block">
              Sign Up
            </span>
          </Link>
          <div className="border-t border-d87b57 mt-4"></div>
          <Link href="/reset-password">
            <span className="text-fe654f hover:text-d87b57 font-bold text-xl mt-4 inline-block">
              Forgot password?
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
