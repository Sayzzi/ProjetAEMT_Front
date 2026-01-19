// Context pour gérer l'utilisateur connecté
// Pattern: createContext + useReducer

import { createContext, useContext, useReducer, ReactNode } from 'react';
import { User } from '../../types/user.ts';

// State
interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
}

// Actions
type AuthAction =
    | { type: 'login'; user: User }
    | { type: 'logout' };

// Initial state
const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case 'login':
            return { user: action.user, isAuthenticated: true };
        case 'logout':
            return { user: null, isAuthenticated: false };
        default:
            return state;
    }
}

// Contexts
const AuthContext = createContext<AuthState | null>(null);
const AuthDispatchContext = createContext<React.Dispatch<AuthAction> | null>(null);

// Provider
export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    return (
        <AuthContext.Provider value={state}>
            <AuthDispatchContext.Provider value={dispatch}>
                {children}
            </AuthDispatchContext.Provider>
        </AuthContext.Provider>
    );
}

// Hooks
export function useAuth(): AuthState {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

export function useAuthDispatch(): React.Dispatch<AuthAction> {
    const context = useContext(AuthDispatchContext);
    if (!context) {
        throw new Error('useAuthDispatch must be used within AuthProvider');
    }
    return context;
}
