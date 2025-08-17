import type { Metadata } from "next";
import { Ubuntu, Ubuntu_Mono } from "next/font/google";
import { ClientProvider } from "@/components/ClientProvider";
import "./globals.css";

const UbuntuSans = Ubuntu({
  variable: "--font-Ubuntu-sans",
  weight: ['400'],
  subsets: ["latin"],
});

const UbuntuMono = Ubuntu_Mono({
  variable: "--font-Ubuntu-mono",
  weight: ['400'],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Directus Auth Test",
  description: "OAuth authentication with Directus and Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${UbuntuSans.variable} ${UbuntuMono.variable}`}>
        <ClientProvider>
          {children}
        </ClientProvider>
      </body>
    </html>
  );
}