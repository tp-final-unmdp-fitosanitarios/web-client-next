"use client";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loader from "../Loader/Loader";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [],
  fallback 
}) => {
  const { user, isLoading, isReady, isAuthenticated } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Si el contexto está listo y no está autenticado, redirigir al login
    if (isReady && !isAuthenticated) {
      router.push("/login");
    }
  }, [isReady, isAuthenticated, router]);

  // Mostrar loader mientras se carga el usuario
  if (isLoading || !isReady) {
    return fallback || <Loader />;
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (!isAuthenticated) {
    return null;
  }

  // Si no hay usuario después de la carga, mostrar error
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error de autenticación</h2>
          <p className="text-gray-600">No se pudo cargar la información del usuario</p>
          <button 
            onClick={() => router.push("/login")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Volver al login
          </button>
        </div>
      </div>
    );
  }

  // Verificar roles si se especifican
  if (requiredRoles.length > 0) {
    const hasRequiredRole = user.roles.some(role => requiredRoles.includes(role));
    if (!hasRequiredRole) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Acceso denegado</h2>
            <p className="text-gray-600">No tienes permisos para acceder a esta página</p>
            <button 
              onClick={() => router.push("/home")}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}; 