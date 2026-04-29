import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Candidate Pre-Screening Assistant | Alex Rivera",
  description: "Professional assistant for screening Alex Rivera's skills, experience, and professional background.",
  keywords: ["Recruitment Assistant", "Pre-screening", "Alex Rivera", "Full-Stack Developer", "Candidate Search"],
  authors: [{ name: "Alex Rivera" }],
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-black">
      <body className={`${inter.className} bg-black text-white antialiased`}>{children}</body>
    </html>
  );
}
