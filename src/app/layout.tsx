import type { Metadata } from "next";
import "./styles/globals.scss"


export const metadata: Metadata = {
  title: "Tp Final",
  description: "Tp final",
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
