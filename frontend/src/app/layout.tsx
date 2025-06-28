import type { Metadata } from "next";
import { Albert_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const albertSans = Albert_Sans({
  variable: "--font-albert-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PromisePay",
  description: "Decentralized Escrow for a Borderless Workforce.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${albertSans.variable} antialiased `}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
