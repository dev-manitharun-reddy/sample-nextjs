"use client";

import Link from "next/link";
import { useAuth } from "./context/AuthContext";

export default function HomePage() {
  const { isLoggedIn, user } = useAuth();

  return (
    <>
      <div className="flex flex-col items-center justify-center ">
        <h1 className="text-4xl font-bold">Home Page</h1>
        <p className="text-lg">Welcome to the home page</p>
      </div>
    </>
  );
}
