"use client";
import React, { useState, FormEvent, ChangeEvent } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/pages/firebase/config";
import { useRouter } from "next/router";
import Link from "next/link";

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setMessage("");
    setError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(
        "Password reset email sent successfully.,Please follow instructions in the email sent to you"
      );
      setTimeout(() => {
        router.push("/login"); // Redirect to login page after a few seconds
      }, 3000); // 3 seconds
    } catch (error: any) {
      setError("Failed to send password reset email. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="Logo" className="mx-auto w-24 h-24" />
        </div>
        <h2 className="text-3xl font-bold mb-6 text-white text-center">
          Reset Password
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-400 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-500 text-gray-900 bg-gray-200"
              required
            />
          </div>
          {message && <p className="text-green-500 text-sm mb-4">{message}</p>}
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            >
              Send Reset Email
            </button>
          </div>
        </form>
        <div className="mt-6 text-center text-lg">
          <Link href="/login">
            <span className="text-indigo-400 hover:text-indigo-600 font-bold text-xl mt-4 inline-block">
              Back to Login
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
