import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import Footer from "./(components)/Footer";
import Header from "./(components)/Header";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DevMTR - E-Commerce",
  description: "A modern e-commerce platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <AuthProvider>
          <Header />
          <main className="flex-grow ">{children}</main>
        </AuthProvider>
        <Footer />
      </body>
    </html>
  );
}
