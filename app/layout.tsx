import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Siemens DIS | Company Health Check",
  description: "Siemens Digital Industries Software — Company opportunity intelligence dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
