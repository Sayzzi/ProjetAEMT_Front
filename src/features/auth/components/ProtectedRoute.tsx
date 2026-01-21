// Composant qui protège une route : redirige vers /login si pas connecté
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.tsx";
import type { ReactNode } from "react";

interface Props {
    children: ReactNode;  // Le composant à afficher si connecté
}

export function ProtectedRoute({ children }: Props) {
    const { user } = useAuth();

    // Si pas connecté, redirige vers la page de connexion
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Sinon, affiche le composant enfant
    return <>{children}</>;
}
