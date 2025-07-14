import type { Metadata } from "next";
import "./styles/globals.scss"
import { AuthProvider } from "@/components/Auth/AuthProvider";
import LoaderProvider from "@/components/Loader/LoaderProvider";
import ClientSideSetup from "@/components/ClientSideSetup/clientSideSetup";

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
        <AuthProvider>
          <LoaderProvider>
            <ClientSideSetup />
            {children}
          </LoaderProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
