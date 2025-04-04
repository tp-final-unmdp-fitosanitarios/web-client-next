/*"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
    getToken: () => string;
    setToken: (newToken: string) => void
    getRoles: () => string[];
    setRoles: (newRoles: string[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token,setNewToken] = useState("");
    const [roles, setNewRoles] = useState<string[]>([])

    const login = () => setIsAuthenticated(true);
    const logout = () => setIsAuthenticated(false);
    const getToken = () => token;
    const setToken = (newToken: string) => setNewToken(newToken);
    const getRoles = () => roles;
    const setRoles = (newRoles: string[]) => setNewRoles(newRoles);

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, getToken, setToken, getRoles,setRoles}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};*/