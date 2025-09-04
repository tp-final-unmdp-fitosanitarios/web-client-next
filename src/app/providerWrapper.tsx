"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/components/Auth/AuthProvider";
import LoaderProvider from "@/components/Loader/LoaderProvider";
import { ProtectedRoute } from "@/components/Auth/ProtectedRoute";
import WarmupAlert from "@/components/WarmUpAlert/WarmUpAlert";

export default function ProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublicRoute = pathname === "/login";

  return (
    <AuthProvider>
      <LoaderProvider>
          <WarmupAlert />
        {isPublicRoute ? (
          children
        ) : (
          <ProtectedRoute>{children}</ProtectedRoute>
        )}
      </LoaderProvider>
    </AuthProvider>
  );
}