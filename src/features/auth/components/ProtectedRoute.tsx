// Component that protects a route: redirects to /login if not authenticated
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.tsx";
import type { ReactNode } from "react";

interface Props {
    children: ReactNode;  // The component to display if authenticated
}

export function ProtectedRoute({ children }: Props) {
    const { user } = useAuth();

    // If not authenticated, redirect to the welcome page
    if (!user) {
        return <Navigate to="/welcome" replace />;
    }

    // Otherwise, render the child component
    return <>{children}</>;
}
