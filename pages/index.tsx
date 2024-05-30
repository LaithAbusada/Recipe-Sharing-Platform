// pages/index.tsx
"use client";
import React from "react";
import MainPage from "../components/MainPage";
import withAuth from "../components/withAuth"; // Adjust the import path as needed

const Home: React.FC = () => {
  return <MainPage />;
};

export default withAuth(Home);
