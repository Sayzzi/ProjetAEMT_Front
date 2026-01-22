// Contexte pour gérer les alertes globales (erreurs API, succès, etc.)
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

// Types d'alertes
export type AlertType = 'error' | 'success' | 'warning' | 'info';

// Structure d'une alerte
export interface Alert {
    id: number;
    type: AlertType;
    title: string;
    message: string;
}

// Interface du contexte
interface AlertContextType {
    alerts: Alert[];
    showAlert: (type: AlertType, title: string, message: string) => void;
    showError: (title: string, message: string) => void;
    showSuccess: (title: string, message: string) => void;
    removeAlert: (id: number) => void;
}

const AlertContext = createContext<AlertContextType | null>(null);

// Hook pour utiliser le contexte
export function useAlert() {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within AlertProvider');
    }
    return context;
}

// Variable globale pour accéder aux alertes depuis api.ts (hors composant React)
let globalShowError: ((title: string, message: string) => void) | null = null;

export function getGlobalShowError() {
    return globalShowError;
}

// Provider
export function AlertProvider({ children }: { children: ReactNode }) {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [nextId, setNextId] = useState(1);

    // Ajoute une alerte
    const showAlert = useCallback((type: AlertType, title: string, message: string) => {
        const id = nextId;
        setNextId(prev => prev + 1);

        setAlerts(prev => [...prev, { id, type, title, message }]);

        // Auto-suppression après 5 secondes
        setTimeout(() => {
            removeAlert(id);
        }, 5000);
    }, [nextId]);

    // Raccourcis
    const showError = useCallback((title: string, message: string) => {
        showAlert('error', title, message);
    }, [showAlert]);

    const showSuccess = useCallback((title: string, message: string) => {
        showAlert('success', title, message);
    }, [showAlert]);

    // Supprime une alerte
    const removeAlert = useCallback((id: number) => {
        setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, []);

    // Expose showError globalement pour api.ts
    globalShowError = showError;

    return (
        <AlertContext.Provider value={{ alerts, showAlert, showError, showSuccess, removeAlert }}>
            {children}
        </AlertContext.Provider>
    );
}
