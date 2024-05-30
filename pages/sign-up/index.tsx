"use client";
import React, { useState, FormEvent, ChangeEvent } from "react";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import { auth, firestore } from "@/pages/firebase/config";
import { setDoc, doc } from "firebase/firestore";

const SignUp: React.FC = () => {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [emailError, setEmailError] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<boolean>(false);
  const [confirmPasswordError, setConfirmPasswordError] =
    useState<boolean>(false);
  const [passwordRulesError, setPasswordRulesError] = useState<string>("");

  const [createUserWithEmailAndPassword, user, loading, error] =
    useCreateUserWithEmailAndPassword(auth);

  const router = useRouter();

  const handleFirstNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFirstName(e.target.value);
  };

  const handleLastNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLastName(e.target.value);
  };

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

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setConfirmPasswordError(false);
    setErrorMessage("");
  };

  const validatePasswordRules = (pwd: string): string[] => {
    const rules = [];
    if (pwd.length < 8)
      rules.push("Password must be at least 8 characters long.");
    if (!/[A-Z]/.test(pwd))
      rules.push("Password must contain at least one uppercase letter.");
    if (!/[a-z]/.test(pwd))
      rules.push("Password must contain at least one lowercase letter.");
    if (!/[0-9]/.test(pwd))
      rules.push("Password must contain at least one number.");
    if (!/[^A-Za-z0-9]/.test(pwd))
      rules.push("Password must contain at least one special character.");

    return rules;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Reset error states
    setEmailError(false);
    setPasswordError(false);
    setConfirmPasswordError(false);
    setErrorMessage("");
    setPasswordRulesError("");

    // Email regex for validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setEmailError(true);
      setErrorMessage("Invalid email format");
      return;
    }

    const passwordValidationErrors = validatePasswordRules(password);
    if (passwordValidationErrors.length > 0) {
      setPasswordError(true);
      setPasswordRulesError(passwordValidationErrors.join(" "));
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError(true);
      setConfirmPasswordError(true);
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      const res = await createUserWithEmailAndPassword(email, password);
      if (res) {
        console.log("User created successfully:", res.user);
        // Save additional user information in Firestore
        await setDoc(doc(firestore, "users", res.user.uid), {
          firstName,
          lastName,
          email,
          uid: res.user.uid, // Save the user's uid
        });
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setErrorMessage(""); // Clear any existing error messages
        router.push("/login"); // Redirect to home page
      } else {
        handleFirebaseError(error);
      }
    } catch (error: any) {
      handleFirebaseError(error);
    }
  };

  const handleFirebaseError = (error: any) => {
    switch (error.code) {
      case "auth/email-already-in-use":
        setErrorMessage(
          "This email is already in use. Please use a different email."
        );
        setEmailError(true);
        break;
      case "auth/invalid-email":
        setErrorMessage("The email address is not valid.");
        setEmailError(true);
        break;
      case "auth/weak-password":
        setErrorMessage(
          "The password is too weak. Please use a stronger password."
        );
        setPasswordError(true);
        break;
      default:
        setErrorMessage("An unknown error occurred. Please try again.");
        break;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-white text-center">
          Sign Up
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-400 text-sm font-bold mb-2"
              htmlFor="firstName"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={handleFirstNameChange}
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-500 text-gray-900 bg-gray-200"
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-400 text-sm font-bold mb-2"
              htmlFor="lastName"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={handleLastNameChange}
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-500 text-gray-900 bg-gray-200"
              required
            />
          </div>
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
              className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-500 ${
                emailError
                  ? "border border-red-500 text-red-600"
                  : "text-gray-900 bg-gray-200"
              }`}
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-400 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={handlePasswordChange}
              className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-500 ${
                passwordError
                  ? "border border-red-500 text-red-600"
                  : "text-gray-900 bg-gray-200"
              }`}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-400 text-sm font-bold mb-2">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="mr-2"
              />
              Show Password
            </label>
          </div>
          {passwordRulesError && (
            <p className="text-red-500 text-sm mb-4">{passwordRulesError}</p>
          )}
          <div className="mb-6">
            <label
              className="block text-gray-400 text-sm font-bold mb-2"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-500 ${
                confirmPasswordError
                  ? "border border-red-500 text-red-600"
                  : "text-gray-900 bg-gray-200"
              }`}
              required
            />
            <p className="text-gray-400 text-sm mt-2">
              Password must be at least 8 characters long, contain at least one
              uppercase letter, one lowercase letter, one number, and one
              special character.
            </p>
          </div>
          {errorMessage && (
            <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
          )}

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
              disabled={loading}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
