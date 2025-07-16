"use client";

import "./styles/globals.scss";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/components/Auth/AuthProvider";
import LoaderProvider from "@/components/Loader/LoaderProvider";
import { ProtectedRoute } from "@/components/Auth/ProtectedRoute"; // Asegurate que esté bien el path

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublicRoute = pathname === "/login";

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <LoaderProvider>
            {isPublicRoute ? (
              children
            ) : (
              <ProtectedRoute>{children}</ProtectedRoute>
            )}
          </LoaderProvider>
        </AuthProvider>
      </body>
    </html>
  );
}