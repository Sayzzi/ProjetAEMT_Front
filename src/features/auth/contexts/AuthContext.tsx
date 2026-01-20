import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User } from '../../types/user.ts';

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
    getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Charge l'utilisateur depuis localStorage au démarrage
function loadUserFromStorage(): User | null {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUserState] = useState<User | null>(loadUserFromStorage);

    // Sauvegarde l'utilisateur dans localStorage
    const setUser = (newUser: User | null) => {
        if (newUser) {
            localStorage.setItem('user', JSON.stringify(newUser));
        } else {
            localStorage.removeItem('user');
        }
        setUserState(newUser);
    };

    // Déconnexion
    const logout = () => {
        localStorage.removeItem('user');
        setUserState(null);
    };

    // Récupère le token JWT
    const getToken = () => user?.token ?? null;

    return (
        <AuthContext.Provider value={{ user, setUser, logout, getToken }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
