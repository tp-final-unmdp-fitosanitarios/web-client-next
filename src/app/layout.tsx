import type { Metadata } from "next";
import "./styles/globals.scss"


export const metadata: Metadata = {
  title: "EPP gestion",
  description: "EPP sistema de gestion fitosanitarios y stock ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
