import { useAuth } from "@/components/Auth/AuthProvider";
import { User } from "@/domain/models/User";

interface UseUserReturn {
  user: User | null;
  isLoading: boolean;
  isReady: boolean;
  isAuthenticated: boolean;
  login: (updatedToken: string, userId: string, userData?: User) => void;
}

/**
 * Hook personalizado para acceder al usuario de forma segura
 * Maneja los estados de carga y autenticación
 */
export const useUser = (): UseUserReturn => {
  const { user, isLoadingUser, isReady, isAuthenticated, login} = useAuth();

  return {
    user,
    isLoading: isLoadingUser,
    isReady,
    isAuthenticated,
    login
  };
};

/**
 * Hook para verificar si el usuario tiene un rol específico
 */
export const useUserRole = (requiredRole: string): boolean => {
  const { user } = useAuth();
  return user?.roles?.includes(requiredRole) || false;
};

/**
 * Hook para verificar si el usuario tiene alguno de los roles especificados
 */
export const useUserRoles = (requiredRoles: string[]): boolean => {
  const { user } = useAuth();
  return user?.roles?.some(role => requiredRoles.includes(role)) || false;
}; 