// src/app/layout.tsx

import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import "./login/login.scss";

export const metadata: Metadata = {
  title: "Browser Auth Test",
  description: "Testing Google browser authentication detection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}