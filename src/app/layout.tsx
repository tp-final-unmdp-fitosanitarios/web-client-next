import "./styles/globals.scss";
import type { Metadata } from "next";
import ProviderWrapper from "./providerWrapper";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "EPP Gestión",
  description: "EPP sistema de gestión fitosanitarios y stock",
  manifest: "/manifest.json",
  icons: {
    icon: "/Marca_Verde192x192.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <ProviderWrapper>{children}</ProviderWrapper>
      </body>
    </html>
  );
}